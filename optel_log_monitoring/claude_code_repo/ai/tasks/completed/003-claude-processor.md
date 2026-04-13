# TASK 003 — Claude Processor Service

## Goal

Implement a FastAPI service that periodically queries Elasticsearch for recent logs, sends them to Claude for error pattern clustering and incident summarization, and stores the structured result in the `ai-summaries` Elasticsearch index.

## Pre-Flight Checklist

- [x] Read AGENTS.md completely
- [x] Understand existing patterns
- [x] Know the quality check commands
- [x] Understand the scope boundaries

## Task Type

component

## Suggested Roles

- developer
- tester

## Scope

### Allowed

- `claude-processor/main.py`
- `claude-processor/processor.py`
- `claude-processor/requirements.txt`
- `claude-processor/tests/`

### Forbidden

- `log-generator/`
- `otel-collector/`
- `kibana-plugin/`

## Requirements

### Feature Overview

The processor is the intelligence layer. It bridges Elasticsearch (raw logs) and Claude (AI analysis), then stores the structured result for the Kibana plugin to consume.

### Functional Requirements

**`processor.py`:**
- `fetch_recent_logs(window_minutes)` — query `logs-otel-*` index for logs in the last N minutes
- `build_prompt(logs)` — format logs into the Claude prompt template (see AGENTS.md)
- `call_claude(prompt)` — call Claude API (`claude-sonnet-4-6`) and return parsed JSON
- `validate_response(response)` — validate Claude returned expected keys; fallback gracefully on failure
- `store_summary(summary)` — index the summary document into `ai-summaries`
- `run_once()` — orchestrates fetch → build_prompt → call_claude → validate → store

**`main.py`:**
- FastAPI app with two endpoints:
  - `POST /process` — trigger a processing run manually
  - `GET /latest-summary` — return the most recent document from `ai-summaries`
- Background scheduler: run `processor.run_once()` every `PROCESS_INTERVAL_SECONDS` (default 30)

### API Response Schema (`GET /latest-summary`)

```json
{
  "timestamp": "2026-04-01T12:00:00Z",
  "summary": "String: plain-English incident summary",
  "clusters": [
    {
      "pattern": "DatabaseConnectionTimeout",
      "count": 42,
      "severity": "critical",
      "affected_services": ["payment-service", "inventory-service"],
      "sample_messages": ["Connection to postgres timed out after 30s"]
    }
  ],
  "remediations": [
    {
      "action": "Check database connection pool settings",
      "confidence": 0.92,
      "runbook_url": "https://runbooks.internal/db-timeout"
    }
  ],
  "logs_analyzed": 312,
  "log_window_minutes": 15
}
```

### Acceptance Criteria

- [ ] `processor.py` functions are all typed and tested
- [ ] Claude JSON response is validated before storing
- [ ] Malformed Claude response logs a warning and skips (does not crash)
- [ ] `GET /latest-summary` returns 404 if no summaries exist yet
- [ ] `POST /process` returns the new summary on success
- [ ] `flake8` and `black --check` pass
- [ ] `pytest` passes

## Definition of Done

- [x] All functional requirements implemented
- [x] All acceptance criteria met
- [x] Tests written in `claude-processor/tests/`
- [x] Quality gates pass

## Notes

- Use `anthropic` Python SDK (not raw HTTP)
- Use `apscheduler` for the background scheduler
- Load config from environment variables via `python-dotenv`
- ES client: `elasticsearch` Python package (async client `AsyncElasticsearch`)
