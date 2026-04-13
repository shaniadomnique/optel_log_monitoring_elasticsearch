"""
Synthetic log generator for the OTel Log Monitor hackathon project.

Produces a continuous NDJSON log stream to logs/sample.log, mimicking
5 microservices with realistic mixed-severity log patterns including
repeating error signatures for Claude to cluster.
"""

import json
import os
import random
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

LOG_FILE_PATH = Path(os.getenv("LOG_FILE_PATH", "logs/sample.log"))
LOG_RATE_PER_SECOND = float(os.getenv("LOG_RATE_PER_SECOND", "10"))

SERVICES = [
    "auth-service",
    "payment-service",
    "api-gateway",
    "inventory-service",
    "notification-service",
]

# Severity weights: INFO 60%, WARNING 20%, ERROR 15%, CRITICAL 5%
SEVERITY_WEIGHTS = [
    ("INFO", 9, 0.60),
    ("WARNING", 13, 0.20),
    ("ERROR", 17, 0.15),
    ("CRITICAL", 21, 0.05),
]

# Error patterns — each entry: (error_type, message_template, allowed_services)
ERROR_PATTERNS = [
    (
        "DatabaseConnectionTimeout",
        "Connection to postgres timed out after 30s on host db-primary:5432",
        ["payment-service", "inventory-service"],
    ),
    (
        "DatabaseConnectionTimeout",
        "Failed to acquire connection from pool after 10s (pool_size=10, overflow=5)",
        ["payment-service", "inventory-service"],
    ),
    (
        "AuthTokenExpired",
        "JWT token expired: iat=1743462000, exp=1743465600, now={now}",
        ["auth-service", "api-gateway"],
    ),
    (
        "AuthTokenExpired",
        "Refresh token rejected — token revoked or expired",
        ["auth-service"],
    ),
    (
        "NullPointerException",
        "NullPointerException: Cannot read property 'id' of undefined at processOrder()",
        SERVICES,
    ),
    (
        "NullPointerException",
        "NullPointerException: user object is null — missing middleware?",
        SERVICES,
    ),
    (
        "RateLimitExceeded",
        "Rate limit exceeded for client {client_ip}: 1001 requests in 60s (limit: 1000)",
        ["api-gateway"],
    ),
    (
        "ServiceUnavailable",
        "Downstream service notification-service returned 503 after 3 retries",
        ["notification-service", "api-gateway"],
    ),
    (
        "ServiceUnavailable",
        "Circuit breaker OPEN for notification-service — failing fast",
        ["api-gateway"],
    ),
]

INFO_MESSAGES = [
    "Request processed successfully in {duration}ms",
    "User {user_id} authenticated — session created",
    "Order {order_id} placed and confirmed",
    "Cache hit for key={cache_key} — returning cached response",
    "Health check passed — all dependencies reachable",
    "Scheduled job completed: cleanup_expired_sessions removed {count} records",
    "WebSocket connection established for session {session_id}",
    "Batch job started: processing {count} pending notifications",
]

WARNING_MESSAGES = [
    "Response time degraded: {duration}ms (threshold: 500ms)",
    "Cache miss rate elevated: {miss_rate}% in last 60s",
    "Database connection pool at {pct}% capacity",
    "Retrying request to {service} (attempt {attempt}/3)",
    "Memory usage at {pct}% — approaching limit",
    "Deprecated API endpoint /v1/orders called by {client}",
]


# ---------------------------------------------------------------------------
# Log building
# ---------------------------------------------------------------------------


def _weighted_severity() -> tuple[str, int]:
    """Return a (severity_text, severity_number) tuple based on configured weights."""
    r = random.random()
    cumulative = 0.0
    for text, number, weight in SEVERITY_WEIGHTS:
        cumulative += weight
        if r < cumulative:
            return text, number
    return "INFO", 9


def _render(template: str) -> str:
    """Substitute simple placeholders in message templates."""
    return (
        template.replace("{now}", str(int(time.time())))
        .replace("{duration}", str(random.randint(50, 5000)))
        .replace("{user_id}", f"usr_{random.randint(1000, 9999)}")
        .replace("{order_id}", f"ord_{uuid.uuid4().hex[:8]}")
        .replace("{cache_key}", f"cache:{random.randint(1, 100)}")
        .replace("{count}", str(random.randint(1, 500)))
        .replace("{session_id}", uuid.uuid4().hex[:12])
        .replace("{miss_rate}", str(random.randint(15, 60)))
        .replace("{pct}", str(random.randint(75, 95)))
        .replace("{service}", random.choice(SERVICES))
        .replace("{attempt}", str(random.randint(1, 3)))
        .replace("{client}", f"client-{random.randint(1, 50)}")
        .replace("{client_ip}", f"10.0.{random.randint(0, 255)}.{random.randint(1, 254)}")
    )


def build_log_entry(service: str) -> dict:
    """Construct a single OTel-compatible log entry for the given service."""
    severity_text, severity_number = _weighted_severity()
    now = datetime.now(timezone.utc).isoformat()

    entry: dict = {
        "timestamp": now,
        "severity_text": severity_text,
        "severity_number": severity_number,
        "service.name": service,
        "trace_id": uuid.uuid4().hex,
        "span_id": uuid.uuid4().hex[:16],
    }

    if severity_text in ("ERROR", "CRITICAL"):
        # Pick an error pattern valid for this service
        valid = [p for p in ERROR_PATTERNS if service in p[2]]
        if valid:
            error_type, message_template, _ = random.choice(valid)
        else:
            error_type, message_template, _ = random.choice(ERROR_PATTERNS)
        entry["body"] = _render(message_template)
        entry["error.type"] = error_type
    elif severity_text == "WARNING":
        entry["body"] = _render(random.choice(WARNING_MESSAGES))
    else:
        entry["body"] = _render(random.choice(INFO_MESSAGES))

    return entry


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------


def main() -> None:
    LOG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    interval = 1.0 / LOG_RATE_PER_SECOND

    print(f"[generator] Writing logs to {LOG_FILE_PATH} at {LOG_RATE_PER_SECOND}/s — Ctrl+C to stop")

    with LOG_FILE_PATH.open("a", encoding="utf-8") as fh:
        while True:
            service = random.choice(SERVICES)
            entry = build_log_entry(service)
            fh.write(json.dumps(entry) + "\n")
            fh.flush()
            time.sleep(interval)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[generator] Stopped.")
