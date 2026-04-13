// Shared type definitions for the OTel Log Monitor Kibana plugin.
// All types mirror the ai-summaries Elasticsearch index schema.

export interface AnomalyCluster {
  pattern: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_services: string[];
  sample_messages: string[];
}

export interface Remediation {
  action: string;
  confidence: number; // 0.0 – 1.0
  runbook_url: string | null;
}

export interface AiSummary {
  timestamp: string;
  stored_at: string;
  summary: string;
  clusters: AnomalyCluster[];
  remediations: Remediation[];
  logs_analyzed: number;
  log_window_minutes: number;
}
