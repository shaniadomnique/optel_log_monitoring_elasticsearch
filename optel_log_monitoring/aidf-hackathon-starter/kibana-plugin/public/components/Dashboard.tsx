import React, { useCallback, useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiCallOut,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '@kbn/core/public';
import { OtelLogMonitorStartDeps } from '../plugin';
import { AiSummary } from '../types';
import { AnomalyList } from './AnomalyList';
import { SummaryPanel } from './SummaryPanel';

const PROCESSOR_API_BASE = 'http://localhost:8000';
const POLL_INTERVAL_MS = 30_000;

export interface DashboardProps {
  core: CoreStart;
  deps: OtelLogMonitorStartDeps;
}

export function Dashboard({ core }: DashboardProps) {
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await core.http.fetch<AiSummary>(
        `${PROCESSOR_API_BASE}/latest-summary`,
        { method: 'GET' }
      );
      setSummary(response);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching summary';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [core.http]);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const lastUpdated = summary?.stored_at
    ? new Date(summary.stored_at).toLocaleTimeString()
    : null;

  return (
    <EuiPage paddingSize="l">
      <EuiPageBody>
        <EuiPageHeader
          pageTitle="OTel Log Monitor"
          description={
            lastUpdated
              ? `AI-powered anomaly detection · Last updated: ${lastUpdated} · Auto-refreshes every 30s`
              : 'AI-powered anomaly detection via Claude and OpenTelemetry'
          }
        />

        <EuiSpacer size="l" />

        {isLoading && (
          <EuiFlexGroup justifyContent="center">
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
              <EuiSpacer size="s" />
              <EuiText textAlign="center" color="subdued">
                <p>Fetching latest summary from Claude processor…</p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}

        {!isLoading && error && (
          <EuiCallOut
            title="Could not load summary"
            color="danger"
            iconType="alert"
          >
            <p>{error}</p>
            <p>
              Make sure the Claude processor is running at{' '}
              <code>{PROCESSOR_API_BASE}</code> and has processed at least one
              log batch.
            </p>
          </EuiCallOut>
        )}

        {!isLoading && !error && summary && (
          <EuiFlexGroup alignItems="flexStart" gutterSize="l">
            <EuiFlexItem grow={6}>
              <AnomalyList clusters={summary.clusters} />
            </EuiFlexItem>
            <EuiFlexItem grow={4}>
              <SummaryPanel
                summary={summary.summary}
                remediations={summary.remediations}
                logsAnalyzed={summary.logs_analyzed}
                windowMinutes={summary.log_window_minutes}
                timestamp={summary.timestamp}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiPageBody>
    </EuiPage>
  );
}
