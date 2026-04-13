# AIDF — AI Development Framework

## What is AIDF?

AIDF (AI Development Framework) is a structured context framework for AI-assisted development. Think of it as an **onboarding package for AI assistants** — the same way you'd onboard a new developer with project docs, coding standards, and task assignments, AIDF gives AI assistants the context they need to work effectively on your project.

It works with any AI coding assistant: Claude Code, Cursor, GitHub Copilot, Windsurf, or any tool that reads project files for context.

## How It Works

AIDF organizes context into five layers that build on each other:

```
Layer 1 (Global)  → AGENTS.md       → Your project's identity, architecture, conventions, and boundaries
Layer 2 (Role)    → roles/*.md      → Specialized personas (developer, architect, tester, etc.)
Layer 3 (Skill)   → skills/*.md     → Portable skill definitions with specific instructions
Layer 4 (Task)    → tasks/*.md      → Scoped work items with allowed/forbidden files
Layer 5 (Plan)    → plans/*.md      → Multi-task initiatives with phases and dependencies
```

**The key idea:** Project conventions (Layer 1) + role expertise (Layer 2) + skill context (Layer 3) + task scope (Layer 4) = precise, bounded execution instructions for the AI.

## Directory Structure

```
ai/
├── AGENTS.md                    # ⭐ START HERE — Master project context
├── AGENTS.template.md           # Template version (rename to AGENTS.md after customizing)
├── ROLES.md                     # Quick reference for choosing roles
├── README.md                    # Directory overview
├── FOR_dev.md                   # This file
│
├── roles/                       # Layer 2 — Role definitions
│   ├── architect.md             # System design, architecture decisions
│   ├── developer.md             # Feature implementation, bug fixes
│   ├── tester.md                # Test writing, coverage improvement
│   ├── reviewer.md              # Code review, quality checks
│   └── documenter.md            # Documentation writing
│
├── skills/                      # Layer 3 — Portable skill definitions
│   ├── aidf/SKILL.md            # Core AIDF framework knowledge
│   ├── aidf-architect/SKILL.md  # Architecture skill
│   ├── aidf-developer/SKILL.md  # Development skill
│   ├── aidf-tester/SKILL.md     # Testing skill
│   ├── aidf-reviewer/SKILL.md   # Review skill
│   ├── aidf-documenter/SKILL.md # Documentation skill
│   └── aidf-task-templates/SKILL.md  # Task creation skill
│
├── prompts/                     # Ready-to-use prompt templates
│   ├── personalize.prompt.md    # Customize AIDF for your project
│   ├── create-task.prompt.md    # Generate task specifications
│   ├── create-plan.prompt.md    # Generate multi-task plans
│   ├── code-review.prompt.md    # Structured code review
│   └── debug.prompt.md          # Systematic debugging
│
├── templates/                   # Templates for creating new items
│   ├── TASK.template.md         # Base task template
│   ├── PLAN.template.md         # Base plan template
│   ├── MEMORY.template.md       # Memory/learning template
│   └── tasks/                   # Specialized task templates
│       ├── new-feature.template.md
│       ├── bug-fix.template.md
│       ├── refactor.template.md
│       ├── test-coverage.template.md
│       └── dependency-update.template.md
│
├── tasks/                       # Layer 4 — Task specifications (Kanban-style)
│   ├── backlog/                 # Tasks not yet started
│   ├── approved/                # Tasks approved and ready to work
│   ├── in-progress/             # Tasks currently being worked on
│   ├── blocked/                 # Tasks that are stuck
│   └── completed/               # Finished tasks
│
├── plans/                       # Layer 5 — Multi-task initiatives
│   ├── backlog/
│   ├── approved/
│   ├── in-progress/
│   ├── blocked/
│   └── completed/
```

## Key Files Explained

### AGENTS.md (Layer 1 — Start Here)

This is the **single source of truth** for your project. It defines:

- **Identity**: What your project is and what it does
- **Architecture**: Directory structure, key patterns, important files
- **Technology Stack**: Languages, frameworks, tools, and versions
- **Conventions**: Naming patterns, code style, import order, error handling
- **Quality Gates**: Commands that must pass before any task is complete (lint, typecheck, test, build)
- **Boundaries**: What the AI must never do, and what always applies

You'll customize `AGENTS.template.md` with your project's real information and rename it to `AGENTS.md`.

### roles/ (Layer 2)

Each role file defines a **persona** the AI adopts when working. It includes an identity, areas of expertise, constraints, quality criteria, and response format. For example, the `developer` role focuses on clean implementation and following existing patterns, while the `architect` role focuses on system design and trade-off analysis.

### skills/ (Layer 3)

Skills are **portable, self-contained instruction sets** that can be loaded by AI tools that support them (like Claude Code's skills system). Each skill maps to a role but is formatted for tool consumption.

### tasks/ (Layer 4)

Tasks are **scoped work items** with explicit boundaries. Each task defines:

- **Allowed files**: What the AI can modify
- **Forbidden files**: What the AI must never touch
- **Requirements**: What needs to be done
- **Definition of Done**: Objective checklist for completion

Tasks move through folders like a Kanban board: `backlog → approved → in-progress → completed` (or `blocked`).

### plans/ (Layer 5)

Plans are **multi-task initiatives** that sequence several tasks across phases with dependencies. Useful for larger features or refactors.

### prompts/

Ready-to-use prompts you can copy/paste into your AI assistant to perform common operations like personalizing your AIDF setup, creating tasks, running code reviews, or debugging.

## How to Use It

### 1. Personalize for Your Project

Open the `prompts/personalize.prompt.md` file, copy its content, and paste it into your AI assistant. It will guide you through customizing `AGENTS.template.md` with your project's real information.

### 2. Give Your AI Context

When starting a conversation with your AI assistant, point it to the `ai/` directory:

- **Claude Code**: It will automatically read `CLAUDE.md` if present
- **Cursor**: Reference `ai/AGENTS.md` in your conversation or add it to `.cursorrules`
- **Copilot**: Reference it in `.github/copilot-instructions.md`
- **Any tool**: Just say _"Read ai/AGENTS.md before starting"_

### 3. Create Tasks

Use the task templates in `templates/tasks/` or the `prompts/create-task.prompt.md` prompt to generate scoped tasks. Place them in `tasks/backlog/` and tell your AI to execute them.

### 4. Run Code Reviews

Copy the content of `prompts/code-review.prompt.md` and paste it into your AI with a PR or diff to get a structured review.

## Learn More

- **Role selection guide**: See `ROLES.md` in this directory
