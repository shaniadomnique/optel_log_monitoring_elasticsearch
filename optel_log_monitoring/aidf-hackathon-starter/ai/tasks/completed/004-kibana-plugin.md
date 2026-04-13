# TASK 004 — Kibana Plugin Dashboard

## Goal

Implement a Kibana plugin that registers a React application at `/app/otel-log-monitor`, polls the `ai-summaries` Elasticsearch index via the Kibana server proxy, and renders a live dashboard showing top error clusters, a plain-English incident summary, and suggested remediation actions.

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

- `kibana-plugin/kibana.json`
- `kibana-plugin/package.json`
- `kibana-plugin/tsconfig.json`
- `kibana-plugin/public/`

### Forbidden

- `log-generator/`
- `otel-collector/`
- `claude-processor/`

## Requirements

### Feature Overview

The Kibana plugin is the user-facing interface. It shows the live anomaly-to-action path: what's broken, why Claude thinks so, and what to do about it.

### Functional Requirements

**Plugin registration (`plugin.ts`):**
- Register a Kibana application with `id: 'otel-log-monitor'`
- Add navigation entry: "OTel Log Monitor"
- Mount the React app at `/app/otel-log-monitor`

**Dashboard (`Dashboard.tsx`):**
- Poll `ai-summaries` index via `data.search` Kibana service every 30 seconds
- Show loading spinner while fetching
- Show error state if fetch fails
- Layout: header + two panels side by side (AnomalyList left, SummaryPanel right)

**AnomalyList (`AnomalyList.tsx`):**
- Renders a list of error clusters sorted by `count` descending
- Each cluster shows: pattern name, count badge, severity badge (color-coded), affected services
- Uses Elastic UI (`@elastic/eui`) components: `EuiPanel`, `EuiBadge`, `EuiBasicTable`

**SummaryPanel (`SummaryPanel.tsx`):**
- Shows Claude's plain-English summary text
- Shows each remediation as a card with: action text, confidence bar (0–100%), optional runbook link
- Shows metadata: logs analyzed count, time window, last updated timestamp
- Uses EUI: `EuiPanel`, `EuiProgress`, `EuiLink`, `EuiStat`

### Acceptance Criteria

- [ ] Plugin loads at `/app/otel-log-monitor` in Kibana without errors
- [ ] Dashboard renders with real data from `ai-summaries`
- [ ] Severity badges use correct EUI colors: critical=danger, high=warning, medium=primary, low=subdued
- [ ] Confidence displayed as a percentage progress bar
- [ ] Runbook links open in a new tab
- [ ] Auto-refreshes every 30 seconds
- [ ] `yarn lint` passes
- [ ] `yarn tsc --noEmit` passes

## Definition of Done

- [x] All components implemented
- [x] All acceptance criteria met
- [x] TypeScript strict mode — no `any` types
- [x] Quality gates pass

## Notes

- Kibana plugins must use `@elastic/eui` for all UI — do not import other UI libraries
- Access Elasticsearch through `data.search.search()` or `http.fetch` to the ES proxy — never direct
- The `kibana.json` `version` field must exactly match the running Kibana version
- For the hackathon, hardcode Kibana version `8.13.0` in `kibana.json` (update if different)
