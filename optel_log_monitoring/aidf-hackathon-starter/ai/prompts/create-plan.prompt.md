# Create Plan

Generate a multi-task implementation plan.
Complete the input section below, then paste into your AI assistant.

## Context — Read these files first

- `ai/AGENTS.md` — project conventions and boundaries
- `ai/templates/PLAN.template.md` — plan format to follow
- `ai/plans/` — existing plans for reference

## Your input (complete before pasting)

- **Initiative name**: [short name, e.g., "oauth2-migration"]
- **Goal**: [what will be true when the initiative is complete]
- **Scope**: [which parts of the codebase are involved]
- **Constraints**: [deadlines, dependencies, risks, or limitations]
- **Additional context**: [any extra details]

## Instructions

1. Read the project context from `ai/AGENTS.md`
2. Read the plan template from `ai/templates/PLAN.template.md`
3. Check existing plans in `ai/plans/` to avoid overlap
4. Break the initiative into phases:
   - Phase 1: Research & analysis (non-coding)
   - Phase 2+: Implementation phases (logical groupings)
   - Final phase: Testing & verification
6. For each phase, define individual tasks with:
   - Clear goal
   - Dependencies on other tasks
   - Estimated complexity
7. Create a task tracking table with status columns
8. Include the Execution Protocol section
9. Save to `ai/plans/backlog/[initiative-name].md`
10. Optionally, generate the individual task files too
