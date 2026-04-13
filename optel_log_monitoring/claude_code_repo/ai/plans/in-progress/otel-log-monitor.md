# PLAN: OTel Log Monitor — Hackathon MVP

## Overview

Build a log anomaly detection and summarization system that ingests logs via OpenTelemetry, uses Claude to cluster error patterns and generate incident summaries with suggested remediations, and visualizes the results live in a Kibana plugin.

## Goals

- Ingest a synthetic log stream via OpenTelemetry Collector into Elasticsearch
- Use Claude to detect top error patterns and generate a deduped incident summary
- Expose suggested remediations with confidence scores via a FastAPI backend
- Display the anomaly-to-action dashboard in a Kibana plugin

## Non-Goals

- Production-grade auth or multi-tenancy for the processor API
- Real-time streaming (polling every 30s is sufficient for the MVP)
- Alerting/paging integrations (Slack, PagerDuty) — these are stretch goals

## Tasks

### Phase 1: Data Foundation

Set up the log stream and get data flowing into Elasticsearch.

- [x] `001-log-generator.md` - Synthetic log generator that writes OTel-compatible JSON logs
- [x] `002-otel-collector.md` - OTel Collector config: filelog receiver → normalize → ES exporter

### Phase 2: AI Processing

Build the Claude-powered backend that reads logs and produces structured summaries.

- [x] `003-claude-processor.md` - FastAPI service: query ES → Claude clustering → store summaries

### Phase 3: Visualization

Build the Kibana plugin that renders the live dashboard.

- [x] `004-kibana-plugin.md` - Kibana plugin with anomaly list, summary panel, and remediation actions

## Dependencies

- Elasticsearch 8.x running locally (or via Docker)
- Kibana 8.x running locally (matching ES version)
- `ANTHROPIC_API_KEY` set in `.env`
- OpenTelemetry Collector binary or Docker image

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude returns malformed JSON | Medium | High | Add JSON validation + retry logic with fallback |
| Kibana plugin version mismatch | Medium | High | Pin `kibana.json` version to local Kibana version |
| ES schema mismatch on `ai-summaries` | Low | Medium | Use dynamic mapping for the MVP |
| OTel Collector drops logs on high volume | Low | Low | Generator rate-limits to ~10 logs/sec |

## Success Criteria

- [ ] Log generator produces a realistic mixed-severity log stream
- [ ] OTel Collector ingests logs and `logs-otel-*` index has documents in ES
- [ ] Claude processor clusters errors and stores a summary in `ai-summaries`
- [ ] Kibana plugin loads at `/app/otel-log-monitor` and renders the dashboard
- [ ] Dashboard shows: top error clusters, plain-English summary, and ≥1 suggested remediation

## Notes

- Use `claude-sonnet-4-6` as specified in AGENTS.md — do not change the model
- The `ai-summaries` index schema: `{ timestamp, clusters[], summary, remediations[], log_window_minutes, logs_analyzed }`
- Runbook URLs are mocked for the hackathon (e.g. `https://runbooks.internal/db-timeout`)
- Generator mimics 5 services: `auth-service`, `payment-service`, `api-gateway`, `inventory-service`, `notification-service`

---

## Execution Protocol

When starting this plan:
1. Move this file to `ai/plans/in-progress/`

When a task completes:
1. Update the task's checkbox status in the Tasks table above

When all tasks are completed:
1. Move this file to `ai/plans/completed/`

If blocked:
1. Document the blocker under ## Blockers
2. Move this file to `ai/plans/blocked/`

## Blockers
<!-- Document any blockers here -->
