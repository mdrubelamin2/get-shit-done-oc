---
description: new-project - Phase 5.5: Resolve Model Profile
parent: gsd:new-project
---

## Phase 5.5: Resolve Model Profile

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

---

> [!NOTE]
> **Phase 5.5 of 4 complete**
> 
> Return to the main workflow to continue: `@gsd:new-project.md`
