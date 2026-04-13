import React from 'react';
import {
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
  EuiStat,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Remediation } from '../types';

export interface SummaryPanelProps {
  summary: string;
  remediations: Remediation[];
  logsAnalyzed: number;
  windowMinutes: number;
  timestamp: string;
}

function confidenceColor(confidence: number): 'success' | 'warning' | 'danger' {
  if (confidence >= 0.75) return 'success';
  if (confidence >= 0.5) return 'warning';
  return 'danger';
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.75) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}

export function SummaryPanel({
  summary,
  remediations,
  logsAnalyzed,
  windowMinutes,
  timestamp,
}: SummaryPanelProps) {
  const analysisTime = new Date(timestamp).toLocaleString();

  return (
    <EuiPanel hasShadow={false} hasBorder paddingSize="l">
      {/* Header */}
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h2>Incident Summary</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiBadge color="hollow">Claude claude-sonnet-4-6</EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      {/* Summary text */}
      <EuiText>
        <p>{summary}</p>
      </EuiText>

      <EuiHorizontalRule margin="m" />

      {/* Metadata stats */}
      <EuiFlexGroup gutterSize="l">
        <EuiFlexItem>
          <EuiStat
            title={logsAnalyzed.toLocaleString()}
            description="Logs analyzed"
            titleSize="s"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            title={`${windowMinutes}m`}
            description="Time window"
            titleSize="s"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            title={analysisTime}
            description="Analyzed at"
            titleSize="s"
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiHorizontalRule margin="m" />

      {/* Remediations */}
      <EuiTitle size="xs">
        <h3>Suggested Actions</h3>
      </EuiTitle>
      <EuiSpacer size="s" />

      {remediations.length === 0 ? (
        <EuiText color="subdued" size="s">
          <p>No remediations suggested for the current pattern.</p>
        </EuiText>
      ) : (
        remediations.map((rem, idx) => (
          <EuiPanel
            key={idx}
            hasShadow={false}
            hasBorder
            paddingSize="s"
            style={{ marginBottom: 8 }}
          >
            <EuiText size="s">
              <p style={{ marginBottom: 6 }}>
                <strong>{rem.action}</strong>
              </p>
            </EuiText>

            {/* Confidence bar */}
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem>
                <EuiProgress
                  value={Math.round(rem.confidence * 100)}
                  max={100}
                  size="s"
                  color={confidenceColor(rem.confidence)}
                  label="Confidence"
                  valueText={`${Math.round(rem.confidence * 100)}% — ${confidenceLabel(rem.confidence)}`}
                />
              </EuiFlexItem>
            </EuiFlexGroup>

            {/* Runbook link */}
            {rem.runbook_url && (
              <>
                <EuiSpacer size="xs" />
                <EuiLink href={rem.runbook_url} target="_blank" external>
                  View runbook
                </EuiLink>
              </>
            )}
          </EuiPanel>
        ))
      )}
    </EuiPanel>
  );
}
