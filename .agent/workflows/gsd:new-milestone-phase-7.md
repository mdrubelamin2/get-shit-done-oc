---
description: new-milestone - Phase 7: Research Decision
parent: gsd:new-milestone
---

## Phase 7: Research Decision

Use AskUserQuestion:
- header: "Research"
- question: "Research the domain ecosystem for new features before defining requirements?"
- options:
  - "Research first (Recommended)" — Discover patterns, expected features, architecture for NEW capabilities
  - "Skip research" — I know what I need, go straight to requirements

**If "Research first":**

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RESEARCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Researching [new features] ecosystem...
```

Create research directory:
```bash
mkdir -p .planning/research
```

Display spawning indicator:
```
◆ Spawning 4 researchers in parallel...
  → Stack research (for new features)
  → Features research
  → Architecture research (integration)
  → Pitfalls research
```

Spawn 4 parallel gsd-project-researcher agents with milestone-aware context:

```

## Project Researcher

**Context:** You are operating in the user's PROJECT DIRECTORY.
**CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.

**Task Context:**

<research_type>
Project Research — Stack dimension for [new features].
</research_type>

<milestone_context>
SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Existing validated capabilities (DO NOT re-research):
[List from PROJECT.md Validated requirements]

Focus ONLY on what's needed for the NEW features.
</milestone_context>

<question>
What stack additions/changes are needed for [new features]?
</question>

<project_context>
[PROJECT.md summary - current state, new milestone goals]
</project_context>

<downstream_consumer>
Your STACK.md feeds into roadmap creation. Be prescriptive:
- Specific libraries with versions for NEW capabilities
- Integration points with existing stack
- What NOT to add and why
</downstream_consumer>

<quality_gate>
- [ ] Versions are current (verify with Context7/official docs, not training data)
- [ ] Rationale explains WHY, not just WHAT
- [ ] Integration with existing stack considered
</quality_gate>

<output>
Write to: .planning/research/STACK.md
Use template: .agent/resources/templates/research-project/STACK.md
</output>
", subagent_type=

**How to proceed:**
1. Read the project-researcher skill:
   ```
   View file: .agent/skills/project-researcher/SKILL.md
   ```
2. Follow the skill's instructions, applying them to the task context above. Note: You are Antigravity, follow the instructions as Antigravity.
3. Create outputs as specified in the skill



## Project Researcher

**Context:** You are operating in the user's PROJECT DIRECTORY.
**CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.

**Task Context:**

<research_type>
Project Research — Architecture dimension for [new features].
</research_type>

<milestone_context>
SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Existing architecture:
[Summary from PROJECT.md or codebase map]

Focus on how [new features] integrate with existing architecture.
</milestone_context>

<question>
How do [target features] integrate with existing [domain] architecture?
</question>

<project_context>
[PROJECT.md summary - current architecture, new features]
</project_context>

<downstream_consumer>
Your ARCHITECTURE.md informs phase structure in roadmap. Include:
- Integration points with existing components
- New components needed
- Data flow changes
- Suggested build order
</downstream_consumer>

<quality_gate>
- [ ] Integration points clearly identified
- [ ] New vs modified components explicit
- [ ] Build order considers existing dependencies
</quality_gate>

<output>
Write to: .planning/research/ARCHITECTURE.md
Use template: .agent/resources/templates/research-project/ARCHITECTURE.md
</output>
", subagent_type=

**How to proceed:**
1. Read the project-researcher skill:
   ```
   View file: .agent/skills/project-researcher/SKILL.md
   ```
2. Follow the skill's instructions, applying them to the task context above. Note: You are Antigravity, follow the instructions as Antigravity.
3. Create outputs as specified in the skill

```

After all 4 agents complete, spawn synthesizer to create SUMMARY.md:

```

## Roadmapper

**Context:** You are operating in the user's PROJECT DIRECTORY.
**CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.

**Task Context:**

<task>
Synthesize research outputs into SUMMARY.md.
</task>

<research_files>
Read these files:
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</research_files>

<output>
Write to: .planning/research/SUMMARY.md
Use template: .agent/resources/templates/research-project/SUMMARY.md
Commit after writing.
</output>
", subagent_type=

**How to proceed:**
1. Read the roadmapper skill:
   ```
   View file: .agent/skills/roadmapper/SKILL.md
   ```
2. Follow the skill's instructions, applying them to the task context above. Note: You are Antigravity, follow the instructions as Antigravity.
3. Create outputs as specified in the skill

```

**Handle roadmapper return:**

**If `## ROADMAP BLOCKED`:**
- Present blocker information
- Work with user to resolve
- Re-spawn when resolved

**If `## ROADMAP CREATED`:**

Read the created ROADMAP.md and present it nicely inline:

```
---

## Proposed Roadmap

**[N] phases** | **[X] requirements mapped** | All milestone requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| [N] | [Name] | [Goal] | [REQ-IDs] | [count] |
| [N+1] | [Name] | [Goal] | [REQ-IDs] | [count] |
...

### Phase Details

**Phase [N]: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]

[... continue for all phases ...]

---
```

**CRITICAL: Ask for approval before committing:**

Use AskUserQuestion:
- header: "Roadmap"
- question: "Does this roadmap structure work for you?"
- options:
  - "Approve" — Commit and continue
  - "Adjust phases" — Tell me what to change
  - "Review full file" — Show raw ROADMAP.md

**If "Approve":** Continue to commit.

**If "Adjust phases":**
- Get user's adjustment notes
- Re-spawn roadmapper with revision context:
  ```
  
## Roadmapper

**Context:** You are operating in the user's PROJECT DIRECTORY.
**CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.

**Task Context:**

  <revision>
  User feedback on roadmap:
  [user's notes]

  Current ROADMAP.md: @.planning/ROADMAP.md

  Update the roadmap based on feedback. Edit files in place.
  Return ROADMAP REVISED with changes made.
  </revision>
  

**How to proceed:**
1. Read the roadmapper skill:
   ```
   View file: .agent/skills/roadmapper/SKILL.md
   ```
2. Follow the skill's instructions, applying them to the task context above. Note: You are Antigravity, follow the instructions as Antigravity.
3. Create outputs as specified in the skill

  ```
- Present revised roadmap
- Loop until user approves

**If "Review full file":** Display raw `cat .planning/ROADMAP.md`, then re-ask.

**Commit roadmap (after approval):**

Check planning config (same pattern as Phase 6).

If committing:
```bash
git add .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
git commit -m "$(cat <<'EOF'
docs: create milestone v[X.Y] roadmap ([N] phases)

Phases:
[N]. [phase-name]: [requirements covered]
[N+1]. [phase-name]: [requirements covered]
...

All milestone requirements mapped to phases.
EOF
)"
```

---

> [!NOTE]
> **Phase 7 of 2 complete**
> 
> Return to the main workflow to continue: `@gsd:new-milestone.md`
