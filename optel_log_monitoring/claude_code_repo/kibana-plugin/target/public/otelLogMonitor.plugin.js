(function () {
/**
 * OTel Log Monitor — Kibana Plugin
 *
 * Pure vanilla JavaScript — no imports required.
 * Kibana passes its core API at runtime via the plugin() initializer.
 * Webpack compiles this to AMD format so Kibana's loader can pick it up.
 */

// ---------------------------------------------------------------------------
// Styles (scoped to .otel-monitor to avoid polluting Kibana's global CSS)
// ---------------------------------------------------------------------------

const CSS = `
  .otel-monitor * { box-sizing: border-box; margin: 0; padding: 0; }

  .otel-monitor {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    background: #f1f4f9;
    color: #1a1c21;
    min-height: 100%;
    padding-bottom: 40px;
  }

  .otel-monitor header {
    background: #07135e;
    color: white;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .otel-monitor .logo { display: flex; align-items: center; gap: 10px; }
  .otel-monitor h1 { font-size: 1.15rem; font-weight: 600; }
  .otel-monitor .subtitle { font-size: 0.72rem; opacity: 0.65; margin-top: 2px; }
  .otel-monitor .status-bar { font-size: 0.78rem; opacity: 0.8; display: flex; gap: 16px; align-items: center; }

  .otel-monitor .pulse {
    display: inline-block; width: 8px; height: 8px;
    border-radius: 50%; background: #00d4a1; margin-right: 6px;
    animation: otelPulse 2s infinite;
  }
  @keyframes otelPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .otel-monitor main { padding: 24px 28px; max-width: 1400px; margin: 0 auto; }

  .otel-monitor .meta-strip { display: flex; gap: 14px; margin-bottom: 22px; flex-wrap: wrap; }
  .otel-monitor .meta-card {
    background: white; border-radius: 8px; padding: 14px 18px;
    flex: 1; min-width: 140px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .otel-monitor .meta-card .value { font-size: 1.5rem; font-weight: 700; color: #07135e; line-height: 1.2; }
  .otel-monitor .meta-card .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-top: 4px; }

  .otel-monitor .grid { display: grid; grid-template-columns: 1fr 380px; gap: 18px; }
  @media (max-width: 700px) { .otel-monitor .grid { grid-template-columns: 1fr; } }

  .otel-monitor .card {
    background: white; border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;
    margin-bottom: 16px;
  }
  .otel-monitor .card-header {
    padding: 14px 18px; border-bottom: 1px solid #e5e7eb;
    display: flex; align-items: center; justify-content: space-between;
  }
  .otel-monitor .card-header h2 { font-size: 0.92rem; font-weight: 600; }
  .otel-monitor .card-header .hint { font-size: 0.72rem; color: #6b7280; }
  .otel-monitor .card-body { padding: 18px; }

  .otel-monitor table { width: 100%; border-collapse: collapse; font-size: 0.855rem; }
  .otel-monitor th {
    text-align: left; padding: 9px 12px;
    font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
    color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;
  }
  .otel-monitor td { padding: 11px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .otel-monitor tr:last-child td { border-bottom: none; }
  .otel-monitor tr:hover td { background: #fafbfc; }

  .otel-monitor .pattern-name { font-weight: 500; color: #111827; }
  .otel-monitor .sample-msg { font-size: 0.73rem; color: #6b7280; margin-top: 3px; }

  .otel-monitor .count-badge {
    display: inline-block; background: #f3f4f6; border-radius: 999px;
    padding: 2px 10px; font-size: 0.78rem; font-weight: 600; color: #374151;
  }
  .otel-monitor .svc-tag {
    display: inline-block; background: #eff6ff; color: #1d4ed8;
    border-radius: 4px; padding: 1px 7px; font-size: 0.7rem; margin: 2px 2px 2px 0;
  }
  .otel-monitor .badge {
    display: inline-block; border-radius: 4px; padding: 2px 8px;
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .otel-monitor .badge-critical { background: #fef2f2; color: #dc2626; }
  .otel-monitor .badge-high     { background: #fffbeb; color: #d97706; }
  .otel-monitor .badge-medium   { background: #eff6ff; color: #2563eb; }
  .otel-monitor .badge-low      { background: #f0fdf4; color: #16a34a; }

  .otel-monitor .summary-text { font-size: 0.88rem; line-height: 1.65; color: #374151; }
  .otel-monitor .model-badge {
    font-size: 0.68rem; background: #eef2ff; color: #4f46e5;
    border-radius: 4px; padding: 2px 8px;
  }

  .otel-monitor .remediation {
    border: 1px solid #e5e7eb; border-radius: 8px; padding: 13px; margin-bottom: 10px;
  }
  .otel-monitor .remediation:last-child { margin-bottom: 0; }
  .otel-monitor .remediation .action { font-size: 0.855rem; font-weight: 500; color: #111827; margin-bottom: 10px; line-height: 1.5; }
  .otel-monitor .conf-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
  .otel-monitor .conf-wrap { flex: 1; background: #f3f4f6; border-radius: 999px; height: 6px; overflow: hidden; }
  .otel-monitor .conf-bar { height: 100%; border-radius: 999px; }
  .otel-monitor .conf-high   { background: #16a34a; }
  .otel-monitor .conf-medium { background: #d97706; }
  .otel-monitor .conf-low    { background: #dc2626; }
  .otel-monitor .conf-pct { font-size: 0.73rem; font-weight: 600; color: #374151; white-space: nowrap; }
  .otel-monitor .runbook-link { font-size: 0.73rem; color: #2563eb; text-decoration: none; }
  .otel-monitor .runbook-link:hover { text-decoration: underline; }

  .otel-monitor .state-center { text-align: center; padding: 60px 20px; color: #6b7280; }
  .otel-monitor .spinner {
    width: 34px; height: 34px; border: 3px solid #e5e7eb; border-top-color: #07135e;
    border-radius: 50%; animation: otelSpin 0.8s linear infinite; margin: 0 auto 14px;
  }
  @keyframes otelSpin { to { transform: rotate(360deg); } }
  .otel-monitor .error-state { color: #dc2626; }
  .otel-monitor .countdown { font-size: 0.73rem; opacity: 0.7; }

  .otel-monitor .time-filter {
    background: white; border-bottom: 1px solid #e5e7eb;
    padding: 10px 28px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .otel-monitor .time-filter label { font-size: 0.78rem; color: #6b7280; font-weight: 500; }
  .otel-monitor .preset-btn {
    border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 6px;
    padding: 5px 12px; font-size: 0.78rem; cursor: pointer; color: #374151;
  }
  .otel-monitor .preset-btn:hover { background: #f3f4f6; }
  .otel-monitor .preset-btn.active { background: #07135e; color: white; border-color: #07135e; }
  .otel-monitor .time-sep { color: #d1d5db; font-size: 0.78rem; }
  .otel-monitor .time-input {
    border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 10px;
    font-size: 0.78rem; color: #374151; background: #f9fafb;
  }
  .otel-monitor .apply-btn {
    background: #07135e; color: white; border: none; border-radius: 6px;
    padding: 5px 14px; font-size: 0.78rem; cursor: pointer; font-weight: 500;
  }
  .otel-monitor .apply-btn:hover { background: #0a1a7a; }

  .otel-monitor .severity-filter {
    background: #f9fafb; border-bottom: 1px solid #e5e7eb;
    padding: 8px 28px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .otel-monitor .analyse-btn {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: 5px 14px; font-size: 0.78rem; cursor: pointer; font-weight: 500; margin-left: auto;
  }
  .otel-monitor .analyse-btn:hover { background: #4338ca; }
  .otel-monitor .analyse-btn:disabled { background: #a5b4fc; cursor: not-allowed; }
`;

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function severityClass(s) {
  return ({ critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' })[s] || 'badge-low';
}

function confClass(c) {
  if (c >= 0.75) return 'conf-high';
  if (c >= 0.5) return 'conf-medium';
  return 'conf-low';
}

function confLabel(c) {
  if (c >= 0.9) return 'Very High';
  if (c >= 0.75) return 'High';
  if (c >= 0.5) return 'Medium';
  return 'Low';
}

function renderLogRows(logs) {
  if (!logs || !logs.length) {
    return '<tr><td colspan="5" style="text-align:center;padding:32px;color:#6b7280">No logs in this range.</td></tr>';
  }
  return logs.map(l => {
    const ts = l['@timestamp'] ? new Date(l['@timestamp']).toLocaleString() : '—';
    const severity = l.SeverityText || '—';
    const service = (l.Resource && l.Resource.service && l.Resource.service.name) || '—';
    const errorType = (l.Attributes && l.Attributes.error && l.Attributes.error.type) || '—';
    const body = l.Body || l.body || '—';
    return `
      <tr>
        <td style="white-space:nowrap;font-size:0.75rem;color:#6b7280">${esc(ts)}</td>
        <td><span class="badge ${severityClass(severity.toLowerCase())}">${esc(severity)}</span></td>
        <td><span class="svc-tag">${esc(service)}</span></td>
        <td><span class="pattern-name">${esc(errorType)}</span></td>
        <td class="sample-msg">${esc(body)}</td>
      </tr>
    `;
  }).join('');
}

function renderPagination(total, page, size) {
  const totalPages = Math.ceil(total / size);
  if (totalPages <= 1) return '';
  const showing = ((page - 1) * size) + 1;
  const showingEnd = Math.min(page * size, total);
  const pageButtons = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    const p = i + 1;
    return `<button class="preset-btn${p === page ? ' active' : ''}" data-logpage="${p}">${p}</button>`;
  }).join('');
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 18px;flex-wrap:wrap;gap:8px;border-top:1px solid #f3f4f6;">
      <span style="font-size:0.75rem;color:#6b7280">Showing ${showing}–${showingEnd} of ${total.toLocaleString()} logs</span>
      <div style="display:flex;gap:4px;align-items:center;">
        <button class="preset-btn" data-logpage="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''}>‹</button>
        ${pageButtons}
        ${totalPages > 7 ? `<span style="color:#6b7280;font-size:0.78rem">… ${totalPages}</span>` : ''}
        <button class="preset-btn" data-logpage="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>
  `;
}

function renderRemediations(remediations) {
  if (!remediations.length) return '<p style="color:#6b7280;font-size:0.85rem">No remediations suggested.</p>';
  return remediations.map(r => {
    const pct = Math.round(r.confidence * 100);
    return `
      <div class="remediation">
        <div class="action">${esc(r.action)}</div>
        <div class="conf-row">
          <div class="conf-wrap">
            <div class="conf-bar ${confClass(r.confidence)}" style="width:${pct}%"></div>
          </div>
          <span class="conf-pct">${pct}% · ${confLabel(r.confidence)}</span>
        </div>
        ${r.runbook_url ? `<a class="runbook-link" href="${esc(r.runbook_url)}" target="_blank">📖 View runbook</a>` : ''}
      </div>
    `;
  }).join('');
}

function renderDashboard(data, totalIngested, logsPage) {
  const analyzedAt = data.timestamp ? new Date(data.timestamp).toLocaleString() : '—';
  const ingestedCount = totalIngested != null ? totalIngested : (data.logs_analyzed || 0);
  const lp = logsPage || { logs: [], total: 0, page: 1, size: 10 };

  return `
    <div class="meta-strip">
      <div class="meta-card"><div class="value">${ingestedCount.toLocaleString()}</div><div class="label">Logs Ingested</div></div>
      <div class="meta-card"><div class="value">${(data.clusters || []).length}</div><div class="label">Error Clusters</div></div>
      <div class="meta-card"><div class="value">${(data.remediations || []).length}</div><div class="label">Actions</div></div>
      <div class="meta-card"><div class="value" style="font-size:0.9rem">${analyzedAt}</div><div class="label">Last Analysis</div></div>
    </div>

    <div class="grid">
      <div>
        <div class="card">
          <div class="card-header">
            <h2>Log Explorer</h2>
            <span class="hint">All logs · paginated · no AI tokens used</span>
          </div>
          <div style="overflow-x:auto" id="otel-log-table-wrap">
            <table>
              <thead><tr>
                <th>Timestamp</th><th>Severity</th><th>Service</th><th>Error Pattern</th><th>Message</th>
              </tr></thead>
              <tbody id="otel-log-rows">${renderLogRows(lp.logs)}</tbody>
            </table>
          </div>
          <div id="otel-pagination">${renderPagination(lp.total, lp.page, lp.size)}</div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <h2>Incident Summary</h2>
            <span class="model-badge">Claude claude-sonnet-4-6</span>
          </div>
          <div class="card-body">
            <p class="summary-text" id="otel-summary-text">${esc(data.summary || 'No summary available.')}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Suggested Actions</h2>
            <span class="hint">with confidence signals</span>
          </div>
          <div class="card-body" id="otel-remediations">
            ${renderRemediations(data.remediations || [])}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Kibana Plugin registration
// ---------------------------------------------------------------------------

function plugin() {
  return {
    setup(core) {
      core.application.register({
        id: 'otelLogMonitor',
        title: 'Control Tower Log Monitor',

        mount(params) {
          // Inject scoped CSS once
          const styleEl = document.createElement('style');
          styleEl.id = 'otel-monitor-styles';
          styleEl.textContent = CSS;
          document.head.appendChild(styleEl);

          // Root container
          const root = document.createElement('div');
          root.className = 'otel-monitor';
          params.element.appendChild(root);

          let countdown = 30;
          let countdownTimer = null;
          let activePreset = 'live'; // 'live' | 'custom'
          let customFrom = '';
          let customTo = '';
          let activeSeverity = 'ALL'; // 'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

          function toISO(date) {
            return date.toISOString();
          }

          function presetRange(minutes) {
            const to = new Date();
            const from = new Date(to.getTime() - minutes * 60 * 1000);
            return { from: toISO(from), to: toISO(to) };
          }

          function renderTimeFilter() {
            const presets = [
              { label: 'Last 5m',  key: '5m',   minutes: 5 },
              { label: 'Last 15m', key: '15m',  minutes: 15 },
              { label: 'Last 1h',  key: '1h',   minutes: 60 },
              { label: 'Last 24h', key: '24h',  minutes: 1440 },
              { label: 'Last 7d',  key: '7d',   minutes: 10080 },
            ];
            return `
              <div class="time-filter" id="otel-time-filter">
                <label>Time range:</label>
                ${presets.map(p => `
                  <button class="preset-btn${activePreset === p.key ? ' active' : ''}"
                    data-preset="${p.key}" data-minutes="${p.minutes}">${p.label}</button>
                `).join('')}
                <span class="time-sep">|</span>
                <button class="preset-btn${activePreset === 'custom' ? ' active' : ''}"
                  data-preset="custom">Custom</button>
                <div id="otel-custom-range" style="display:${activePreset === 'custom' ? 'flex' : 'none'};align-items:center;gap:8px;">
                  <input class="time-input" type="datetime-local" id="otel-from" value="${customFrom}" />
                  <span class="time-sep">→</span>
                  <input class="time-input" type="datetime-local" id="otel-to" value="${customTo}" />
                  <button class="apply-btn" id="otel-apply">Apply</button>
                </div>
              </div>
            `;
          }

          function renderSeverityFilter() {
            const severities = ['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
            return `
              <div class="severity-filter" id="otel-severity-filter">
                <label style="font-size:0.78rem;color:#6b7280;font-weight:500;">Severity:</label>
                ${severities.map(s => `
                  <button class="preset-btn${activeSeverity === s ? ' active' : ''}" data-severity="${s}">${s}</button>
                `).join('')}
                <button class="analyse-btn" id="otel-analyse-btn">✦ Analyse with AI</button>
              </div>
            `;
          }

          function setContent(html) {
            const isLive = activePreset === 'live';
            root.innerHTML = `
              <header>
                <div class="logo">
                  <img src="${(window.__kbnPublicPath__||{})['otelLogMonitor']||''}test.png" alt="Logo" style="height:32px;display:block;" />
                  <div>
                    <h1>Control Tower Log Monitor</h1>
                    <div class="subtitle">OpenTelemetry · Claude claude-sonnet-4-6 · Elasticsearch</div>
                  </div>
                </div>
                <div class="status-bar">
                  ${isLive ? '<span><span class="pulse"></span>Live</span>' : '<span>Historical</span>'}
                  ${isLive ? `<span class="countdown" id="otel-countdown">Refreshes in ${countdown}s</span>` : ''}
                </div>
              </header>
              ${renderTimeFilter()}
              ${renderSeverityFilter()}
              <main>${html}</main>
            `;
            attachTimeFilterListeners();
            attachSeverityFilterListeners();
            attachPaginationListeners();
          }

          function attachSeverityFilterListeners() {
            const bar = document.getElementById('otel-severity-filter');
            if (!bar) return;

            bar.querySelectorAll('[data-severity]').forEach(btn => {
              btn.addEventListener('click', () => {
                console.log('[severity filter click] button clicked:', btn.dataset.severity);
                activeSeverity = btn.dataset.severity;
                console.log('[severity filter click] activeSeverity now:', activeSeverity);
                clearInterval(countdownTimer);
                setContent('<div class="state-center"><div class="spinner"></div><p>Loading…</p></div>');
                fetchAndRender();
              });
            });

            const analyseBtn = document.getElementById('otel-analyse-btn');
            if (analyseBtn) {
              analyseBtn.addEventListener('click', async () => {
                analyseBtn.disabled = true;
                analyseBtn.textContent = 'Analysing…';
                const sev = activeSeverity === 'ALL' ? null : activeSeverity;
                const url = `http://localhost:8000/process-range?from_ts=${encodeURIComponent(currentFrom)}&to_ts=${encodeURIComponent(currentTo)}${sev ? '&severity=' + sev : ''}`;
                try {
                  const res = await fetch(url, { method: 'POST' });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json();
                  currentSummaryData = data;
                  // Update just the right-column panels without full re-render
                  const summaryEl = document.getElementById('otel-summary-text');
                  const remediationsEl = document.getElementById('otel-remediations');
                  if (summaryEl) summaryEl.textContent = data.summary || 'No summary available.';
                  if (remediationsEl) remediationsEl.innerHTML = renderRemediations(data.remediations || []);
                  analyseBtn.disabled = false;
                  analyseBtn.textContent = '✦ Analyse with AI';
                } catch (e) {
                  analyseBtn.disabled = false;
                  analyseBtn.textContent = '✦ Analyse with AI';
                  alert('Analysis failed: ' + e.message);
                }
              });
            }
          }

          function attachTimeFilterListeners() {
            const filter = document.getElementById('otel-time-filter');
            if (!filter) return;

            filter.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
              btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                if (preset === 'custom') {
                  activePreset = 'custom';
                  // Default custom range to last 15 minutes
                  const now = new Date();
                  const from = new Date(now.getTime() - 15 * 60 * 1000);
                  customFrom = from.toISOString().slice(0, 16);
                  customTo = now.toISOString().slice(0, 16);
                  clearInterval(countdownTimer);
                  setContent('<div class="state-center"><div class="spinner"></div><p>Loading…</p></div>');
                } else {
                  activePreset = preset;
                  clearInterval(countdownTimer);
                  setContent('<div class="state-center"><div class="spinner"></div><p>Loading…</p></div>');
                  fetchAndRender();
                }
              });
            });

            const applyBtn = document.getElementById('otel-apply');
            if (applyBtn) {
              applyBtn.addEventListener('click', () => {
                const fromEl = document.getElementById('otel-from');
                const toEl = document.getElementById('otel-to');
                customFrom = fromEl ? fromEl.value : '';
                customTo = toEl ? toEl.value : '';
                if (!customFrom || !customTo) return;
                clearInterval(countdownTimer);
                setContent('<div class="state-center"><div class="spinner"></div><p>Loading…</p></div>');
                fetchAndRender();
              });
            }
          }

          function startCountdown() {
            if (activePreset !== 'live' && !['5m','15m','1h','24h','7d'].includes(activePreset)) return;
            clearInterval(countdownTimer);
            countdown = 30;
            countdownTimer = setInterval(() => {
              countdown--;
              const el = document.getElementById('otel-countdown');
              if (el) el.textContent = countdown > 0 ? `Refreshes in ${countdown}s` : 'Refreshing…';
              if (countdown <= 0) {
                clearInterval(countdownTimer);
                fetchAndRender();
              }
            }, 1000);
          }

          const PRESET_MINUTES = { '5m': 5, '15m': 15, '1h': 60, '24h': 1440, '7d': 10080 };
          let currentFrom = '';
          let currentTo = '';
          let currentSummaryData = null;
          let currentTotalIngested = 0;
          let currentLogPage = 1;

          async function fetchLogsPageAndUpdate(page) {
            currentLogPage = page;
            const sev = activeSeverity === 'ALL' ? '' : `&severity=${activeSeverity}`;
            const url = `http://localhost:8000/logs?from_ts=${encodeURIComponent(currentFrom)}&to_ts=${encodeURIComponent(currentTo)}&page=${page}&size=10${sev}`;
            try {
              const res = await fetch(url);
              if (!res.ok) return;
              const lp = await res.json();
              const rowsEl = document.getElementById('otel-log-rows');
              const pageEl = document.getElementById('otel-pagination');
              if (rowsEl) rowsEl.innerHTML = renderLogRows(lp.logs);
              if (pageEl) { pageEl.innerHTML = renderPagination(lp.total, lp.page, lp.size); attachPaginationListeners(); }
            } catch (e) { /* silent */ }
          }

          function attachPaginationListeners() {
            const pageEl = document.getElementById('otel-pagination');
            if (!pageEl) return;
            pageEl.querySelectorAll('[data-logpage]').forEach(btn => {
              btn.addEventListener('click', () => {
                const p = parseInt(btn.dataset.logpage, 10);
                if (p && !btn.disabled) fetchLogsPageAndUpdate(p);
              });
            });
          }

          async function fetchAndRender() {
            let from, to;
            if (activePreset === 'custom') {
              if (!customFrom || !customTo) return;
              from = new Date(customFrom).toISOString();
              to = new Date(customTo).toISOString();
            } else {
              const minutes = PRESET_MINUTES[activePreset];
              const range = presetRange(minutes);
              from = range.from;
              to = range.to;
            }

            currentFrom = from;
            currentTo = to;
            currentLogPage = 1;

            const sev = activeSeverity === 'ALL' ? '' : `&severity=${activeSeverity}`;
            console.log('[fetchAndRender] activeSeverity =', activeSeverity, ', sev =', sev);
            const summaryUrl = `http://localhost:8000/summary-range?from_ts=${encodeURIComponent(from)}&to_ts=${encodeURIComponent(to)}`;
            const countUrl   = `http://localhost:8000/log-count?from_ts=${encodeURIComponent(from)}&to_ts=${encodeURIComponent(to)}${sev}`;
            const logsUrl    = `http://localhost:8000/logs?from_ts=${encodeURIComponent(from)}&to_ts=${encodeURIComponent(to)}&page=1&size=10${sev}`;
            console.log('[fetchAndRender] logsUrl =', logsUrl);

            try {
              const [summaryRes, countRes, logsRes] = await Promise.all([
                fetch(summaryUrl),
                fetch(countUrl),
                fetch(logsUrl),
              ]);

              const countData = countRes.ok ? await countRes.json() : { count: 0 };
              const logsData  = logsRes.ok  ? await logsRes.json()  : { logs: [], total: 0, page: 1, size: 10 };
              currentTotalIngested = countData.count;

              if (summaryRes.status === 404) {
                setContent(`
                  <div class="meta-strip">
                    <div class="meta-card">
                      <div class="value">${countData.count.toLocaleString()}</div>
                      <div class="label">Logs Ingested</div>
                    </div>
                  </div>
                  <div class="card" style="margin:24px 28px;">
                    <div class="card-header"><h2>Log Explorer</h2><span class="hint">Paginated · no AI tokens used</span></div>
                    <div style="overflow-x:auto">
                      <table>
                        <thead><tr>
                          <th>Timestamp</th><th>Severity</th><th>Service</th><th>Error Pattern</th><th>Message</th>
                        </tr></thead>
                        <tbody id="otel-log-rows">${renderLogRows(logsData.logs)}</tbody>
                      </table>
                    </div>
                    <div id="otel-pagination">${renderPagination(logsData.total, logsData.page, logsData.size)}</div>
                  </div>
                  <div class="state-center" style="padding:20px 28px;">
                    <div style="font-size:2rem;margin-bottom:12px">📭</div>
                    <p style="font-weight:600;color:#374151">No stored AI summary for this period</p>
                    <p style="margin-top:8px;font-size:0.85rem;color:#6b7280">
                      ${countData.count > 0
                        ? `${countData.count.toLocaleString()} logs ingested. Use <strong>Analyse with AI</strong> to generate a summary.`
                        : 'No logs ingested in this time range.'}
                    </p>
                  </div>
                `);
              } else if (!summaryRes.ok) {
                throw new Error(`HTTP ${summaryRes.status}`);
              } else {
                const data = await summaryRes.json();
                currentSummaryData = data;
                setContent(renderDashboard(data, countData.count, logsData));
              }
            } catch (e) {
              setContent(`
                <div class="state-center error-state">
                  <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
                  <p><strong>Could not load summary</strong></p>
                  <p style="margin-top:8px;font-size:0.85rem">${esc(e.message)}</p>
                  <p style="margin-top:8px;font-size:0.82rem;color:#6b7280">
                    Make sure the Claude processor is running at <code>http://localhost:8000</code>
                  </p>
                </div>
              `);
            }
            startCountdown();
          }

          // Initial load — default to last 15 minutes
          activePreset = '15m';
          activeSeverity = 'ALL';
          setContent('<div class="state-center"><div class="spinner"></div><p>Loading latest AI summary…</p></div>');
          fetchAndRender();

          // Unmount cleanup
          return () => {
            clearInterval(countdownTimer);
            const styleToRemove = document.getElementById('otel-monitor-styles');
            if (styleToRemove) styleToRemove.remove();
            root.remove();
          };
        },
      });
    },

    start() {},
    stop() {},
  };
}


  if (!window.__kbnBundles__) {
    console.error('[otelLogMonitor] window.__kbnBundles__ not available');
    return;
  }

  // define(key, bundleRequire, bundleModuleKey)
  // get(key) calls: modules[key].bundleRequire(modules[key].bundleModuleKey)
  // So bundleRequire must be the function itself, not wrapped in a factory.
  window.__kbnBundles__.define(
    'plugin/otelLogMonitor/public',
    function () { return { plugin: plugin }; },
    'plugin/otelLogMonitor/public'
  );

  console.log('[otelLogMonitor] registered via __kbnBundles__.define with bundleRequire wrapper');
})();
