# AIDF Hackathon Starter Kit

This zip contains the **AIDF (AI Development Framework)** scaffolding — a structured context system that makes AI coding assistants significantly more effective by giving them the right project context, roles, and task boundaries.

## What's Inside

```
├── README.md          ← You are here
└── ai/                ← The AIDF framework directory
    ├── FOR_dev.md     ← Detailed guide explaining every file and directory
    ├── AGENTS.md      ← Master project context (the most important file)
    ├── roles/         ← AI role definitions (developer, architect, tester, etc.)
    ├── skills/        ← Portable skill definitions for AI tools
    ├── prompts/       ← Ready-to-use prompt templates
    ├── templates/     ← Templates for creating tasks and plans
    ├── tasks/         ← Kanban-style task board for AI work items
    └── plans/         ← Multi-task initiative plans
```

## Quick Setup (5 minutes)

### Step 1 — Add to your project

Unzip and copy the `ai/` folder into the **root** of your project:

```bash
# From your project root
unzip aidf-hackathon-starter.zip -d .
```

Your project should now look like:

```
my-project/
├── ai/           ← New!
├── src/
├── package.json
└── ...
```

### Step 2 — Personalize for your project

The `ai/` folder comes with template files that need to be customized with your project's information.

**Option A — Use the personalize prompt (recommended):**

1. Open `ai/prompts/personalize.prompt.md`
2. Copy its content and paste it into your AI assistant (Claude, Cursor, Copilot, etc.)
3. The AI will analyze your project and customize the templates for you

**Option B — Do it manually:**

1. Open `ai/AGENTS.template.md`
2. Replace the `[PLACEHOLDER]` values with your project's real info (name, description, architecture, conventions, commands)
3. Rename it to `ai/AGENTS.md`

### Step 3 — Point your AI tool to AIDF

Tell your AI assistant to read `ai/AGENTS.md` before starting any work. How you do this depends on your tool:

- **Claude Code / Claude**: _"Read ai/AGENTS.md before starting"_
- **Cursor**: Add a reference in your `.cursorrules` file or mention it in chat
- **GitHub Copilot**: Add a reference in `.github/copilot-instructions.md`
- **Any AI tool**: Just reference the file at the start of your conversation

> **Tip — Using your existing AGENTS.md as a hook:**
> If your project already has an `AGENTS.md` (or `CLAUDE.md`, `.cursorrules`, etc.) in the root, you don't need to replace it. Just add a line pointing to the AIDF context:
>
> ```markdown
> ## AIDF Context
> Before starting any work, read `ai/AGENTS.md` for full project context, conventions, and quality gates.
> ```
>
> This is also useful when you don't know which AI tools your teammates are using — each tool picks up its own root file, and they all funnel into the same `ai/AGENTS.md` as the single source of truth.

## Next Steps

Once AIDF is set up in your project, the idea is to **let the AI do the heavy lifting** — you brainstorm and decide *what* to do, and the AI creates the structured artifacts using the templates.

1. **Try a task**: Brainstorm with your AI about something you want to build or fix. Once you agree on the scope, ask it: _"Create a task for this using the templates in `ai/templates/tasks/`"_. The AI will generate a properly structured task file and place it in `ai/tasks/backlog/`. Then ask it to execute the task.
2. **Create a plan**: For bigger initiatives, discuss the goal with your AI and then say: _"Create a plan for this using `ai/templates/PLAN.template.md`"_. The AI will break it down into phases and tasks for you.
3. **Run a code review**: Paste a PR link or diff and ask your AI to review it using the prompt in `ai/prompts/code-review.prompt.md`.
4. **Debug with context**: Hit a tricky bug? Tell your AI to follow the structured debugging approach in `ai/prompts/debug.prompt.md`.

## Learn More

- **Detailed guide**: Read `ai/FOR_dev.md` for a complete explanation of every file and directory
- **Role selection**: See `ai/ROLES.md` to understand which AI role to use for different tasks
- **Questions?** Reach out to ruben.mavarez@pivotree.com
