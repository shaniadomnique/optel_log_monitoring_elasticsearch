define(() => { return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   plugin: () => (/* binding */ plugin)
/* harmony export */ });
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
  @media (max-width: 900px) { .otel-monitor .grid { grid-template-columns: 1fr; } }

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

function renderClusters(clusters) {
  if (!clusters.length) {
    return '<tr><td colspan="4" style="text-align:center;padding:32px;color:#6b7280">No anomalies in current window.</td></tr>';
  }
  return clusters.map(c => `
    <tr>
      <td>
        <div class="pattern-name">${esc(c.pattern)}</div>
        ${c.sample_messages?.[0] ? `<div class="sample-msg">${esc(c.sample_messages[0])}</div>` : ''}
      </td>
      <td><span class="count-badge">${c.count}</span></td>
      <td><span class="badge ${severityClass(c.severity)}">${esc(c.severity)}</span></td>
      <td>${(c.affected_services || []).map(s => `<span class="svc-tag">${esc(s)}</span>`).join('')}</td>
    </tr>
  `).join('');
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

function renderDashboard(data) {
  const clusters = [...(data.clusters || [])].sort((a, b) => b.count - a.count);
  const analyzedAt = data.timestamp ? new Date(data.timestamp).toLocaleString() : '—';

  return `
    <div class="meta-strip">
      <div class="meta-card"><div class="value">${(data.logs_analyzed || 0).toLocaleString()}</div><div class="label">Logs Analyzed</div></div>
      <div class="meta-card"><div class="value">${data.log_window_minutes || 15}m</div><div class="label">Time Window</div></div>
      <div class="meta-card"><div class="value">${clusters.length}</div><div class="label">Error Clusters</div></div>
      <div class="meta-card"><div class="value">${(data.remediations || []).length}</div><div class="label">Actions</div></div>
      <div class="meta-card"><div class="value" style="font-size:0.9rem">${analyzedAt}</div><div class="label">Last Analysis</div></div>
    </div>

    <div class="grid">
      <div>
        <div class="card">
          <div class="card-header">
            <h2>Top Anomaly Clusters</h2>
            <span class="hint">ERROR &amp; CRITICAL · sorted by count</span>
          </div>
          <div style="overflow-x:auto">
            <table>
              <thead><tr>
                <th>Error Pattern</th><th>Count</th><th>Severity</th><th>Affected Services</th>
              </tr></thead>
              <tbody>${renderClusters(clusters)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <h2>Incident Summary</h2>
            <span class="model-badge">Claude claude-sonnet-4-6</span>
          </div>
          <div class="card-body">
            <p class="summary-text">${esc(data.summary || 'No summary available.')}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Suggested Actions</h2>
            <span class="hint">with confidence signals</span>
          </div>
          <div class="card-body">
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
        title: 'OTel Log Monitor',

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

          function setContent(html) {
            root.innerHTML = `
              <header>
                <div class="logo">
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="6" fill="#1e3a8a"/>
                    <path d="M6 20L11 10L16 16L19 12L22 20H6Z" fill="#60a5fa" opacity="0.9"/>
                    <circle cx="19" cy="9" r="2.5" fill="#f87171"/>
                  </svg>
                  <div>
                    <h1>OTel Log Monitor</h1>
                    <div class="subtitle">OpenTelemetry · Claude claude-sonnet-4-6 · Elasticsearch</div>
                  </div>
                </div>
                <div class="status-bar">
                  <span><span class="pulse"></span>Live</span>
                  <span class="countdown" id="otel-countdown">Refreshes in ${countdown}s</span>
                </div>
              </header>
              <main>${html}</main>
            `;
          }

          function startCountdown() {
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

          async function fetchAndRender() {
            try {
              const res = await fetch('http://localhost:8000/latest-summary');
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              setContent(renderDashboard(data));
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

          // Initial load
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

/******/ 	return __webpack_exports__;
/******/ })()
;
});;