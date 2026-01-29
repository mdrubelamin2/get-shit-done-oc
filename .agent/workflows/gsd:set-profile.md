---
description: "Profile name: quality, balanced, or budget"
---


<objective>
Switch the model profile used by GSD agents. This controls which Antigravity model each agent uses, balancing quality vs token spend.
</objective>

<profiles>
| Profile | Description |
|---------|-------------|
| **quality** | Opus everywhere except read-only verification |
| **balanced** | Opus for planning, Sonnet for execution/verification (default) |
| **budget** | Sonnet for writing, Haiku for research/verification |
</profiles>

<process>

> [!IMPORTANT]
> **Context:** You are operating in the user's PROJECT DIRECTORY.
> **CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.


## 1. Validate argument

```
if $ARGUMENTS.profile not in ["quality", "balanced", "budget"]:
  Error: Invalid profile "$ARGUMENTS.profile"
  Valid profiles: quality, balanced, budget
  STOP
```

## 2. Check for project

// turbo
```bash
ls .planning/config.json 2>/dev/null
```

If no `.planning/` directory:
```
Error: No GSD project found.
Run /gsd:new-project first to initialize a project.
```

## 3. Update config.json

Read current config:
// turbo
```bash
cat .planning/config.json
```

Update `model_profile` field (or add if missing):
```json
{
  "model_profile": "$ARGUMENTS.profile"
}
```

Write updated config back to `.planning/config.json`.

## 4. Confirm

```
✓ Model profile set to: $ARGUMENTS.profile

Agents will now use:
[Show table from model-profiles.md for selected profile]

Next spawned agents will use the new profile.
```

</process>

<examples>

**Switch to budget mode:**
```
/gsd:set-profile budget

✓ Model profile set to: budget

Agents will now use:
| Agent | Model |
|-------|-------|
| gsd-planner | sonnet |
| gsd-executor | sonnet |
| gsd-verifier | haiku |
| ... | ... |
```

**Switch to quality mode:**
```
/gsd:set-profile quality

✓ Model profile set to: quality

Agents will now use:
| Agent | Model |
|-------|-------|
| gsd-planner | opus |
| gsd-executor | opus |
| gsd-verifier | sonnet |
| ... | ... |
```

</examples>
