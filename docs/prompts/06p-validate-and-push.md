# 06p — Validate and Push

Validate implementation locally before pushing to remote.

**Pipeline Position**: 6 of 10 | **Prev**: `05p-review-implementation.md` | **Next**: `docs/prompts/create-pr.md`

## Mandates (NON-NEGOTIABLE)

1. **Sub-Agent Delegation**: You MUST delegate long-running validation tasks (e.g., full test suites) to a sub-agent if context efficiency or turn count is a concern. Do NOT simulate validation results.
2. **Mandatory Thinking Injection**: You MUST wrap all internal reasoning inside `<thinking> ... </thinking>` tags. After thinking is complete, output the final validation report inside `<artifact> ... </artifact>` tags.

## Workflow Scope

- **Used In Step(s)**: Pipeline Step 6 (`validate-and-push`) before PR creation.
- **Trigger**: Implementation complete and ready for final local validation + branch sync.
- **Gate Type**: Blocking gate.
- **Prereqs**: Validation-review gate passed for current head; branch has implementation commits ready for verification.
- **Output Required**: Clean validation status, branch push confirmation, and any command adjustments made.
- **Skip Conditions**: None for mandatory gates; optional fast loop remains non-blocking.

---

Prepare for PR after implementation is complete and local validation passes.

## Step 1: Cleanup & Auto-Fix (MANDATORY)

**Rule: Systemic Validation**. Run your repo's full validation suite (linting, formatting, tests), apply all fixes globally, and commit the "Verified Clean" state once.

**Examples:**
```bash
# Node/JavaScript
npm run lint && npm run format && npm test

# Python
python -m pytest && python -m black . && python -m ruff check --fix .

# Rust
cargo fmt && cargo clippy && cargo test

# Or via Makefile
make test && make format && make lint
```

**Verifies & Fixes:**
- Linting
- Formatting
- Tests

If this script modifies files, commit the fixes immediately.

## Step 1.5: Verify Working Tree (MANDATORY)

**Protocol**: You MUST verify that your local disk state matches your repository staging area.

1. Run `git status --porcelain`.
2. If the output is NOT empty, you MUST stage and commit the changes.
3. **DO NOT** proceed to Step 2 or Step 3 if `git status --porcelain` returns any output.

**Definition of "Verified Clean"**: Local Disk == Staging Area == Remote Head.

## Step 2: Full Validation (MANDATORY)

**Cache Check**: Before running, check if you've already run tests on this commit. Only rerun if new commits were added since the last run or if Step 1 created new changes.

**Run your repo's complete validation suite:**
```bash
# Examples:
make test          # if repo has Makefile
npm run test       # Node.js
python -m pytest   # Python
cargo test         # Rust
```

Notes:
- Run the complete validation suite, not just a quick subset.
- If tests fail, fix the issues and re-run until green.
- If command syntax differs from examples, check your repo's docs or `--help`.

If validation fails:
1. STOP (do not push)
2. Fix the errors
3. Re-run validation until green

## Step 3: Push (MANDATORY)

```bash
git push origin <BRANCH_NAME>
```

## Transition
- Report validation status.
- **STOP** and wait for explicit PR creation request.
- Next prompt: `docs/prompts/create-pr.md`.
