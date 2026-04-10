# Prompt: Merge Commit Protocol

Follow the merge protocol for your repository.

## Workflow Scope

- **Used In Step(s)**: Final merge stage after PR review approval and explicit user merge instruction.
- **Trigger**: User explicitly requests merge after green checks/review readiness.
- **Gate Type**: Blocking gate for integration into `main`.
- **Prereqs**: Validation-review + review-pr gates complete, PR checks green on merge head, and explicit merge authorization in current turn.
- **Output Required**: Verified `--no-ff` merge execution, post-merge verification, and push confirmation.

**CRITICAL RULE**: This repository mandates **Merge Commits** (`--no-ff`). Do NOT squash or rebase when merging to main.

Before merging, verify:
1. **All checks pass**: Run final test suite
2. **Review complete**: All review comments addressed
3. **Branch ready**: `git status` shows clean working directory

**Merge Steps**:
1. `git checkout main`
2. `git pull origin main`
3. `git merge --no-ff <FEATURE_BRANCH> -m "Merge branch '<FEATURE_BRANCH>'\n\nCloses #XXX"`
4. Run final verification
5. `git push origin main`
