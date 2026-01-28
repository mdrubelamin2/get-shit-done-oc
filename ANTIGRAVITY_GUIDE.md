# Antigravity Native Adaptation: Master Technical Reference & User Guide

Get-Shit-Done (GSD) features a sophisticated **Native Adaptation** for Antigravity. This integration is not just a file copy; it is a full semantic transformation of the GSD methodology into Antigravity's Skill/Workflow architecture, designed for maximum autonomy and high-performance development.

**New in this version:**
- ✨ **Intelligent Workflow Splitting** - Recursive boundary detection for the 10K safety margin (of Antigravity's 12K limit).
- ✨ **Platform-Agnostic Engine** - Stripped of vendor lock-in; works with any Assistant model.
- ✨ **Turbo-JIT Annotations** - Automated static analysis for safe command auto-execution.
- ✨ **Manifest-Aware Lifecycle** - High-precision installer/uninstaller with marker-based rule management.

---

## ⚡ Quick Start

### 1. Build and Install
```bash
cd /path/to/get-shit-done-oc
npm run build:antigravity
npm run install:antigravity
```
Choose **Local** for project-specific isolation or **Global** for system-wide access (`~/.gemini/antigravity`).

### 2. Selective Uninstall
```bash
npm run uninstall:antigravity
```
The uninstaller is **Manifest-Aware**—it reads the `.agent` manifest to remove only GSD-specific assets, protecting your custom skills. It also uses **Marker-Based Rule Removal** to selectively clean `GEMINI.md`.

### 3. Usage
Reference GSD workflows using the `@` prefix or slash commands in the chat:
```markdown
@gsd:new-project.md
@gsd:progress.md
/gsd:help
```

---

## 🏗️ Core Architecture & Compiler Deep Dive

The GSD compiler (`scripts/compile-antigravity.js`) is the brain of the adaptation. It performs high-fidelity translation of complex agentic patterns:

### 1. Semantic Skill Transformation
The compiler re-architects the logic to fit Antigravity's native Skill engine:
- **`Task()` Primitive Conversion**: It identifies XML-based agent spawning calls and transforms them into Antigravity-native **Skill Adoptions**. This preserves the "Agentic" feel while operating within Antigravity's constraints.
- **Turbo-JIT Annotations**: It performs static analysis of shell commands, automatically injecting `// turbo` safe-guards for read-only operations (file checks, `ls`, `git status`, `cat`), allowing the assistant to operate without manual confirmation.
- **Semantic Path Rewriting**: It transforms global-style resource paths (`~/.claude/get-shit-done/...`) into project-local `.agent/resources/` paths during compilation.

### 2. Recursive Splitting Engine (The 10K Safety Margin)
To ensure absolute reliability within Antigravity's **12,000 character limit**, the compiler implements a conservative **10,000 character safety threshold**:
- **Logical Paging**: It identifies `## Phase N:` markers and extracts large phases into standalone sub-workflows when the 10K threshold is approached.
- **Context-Preserving Handoffs**: Automatically generates orchestrator links (e.g., `@gsd:new-project-phase-6.md`) to maintain state continuity for the assistant.

### 3. Model-Agnostic Sanitization
The compiler strips away vendor-locked instructions and platform-specific model profiles, producing a **Pure Methodology** that performs identically across all LLM backends.

---

## 📂 Compiled File Structure

Running `npm run build:antigravity` generates a mission-ready architecture in your project root:

```markdown
.agent/
├── skills/                     # 11 Compiled GSD Intelligence Units
│   ├── codebase-mapper/        # Analyzes architecture & tech debt
│   ├── debugger/               # Scientific method debugging engine
│   ├── executor/               # Atomic delivery & checkpoint manager
│   ├── integration-checker/    # Cross-phase validation
│   ├── phase-researcher/       # Targeted implementation research
│   ├── plan-checker/           # Logic & goal-backward verification
│   ├── planner/                # Phase decomposition & planning
│   ├── project-researcher/     # Domain & ecosystem analysis
│   ├── research-synthesizer/   # Research data consolidation
│   ├── roadmapper/             # Milestone & roadmap generation
│   └── verifier/               # Final goal achievement validation
├── workflows/                  # 33 Orchestration Workflows
│   ├── gsd:add-phase.md        # Add a new phase to current milestone
│   ├── gsd:add-todo.md         # Capture a new idea or task as a todo
│   ├── gsd:audit-milestone.md  # Deep audit of deliverables vs requirements
│   ├── gsd:check-todos.md      # Review and select from pending todos
│   ├── gsd:complete-milestone.md # Formal version archival and next prep
│   ├── gsd:debug.md            # Scientific-method based systematic debugging
│   ├── gsd:discuss-phase.md    # Interactive requirement gathering for phases
│   ├── gsd:execute-phase.md    # High-velocity orchestration of planned tasks
│   ├── gsd:help.md             # Comprehensive command & methodology index
│   ├── gsd:insert-phase.md     # Insert an urgent phase between existing ones
│   ├── gsd:join-discord.md     # GSD Community access
│   ├── gsd:list-phase-assumptions.md # Surface & validate implicit assumptions
│   ├── gsd:map-codebase.md     # Automated structural analysis of existing code
│   ├── gsd:new-milestone.md    # Initialize a new versioned milestone cycle
│   ├── gsd:new-milestone-phase-7.md # [Sub] Requirement definition phase
│   ├── gsd:new-milestone-phase-10.md # [Sub] Roadmap finalization phase
│   ├── gsd:new-project.md      # End-to-end initialization for new projects
│   ├── gsd:new-project-phase-5.md # [Sub] Workflow preference configuration
│   ├── gsd:new-project-phase-5-5.md # [Sub] Identity & context setup
│   ├── gsd:new-project-phase-6.md # [Sub] Deep technical research phase
│   ├── gsd:new-project-phase-10.md # [Sub] Initial roadmap generation
│   ├── gsd:pause-work.md       # Create a state handoff for session suspension
│   ├── gsd:plan-milestone-gaps.md # Plans to close goal-to-roadmap gaps
│   ├── gsd:plan-phase.md       # Strategic task decomposition (Goal-Backward)
│   ├── gsd:progress.md         # health-check & next-task routing engine
│   ├── gsd:quick.md            # Atomic delivery for small, low-risk changes
│   ├── gsd:remove-phase.md     # Safely remove a future phase from roadmap
│   ├── gsd:research-phase.md   # Targeted investigation before planning
│   ├── gsd:resume-work.md      # Complete state and context restoration
│   ├── gsd:set-profile.md      # Toggle performance/quality model profiles
│   ├── gsd:settings.md         # Configure methodology behavior & toggles
│   ├── gsd:update.md           # Synchronize GSD to the latest version
│   └── gsd:verify-work.md      # Empirical verification of deliverable quality
└── resources/                  # GSD Methodology Repository
    ├── templates/              # 31 Standard Project Templates
    │   ├── project.md          # Core specification and vision document
    │   ├── roadmap.md          # Strategic milestone and phase breakdown
    │   ├── phase-prompt.md     # Logic for generating phase plans
    │   ├── state.md            # Persistent session tracking template
    │   ├── requirements.md     # Scoped features and constraints template
    │   ├── research.md         # Technical investigation template
    │   ├── config.json         # Workflow & project settings template
    │   ├── DEBUG.md            # Scientific debugging log template
    │   ├── verification-report.md # Goal achievement report template
    │   ├── UAT.md              # User Acceptance Testing template
    │   ├── context.md          # Project-wide context preservation template
    │   ├── summary.md          # Research synthesis and summary template
    │   ├── discovery.md        # Initial project discovery template
    │   ├── milestone.md        # Versioned milestone definition template
    │   ├── milestone-archive.md # Milestone archival report template
    │   ├── user-setup.md       # User onboarding and identity template
    │   ├── continue-here.md    # Session continuation link template
    │   ├── planner-subagent-prompt.md # Planner agent instruction template
    │   ├── debug-subagent-prompt.md # Debugger agent instruction template
    │   ├── codebase/           # (7 templates for structural analysis)
    │   └── research-project/   # (5 templates for domain research)
    ├── references/             # 9 Technical Best-Practice Docs
    │   ├── checkpoints.md      # Standards for state checkpointing
    │   ├── tdd.md              # Test-Driven Development best practices
    │   ├── verification-patterns.md # Patterns for empirical validation
    │   ├── git-integration.md  # Atomic commit & branch hygiene protocols
    │   ├── questioning.md      # Framework for adaptive context gathering
    │   ├── ui-brand.md         # Design system & aesthetic standards
    │   ├── model-profiles.md   # Model-specific performance strategies
    │   ├── planning-config.md  # Standards for planning configuration
    │   └── continuation-format.md # Context handoff & link standards
    └── workflows/              # 12 Detailed internal flow docs
        ├── execute-plan.md     # Logic for plan orchestration
        ├── verify-phase.md     # Goal-backward completion auditing
        ├── diagnose-issues.md  # Systematic troubleshooting protocols
        ├── map-codebase.md     # Codebase structural analysis patterns
        ├── transition.md       # Session transition & handoff protocols
        ├── complete-milestone.md # Deep logic for version archival
        ├── discovery-phase.md  # Initial context exploration flow
        ├── discuss-phase.md    # Multi-agent requirement gathering flow
        ├── execute-phase.md    # High-velocity phase orchestration logic
        ├── list-phase-assumptions.md # Logic for surfacing implicit assumptions
        ├── resume-project.md   # Logic for session restoration
        └── verify-work.md      # End-to-end verification protocols

---

## 📜 GSD Mission Control Rules (`GEMINI.md`)

The heart of every GSD session is the **Mission Control Protocol** found in [GEMINI.md](file:///Volumes/Others/projects/get-shit-done-oc/antigravity/GEMINI.md). This document isn't just a list of guidelines; it's a set of hard constraints that govern the AI's behavior from the moment a session starts.

The protocol is organized into five critical phases and several professional standards:
- **Phase I: Awareness** — Mandates configuration checks and strict adherence to project modes.
- **Phase II: The Planning Lock** — Prevents premature implementation; requires documented scoped requirements.
- **Phase III: Lifecycle** — Enforces state persistence (`STATE.md`) and context hygiene during debugging.
- **Phase IV: Validation** — Requires empirical proof (screenshots, commands, builds) for every change.
- **Phase V: Intelligence** — Mandates proactive MCP tool usage and "Templates First" development.
### Methodology Enforcement
1.  **Rule 1: The Planning Lock (🔒)**: Blocks implementation until `PROJECT.md` and `ROADMAP.md` are scoped.
2.  **Rule 2: State Persistence (💾)**: Mandates `STATE.md` updates after *every* task to kill context rot.
3.  **Rule 3: Context Hygiene (🧹)**: Triggers an automatic reset recommendation after 3 failed debug attempts.
4.  **Rule 4: Empirical Validation (✅)**: Requires verifiable evidence (logs, screenshots) for all changes.
5.  **Rule 5: MCP Intelligence (🧠)**: Enforces proactive tool checking (`list_resources`, `mcp_list_tools`) before coding.

### Execution Principles
- **Silent Execution**: Execute tools without commentary. Only respond AFTER all tools complete.
  - ❌ **BAD**: "Let me search for files... Okay, found them. Now I will read..."
  - ✅ **GOOD**: [Execute multiple tools in parallel/sequence, then provide a single concise response]
- **Parallel Execution**: Execute independent operations (grep, find, list) simultaneously.
  - ✅ **GOOD**: Call `grep_search`, `find_by_name`, and `list_dir` simultaneously.
  - ❌ **BAD**: Sequential tool calls (awaiting each one before the next).
- **Templates First**: ALWAYS check available templates or resources before building from scratch.
  - ✅ **GOOD**: Use GSD templates in `.agent/resources/templates` (Local) or `~/.gemini/antigravity/gsd_resources/templates` (Global) to kickstart work.

---

## 🛠️ Deployment & Lifecycle

### 📦 Manifest-Aware Manager
Installation is managed by `bin/antigravity-installer.js`:
- **Selective Deletion**: Protects your custom skills while cleaning GSD assets.
- **Smart Rule Conflict Resolution**: 
  - **Global Mode**: Identifies GSD blocks via `<!-- GSD_START -->` markers in `~/.gemini/GEMINI.md` and updates them in-place.
  - **Local Mode**: Preserves your root `GEMINI.md` by keeping GSD rules isolated in `.agent/rules/GSD_GEMINI.md`.

---

## 🎨 Style & Philosophy

GSD isn't just a set of files; it's a **Meta-Prompting System**. The Native Adaptation enforces high-fidelity stylistic and technical protocols (codified in `GEMINI.md`) to ensure the AI operates as a seasoned solo developer.

### 🗣️ Protocol: Persona & Voice
- **Zero Sycophancy**: No "Great!", "Excellent!", or "I'd be happy to help." The AI focuses strictly on technical precision.
- **No Filler**: Zero meta-talk ("Let me...", "Just...") to minimize token waste and maximize speed.
- **Imperative Voice**: Direct, action-oriented instructions only. "Execute task" vs "The task will be executed."

### 🛠️ Protocol: Technical & XML
- **Atomic Commits**: Enforces the `{type}({phase}-{plan}): {description}` format for high-quality context restoration.
- **Semantic XML Interface**: Uses semantic tags (`<task>`, `<action>`, `<verify>`) rather than generic structure, turning plans into executable code.
- **Clean Hygiene**: Explicitly bans enterprise rot, temporal language, and vague tasks.

### 🧱 Protocol: Architecture
- **10K Boundary Enforcement**: Proactively monitors context length and triggers logical splits.
- **Fresh Context Pattern**: Prefers autonomous subagents for implementation to keep the main context clean for the user.

---

### Commands Table
| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Build** | `npm run build:antigravity` | Transform GSD source to Antigravity Skill/Workflow |
| **Install** | `npm run install:antigravity` | Deploy compiled assets to local or global paths |
| **Uninstall** | `npm run uninstall:antigravity` | Selective cleanup of GSD logic |

---

## 📜 Available Reference Catalog

### Core Workflows Catalog
| Category | Workflow | Simple Description |
| :--- | :--- | :--- |
| **Lifecycle** | `new-project.md` | Initialize new project with deep context gathering. |
| | `new-milestone.md` | Start a new versioned milestone cycle. |
| | `progress.md` | Check project health and route to next action. |
| | `complete-milestone.md` | Archive finished version and prep for next cycle. |
| **Phases** | `plan-phase.md` | Create detailed execution plan with goal-backward logic. |
| | `execute-phase.md` | High-velocity execution of planned tasks. |
| | `verify-work.md` | Validate deliverables through proof-of-work checks. |
| | `discuss-phase.md` | Clarify phase requirements through context gathering. |
| | `research-phase.md` | Technical investigation before planning starts. |
| **Quality** | `debug.md` | Scientific method debugging with state checkpoints. |
| | `audit-milestone.md` | Audit deliverables against original requirements. |
| | `map-codebase.md` | Deep structural analysis of existing codebases. |
| | `list-phase-assumptions.md` | Surface implicit assumptions before execution. |
| **Utility** | `resume-work.md` | Restore state and context after a break. |
| | `pause-work.md` | Create a context handoff for future sessions. |
| | `check-todos.md` | Manage pending tasks and backlog items. |
| | `add-todo.md` | Capture ad-hoc ideas for future processing. |
| | `settings.md` | Configure GSD behavior toggles and profiles. |
| | `help.md` | Full catalog of available tools and rules. |

### Core Skills Catalog
| Skill | Simple Description |
| :--- | :--- |
| `codebase-mapper` | Analyzes code structure and identifies technical debt. |
| `debugger` | Investigates bugs using the scientific method and checkpoints. |
| `executor` | High-accuracy task execution with atomic commits. |
| `integration-checker`| Validates that new features integrate with the existing codebase. |
| `phase-researcher` | Performs targeted research for the current phase goals. |
| `plan-checker` | Verifies and hardens execution plans before work starts. |
| `planner` | Decomposes phases into granular, executable steps. |
| `project-researcher` | Conducts domain and ecosystem research for new projects. |
| `research-synthesizer`| Consolidates research findings into actionable summaries. |
| `roadmapper` | Creates high-level versions, milestones, and roadmaps. |
| `verifier` | Final E2E delivery verification against phase goals. |

---

## 📚 Methodology Resource Catalogs

Beyond workflows and skills, GSD provides a rich library of methodology assets in `.agent/resources/`.

### 📄 Standard Templates
| File | Simple Description |
| :--- | :--- |
| `PROJECT.md` | Core specification and vision document. |
| `ROADMAP.md` | Strategic milestone and phase breakdown. |
| `PLAN.md` | Granular, executable task list for a specific phase. |
| `STATE.md` | Persistent session tracking for context continuity. |
| `REQUIREMENTS.md` | Scoped features and technical constraints for current work. |
| `RESEARCH.md` | Documentation of technical investigations and findings. |
| `DEBUG.md` | Structured log of hypothesis testing and bug fixes. |
| `VERIFICATION.md` | Evidence-based proof of goal achievement. |
| `UAT.md` | Instructions and results for User Acceptance Testing. |

### 📚 Technical References
| File | Simple Description |
| :--- | :--- |
| `checkpoints.md` | Standards for setting and verifying state checkpoints. |
| `tdd.md` | Best practices for Test-Driven Development patterns. |
| `verification.md` | Patterns for empirical validation (logs, screenshots). |
| `git-integration.md`| Protocol for atomic commits and branch hygiene. |
| `questioning.md` | Framework for adaptive context gathering. |
| `ui-brand.md` | Design system and aesthetic guidelines. |

### 🔄 Internal Flow Docs
| File | Simple Description |
| :--- | :--- |
| `execute-plan.md` | Detailed logic for high-fidelity plan orchestration. |
| `verify-phase.md` | Goal-backward logic for auditing phase completion. |
| `diagnose-issues.md`| Systematic flow for troubleshooting complex failures. |
| `map-codebase.md` | Patterns for parallel codebase structural analysis. |
| `transition.md` | Protocols for handoffs and session transitions. |

---

## 🔄 Maintenance & Customization

- **Updating**: Run `npm run build:antigravity` whenever source commands change.
- **Customizing**: Edit sources in `commands/gsd/*.md` or `agents/*.md` and recompile. The compiler handles all complexities (splitting, path rewriting, turbo-annotations).

---

## 🧩 Troubleshooting

- **"Skill not found"**: Ensure the `.agent/skills/` directory is present in your project root.
- **"Workflow too large"**: The compiler automatically splits these; follow the `@gsd:*-phase-*` links.
- **"Task() not working"**: Recompile with the latest version of the Antigravity compiler.

---

**You now have the most disciplined, high-performance dev system ever built for Antigravity.** 🚀
