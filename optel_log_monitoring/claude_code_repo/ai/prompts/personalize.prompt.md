# Personalize AIDF Context

This prompt customizes your AIDF context files to match your actual project.
Paste this into your AI assistant after adding the `ai/` folder to your project.

## Context — Read these files first

- `ai/AGENTS.md` — current template (you will customize this)
- `ai/ROLES.md` — role selection guide
- `ai/roles/*.md` — all role definitions
- `ai/skills/` — all skill definitions
- `ai/templates/` — task and plan templates

Also analyze:
- `package.json` (root and any workspaces)
- Project directory structure
- Build/test configuration files (tsconfig, vite.config, jest.config, etc.)
- Existing CI/CD configuration
- Recent git history (`git log --oneline -20`)

## Instructions

Analyze this project thoroughly and customize ALL `ai/` files:

### 1. AGENTS.md
Rewrite with real project context:
- **Identity**: Project name, purpose, what it does
- **Architecture**: Actual directory structure, key patterns, data flow
- **Technology Stack**: Real frameworks, libraries, versions
- **Conventions**: Detect from existing code (naming, imports, patterns)
- **Quality Gates**: Map to real commands from the project
- **Boundaries**: Define NEVER/ALWAYS rules based on project structure
- **Commands**: Real development and quality check commands

### 2. Roles (`ai/roles/*.md`)
Adjust each role to the project's stack:
- Developer role: emphasize the project's primary language/framework
- Tester role: reference the actual test framework and patterns
- Reviewer role: include project-specific conventions to check
- Architect role: reflect the actual architecture decisions
- Documenter role: reference actual documentation tools/patterns
- Remove roles that don't apply, add custom ones if needed

### 3. Skills (`ai/skills/`)
Create project-specific skills based on:
- Primary frameworks detected
- Common patterns in the codebase
- Testing approaches used
- Build/deploy processes

### 4. Task Templates (`ai/templates/tasks/`)
Update templates with:
- Real file path patterns for scope definitions
- Project-specific quality gate commands
- Relevant conventions from AGENTS.md

### 5. Report
After customizing, list what you changed and why.
