# Prompt: Post-Implementation Review

**Purpose**: Assess performance and close out the issue after merging a PR.
**Trigger**: After merging a PR and before starting the next issue.

---

## 1. Assessment Protocol

Review the interaction history for the completed issue and evaluate:

1.  **Procedural Adherence**:
    *   Did I wait for user validation before creating the PR?
    *   Did I wait for explicit permission before merging?
    *   Did I follow the `specs/` workflow (Specify -> Plan -> Tasks)?

2.  **Technical Quality**:
    *   Did the solution work on the first try?
    *   Were there regressions or environmental assumptions (e.g., SSL, Hostnames)?
    *   Is the code tested and linted?

3.  **Communication**:
    *   Did I assume intent instead of asking clarifying questions?
    *   Was the output concise and relevant?

4.  **Measured Execution Metrics (REQUIRED)**:
    *   Record parity gate runtime baseline or delta for this issue.
    *   Record total rerun count for validation commands.
    *   Record repeated long quiet validation reruns and forced-quit incidents (target trend: zero).
    *   Record command-drift incidents (missing flags/adjusted commands) and how they were corrected.
    *   Record instruction reload count and reload reason for the issue cycle.

## 2. Root Cause Analysis

For any issues (e.g., "Premature Merge", "Broken Test"):
- **What**: Describe the specific error.
- **Why**: Identify what led to it.
- **Fix**: Define how to prevent recurrence.

After the PR is merged:

1. Update `specs/<issue-number>-<slug>/metadata.json` with final status
2. Create handoff summary
3. Commit close-out artifacts to `main`
   # Expected: runner is offline or absent after deregistration/cleanup
   ```

3. If container is removed but runner still appears online/registered:
   - Record as stale registration evidence.
   - Run explicit runner deregistration remediation for the current repo runner name.
   - Re-check both Docker and GitHub runner status before closing PIR.

---

## 5. Mitigation Strategies

If ambiguity arises in future tasks:
*   **Multiple Paths**: Present options (A/B) with trade-offs before coding.
*   **Missing Context**: Stop and ask the user to run a diagnostic command (e.g., `scutil`, `openssl`).
*   **User Gates**: Treat "Validation" and "Merge" as hard stops requiring explicit user "Go".
*   **Service Restarts**: If services were restarted manually, log bind/health verification and note any HOST/loopback deviations as root causes.

## 6. Output Artifacts (REQUIRED)

1.  **Generate PIR File**:
    *   Path: `docs/pi-review/PIR-ISSUE-<ID>.md`
    *   Content: The detailed assessment, measurable execution metrics, root cause analysis, and corrective actions.

2.  **Update MCP Memory**:
    *   Use `create_entities` or `add_observations`.
    *   Entity: "Process" or "Agent Workflow".
    *   Observation: "Learned: [Key Correction] (Source: Issue #<ID>)".

```markdown
### Post-Implementation Review: Issue #<ID>

**Rating**: [High/Mixed/Low]

**Key Learnings**:
*   [Observation 1]
*   [Observation 2]

**Measured Execution Metrics**:
*   Parity gate runtime baseline/delta: [value]
*   Validation rerun count: [value]
*   Command-drift incidents: [value]
*   Corrective actions tied to metric findings: [value]

**Artifacts Created**:
*   `docs/pi-review/PIR-ISSUE-<ID>.md`
*   MCP Memory Updated: [Yes/No]

**Prompt Hygiene**:
*   Record any CLI argument drift or tool invocation changes and update prompts accordingly.
```
