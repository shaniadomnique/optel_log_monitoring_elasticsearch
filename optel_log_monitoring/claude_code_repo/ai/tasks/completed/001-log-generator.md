# TASK 001 — Synthetic Log Generator

## Goal

Implement a Python log generator that produces a continuous, realistic JSON log stream to a file, mimicking 5 microservices with mixed severity levels and repeating error patterns suitable for anomaly detection.

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

- `log-generator/generator.py`
- `log-generator/requirements.txt`
- `logs/` (directory created at runtime)

### Forbidden

- `otel-collector/`
- `claude-processor/`
- `kibana-plugin/`
- `ai/` (except moving this task file)

## Requirements

### Feature Overview

Generate a realistic log stream that the OTel Collector can pick up. Logs must follow OTel semantic conventions in JSON format so the collector can map them without custom parsing.

### Functional Requirements

- Write JSON logs to `logs/sample.log` (one JSON object per line — NDJSON format)
- Simulate 5 services: `auth-service`, `payment-service`, `api-gateway`, `inventory-service`, `notification-service`
- Emit mixed severity: INFO (60%), WARNING (20%), ERROR (15%), CRITICAL (5%)
- Include repeating error patterns to give Claude something to cluster:
  - `DatabaseConnectionTimeout` — payment-service, inventory-service
  - `AuthTokenExpired` — auth-service, api-gateway
  - `NullPointerException` — any service
  - `RateLimitExceeded` — api-gateway
  - `ServiceUnavailable` — notification-service
- Each log line includes: `timestamp`, `severity`, `service.name`, `trace_id`, `span_id`, `body` (message), `error.type` (for errors)
- Rate: ~10 logs/second (configurable via `LOG_RATE_PER_SECOND` env var)
- Runs indefinitely until Ctrl+C

### Acceptance Criteria

- [ ] `logs/sample.log` is created and written to on startup
- [ ] All 5 services appear in the log stream
- [ ] Error patterns repeat with realistic frequency
- [ ] Each line is valid JSON parseable by `json.loads()`
- [ ] `flake8` and `black --check` pass

## Definition of Done

- [x] Generator implemented and runs without errors
- [x] All acceptance criteria met
- [x] `flake8` passes
- [x] `black --check` passes

## Notes

- Use `uuid4` for `trace_id` and `span_id`
- Timestamps in ISO 8601 format with UTC timezone
- The `logs/` directory is `.gitignore`d — generator creates it on startup
