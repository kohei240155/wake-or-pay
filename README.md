# Agentic Workshop

A hands-on workshop repository for learning spec-driven development workflows with AI coding assistants. This repo provides templates, prompts, and structured workflows to guide feature implementation from specification through review and merge.

## Setup

### Prerequisites

- **Code Editor**: Visual Studio Code, Cursor, or similar
- **GitHub Account**: For authentication and collaboration
- **AI Coding Assistant**: Subscribed and signed in (GitHub Copilot, Claude, Gemini, Codex, etc.)
- **Git**: Version control
  - **Mac**: `xcode-select --install`
  - **Windows**: [Git for Windows](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Step 1: Install GitHub CLI

**Mac (Homebrew)**:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
```

**Windows**:
```powershell
winget install --id GitHub.cli
```

**Then authenticate**:
```bash
gh auth login
gh auth setup-git
```

### Step 2: Install Spec Kit

**Install uv** (universal Python installer):

**Mac**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows**:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Install Spec Kit**:
```bash
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git
```

If Python is missing:
```bash
uv python install 3.11
```

### Step 3: Initialize Spec Kit

Choose your AI assistant:

```bash
# GitHub Copilot
specify init --here --force --ai copilot --ai-skills

# Claude
specify init --here --force --ai claude --ai-skills

# Google Gemini
specify init --here --force --ai gemini

# OpenAI Codex
specify init --here --force --ai codex --ai-skills
```

### Step 4: Verify Installation

```bash
git --version
uv --version
specify --help
```

---

## Project Structure

```
.
├── .github/
│   └── ISSUE_TEMPLATE/          # GitHub issue templates
│       ├── bug.yml              # Bug report template
│       ├── feature.yml          # Feature request template
│       ├── docs.yml             # Documentation template
│       ├── refactor.yml         # Code refactor template
│       ├── technical-debt.yml   # Technical debt template
│       └── milestone-issue.yml  # Milestone tracking template
├── docs/
│   ├── PRD-TRD-USX/                # Specification prompts (Phase 1)
│   │   ├── 00-KICKOFF.md           # Start here
│   │   ├── 01-PRD-Prompt.md        # Product requirements
│   │   ├── 02-TRD-Prompt.md        # Technical requirements
│   │   ├── 03-USX-Prompt.md        # UX specification
│   │   └── 04-Roadmap.md           # Generate roadmap & issues
│   ├── contributing/                # Implementation workflow
│   │   ├── AGENT-WORKFLOW.md       # Complete SOP (phases 1-6)
│   │   └── README.md               # Quick navigation
│   └── prompts/                     # Phase 2-6 workflow prompts
│       ├── 01p-start-issue.md      # Phase 2: Initialize work
│       ├── 05p-validation-review.md     # Phase 3: Deep review
│       ├── 06p-validate-and-push.md     # Phase 3: Validate & push
│       ├── 07p-create-pr.md             # Phase 4: Create PR
│       ├── 08p-review-pr.md             # Phase 4: Address reviews
│       ├── 09p-merge-branch.md          # Phase 5: Merge to main
│       ├── 10p-post-implementation-review.md  # Phase 5: Close out
│       ├── next-issue-handoff.md        # Phase 6: Select next
│       ├── spec-review-checklist.md     # Check specs completeness
│       └── context-pack.md              # Load policy
├── specs/                       # Per-issue implementation bundles
│   └── NNN-feature-slug/        # Created during Phase 2 per issue
│       ├── spec.md              # Copy of PRD/TRD/UXS
│       ├── plan.md              # Implementation design
│       ├── tasks.md             # Ordered work breakdown
│       └── metadata.json        # Status & tracking
├── AGENTS.md                    # Agent quick-reference (load first)
└── README.md                    # This file (setup + overview)
```

---

## How It Works

### Phase 1: Specification (ONE TIME)

Start here for new projects. Write all specifications once, generate roadmap, create all issues.

```
docs/PRD-TRD-USX/00-KICKOFF.md
    ↓
01-PRD-Prompt.md → Write to docs/PRD-[name].md
    ↓
02-TRD-Prompt.md → Write to docs/TRD-[name].md
    ↓
03-USX-Prompt.md → Write to docs/UXS-[name].md
    ↓
04-Roadmap.md → Generate roadmap + create GitHub issues (1 Milestone + 4-5 Features)
```

Result: **1 PRD + 1 TRD + 1 UXS + 5+ GitHub issues**

### Phase 2-6: Implementation Cycle (PER ISSUE)

Repeat this cycle for each feature issue. Use Phase 6 (next-issue-handoff) to select next issue, then loop back to Phase 2.

```
01p-start-issue (Phase 2)
    ↓
Create plan.md & tasks.md (Phase 3a)
    ↓
Implement & test (Phase 3b-4a)
    ↓
05p-validation-review → Senior code review
    ↓
06p-validate-and-push → Local validation + push branch
    ↓
07p-create-pr (Phase 4b) → Create PR on GitHub
    ↓
08p-review-pr (Phase 4c) → Address review comments
    ↓
09p-merge-branch (Phase 5) → Merge --no-ff to main
    ↓
10p-post-implementation-review (Phase 5) → Close out issue
    ↓
next-issue-handoff (Phase 6) → Select next issue
    ↓
LOOP: Jump to 01p with next issue (NO Phase 1 restart)
```

**Key Point**: Phase 1 runs once. Phase 2-6 repeats per issue.

### Key Folders

#### `docs/PRD-TRD-USX/` - Specification Prompts (Phase 1)

Use these ONE TIME to fully specify your feature:

- **00-KICKOFF.md** — Orientation & workflow introduction
- **01-PRD-Prompt.md** — Write product requirements → save to `docs/PRD-[name].md`
- **02-TRD-Prompt.md** — Write technical requirements → save to `docs/TRD-[name].md`
- **03-USX-Prompt.md** — Write UX/implementation spec → save to `docs/UXS-[name].md`
- **04-Roadmap.md** — Generate roadmap & create all GitHub issues

**Output**: 1 PRD + 1 TRD + 1 UXS + 4-5 GitHub issues in your repo

#### `docs/contributing/` - Implementation Workflow

- **AGENT-WORKFLOW.md** — Complete SOP for phases 2-6 (per-issue implementation)
- **README.md** — Quick navigation guide

#### `.github/ISSUE_TEMPLATE/` - Issue Templates

Generic templates for creating GitHub issues without language/framework specifics:

- **bug.yml**: Report defects with reproduction steps
- **feature.yml**: Request new capabilities
- **docs.yml**: Documentation improvements
- **refactor.yml**: Code quality improvements  
- **technical-debt.yml**: Maintenance/cleanup work
- **milestone-issue.yml**: Track roadmap deliverables

Each template includes:
- Clear description fields
- **Gherkin acceptance criteria** (Given/When/Then)
- **Spec reference** (PRD-R#, TRD-R#, UXS-R#) for traceability
- Test plan section

#### `docs/prompts/` - Phase 2-6 Workflow Prompts

Use these **per issue** in sequence during implementation:

- **01p-start-issue.md** — Phase 2: Initialize issue work
- **05p-validation-review.md** — Phase 3: Deep review of code & tests
- **06p-validate-and-push.md** — Phase 3: Validate & push branch
- **07p-create-pr.md** — Phase 4: Create pull request on GitHub
- **08p-review-pr.md** — Phase 4: Address review feedback
- **09p-merge-branch.md** — Phase 5: Merge to main
- **10p-post-implementation-review.md** — Phase 5: Close out issue
- **next-issue-handoff.md** — Phase 6: Select next issue & loop
- **spec-review-checklist.md** — Validate issue-level spec.md & plan.md
- **context-pack.md** — Load-once policy guidance

**All prompts are language/framework-agnostic:**
- Generic build commands (make, npm, cargo, python -m, etc.)
- No external scripts or dependencies
- Work with any tech stack

#### `specs/` - Per-Issue Implementation Bundles

Created in Phase 2 when starting work on each issue:

```
specs/NNN-feature-slug/
├── spec.md       # Copy of PRD/TRD/UXS from docs/ (read-only reference)
├── plan.md       # Implementation design (created Phase 3a)
├── tasks.md      # Ordered work items (created Phase 3a)
└── metadata.json # Issue tracking info
```

**Flow**:
1. Phase 1: Write PRD/TRD/UXS → save to `docs/` folder
2. Phase 2: Create `specs/NNN/` and copy spec.md from `docs/`
3. Phase 3: Add plan.md and tasks.md during design

---

## Quick Start

### For Starting a New Project

1. **Read**: [AGENTS.md](AGENTS.md) (agent quick-reference, ~1 min)
2. **Load**: [docs/contributing/AGENT-WORKFLOW.md](docs/contributing/AGENT-WORKFLOW.md) (complete SOP, ~5 min)
3. **Phase 1** — Spec your feature (one-time):
   - Start: [docs/PRD-TRD-USX/00-KICKOFF.md](docs/PRD-TRD-USX/00-KICKOFF.md)
   - Write: PRD → TRD → UXS (save to `docs/`)
   - Generate: Roadmap and create GitHub issues
4. **Phase 2-6** — Implement each issue (repeat per feature):
   - Follow [docs/contributing/AGENT-WORKFLOW.md](docs/contributing/AGENT-WORKFLOW.md)
   - Use prompts from `docs/prompts/` in order
   - Loop through Phase 2-6 for each GitHub issue
   - Continue until all issues merged

### For Working on an Existing Issue

1. **Load**: [docs/contributing/AGENT-WORKFLOW.md](docs/contributing/AGENT-WORKFLOW.md) (Phase 2 onwards)
2. **Start**: [docs/prompts/01p-start-issue.md](docs/prompts/01p-start-issue.md)
3. **Follow**: Phase 2-6 cycle from AGENT-WORKFLOW.md

---

## Notes on Workshop Structure

- **Spec-first**: Attendees write PRD/TRD/UXS before ANY GitHub issues
- **One-time Phase 1**: Specification happens once per project via 04-Roadmap.md
- **Repeating Phase 2-6**: Implementation cycle repeats per feature issue, looping through next-issue-handoff
- **Framework-agnostic**: All templates work with any tech stack (JavaScript, Python, Rust, Go, etc.)
- **No external scripts**: Uses only built-in tools (git, gh CLI)
- **AI-ready**: All prompts designed for agentic workflows (Copilot, Claude, Gemini, etc.)

---

## Resources

- [AGENTS.md](AGENTS.md) — Agent quick-reference (read at session start)
- [docs/contributing/AGENT-WORKFLOW.md](docs/contributing/AGENT-WORKFLOW.md) — Complete workflow SOP (load at project start)
- [docs/PRD-TRD-USX/00-KICKOFF.md](docs/PRD-TRD-USX/00-KICKOFF.md) — Spec-driven development introduction
- [Spec Kit Documentation](https://speckit.org) — Automation tool for Phase 1 (optional)
- [GitHub CLI Reference](https://cli.github.com) — Used throughout workflow for issue/PR management
- [Gherkin Syntax Guide](https://cucumber.io/docs/gherkin/) — For writing acceptance criteria in PRD

---

## License

MIT
