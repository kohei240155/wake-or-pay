# workshop-roadmap-to-github-issues-prompt.md

## Purpose
Generate a delivery roadmap from the completed PRD → TRD → UXS (created earlier in this same chat), and convert it into a set of GitHub-ready issues that match the repository’s Issue Forms:
- milestone-issue.yml (roadmap deliverables)
- feature.yml (enhancements/features)
- bug.yml (bugs)
- docs.yml (documentation)
- refactor.yml (refactoring)
- technical-debt.yml (tech debt)
Spikes/experiments are first-class work items and should be issued as either Feature, Technical Debt, or Milestone (depending on outcome).

Constraints:
- Do not introduce new scope beyond PRD.
- Do not propose implementation decisions that contradict TRD.
- Do not add UX flows/screens beyond UXS; if missing, file a UXS gap issue (Docs).
- Everything must remain traceable: every milestone/issue links to PRD/TRD/UXS sections.
- Use explicit traceability IDs in every milestone/issue: PRD-R#, TRD-R#, and UXS-R# (as applicable).
- Each issue must include: requirements checklist, Gherkin acceptance criteria, test strategy, and doc updates (where relevant).
- Use story points: 2 / 3 / 5 / 8.
- Use implementation-order numbering in titles: prefix milestone and issue titles with "00 -", "01 -", "02 -", ... in the intended build order. GitHub assigns issue numbers automatically; ordering is represented via the title prefix in this workshop.
- Sizing rule (workshop default): prefer 2–3 point issues; use 5 for vertical slices; use 8 only if it cannot be split without losing coherence.
- Default repository structure assumption: monorepo.
- Beginner→intermediate best practices: small issues, explicit DoD, measurable validation, and conservative technical risk.

Process:
1) Ingest PRD, TRD, UXS from earlier messages in this chat.
2) Produce a “Decision Lock Summary” (what is fixed vs open).
3) Produce 2–3 roadmap scenarios with tradeoffs.
4) Choose a recommended scenario.
5) Produce roadmap waves/milestones and epics.
6) Produce an “Issue Pack” that is ready to paste into GitHub Issue Forms.
7) Provide a “Validation Map” tying PRD metrics to telemetry and milestones.

Micro-project mode (auto-switch)
If the attendee’s project can realistically be delivered in **4–5 GitHub issues** (excluding one milestone issue):
- Generate **1 wave** with **1 milestone** and **1 epic** only.
- Generate **4–5 issue titles** (plus the milestone), each mapped to PRD-R#/TRD-R#/UXS-R#.
- Output full issue content for **all** issues (not just the first 10–15).

Important: If any required inputs are missing or ambiguous, ask targeted clarifying questions first, then proceed with best-guess defaults.

---

## Inputs (from this same chat)
- PRD (final)
- TRD (final)
- UXS (final)
- Any constraints: timeline, budget, team size, deployment environment
- Platform/runtime assumptions (from TRD). If unspecified, do not assume a language, runtime, or OS.

---

## Output Structure (follow exactly)

### 1) Decision Lock Summary
A) Locked decisions (must not change)
- PRD: scope boundaries + success metrics + non-goals
- TRD: architecture choices/constraints + NFR priorities + ADR decisions (if any)
- UXS: core flows + screen inventory + key states + accessibility requirements

B) Open decisions (must resolve)
- Numbered list
- For each: “decision owner”, “decision deadline”, “impact if delayed”
- If an open decision is substantial, propose a Spike issue (see Issue Pack rules)

### 2) Roadmap Scenarios (Options)
Provide 2–3 scenarios:
- “Fast Validation”
- “Balanced”
- “Foundation First”

For each:
- Optimizes for
- De-prioritizes
- Key risks + mitigations
- When to choose

Include comparison table:
| Scenario | Speed | Cost | Risk | Quality | Reuse toward MVP | Notes |
|---|---:|---:|---:|---:|---:|---|

### 3) Recommended Scenario
- Choose one (or staged path)
- Justify with PRD metrics + TRD constraints + UXS complexity
- Define success gates per wave (proceed/pivot/stop)

### 4) Roadmap (Waves → Milestones → Epics)
Roadmap must be capability-based (no dates, no sprint plan). Sequence waves by dependency and validation logic only.
#### 4.1 Waves
For each wave:
- Goal
- Entry criteria
- Exit criteria (measurable)
- Validation activity (what will be demonstrated/measured)

Wave table:
| Wave | Goal | Exit criteria | Validation activity |
|---|---|---|---|

#### 4.2 Milestones
Each Wave must have at least 1 Milestone issue (roadmap deliverable).
Milestone definition includes:
- Summary (what outcome it represents)
- Gherkin acceptance criteria (milestone delivered state)
- Test Plan checkbox list (must include local CI script if applicable)

Milestone table:
| Wave | Milestone issue title | Outcome | Exit criteria |
|---|---|---|---|

#### 4.3 Epics
For each epic:
- Objective
- PRD linkage (goal/metric)
- UXS linkage (flows/screens)
- TRD linkage (components/NFR/ADR)
- DoD summary

Epic table:
| Wave | Epic | Objective | DoD (short) | Dependencies |
|---|---|---|---|---|

### 5) Validation Map (PRD metrics → telemetry → milestone)
Map each PRD metric to:
- telemetry events/data needed
- where it will be measured (dashboard/export)
- first wave where it becomes measurable

Table:
| Metric | Definition | Event(s)/data needed | Where measured | First measurable in wave |
|---|---|---|---|---|

### 6) Issue Pack (GitHub Issue Forms compatible)
Generate:
- 10–40 issue titles grouped by epic
- For the first 10–15 issues: provide full issue content in a format that can be pasted into the corresponding GitHub Issue Form fields.

#### 6.1 Issue type selection rules (must follow)
Use these forms:
- Milestone: for wave deliverables/outcomes (labels: roadmap)
- Feature: new capability; include Requirements checklist + Gherkin + Test Strategy + Technical Considerations
- Bug: defects found during validation
- Docs: documentation, runbooks, onboarding, specs alignment, workshop guidance
- Refactor: restructuring with behavioral parity
- Technical Debt: debt items to unblock quality/reliability

Spikes/experiments:
- If the outcome is “learn/decide”, create as Feature (with explicit “Spike” in title) or as Milestone if it gates the wave.
- Spikes must have a measurable output: decision, prototype, benchmark, or narrowed options list.

Story points:
- Always include `Effort: 2|3|5|8` as the first line of the **Description** field for every issue type (Feature, Milestone, Bug, Docs, Refactor, Technical Debt), regardless of whether the form has a dedicated effort dropdown.

#### 6.2 Required content rules per issue (workshop best practice)

Before outputting full issue bodies, verify the field names you use match the repo Issue Forms (feature.yml, bug.yml, docs.yml, refactor.yml, technical-debt.yml, milestone-issue.yml). If a form uses different field labels, adapt the output to those labels.

Every Feature issue must include:
- Description (clear)
- Why (tie to PRD)
- Requirements checklist (3–10 items)
- Acceptance Criteria in Gherkin (include doc update)
- Test strategy (unit/integration/e2e/manual)
- Technical considerations (dependencies, security, performance, artifact hygiene, fail-closed validation)
- Related issues placeholders (depends on / blocks)

Every Milestone issue must include:
- Summary (what wave outcome means)
- Acceptance Criteria Gherkin
- Test Plan checklist

Every Docs issue must include:
- Topics to cover
- Acceptance criteria Gherkin (user can complete action)
- Format selection (README/docs/etc.)

Every Refactor issue must include:
- Current state / proposed state
- Gherkin acceptance criteria (behavioral parity)
- Risk assessment checklist alignment

---

## Output formatting for the Issue Pack

For each issue, output in this format:

### Issue: <NN> - <Title>
Form: Feature | Milestone | Bug | Docs | Refactor | Technical Debt
Labels: (use the form defaults; add extra labels only if necessary)
Platform/Runtime: (from TRD; specify only if needed)

Fields to paste:
- Description: MUST start with `Effort: X` on the first line.
- Why:
- Traceability: PRD-R# / TRD-R# / UXS-R#
- User Story (if applicable):
- Requirements:
- Acceptance Criteria (Gherkin):
- Test Strategy:
- Technical Considerations:
- Related Issues:

For Milestone include:
- Summary:
- Acceptance Criteria (Gherkin):
- Test Plan:

For Bug include:
- Steps to Reproduce:
- Expected Behavior:
- Actual Behavior:
- Version/Commit:
- Deployment Environment:
- Reproducibility:
- Acceptance Criteria (Gherkin):
- Test Strategy:

For Docs include:
- Topics to Cover:
- Acceptance Criteria (Gherkin):
- Documentation Format:

For Refactor include:
- Current State:
- Proposed State:
- Acceptance Criteria (Gherkin):
- Risk Assessment:
- Scope of Changes:
- Test Strategy:

For Technical Debt include:
- Current Impact:
- Proposed Solution:
- Acceptance Criteria (Gherkin):

---

## Final section: Roadmap hygiene
End with:
1) “First 5 Issues to Create” (ordered)
2) “Dependencies / Critical Path”
3) “What to validate after each merge” (QA checklist)
4) “What must be documented” (docs checklist)

---

## Step 7 — Create GitHub issues (issues only; no Project board)
Use the repo prompt:
- `docs/prompts/create-gh-issue-short.md`

Execution rules:
1) Create issues in numeric title order (00, 01, 02…).
2) For each issue body from the Issue Pack, paste it into a local file (e.g., `/tmp/issue-body.md`) and use the GitHub CLI `--body-file` workflow defined in `docs/prompts/create-gh-issue-short.md`.
3) Ensure every created issue includes:
   - `Effort: X` as the first line of Description
   - `Traceability: PRD-R# / TRD-R# / UXS-R#`

Note: GitHub assigns issue numbers automatically. In this workshop, the implementation order is encoded in the title prefix (00/01/02…).

End.