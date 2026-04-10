# Prompt: Spec Review Before Implementation

**Purpose**: Validate that an issue's specifications (`spec.md` and `plan.md`) are complete and unambiguous before implementation starts.

**Scope**: This checklist is for **issue-level specifications ONLY** (Phase 2 onwards, when working on a specific GitHub issue).

**NOT for**: High-level PRD/TRD/UXS validation (that happens in Phase 1 using `00-KICKOFF.md` review).

**When to use**: Before starting Phase 3 (implementation) — review the generated issue-specific `specs/<issue>/spec.md` and `specs/<issue>/plan.md` against this checklist.

---

## Spec Completeness Checklist

### 1. Authentication & Secrets

- [ ] **Spec clearly identifies**: Necessary environment variables.
- [ ] **Spec defines**: How external services/APIs are tested (fixtures, live, mocks).
- [ ] **If using Live Services**: Handles rate-limiting and failures.
- [ ] **Security**: No secrets in code, all sensitive data handled securely.

### 2. Integration & Environment

- [ ] **Spec identifies**: All external services/integrations and their boundaries.
- [ ] **Dependencies**: Any new dependencies specified and impact assessed.
- [ ] **Compatibility**: Version requirements documented.

### 3. Testing Strategy (Constitution-First)

- [ ] **Test-First**: Tests planned before or with implementation.
- [ ] **Coverage**: Happy path, edge cases, and error paths covered.
- [ ] **Integration**: If external services involved, integration tests included.

### 4. Robustness & UX

- [ ] **Error Handling**: Clear error messages and proper exit codes.
- [ ] **Idempotency**: Operations can run safely multiple times.
- [ ] **Documentation**: User-facing docs planned.

### 5. Architecture & Design

- [ ] **Patterns**: Follows existing codebase patterns.
- [ ] **Scope**: Feature scope is clear and bounded.
- [ ] **Extensibility**: Future-proof design considered.

---

## Common Gaps (Red Flags)

| Gap | Question | Action |
|-----|----------|--------|
| Missing error cases | Tests only cover happy path | Add edge case and error path tests |
| Incomplete scope | Ambiguity about what's included | Clarify with user; update spec |
| No integration plan | How is it tested with dependencies? | Define integration test strategy |
| Outdated docs | Examples don't match new behavior | Plan doc updates |

---

## Validation Workflow

**Before starting implementation:**

1. Read `spec.md` and `plan.md`
2. Answer each checklist item
3. If unchecked: **STOP and clarify**
4. Update spec to address all gaps
5. Document findings
6. Proceed when all items checked

---

## Outcome

After this check:
- ✅ **Scope Clarity**: Feature requirements are unambiguous
- ✅ **Test Strategy**: Tests planned and comprehensive
- ✅ **Dependencies**: External integrations and requirements clear
- ✅ **Quality**: Robustness and error handling addressed
