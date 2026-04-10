# Prompt: Create Pull Request

Create a PR after implementation is complete and local validation passes.

## Mandates (NON-NEGOTIABLE)

1. **Sub-Agent Delegation**: You MUST delegate final integrity audits and E2E ground truth verification to the `generalist` sub-agent.
2. **Mandatory Thinking Injection**: You MUST wrap all internal reasoning and step-by-step thinking inside `<thinking> ... </thinking>` tags. After your thinking is complete, you must output the final PR description and status inside `<artifact> ... </artifact>` tags.

Create a PR after implementation is complete and local validation passes.

## Pre-PR Validation (Lean)

**Validation-Review Gate**: Before PR creation, complete `docs/prompts/validation-review.md` and summarize required deliverables.
**Context Policy**: Load once per session from instruction sources and reload only on trigger conditions documented in `docs/prompts/context-pack.md`.

### Step 1: Quality Gate
Run your repo's complete validation suite:

Verify:
- All tests pass
- No lint/format issues
- No type errors (if applicable)
- Integration tests pass (if applicable)

### Step 2: Final Status Report
Verify before creating PR:
- ✅ Local validation: PASS
- ✅ Git status: CLEAN (no uncommitted changes)
- ✅ Branch: Synced with remote
- ✅ Commits: Ready for review

---

## Create the PR

```bash
gh pr create \
  --base main \
  --head <BRANCH_NAME> \
  --title "fix/feat: Summary (Closes #NNN)" \
  --body "[Summary + Key Changes + Verification Status]"
```

**Checklist**:
- ✅ Full test suite passed
- ✅ Linting/formatting clean
- ✅ Code reviewed locally
- ✅ Branch pushed to remote
