import React from 'react';
import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiToolTip,
  EuiText,
} from '@elastic/eui';
import { AnomalyCluster } from '../types';

export interface AnomalyListProps {
  clusters: AnomalyCluster[];
}

type SeverityColor = 'danger' | 'warning' | 'primary' | 'default';

function severityColor(severity: AnomalyCluster['severity']): SeverityColor {
  const map: Record<AnomalyCluster['severity'], SeverityColor> = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'default',
  };
  return map[severity];
}

const COLUMNS: Array<EuiBasicTableColumn<AnomalyCluster>> = [
  {
    field: 'pattern',
    name: 'Error Pattern',
    render: (pattern: string) => (
      <EuiText size="s">
        <strong>{pattern}</strong>
      </EuiText>
    ),
  },
  {
    field: 'count',
    name: 'Count',
    width: '80px',
    render: (count: number) => (
      <EuiBadge color="hollow">{count.toLocaleString()}</EuiBadge>
    ),
  },
  {
    field: 'severity',
    name: 'Severity',
    width: '100px',
    render: (severity: AnomalyCluster['severity']) => (
      <EuiBadge color={severityColor(severity)}>
        {severity.toUpperCase()}
      </EuiBadge>
    ),
  },
  {
    field: 'affected_services',
    name: 'Affected Services',
    render: (services: string[]) => (
      <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
        {services.map((svc) => (
          <EuiBadge key={svc} color="default">
            {svc}
          </EuiBadge>
        ))}
      </EuiFlexGroup>
    ),
  },
  {
    field: 'sample_messages',
    name: 'Sample',
    render: (messages: string[]) =>
      messages[0] ? (
        <EuiToolTip content={messages.join('\n')}>
          <EuiText size="xs" color="subdued">
            <span
              style={{
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {messages[0]}
            </span>
          </EuiText>
        </EuiToolTip>
      ) : null,
  },
];

// Inline import to avoid circular deps — only used inside this render
function EuiFlexGroup({ children, gutterSize, wrap, responsive }: {
  children: React.ReactNode;
  gutterSize?: string;
  wrap?: boolean;
  responsive?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 4 }}>
      {children}
    </div>
  );
}

export function AnomalyList({ clusters }: AnomalyListProps) {
  const sorted = [...clusters].sort((a, b) => b.count - a.count);

  return (
    <EuiPanel hasShadow={false} hasBorder paddingSize="l">
      <EuiTitle size="s">
        <h2>Top Anomaly Clusters</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      {sorted.length === 0 ? (
        <EuiText color="subdued">
          <p>No anomaly clusters detected in the current window.</p>
        </EuiText>
      ) : (
        <EuiBasicTable<AnomalyCluster>
          items={sorted}
          columns={COLUMNS}
          rowHeader="pattern"
        />
      )}
    </EuiPanel>
  );
}
