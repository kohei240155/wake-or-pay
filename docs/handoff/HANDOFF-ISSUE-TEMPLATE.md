# HANDOFF-ISSUE-###: [Title]

**Use this template after completing `10p-post-implementation-review.md` to handoff to the next issue.**

---

## Current Status

- **Issue**: #NNN
- **Branch**: `feat/NNN-slug`
- **Milestone**: [Which roadmap milestone/wave]
- **Current Agent**: [Implementer name or agent type]
- **Status**: [In Progress / Ready for Handoff / Depends on Review]

---

## Accomplishments (What's Done)

- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Code reviewed and approved
- [ ] PR merged to main
- [ ] Architecture decisions documented in specs/NNN/

---

## What Was Learned

- **Key Decision**: [ADR or design choice made]
- **Blocker Resolved**: [If any was encountered and fixed]
- **Pattern Established**: [For future issues to follow]

---

## Remaining Work

- [ ] List any follow-up tasks (not in scope of this issue)
- [ ] Known tech debt to address later
- [ ] Future enhancements identified

---

## Technical Context

- **Files Modified**: [Key files changed]
- **New Dependencies**: [Any added to project]
- **Spec Folder**: `specs/NNN-slug/` (contains spec.md, plan.md, tasks.md)
- **Related Issues**: [Link any blocked-by or blocking issues]

---

## Environment Notes

- **Node/Python/Runtime Version**: [If relevant]
- **Setup Quirks**: [Any setup needed to work on next issue]
- **CI/Test Commands**: [How to run tests locally]

---

## Next Steps for Incoming Agent

1. Load `docs/contributing/AGENT-WORKFLOW.md` (Phase 2 onwards)
2. Run `01p-start-issue.md` with the next issue number
3. Select from available issues:
   - [ ] Issue #NNN+1: [Title from roadmap]
   - [ ] Issue #NNN+2: [Title from roadmap]
   - [ ] Issue #NNN+3: [Title from roadmap]

---

## Validation Checklist for Next Issue

- [ ] `git checkout main && git pull origin main` (fresh state)
- [ ] Follow `docs/contributing/AGENT-WORKFLOW.md` Phase 2-6
- [ ] Use prompt sequence: 01p → 05p → 06p → 07p → 08p → 09p → 10p → next-issue-handoff
- [ ] All tests pass locally before push
- [ ] PR approved before merge
- [ ] Linked to GitHub issue (Closes #NNN)

---

## Questions?

- **Stuck?** Check `docs/contributing/AGENT-WORKFLOW.md` for phase guidance
- **Spec clarity?** See `specs/NNN-slug/spec.md`
- **Workflow help?** Refer to `AGENTS.md` (quick ref) or `docs/contributing/README.md` (navigation)
