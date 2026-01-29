---
description: Start a new milestone cycle — update PROJECT.md and route to requirements
---


<objective>
Start a new milestone through unified flow: questioning → research (optional) → requirements → roadmap.

This is the brownfield equivalent of new-project. The project exists, PROJECT.md has history. This command gathers "what's next", updates PROJECT.md, then continues through the full requirements → roadmap cycle.

**Creates/Updates:**
- `.planning/PROJECT.md` — updated with new milestone goals
- `.planning/research/` — domain research (optional, focuses on NEW features)
- `.planning/REQUIREMENTS.md` — scoped requirements for this milestone
- `.planning/ROADMAP.md` — phase structure (continues numbering)
- `.planning/STATE.md` — reset for new milestone

**After this command:** Run `/gsd:plan-phase [N]` to start execution.
</objective>

<execution_context>
.agent/resources/references/questioning.md
.agent/resources/references/ui-brand.md
.agent/resources/templates/project.md
.agent/resources/templates/requirements.md
</execution_context>

<context>
Milestone name: $ARGUMENTS (optional - will prompt if not provided)

**Load project context:**
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/MILESTONES.md
@.planning/config.json

**Load milestone context (if exists, from /gsd:discuss-milestone):**
@.planning/MILESTONE-CONTEXT.md
</context>

<process>

> [!IMPORTANT]
> **Context:** You are operating in the user's PROJECT DIRECTORY.
> **CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.


## Phase 1: Load Context

- Read PROJECT.md (existing project, Validated requirements, decisions)
- Read MILESTONES.md (what shipped previously)
- Read STATE.md (pending todos, blockers)
- Check for MILESTONE-CONTEXT.md (from /gsd:discuss-milestone)

## Phase 2: Gather Milestone Goals

**If MILESTONE-CONTEXT.md exists:**
- Use features and scope from discuss-milestone
- Present summary for confirmation

**If no context file:**
- Present what shipped in last milestone
- Ask: "What do you want to build next?"
- Use AskUserQuestion to explore features
- Probe for priorities, constraints, scope

## Phase 3: Determine Milestone Version

- Parse last version from MILESTONES.md
- Suggest next version (v1.0 → v1.1, or v2.0 for major)
- Confirm with user

## Phase 4: Update PROJECT.md

Add/update these sections:

```markdown
## Current Milestone: v[X.Y] [Name]

**Goal:** [One sentence describing milestone focus]

**Target features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]
```

Update Active requirements section with new goals.

Update "Last updated" footer.

## Phase 5: Update STATE.md

```markdown
## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: [today] — Milestone v[X.Y] started
```

Keep Accumulated Context section (decisions, blockers) from previous milestone.

## Phase 6: Cleanup and Commit

Delete MILESTONE-CONTEXT.md if exists (consumed).

Check planning config:
```bash
COMMIT_PLANNING_DOCS=$(cat .planning/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q .planning 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

If `COMMIT_PLANNING_DOCS=false`: Skip git operations

If `COMMIT_PLANNING_DOCS=true` (default):
```bash
git add .planning/PROJECT.md .planning/STATE.md
git commit -m "docs: start milestone v[X.Y] [Name]"
```

## Phase 6.5: Resolve Model Profile

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.
## Phase 7: Research Decision

> [!NOTE]
> This phase has been extracted to a separate workflow for size management.

**To continue this phase:**
```
@gsd:new-milestone-phase-7.md
```

After completing Phase 7, return here to proceed.

## Phase 10: Done

> [!NOTE]
> This phase has been extracted to a separate workflow for size management.

**To continue this phase:**
```
@gsd:new-milestone-phase-10.md
```

After completing Phase 10, return here to proceed.


