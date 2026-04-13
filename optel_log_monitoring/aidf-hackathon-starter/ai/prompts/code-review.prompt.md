# Code Review

Review code changes against project conventions and quality standards.
Complete the input section below, then paste into your AI assistant.

## Context — Read these files first

- `ai/AGENTS.md` — project conventions, quality gates, and boundaries
- `ai/roles/reviewer.md` — reviewer role and behavior rules

## Your input (complete before pasting)

- **What to review**: [PR number, branch name, or "staged changes"]
- **Files changed**: [list key files, or "see diff"]
- **Type of change**: [feature | bugfix | refactor | docs | dependency]
- **Focus areas**: [any specific concerns, or "general review"]

## Instructions

1. Read the project conventions from `ai/AGENTS.md`
2. Read the reviewer role definition from `ai/roles/reviewer.md`
3. Review all changes against:
   - **Conventions**: naming, imports, code style, patterns
   - **Architecture**: correct layer, no boundary violations
   - **Quality**: test coverage, error handling, edge cases
   - **Security**: no secrets, no injection vectors, safe inputs
   - **Performance**: no obvious bottlenecks or regressions
5. Categorize findings by severity:
   - **Critical** — must fix before merge
   - **Important** — should fix, creates tech debt if not
   - **Suggestion** — nice to have, not blocking
6. For each finding, provide:
   - File and line reference
   - What's wrong
   - How to fix it (with code if applicable)
7. End with a clear verdict: APPROVE, REQUEST CHANGES, or NEEDS DISCUSSION
