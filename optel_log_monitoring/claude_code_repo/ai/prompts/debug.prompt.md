# Debug

Systematic debugging with project context.
Complete the input section below, then paste into your AI assistant.

## Context — Read these files first

- `ai/AGENTS.md` — project architecture and conventions

## Your input (complete before pasting)

- **Bug description**: [what's happening vs. what should happen]
- **Reproduction steps**: [how to trigger the bug]
- **Affected files/areas**: [paths or components involved]
- **Error messages**: [exact error text, stack traces, or logs]
- **What you've tried**: [any debugging already done]

## Instructions

1. Read project architecture from `ai/AGENTS.md`
2. Analyze the bug systematically:
   - Reproduce mentally from the described steps
   - Trace the data/control flow through the affected code
   - Identify potential root causes (list at least 3)
   - Rank by likelihood
4. For the most likely root cause:
   - Explain WHY it causes the observed behavior
   - Show the specific code that's problematic
   - Propose a fix with exact code changes
   - Identify what tests should be added to prevent regression
5. If the fix reveals a broader pattern or learning, document it for the team.
