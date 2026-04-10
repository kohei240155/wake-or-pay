# Agent Workflow SOP (Standard Operating Procedure)

**Complete phase-gate workflow for implementing features through spec-driven development.**

## Critical Safety Mandate (NON-NEGOTIABLE)

⚠️ **NEVER use destructive commands without explicit user permission:**
- ❌ `git reset --hard`
- ❌ `git clean -fd`
- ❌ Force-delete files or directories

**Before any state-modifying operation:**
1. Always run `git status` and `git diff` to verify current state
2. Show the user what will change
3. **Wait for explicit approval** before proceeding

---

## Phase 1: Specification (PRD → TRD → UXS)

### Important Phase 1 Clarifications

**Spec Output Location**: During Phase 1, save all PRD/TRD/UXS to `docs/`, NOT `specs/`.
- Example: `docs/PRD-raid-status-generator.md`, `docs/TRD-raid-status-generator.md`, `docs/UXS-raid-status-generator.md`
- The `specs/NNN-slug/` folder is created only in Phase 2 when starting Issue #1

**Milestone vs. First Actionable Issue**: The roadmap produces:
- **1 Milestone** (Wave 00) - records outcome and high-level success
- **Multiple Features** (Issues 01, 02, 03...) - each is a small, deliverable slice

When starting work, begin with **Feature #01** (not the Milestone), unless explicitly told to work on the Milestone itself.

### Step 1.1: Kickoff
- Read: `docs/PRD-TRD-USX/00-KICKOFF.md`
- Identify feature or improvement to work on
- Ensure it aligns with project goals

### Step 1.2: Write PRD (Product Requirements)
- Follow: `docs/PRD-TRD-USX/01-PRD-Prompt.md`
- Answer: What? Why? Who benefits?
- Output: Feature description, user goals, acceptance criteria (Gherkin)

### Step 1.3: Write TRD (Technical Requirements)
- Follow: `docs/PRD-TRD-USX/02-TRD-Prompt.md`
- Answer: How? Architecture? Dependencies?
- Output: Tech approach, APIs, external services, assumptions

### Step 1.4: Write UXS (User Experience Spec)
- Follow: `docs/PRD-TRD-USX/03-USX-Prompt.md`
- Answer: How will users interact? Workflows? Outputs?
- Output: Implementation details, behavior spec, examples

### Step 1.5: Generate Roadmap & Create Issues
- Follow: `docs/PRD-TRD-USX/04-Roadmap.md`
- Outputs: 1 Milestone issue + 4-5 Feature issues (all with roadmap details)
- Create all issues in GitHub using templates from `.github/ISSUE_TEMPLATE/`
- Label issues with effort estimates and traceability (PRD-R#, TRD-R#, UXS-R#)

---

## Phase 2-6: Implementation Cycle (Per Issue)

**Repeat this cycle for EACH issue from the roadmap** (start with Feature #01, then #02, etc.)

### Phase 2: Start Work
- Follow: `docs/prompts/01p-start-issue.md`
- Fetch issue context (`gh issue view <NNN>`)
- Create local folder: `mkdir -p specs/NNN-feature-slug/`
- Copy PRD/TRD/UXS from `docs/` to your issue folder

### Phase 3: Plan & Design
- Create `specs/<issue>/plan.md` (design, approach)
- Create `specs/<issue>/tasks.md` (ordered work items)
- Follow prompts or Speckit as available

### Phase 4: Implement
- Create feature branch: `git checkout -b feat/NNN-description`
- Follow task list
- Write tests alongside code
- Follow: `docs/prompts/05p-validation-review.md` (deep review before push)
- Follow: `docs/prompts/06p-validate-and-push.md` (validate & push)

### Phase 5: PR & Review
- Create PR: use `docs/prompts/07p-create-pr.md`
- Address review comments: use `docs/prompts/08p-review-pr.md`

### Phase 6: Merge & Next
- Merge to main: use `docs/prompts/09p-merge-branch.md`
- Post-review: use `docs/prompts/10p-post-implementation-review.md`
- **Select next issue**: use `docs/prompts/next-issue-handoff.md`
- Jump back to Phase 2 with next issue number

---

## Detailed Phase-by-Phase Overview

For reference, here's what happens in each phase:

---

## Phase 2: Start Work on Issue

- Fetch issue context: `gh issue view <NNN>`
- Create folder: `mkdir -p specs/NNN-feature-slug/`
- Copy PRD/TRD/UXS from `docs/` to issue folder
- Follow: `docs/prompts/01p-start-issue.md`

---

## Phase 3: Plan & Implement

- Create `specs/<issue>/plan.md` (design + approach)
- Create `specs/<issue>/tasks.md` (ordered work items)
- Create feature branch: `git checkout -b feat/NNN-description`
- Implement tasks, test alongside code
- After each change: lint, format, commit
- Follow: `docs/prompts/05p-validation-review.md` (deep review before push)
- Follow: `docs/prompts/06p-validate-and-push.md` (validate & push)
- Push: `git push origin feat/NNN-description`

---

## Phase 4: Pull Request & Review

- Create PR: follow `docs/prompts/07p-create-pr.md` (link to issue)
- Address reviews: follow `docs/prompts/08p-review-pr.md`
- Wait for approval before merging

---

## Phase 5: Merge & Close

- Merge to main: follow `docs/prompts/09p-merge-branch.md` (use `--no-ff`)
- Post-review: follow `docs/prompts/10p-post-implementation-review.md`

---

## Phase 6: Next Issue

- Select next work: follow `docs/prompts/next-issue-handoff.md`
- Loop back to Phase 2 with next issue number
- **Do NOT restart Phase 1**

---

## Detailed Phase 2: Initialization

### Step 2.1: Start Issue
- Follow: `docs/prompts/01p-start-issue.md`
- Create folder: `mkdir -p specs/NNN-feature-slug/`
- Copy PRD/TRD/UXS to specs folder
- Set up local environment
- Install dependencies

### Step 2.2: Create Implementation Plan
- Speckit or manual: Create `specs/<issue>/plan.md`
- Design approach, components, data flow
- Identify external dependencies
- Commit: `git add specs/ && git commit -m "docs: Add implementation plan"`

### Step 2.3: Break Down Work
- Speckit or manual: Create `specs/<issue>/tasks.md`
- Ordered, independent work items
- Include test tasks
- Commit: `git add specs/ && git commit -m "docs: Add task breakdown"`

---

## Detailed Phase 3: Implementation

### Step 3.1: Create Feature Branch
```bash
git checkout main && git pull origin main
git checkout -b feat/NNN-description
```

### Step 3.2: Implement Tasks
- Follow task order from `specs/<issue>/tasks.md`
- Write tests alongside code
- Run test suite and linter after each change
- Commit with clear messages

### Step 3.3: Validate Implementation
- Follow: `docs/prompts/05p-validation-review.md`

### Step 3.4: Local Validation Before Push
- Follow: `docs/prompts/06p-validate-and-push.md`

### Step 3.5: Push Branch
```bash
git push origin feat/NNN-description
```

---

## Detailed Phase 4: Pull Request & Review

### Step 4.1: Create PR
- Follow: `docs/prompts/07p-create-pr.md`
- Link to GitHub issue: `Closes #NNN`

### Step 4.2: Address Review Comments
- Follow: `docs/prompts/08p-review-pr.md`

### Step 4.3: Receive Approval
- Wait for explicit approval before merging

---

## Detailed Phase 5: Merge & Close

### Step 5.1: Merge to Main
- Follow: `docs/prompts/09p-merge-branch.md`
- Use merge commit (`--no-ff`)

### Step 5.2: Post-Implementation Review
- Follow: `docs/prompts/10p-post-implementation-review.md`

---

## Detailed Phase 6: Next Issue

### Step 6.1: Next Issue Handoff
- Follow: `docs/prompts/next-issue-handoff.md`
- Check for blocking dependencies

### Step 6.2: Loop Back
- Go to **Phase 2** with the next issue
- **Do NOT restart Phase 1**
- Continue until all roadmap issues are merged

---

## Critical Workflow Rules

1. **Phase 1 = ONE TIME** — Spec PRD/TRD/UXS, generate roadmap, create all GitHub issues
2. **Phase 2-6 = PER ISSUE** — Repeat for each feature issue in the roadmap
3. **Spec before code** — All speci​fied in Phase 1, then implement in Phase 2+
4. **Commit early & often** — Clean git history with meaningful messages
5. **Validate before push** — Run full suite locally
6. **Wait for approval** — Don't merge without explicit sign-off
7. **Use merge commits** — `--no-ff` for clean history
8. **Track decisions** — Update specs folder for future reference

---

## File Organization

```
project/
├── .github/ISSUE_TEMPLATE/          # Issue templates
├── docs/
│   ├── PRD-TRD-USX/
│   │   ├── 00-KICKOFF.md           # Start here
│   │   ├── 01-PRD-Prompt.md
│   │   ├── 02-TRD-Prompt.md
│   │   ├── 03-USX-Prompt.md
│   │   └── 04-Roadmap.md
│   ├── contributing/
│   │   └── AGENT-WORKFLOW.md       # This file
│   └── prompts/
│       ├── 01p-start-issue.md
│       ├── 05p-validation-review.md
│       ├── 06p-validate-and-push.md
│       ├── 07p-create-pr.md
│       ├── 08p-review-pr.md
│       ├── 09p-merge-branch.md
│       └── ... (12 prompts total)
├── specs/
│   └── NNN-feature-slug/           # Created per issue
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── metadata.json
├── AGENTS.md                        # Quick reference
└── README.md                        # Setup & overview
```

---

## Load Policy

- Load this file **ONCE per project** (when starting Phase 1)
- Reference specific prompts as directed by this SOP
- For each issue, follow the Phase 2-6 cycle without reloading this file

---

## Questions?

- **Starting the project?** Begin with Phase 1 + `docs/PRD-TRD-USX/00-KICKOFF.md`
- **Working on an issue?** Jump to Phase 2 with the issue number
- **Choosing next issue?** Use Phase 6 + `docs/prompts/next-issue-handoff.md`
- **Stuck on a phase?** Follow the prompt for that phase (e.g., Phase 4.1 → `07p-create-pr.md`)
