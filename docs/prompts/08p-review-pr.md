# Prompt: Review Pull Request

Address review comments on a pull request.

## Mandates (NON-NEGOTIABLE)

1. **Reviewer Persona**: Ideally, you are a **different agent instance** than the Implementer (e.g., one agent implemented, now a different agent reviews). This provides independent perspective and catches blind spots.
2. **Sub-Agent Delegation**: You MUST delegate the fetching and grouping of review comments to the `generalist` sub-agent. Use the `codebase_investigator` for deep architectural impact analysis if requested by the reviewer.
3. **Mandatory Thinking Injection**: You MUST wrap all internal reasoning and step-by-step thinking inside `<thinking> ... </thinking>` tags. After your thinking is complete, you must output the final remediation status and closure table inside `<artifact> ... </artifact>` tags.

You are assisting with a pull request review.

## Workflow Scope

- **Used In Step(s)**: PR review stage after implementation + validate-and-push, before merge authorization.
- **Trigger**: Open PR with review comments, failing checks, or requested verification pass.
- **Gate Type**: Blocking gate for merge readiness.
- **Prereqs**: Validation-review gate completed for current head; review context fetched (inline + general comments + CI status).
- **Output Required**: Actionable thread checklist (`thread_id -> fixed -> committed -> resolved`), closure table artifact, and lean E2E/health evidence.
- **Skip Conditions**: Long E2E rerun may be skipped on unchanged `head_sha` when prior evidence exists and bounded checks remain healthy.

**Validation-Review Gate**: complete `docs/prompts/validation-review.md` and attach required deliverables before declaring the PR ready.
**Context Policy**: reuse loaded instructions and reload only when triggers from `docs/prompts/context-pack.md` apply.

1.      **Fetch Review Context**:
        *   **Inline Comments**: Use `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`.
        *   **General Comments**: Use `gh api repos/{owner}/{repo}/issues/{pr_number}/comments`.
        *   **CI Status**: Use `gh pr view {pr_number}`.
        *   **GraphQL Verification**: After fixes, re-check review threads via GraphQL and confirm no actionable threads remain.
        *   **Thread Checklist (required)**: Track every actionable thread as `thread_id -> fixed -> committed -> resolved`.
        *   **Closure Table Artifact (required)**: Maintain a final table in the status report with one row per actionable thread:
            `thread_id | file | resolution_commit | resolved_via_graphql`.
        *   **User-Failure Repro Guard**: If the user reports a runtime failure, reproduce the exact failing command/path before relying on prior green snapshots.

2.      **Technical Integrity Check**:
        Verify implementation follows Constitution v1.3.0.
        *   **Terminal Parity Checklist (required for generate/streaming/runtime response changes)**:
            - Verify success semantics are equivalent across stream and non-stream paths.
            - Verify empty-output behavior is explicit and parity-aligned (no silent success).
            - Verify timeout/provider-failure paths emit terminal failure outcomes in both modes.
            - Verify regression tests cover stream and non-stream edge parity (including zero-content stream completion).

3.      **Remediation Strategy & Implementation (MANDATORY)**:
        Before editing any files, you MUST perform a deep reasoning phase wrapped in `<thinking>` tags.

        *   **Symbol Scan**: Execute `grep` or `read_file` for EVERY function, class, or variable signature mentioned in the review. Do NOT rely on memory of previous implementation turns.
        *   **Root Cause Analysis**: If a comment identifies a testing friction or "brittle" logic, prioritize refactoring for testability (e.g., Dependency Injection) over simply adding more complex mocks.
        *   **Holistic Plan**: Group related comments into at most 2 related logic changes per turn. Addressing 5+ findings in a single turn is prohibited as it leads to structural regressions.

        **Implementation Protocol**:
        - Apply changes sequentially
        - After each change: lint, format, and run syntax check
        - Track each comment in a checklist: `comment_id -> fixed -> committed`

4. **Verify Changes Locally**:
        - Run full test suite
        - Run linting and formatting checks
        - If services involved, verify health/status endpoints respond correctly
        - Compare `head_sha` with prior runs to avoid duplicate validation

5.      **Final Status Report**:
        *   ✅ Inline comments addressed
        *   ✅ Local CI: PASS
        *   ✅ E2E Health: PASS
        *   ✅ Spec/Status updated if PoC concluded (no lingering "Draft")
        *   ✅ Benchmark harness hygiene checked (single clock, HTTP errors surfaced, backend RSS sampling if reported)
        *   ✅ Closure table artifact included (all actionable threads)
        *   ✅ Command-drift notes included (if any), following `docs/prompts/snippets/command-drift-notes.md`

        **STOP**. Do **NOT** merge the PR.
        Ask the user: "The PR is verified and ready. Shall I merge it now?"
