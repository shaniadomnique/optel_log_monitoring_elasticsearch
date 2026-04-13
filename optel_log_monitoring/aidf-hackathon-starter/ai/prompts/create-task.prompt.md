# Create Task

Generate a well-formed task specification for your project.
Complete the input section below, then paste into your AI assistant.

## Context — Read these files first

- `ai/AGENTS.md` — project conventions and boundaries
- `ai/ROLES.md` — available roles
- `ai/templates/TASK.template.md` — task format to follow

## Your input (complete before pasting)

- **Task goal**: [describe what should be true when this task is done]
- **Task type**: [feature | bugfix | refactor | test | docs]
- **Relevant files/paths**: [e.g., src/auth/**, tests/auth/**]
- **Parent plan**: [name of parent plan, or "none"]
- **Additional context**: [any extra details, constraints, or requirements]

## Instructions

1. Read the project context from `ai/AGENTS.md`
2. Read the task template from `ai/templates/TASK.template.md`
3. Analyze the goal and identify all files that will be affected
5. Generate a complete task specification:
   - Clear, single-sentence goal
   - Task type and suggested role(s)
   - Scope: allowed paths (can modify) and forbidden paths (must NOT touch)
   - Detailed requirements following project conventions
   - Execution steps: Research, Plan, Implement, Verify
   - Verifiable Definition of Done checklist
   - Include the Execution Protocol section
6. Save to `ai/tasks/backlog/[descriptive-name].md`
7. If a parent plan was specified, add this task to the plan's task table
