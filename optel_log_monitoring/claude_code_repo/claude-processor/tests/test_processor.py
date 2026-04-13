"""
Unit tests for processor.py.

Tests cover: prompt building, Claude response validation, and the full run_once
orchestration using mocked ES and Claude clients.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from processor import (
    build_prompt,
    call_claude,
    run_once,
    validate_response,
)


# ---------------------------------------------------------------------------
# build_prompt
# ---------------------------------------------------------------------------


def test_build_prompt_includes_all_logs() -> None:
    logs = [
        {"body": "Connection timeout", "severity_text": "ERROR"},
        {"body": "Auth token expired", "severity_text": "CRITICAL"},
    ]
    prompt = build_prompt(logs)

    assert "Connection timeout" in prompt
    assert "Auth token expired" in prompt
    assert "NDJSON" in prompt


def test_build_prompt_returns_string() -> None:
    logs = [{"body": "test", "severity_text": "INFO"}]
    assert isinstance(build_prompt(logs), str)


def test_build_prompt_empty_logs() -> None:
    prompt = build_prompt([])
    assert "Logs (NDJSON" in prompt


# ---------------------------------------------------------------------------
# validate_response
# ---------------------------------------------------------------------------


def _valid_response() -> dict:
    return {
        "clusters": [
            {
                "pattern": "DatabaseConnectionTimeout",
                "count": 42,
                "severity": "critical",
                "affected_services": ["payment-service"],
                "sample_messages": ["Connection timed out"],
            }
        ],
        "summary": "The payment service is experiencing database connection timeouts.",
        "remediations": [
            {
                "action": "Check connection pool settings",
                "confidence": 0.92,
                "runbook_url": "https://runbooks.internal/db-timeout",
            }
        ],
    }


def test_validate_response_valid() -> None:
    assert validate_response(_valid_response()) is True


def test_validate_response_missing_clusters() -> None:
    resp = _valid_response()
    del resp["clusters"]
    assert validate_response(resp) is False


def test_validate_response_missing_summary() -> None:
    resp = _valid_response()
    del resp["summary"]
    assert validate_response(resp) is False


def test_validate_response_missing_remediations() -> None:
    resp = _valid_response()
    del resp["remediations"]
    assert validate_response(resp) is False


def test_validate_response_empty_summary() -> None:
    resp = _valid_response()
    resp["summary"] = "   "
    assert validate_response(resp) is False


def test_validate_response_clusters_not_list() -> None:
    resp = _valid_response()
    resp["clusters"] = "not a list"
    assert validate_response(resp) is False


def test_validate_response_remediations_not_list() -> None:
    resp = _valid_response()
    resp["remediations"] = {"action": "fix it"}
    assert validate_response(resp) is False


# ---------------------------------------------------------------------------
# call_claude
# ---------------------------------------------------------------------------


def test_call_claude_parses_valid_json() -> None:
    expected = _valid_response()
    mock_client = MagicMock()
    mock_client.messages.create.return_value = MagicMock(
        content=[MagicMock(text=json.dumps(expected))]
    )

    result = call_claude(mock_client, "test prompt")
    assert result == expected


def test_call_claude_raises_on_invalid_json() -> None:
    mock_client = MagicMock()
    mock_client.messages.create.return_value = MagicMock(
        content=[MagicMock(text="not json at all")]
    )

    with pytest.raises(ValueError, match="non-JSON"):
        call_claude(mock_client, "test prompt")


def test_call_claude_strips_whitespace() -> None:
    expected = _valid_response()
    mock_client = MagicMock()
    mock_client.messages.create.return_value = MagicMock(
        content=[MagicMock(text=f"\n\n{json.dumps(expected)}\n")]
    )

    result = call_claude(mock_client, "test prompt")
    assert result == expected


# ---------------------------------------------------------------------------
# run_once
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_run_once_returns_none_when_no_logs() -> None:
    mock_es = AsyncMock()
    mock_es.search.return_value = {"hits": {"hits": []}}

    mock_claude = MagicMock()

    result = await run_once(mock_es, mock_claude, window_minutes=15)
    assert result is None
    mock_claude.messages.create.assert_not_called()


@pytest.mark.asyncio
async def test_run_once_returns_summary_on_success() -> None:
    log_doc = {
        "body": "Connection timed out",
        "severity_text": "ERROR",
        "resource": {"service.name": "payment-service"},
    }
    mock_es = AsyncMock()
    mock_es.search.return_value = {"hits": {"hits": [{"_source": log_doc}]}}
    mock_es.index = AsyncMock()

    valid = _valid_response()
    mock_claude = MagicMock()
    mock_claude.messages.create.return_value = MagicMock(
        content=[MagicMock(text=json.dumps(valid))]
    )

    result = await run_once(mock_es, mock_claude, window_minutes=15)

    assert result is not None
    assert result["summary"] == valid["summary"]
    assert result["logs_analyzed"] == 1
    assert result["log_window_minutes"] == 15
    mock_es.index.assert_called_once()


@pytest.mark.asyncio
async def test_run_once_returns_none_on_invalid_claude_response() -> None:
    log_doc = {
        "body": "Auth token expired",
        "severity_text": "CRITICAL",
        "resource": {"service.name": "auth-service"},
    }
    mock_es = AsyncMock()
    mock_es.search.return_value = {"hits": {"hits": [{"_source": log_doc}]}}
    mock_es.index = AsyncMock()

    mock_claude = MagicMock()
    mock_claude.messages.create.return_value = MagicMock(
        content=[MagicMock(text="this is not json")]
    )

    result = await run_once(mock_es, mock_claude, window_minutes=15)
    assert result is None
    mock_es.index.assert_not_called()
