# Prompt: Senior Architect Validation Review

Perform a deep review after implementation is integrated and before pushing to PR.

## Mandates (NON-NEGOTIABLE)

1. **Sub-Agent Delegation**: You MUST delegate deep test integrity audits and spec-fidelity comparisons to the `generalist` sub-agent.
2. **Mandatory Thinking Injection**: You MUST wrap all internal reasoning and step-by-step thinking inside `<thinking> ... </thinking>` tags. After your thinking is complete, you must output the final Senior Architect Review Report inside `<artifact> ... </artifact>` tags.

Perform this review after implementation is integrated and before expensive CI/push gates.

## Agent Role
- **Executor**: 🧠 **Senior Architect Agent** (High-reasoning model)
- **Trigger**: Implementation is integrated but not yet validated for push.

## Purpose
Run a deep senior-engineer review focused on:
- logic correctness,
- requirements/spec fidelity,
- test integrity (including over-mocking/shallow assertions).

**Goal**: Catch logic bugs, spec mismatches, and weak tests before full parity CI.

---

## Phase 1: Context Loading & Spec Alignment

1. Read `specs/<ISSUE-NO>-<slug>/spec.md` (source of truth)
2. Read `specs/<ISSUE-NO>-<slug>/tasks.md` (implementation checklist)
3. Read actual implementation changes (all modified files)
4. Note any impact analysis or risk assessments

2. **Spec-verification protocol**
- Compare `spec.md` requirements line-by-line against implementation.
- Check for semantic mismatches (example: soft-delete implemented wh
- Check for semantic mismatches (e.g., soft-delete vs hard-delete mismatch)
- **Security**: Verify sensitive data (secrets, API keys) is handled securely
- **Error Handling**: Audit error paths for proper responses and recovery
- Check terminal outcomes (timeouts, empty responses, failures, invalid inputs)
- Validate external service assumptions are explicit

---

## Phase 2: Test Integrity Audit

Evaluate whether tests truly validate behavior.

1. **Analyze test depth**
   - Review new/updated tests
   - Flag happy-path-only coverage and missing edge cases
   - Identify over-mocking that bypasses actual behavior
   - Check assertions for correctness, not just presence

2. **Coverage confirmation**
   - Verify each user story has corresponding tests
   - Explicitly call out uncovered requirements

---

## Phase 3: Manual Verification Plan

Generate a concise Markdown checklist for human validation, focused on interactions hard to automate.

Required output format:

```markdown
### 🛠️ Manual Verification Steps
1. Start required services using repo-approved method.
2. Run the primary user flow for this issue.
3. Trigger at least one failure/edge condition.
4. Verify expected terminal outcome and error semantics.
5. Validate key logging/observability signal(s) without sensitive data leakage.
```

Use repo-accurate commands and ports/protocols; if defaults differ in environment, state the exact override used.

---

## Phase 4: Verdict

Produce a **Review Report** with one of two outcomes:

### A) REQUEST CHANGES
- Provide a bulleted list of **Blocking Issues**.
- Each item must include:
  - requirement/test mismatch,
  - impact/risk,
  - exact file reference.
- Stop progression; instruct: **"Fix these logic errors and re-run Phase 2."**

### B) APPROVE
- Output: **"✅ Deep Review Passed. Logic matches Spec."**
- Include any residual non-blocking risks.

---

## Required Deliverables

1. **Findings-first report**
- Order by severity (highest first).
- Include file references.

2. **Traceability table**
- Requirement -> implementation path -> test evidence -> status (`PASS`/`GAP`).

3. **Review checklist**
- If reviewing a PR with inline comments, track:
  - `thread_id -> fixed -> committed -> resolved`.

4. **Validation recommendation**
- State whether it is safe to proceed to full CI/local parity gates.



## Required Deliverables (Gate Output)
- Validation-review gate status (`PASS`/`REQUEST CHANGES`).
- Traceability evidence (`thread_id -> fixed -> committed -> resolved` when applicable).
- Rerun decision note for long quiet validations (needed/not needed + reason).
- Context reload note (reload count and reason, per `docs/prompts/context-pack.md`).
