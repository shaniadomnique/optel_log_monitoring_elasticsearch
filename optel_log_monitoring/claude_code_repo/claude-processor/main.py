"""
FastAPI application for the OTel Log Monitor Claude Processor.

Endpoints:
  POST /process         — trigger a processing cycle manually
  GET  /latest-summary  — return the most recent AI summary

A background scheduler also triggers run_once() every PROCESS_INTERVAL_SECONDS.
"""

import logging
import os

import anthropic
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from elasticsearch import AsyncElasticsearch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from processor import _build_es_client, count_logs_in_range, fetch_latest_summary, fetch_logs_page, fetch_summary_in_range, run_for_range, run_once

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App & shared state
# ---------------------------------------------------------------------------

app = FastAPI(
    title="OTel Log Monitor — Claude Processor",
    description="Queries Elasticsearch for recent logs, clusters error patterns with Claude, and stores summaries.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Kibana dev server — restrict in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_es_client: AsyncElasticsearch | None = None
_claude_client: anthropic.Anthropic | None = None
_scheduler: AsyncIOScheduler | None = None

PROCESS_INTERVAL_SECONDS = int(os.getenv("PROCESS_INTERVAL_SECONDS", "30"))
LOG_WINDOW_MINUTES = int(os.getenv("LOG_WINDOW_MINUTES", "15"))

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------


@app.on_event("startup")
async def startup() -> None:
    global _es_client, _claude_client, _scheduler

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY environment variable is required")

    _es_client = _build_es_client()
    _claude_client = anthropic.Anthropic(api_key=api_key)

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _scheduled_run,
        trigger="interval",
        seconds=PROCESS_INTERVAL_SECONDS,
        id="process_logs",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info(
        "Scheduler started — processing every %ds, window=%dm",
        PROCESS_INTERVAL_SECONDS,
        LOG_WINDOW_MINUTES,
    )


@app.on_event("shutdown")
async def shutdown() -> None:
    if _scheduler:
        _scheduler.shutdown(wait=False)
    if _es_client:
        await _es_client.close()


async def _scheduled_run() -> None:
    """Background job: run a processing cycle and log the result."""
    assert _es_client and _claude_client
    try:
        result = await run_once(_es_client, _claude_client, LOG_WINDOW_MINUTES)
        if result:
            logger.info(
                "Scheduled run complete — %d clusters, %d logs analyzed",
                len(result.get("clusters", [])),
                result.get("logs_analyzed", 0),
            )
    except Exception as e:
        logger.error("Scheduled processing run failed: %s", e)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.post("/process", summary="Trigger a manual processing cycle")
async def process() -> dict:
    """
    Run a full processing cycle immediately.
    Returns the generated summary on success.
    """
    assert _es_client and _claude_client

    result = await run_once(_es_client, _claude_client, LOG_WINDOW_MINUTES)
    if result is None:
        raise HTTPException(
            status_code=422,
            detail="Processing cycle completed but produced no summary (no logs or Claude validation failed).",
        )
    return result


@app.get("/latest-summary", summary="Retrieve the most recent AI summary")
async def latest_summary() -> dict:
    """
    Return the most recently stored summary document from the ai-summaries index.
    Returns 404 if no summaries have been generated yet.
    """
    assert _es_client

    summary = await fetch_latest_summary(_es_client)
    if summary is None:
        raise HTTPException(
            status_code=404,
            detail="No summaries found. Trigger /process or wait for the scheduler to run.",
        )
    return summary


@app.get("/summary-range", summary="Retrieve the most recent summary within a time range")
async def summary_range(from_ts: str, to_ts: str) -> dict:
    """
    Return the most recent summary stored between from_ts and to_ts (ISO 8601 strings).
    Example: /summary-range?from_ts=2026-01-01T00:00:00Z&to_ts=2026-02-13T23:59:59Z
    """
    assert _es_client

    summary = await fetch_summary_in_range(_es_client, from_ts, to_ts)
    if summary is None:
        raise HTTPException(
            status_code=404,
            detail="No summaries found in the specified time range.",
        )
    return summary


@app.get("/logs", summary="Fetch paginated logs for a time range")
async def logs_page(from_ts: str, to_ts: str, page: int = 1, size: int = 10, severity: str = None) -> dict:
    """Return a paginated list of raw log entries from Elasticsearch."""
    assert _es_client
    try:
        return await fetch_logs_page(_es_client, from_ts, to_ts, page, size, severity)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-range", summary="Generate AI summary for a specific time range and severity")
async def process_range(from_ts: str, to_ts: str, severity: str = None) -> dict:
    """
    Run Claude analysis on logs within [from_ts, to_ts], optionally filtered by severity.
    Result is returned directly and not stored.
    """
    assert _es_client and _claude_client
    result = await run_for_range(_es_client, _claude_client, from_ts, to_ts, severity)
    if result is None:
        raise HTTPException(status_code=422, detail="No logs found or Claude analysis failed for the given range.")
    return result


@app.get("/log-count", summary="Count logs ingested in a time range")
async def log_count(from_ts: str, to_ts: str) -> dict:
    """Return total log count between from_ts and to_ts (ISO 8601)."""
    assert _es_client
    count = await count_logs_in_range(_es_client, from_ts, to_ts)
    return {"count": count, "from_ts": from_ts, "to_ts": to_ts}


@app.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}
