# AGENTS.md

> Master context document for AI assistants working on the OTel Log Monitor hackathon project.

---

## AIDF Framework

This project uses **AIDF v1.0** (AI Development Framework) to provide structured context for AI assistants.

| Layer | Source | Purpose |
|-------|--------|---------|
| **Layer 1 — Global** | `AGENTS.md` (this file) | Project identity, architecture, conventions, quality gates, boundaries |
| **Layer 2 — Role** | `ai/roles/*.md` | Specialized expertise and behavior rules |
| **Layer 3 — Skill** | `ai/skills/*.md` | Portable skill definitions and instructions |
| **Layer 4 — Task** | `ai/tasks/*.md` | Exact scope, requirements, definition of done |
| **Layer 5 — Plan** | `ai/plans/*.md` | Multi-task initiatives and sequencing |

---

## Identity

This project is **OTel Log Monitor**, a multi-component observability system that ingests high-volume log streams via OpenTelemetry, uses Claude AI to cluster error patterns and generate deduped incident summaries, and surfaces anomalies with suggested remediations through a Kibana plugin.

IMPORTANT: This document defines the single source of truth for AI assistants working on this project. All conventions, boundaries, and quality standards defined here MUST be followed.

CRITICAL: Violating boundaries or skipping quality gates invalidates ALL work done.

---

## Pre-Flight Checklist

Before starting ANY work, verify:

- [ ] Read the entire AGENTS.md document
- [ ] Understand the task scope (Allowed/Forbidden paths)
- [ ] Identify which role to use (if specified)
- [ ] Review relevant conventions for the work type
- [ ] Check quality gates requirements
- [ ] Verify environment is set up correctly

---

## Project Overview

OTel Log Monitor solves the problem of high log volume obscuring anomalies and manual triage delaying MTTR (Mean Time To Resolve). It provides an anomaly-to-action path that trims triage steps and reduces page fatigue.

**Key characteristics:**

- Ingests logs via OpenTelemetry Collector with semantic convention normalization
- Claude-assisted clustering of error patterns with deduped incident summaries
- Suggested remediations with runbook links and confidence signals
- Visualizes everything live in a Kibana plugin dashboard

**Target users:**

- On-call engineers triaging production incidents
- SREs monitoring service health
- Engineering teams doing post-incident analysis

---

## Architecture

### Directory Structure

```
aidf-hackathon-starter/
├── ai/                         # AIDF framework (this directory)
│   ├── AGENTS.md               # This file — start here
│   ├── plans/                  # Multi-task initiative plans
│   └── tasks/                  # Individual task specs
├── log-generator/              # Synthetic log stream producer
│   ├── generator.py            # Main generator script
│   └── requirements.txt
├── otel-collector/             # OpenTelemetry Collector configuration
│   └── config.yaml             # Collector pipeline config
├── claude-processor/           # AI processing backend service
│   ├── main.py                 # FastAPI app entry point
│   ├── processor.py            # Claude clustering & summary logic
│   └── requirements.txt
└── kibana-plugin/              # Kibana frontend plugin
    ├── kibana.json             # Plugin manifest
    ├── package.json            # NPM dependencies
    ├── tsconfig.json           # TypeScript config
    └── public/
        ├── index.ts            # Plugin registration entry point
        ├── plugin.ts           # Plugin class
        ├── application.tsx     # React app root
        └── components/
            ├── Dashboard.tsx   # Main dashboard layout
            ├── AnomalyList.tsx # Top error clusters panel
            └── SummaryPanel.tsx # Claude summary + actions panel
```

### Key Patterns

**Log Data Flow**

```
Sample logs (JSON) → OTel Collector (filelog receiver)
  → normalize with semantic conventions
  → Elasticsearch exporter → logs-otel-* index
  → Claude Processor (queries ES, sends to Claude)
  → ai-summaries index
  → Kibana Plugin reads ai-summaries → displays dashboard
```

**Claude Processor Pattern**

The processor queries Elasticsearch for a rolling time window of logs, batches them, and sends a structured prompt to Claude. Claude returns a JSON response with: `clusters` (grouped error patterns), `summary` (plain-English incident summary), `remediations` (suggested actions with `confidence` 0–1 and optional `runbook_url`). The processor stores this as a document in the `ai-summaries` Elasticsearch index.

**Kibana Plugin Pattern**

The plugin registers a React application at a custom route (`/app/otel-log-monitor`). It polls the `ai-summaries` index via the Kibana server-side proxy and renders the dashboard. All Elasticsearch access goes through the Kibana server — never direct from the browser.

### Key Files

| File | Purpose |
|------|---------|
| `log-generator/generator.py` | Produces a continuous stream of realistic JSON logs to `logs/sample.log` |
| `otel-collector/config.yaml` | OTel Collector reads `logs/sample.log`, normalizes, exports to ES |
| `claude-processor/processor.py` | Queries ES → calls Claude → stores summary in `ai-summaries` |
| `claude-processor/main.py` | FastAPI app exposing `/process` and `/latest-summary` endpoints |
| `kibana-plugin/public/plugin.ts` | Registers the Kibana app and navigation entry |
| `kibana-plugin/public/components/Dashboard.tsx` | Top-level dashboard with anomaly list + summary panel |

---

## Technology Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Language (backend) | Python | 3.11+ | Log generator + Claude processor |
| Language (frontend) | TypeScript | 5.x | Kibana plugin |
| AI | Claude API (Anthropic) | claude-sonnet-4-6 | Pattern clustering & summaries |
| Observability | OpenTelemetry Collector | 0.96+ | Log ingestion & normalization |
| Storage | Elasticsearch | 8.x | Log storage + summary storage |
| Visualization | Kibana | 8.x | Plugin host |
| Backend framework | FastAPI | 0.110+ | Claude processor API |
| Frontend framework | React | 18.x | Kibana plugin UI (via Kibana SDK) |

---

## Environment

<env>
Language: Python 3.11+, TypeScript 5.x
Package Manager (Python): pip
Package Manager (JS): yarn (Kibana requires yarn)
Kibana Version: 8.x (match your local Kibana version)
</env>

### Required Environment Variables

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `ANTHROPIC_API_KEY` | Claude API authentication | `sk-ant-...` | Yes |
| `ELASTICSEARCH_URL` | ES connection URL | `http://localhost:9200` | Yes |
| `ELASTICSEARCH_USER` | ES username | `elastic` | No (if no auth) |
| `ELASTICSEARCH_PASSWORD` | ES password | `changeme` | No (if no auth) |
| `LOG_FILE_PATH` | Path generator writes logs to | `logs/sample.log` | Yes |
| `PROCESS_INTERVAL_SECONDS` | How often processor runs | `30` | No (default: 30) |
| `LOG_WINDOW_MINUTES` | How far back processor looks | `15` | No (default: 15) |

### Configuration Files

| File | Purpose | Notes |
|------|---------|-------|
| `.env` | Local environment variables | Never commit — use `.env.example` |
| `otel-collector/config.yaml` | OTel Collector pipeline | Update ES endpoint if needed |
| `kibana-plugin/kibana.json` | Plugin manifest | Must match Kibana version |

IMPORTANT: NEVER commit sensitive values. Use `.env.example` for documentation.

---

## Conventions

IMPORTANT: Match these patterns EXACTLY when writing new code. Deviations will be rejected.

### File Naming

| Type | Pattern | Example | Wrong |
|------|---------|---------|-------|
| Python modules | `snake_case.py` | `processor.py` | `Processor.py` |
| TypeScript components | `PascalCase.tsx` | `Dashboard.tsx` | `dashboard.tsx` |
| TypeScript non-component | `camelCase.ts` | `plugin.ts` | `Plugin.ts` |
| Config files | `kebab-case.yaml` | `config.yaml` | `Config.yaml` |

### Code Style — Python

```python
# ✅ CORRECT — typed functions, explicit return types, structured errors
from typing import Any

async def fetch_recent_logs(window_minutes: int) -> list[dict[str, Any]]:
    """Query ES for logs in the last window_minutes minutes."""
    try:
        response = await es_client.search(index="logs-otel-*", body=query)
        return response["hits"]["hits"]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch logs from Elasticsearch: {e}") from e

# ❌ WRONG — no types, bare except, no context on errors
def fetch_logs():
    try:
        return es.search()
    except:
        return []
```

### Code Style — TypeScript (Kibana Plugin)

```typescript
// ✅ CORRECT — named export, typed props interface, functional component
export interface AnomalyCluster {
  pattern: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  services: string[];
}

export interface AnomalyListProps {
  clusters: AnomalyCluster[];
  isLoading: boolean;
}

export function AnomalyList({ clusters, isLoading }: AnomalyListProps) {
  // ...
}

// ❌ WRONG — default export, inline types, no explicit interface
export default function AnomalyList({ clusters, isLoading }: { clusters: any[]; isLoading: boolean }) {
  // ...
}
```

### Import Order — TypeScript

```typescript
// 1. React & external libraries
import React, { useState, useEffect } from 'react';
import { EuiPanel, EuiTitle, EuiBadge } from '@elastic/eui';
// 2. Kibana core imports
import { CoreStart } from '@kbn/core/public';
// 3. Internal absolute imports
import { AnomalyCluster } from '../types';
// 4. Relative imports
import { SummaryPanel } from './SummaryPanel';
```

### Claude Prompt Pattern

Always request structured JSON output from Claude. Include a `confidence` field (0.0–1.0) for each remediation.

```python
CLUSTER_PROMPT = """
You are an SRE assistant analyzing production logs. Given the following log entries, return a JSON object with:
- clusters: array of { pattern, count, severity, affected_services, sample_messages }
- summary: plain-English incident summary (2-3 sentences)
- remediations: array of { action, confidence, runbook_url (optional) }

Respond ONLY with valid JSON. No markdown, no explanation.

Logs:
{logs}
"""
```

---

## Quality Standards

### Testing

- Minimum coverage: 70% for Python modules
- Required tests:
  - Unit tests for `processor.py` clustering logic
  - Integration test for ES query (can use mock)
  - Component tests for Kibana plugin React components

### Type Safety

- All Python functions must have type annotations
- No `any` types in TypeScript — use proper interfaces
- All Claude API responses must be validated before use

### Code Style

- Python: `black` formatting, `flake8` linting
- TypeScript: ESLint with Kibana's config

---

## Quality Gates

CRITICAL: Before ANY task can be marked complete, ALL of these MUST pass.

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Python lint | `cd claude-processor && flake8 .` | Zero errors |
| Python format | `cd claude-processor && black --check .` | No changes needed |
| Python tests | `cd claude-processor && pytest` | All tests pass |
| TS lint | `cd kibana-plugin && yarn lint` | Zero errors |
| TS typecheck | `cd kibana-plugin && yarn tsc --noEmit` | Zero errors |
| TS build | `cd kibana-plugin && yarn build` | Builds successfully |

---

## Boundaries

### NEVER Do

- **NEVER** commit `.env` files or API keys
- **NEVER** make direct browser-to-Elasticsearch requests in the Kibana plugin (always go through the server proxy)
- **NEVER** skip quality gates
- **NEVER** modify files outside the task scope
- **NEVER** use `any` types in TypeScript

### ALWAYS Do

- **ALWAYS** validate Claude's JSON response before storing it
- **ALWAYS** use environment variables for secrets and config
- **ALWAYS** include `confidence` scores on Claude-generated remediations
- **ALWAYS** handle the case where Claude returns malformed JSON (fallback gracefully)
- **ALWAYS** write tests for new functionality

### Requires Discussion

- Adding new Elasticsearch indices beyond `logs-otel-*` and `ai-summaries`
- Changing the Claude model from `claude-sonnet-4-6`
- Adding authentication to the FastAPI processor

---

## Commands

### Development

| Command | Description | When to Run |
|---------|-------------|-------------|
| `python log-generator/generator.py` | Start the log stream generator | Before testing the pipeline |
| `docker run otel/opentelemetry-collector-contrib --config otel-collector/config.yaml` | Start OTel Collector | After generator is running |
| `cd claude-processor && uvicorn main:app --reload` | Start the processor API | After ES is running |

### Quality Checks

| Command | Description | When to Run |
|---------|-------------|-------------|
| `cd claude-processor && flake8 .` | Python linting | Before every commit |
| `cd claude-processor && black --check .` | Python format check | Before every commit |
| `cd claude-processor && pytest` | Python tests | Before every commit |
| `cd kibana-plugin && yarn lint` | TS linting | Before every commit |
| `cd kibana-plugin && yarn tsc --noEmit` | TS type check | Before every commit |

### Command Sequences

**Start Full Local Stack**

```bash
python log-generator/generator.py &          # Start log generator in background
docker-compose up -d                         # Start ES + Kibana + OTel Collector
cd claude-processor && uvicorn main:app --reload  # Start processor API
```

**Pre-Commit Verification**

```bash
cd claude-processor && flake8 . && black --check . && pytest
cd kibana-plugin && yarn lint && yarn tsc --noEmit
```

---

## Structured Blocks

| Block | Used By | Purpose |
|-------|---------|---------|
| `<task_analysis>` | All roles | Analyze before implementing |
| `<completion_check>` | All roles | Verify before marking complete |
| `<implementation_plan>` | Developer | Plan code changes |
| `<design_rationale>` | Architect | Document design decisions |
| `<test_plan>` | Tester | Plan test cases |

---

IMPORTANT: Update this document when patterns change or architectural decisions are made.
