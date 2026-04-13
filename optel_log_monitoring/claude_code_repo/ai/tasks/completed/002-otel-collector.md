# TASK 002 — OpenTelemetry Collector Configuration

## Goal

Configure the OpenTelemetry Collector to read logs from `logs/sample.log`, normalize them using OTel semantic conventions, and export them to Elasticsearch into the `logs-otel-*` index pattern.

## Pre-Flight Checklist

- [x] Read AGENTS.md completely
- [x] Understand existing patterns
- [x] Know the quality check commands
- [x] Understand the scope boundaries

## Task Type

architecture

## Suggested Roles

- architect
- developer

## Scope

### Allowed

- `otel-collector/config.yaml`
- `docker-compose.yml` (create if needed)

### Forbidden

- `log-generator/`
- `claude-processor/`
- `kibana-plugin/`

## Requirements

### Feature Overview

The OTel Collector is the bridge between raw logs and Elasticsearch. It reads NDJSON logs from the file the generator produces, normalizes field names to OTel semantic conventions, and exports to ES.

### Functional Requirements

- **Receiver:** `filelog` receiver reading `logs/sample.log`
- **Operators:** Parse JSON body, map `severity` to OTel `severity_text` and `severity_number`, set `service.name` from the log's `service.name` field
- **Exporter:** `elasticsearch` exporter targeting `http://localhost:9200`, index `logs-otel-%{yyyy.MM.dd}`
- **Telemetry:** Collector self-metrics on port 8888

### Acceptance Criteria

- [ ] Config file is valid YAML
- [ ] Receiver correctly references the log file path
- [ ] Severity mapping is correct (INFO→9, WARNING→13, ERROR→17, CRITICAL→21)
- [ ] Exporter targets the correct ES index pattern

## Definition of Done

- [x] `otel-collector/config.yaml` written and valid
- [x] Collector can start with this config without errors

## Notes

- Use `otel/opentelemetry-collector-contrib` image (contrib has the ES exporter)
- ES credentials via env vars `${ELASTICSEARCH_USER}` and `${ELASTICSEARCH_PASSWORD}`
