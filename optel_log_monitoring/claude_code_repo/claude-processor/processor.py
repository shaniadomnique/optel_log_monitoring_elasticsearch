"""
Claude Processor — core logic for the OTel Log Monitor.

Responsibilities:
  1. Fetch recent logs from Elasticsearch (logs-otel-* index)
  2. Build a structured prompt for Claude
  3. Call Claude API and parse the JSON response
  4. Validate the response structure
  5. Store the summary document in the ai-summaries index
"""

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import anthropic
from elasticsearch import AsyncElasticsearch

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ANTHROPIC_MODEL = "claude-sonnet-4-6"
ES_LOG_INDEX = "logs-otel"
ES_SUMMARY_INDEX = "ai-summaries"
LOG_WINDOW_MINUTES = int(os.getenv("LOG_WINDOW_MINUTES", "15"))
MAX_LOGS_PER_BATCH = int(os.getenv("MAX_LOGS_PER_BATCH", "500"))

# ---------------------------------------------------------------------------
# Prompt template
# ---------------------------------------------------------------------------

CLUSTER_PROMPT = """\
You are an SRE assistant analyzing production logs. Given the following log entries, \
return a JSON object with exactly these keys:

- "clusters": array of objects, each with:
    - "pattern": string (the error type or pattern name)
    - "count": integer (how many times this pattern appears)
    - "severity": one of "low", "medium", "high", "critical"
    - "affected_services": array of service name strings
    - "sample_messages": array of up to 3 representative message strings

- "summary": string (plain-English incident summary, 2-3 sentences max)

- "remediations": array of objects, each with:
    - "action": string (concrete remediation step)
    - "confidence": float between 0.0 and 1.0
    - "runbook_url": string or null

Sort clusters by count descending. Include only ERROR and CRITICAL level patterns in clusters.
Respond ONLY with valid JSON. No markdown code blocks, no explanation, no preamble.

Logs (NDJSON — one JSON object per line):
{logs}
"""

# ---------------------------------------------------------------------------
# Elasticsearch helpers
# ---------------------------------------------------------------------------


def _build_es_client() -> AsyncElasticsearch:
    url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    user = os.getenv("ELASTICSEARCH_USER")
    password = os.getenv("ELASTICSEARCH_PASSWORD")

    if user and password:
        return AsyncElasticsearch(url, basic_auth=(user, password))
    return AsyncElasticsearch(url)


async def fetch_recent_logs(
    es: AsyncElasticsearch,
    window_minutes: int = LOG_WINDOW_MINUTES,
) -> list[dict[str, Any]]:
    """Query Elasticsearch for log entries from the last window_minutes minutes."""
    since = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)

    query = {
        "query": {
            "range": {
                "@timestamp": {
                    "gte": since.isoformat(),
                }
            }
        },
        "sort": [{"@timestamp": {"order": "desc"}}],
        "size": MAX_LOGS_PER_BATCH,
    }

    try:
        response = await es.search(index=ES_LOG_INDEX, body=query)
        hits = response["hits"]["hits"]
        return [hit["_source"] for hit in hits]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch logs from Elasticsearch: {e}") from e


async def store_summary(
    es: AsyncElasticsearch,
    summary: dict[str, Any],
) -> None:
    """Index the summary document into the ai-summaries index."""
    doc = {
        **summary,
        "stored_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await es.index(index=ES_SUMMARY_INDEX, document=doc)
        logger.info("Stored summary in %s (%d clusters)", ES_SUMMARY_INDEX, len(summary.get("clusters", [])))
    except Exception as e:
        raise RuntimeError(f"Failed to store summary in Elasticsearch: {e}") from e


async def fetch_latest_summary(
    es: AsyncElasticsearch,
) -> dict[str, Any] | None:
    """Return the most recent document from the ai-summaries index, or None."""
    query = {
        "query": {"match_all": {}},
        "sort": [{"stored_at": {"order": "desc"}}],
        "size": 1,
    }
    try:
        response = await es.search(index=ES_SUMMARY_INDEX, body=query)
        hits = response["hits"]["hits"]
        if not hits:
            return None
        return hits[0]["_source"]
    except Exception as e:
        logger.warning("Failed to fetch latest summary: %s", e)
        return None


async def fetch_logs_for_range(
    es: AsyncElasticsearch,
    from_ts: str,
    to_ts: str,
    severity: str | None = None,
) -> list[dict[str, Any]]:
    """Fetch up to MAX_LOGS_PER_BATCH logs for a time range, optionally filtered by severity."""
    must = [{"range": {"@timestamp": {"gte": from_ts, "lte": to_ts}}}]
    if severity:
        must.append({"match": {"SeverityText": severity.upper()}})

    query = {
        "query": {"bool": {"must": must}},
        "sort": [{"@timestamp": {"order": "desc"}}],
        "size": MAX_LOGS_PER_BATCH,
    }
    try:
        response = await es.search(index=ES_LOG_INDEX, body=query)
        return [h["_source"] for h in response["hits"]["hits"]]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch logs for range: {e}") from e


async def fetch_logs_page(
    es: AsyncElasticsearch,
    from_ts: str,
    to_ts: str,
    page: int = 1,
    size: int = 10,
    severity: str | None = None,
) -> dict[str, Any]:
    """Fetch a paginated page of logs from Elasticsearch for display in the table."""
    must = [{"range": {"@timestamp": {"gte": from_ts, "lte": to_ts}}}]
    if severity:
        must.append({"match": {"SeverityText": severity.upper()}})

    query = {
        "query": {"bool": {"must": must}},
        "sort": [{"@timestamp": {"order": "desc"}}],
        "from": (page - 1) * size,
        "size": size,
    }
    try:
        response = await es.search(index=ES_LOG_INDEX, body=query)
        total = response["hits"]["total"]["value"]
        hits = [h["_source"] for h in response["hits"]["hits"]]
        return {"total": total, "page": page, "size": size, "logs": hits}
    except Exception as e:
        raise RuntimeError(f"Failed to fetch logs page: {e}") from e


async def count_logs_in_range(
    es: AsyncElasticsearch,
    from_ts: str,
    to_ts: str,
) -> int:
    """Return the total number of log entries ingested between from_ts and to_ts."""
    query = {
        "query": {
            "range": {
                "@timestamp": {
                    "gte": from_ts,
                    "lte": to_ts,
                }
            }
        }
    }
    try:
        response = await es.count(index=ES_LOG_INDEX, body=query)
        return response.get("count", 0)
    except Exception as e:
        logger.warning("Failed to count logs in range: %s", e)
        return 0


async def fetch_summary_in_range(
    es: AsyncElasticsearch,
    from_ts: str,
    to_ts: str,
) -> dict[str, Any] | None:
    """Return the most recent summary stored within [from_ts, to_ts], or None."""
    query = {
        "query": {
            "range": {
                "stored_at": {
                    "gte": from_ts,
                    "lte": to_ts,
                }
            }
        },
        "sort": [{"stored_at": {"order": "desc"}}],
        "size": 1,
    }
    try:
        response = await es.search(index=ES_SUMMARY_INDEX, body=query)
        hits = response["hits"]["hits"]
        if not hits:
            return None
        return hits[0]["_source"]
    except Exception as e:
        logger.warning("Failed to fetch summary in range: %s", e)
        return None


# ---------------------------------------------------------------------------
# Prompt building
# ---------------------------------------------------------------------------


def build_prompt(logs: list[dict[str, Any]]) -> str:
    """Format log entries as NDJSON and inject into the prompt template."""
    ndjson_lines = "\n".join(json.dumps(log) for log in logs)
    return CLUSTER_PROMPT.format(logs=ndjson_lines)


# ---------------------------------------------------------------------------
# Claude API
# ---------------------------------------------------------------------------


def call_claude(client: anthropic.Anthropic, prompt: str) -> dict[str, Any]:
    """
    Send the prompt to Claude and return the parsed JSON response.
    Raises ValueError if the response cannot be parsed as JSON.
    """
    message = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    raw_text = message.content[0].text.strip()

    # Strip markdown code fences if Claude wrapped the response
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        raw_text = "\n".join(
            line for line in lines
            if not line.strip().startswith("```")
        ).strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned non-JSON response: {e}\nRaw: {raw_text[:500]}") from e


# ---------------------------------------------------------------------------
# Response validation
# ---------------------------------------------------------------------------


def validate_response(response: dict[str, Any]) -> bool:
    """
    Check that Claude's response has the expected top-level structure.
    Returns True if valid, False otherwise.
    """
    required_keys = {"clusters", "summary", "remediations"}
    if not required_keys.issubset(response.keys()):
        missing = required_keys - response.keys()
        logger.warning("Claude response missing keys: %s", missing)
        return False

    if not isinstance(response["clusters"], list):
        logger.warning("Claude response 'clusters' is not a list")
        return False

    if not isinstance(response["summary"], str) or not response["summary"].strip():
        logger.warning("Claude response 'summary' is empty or not a string")
        return False

    if not isinstance(response["remediations"], list):
        logger.warning("Claude response 'remediations' is not a list")
        return False

    return True


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


async def run_once(
    es: AsyncElasticsearch,
    claude_client: anthropic.Anthropic,
    window_minutes: int = LOG_WINDOW_MINUTES,
) -> dict[str, Any] | None:
    """
    Full processing cycle:
      fetch logs → build prompt → call Claude → validate → store → return summary.

    Returns the stored summary dict, or None if processing failed gracefully.
    """
    logger.info("Starting processing cycle (window=%dm)", window_minutes)

    logs = await fetch_recent_logs(es, window_minutes)
    if not logs:
        logger.warning("No logs found in the last %d minutes — skipping cycle", window_minutes)
        return None

    logger.info("Fetched %d log entries from Elasticsearch", len(logs))

    # Only send error/critical logs to Claude for clustering (reduce token usage)
    # ES stores fields as PascalCase: SeverityText, Body, Resource
    error_logs = [
        log for log in logs
        if log.get("SeverityText") in ("ERROR", "CRITICAL")
    ]
    logs_for_claude = error_logs if error_logs else logs[:50]

    # Slim each log down to only what Claude needs
    trimmed = [
        {
            "severity": l.get("SeverityText", ""),
            "message": l.get("Body", ""),
            "service": l.get("Resource", {}).get("service", {}).get("name", "unknown"),
            "error_type": l.get("Attributes", {}).get("error", {}).get("type", ""),
        }
        for l in logs_for_claude
    ]

    prompt = build_prompt(trimmed)

    try:
        raw_response = call_claude(claude_client, prompt)
    except ValueError as e:
        logger.warning("Claude response parsing failed: %s — skipping cycle", e)
        return None

    if not validate_response(raw_response):
        logger.warning("Claude response failed validation — skipping cycle")
        return None

    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "clusters": raw_response["clusters"],
        "summary": raw_response["summary"],
        "remediations": raw_response["remediations"],
        "logs_analyzed": len(logs),
        "log_window_minutes": window_minutes,
    }

    await store_summary(es, summary)
    return summary


async def run_for_range(
    es: AsyncElasticsearch,
    claude_client: anthropic.Anthropic,
    from_ts: str,
    to_ts: str,
    severity: str | None = None,
) -> dict[str, Any] | None:
    """
    On-demand processing for a specific time range and optional severity filter.
    Does NOT store the result — returns it directly for immediate display.
    """
    logger.info("Starting range processing (from=%s, to=%s, severity=%s)", from_ts, to_ts, severity)

    logs = await fetch_logs_for_range(es, from_ts, to_ts, severity)
    if not logs:
        logger.warning("No logs found in range — skipping")
        return None

    # Always send all fetched logs to Claude (already capped by MAX_LOGS_PER_BATCH)
    trimmed = [
        {
            "severity": l.get("SeverityText", ""),
            "message": l.get("Body", ""),
            "service": l.get("Resource", {}).get("service", {}).get("name", "unknown"),
            "error_type": l.get("Attributes", {}).get("error", {}).get("type", ""),
        }
        for l in logs
    ]

    prompt = build_prompt(trimmed)

    try:
        raw_response = call_claude(claude_client, prompt)
    except ValueError as e:
        logger.warning("Claude response parsing failed: %s", e)
        return None

    if not validate_response(raw_response):
        return None

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "clusters": raw_response["clusters"],
        "summary": raw_response["summary"],
        "remediations": raw_response["remediations"],
        "logs_analyzed": len(logs),
        "from_ts": from_ts,
        "to_ts": to_ts,
        "severity_filter": severity,
    }
