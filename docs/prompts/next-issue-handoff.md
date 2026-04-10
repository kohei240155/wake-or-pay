# Prompt: Generate Next Issue Handoff

**SEQUENCE**: This prompt MUST be run AFTER `10p-post-implementation-review.md` is complete.

After the current issue is complete, prepare the next work item by documenting handoff and selecting next issue.

---

## Your Tasks

1. **Create handoff document** (optional, but recommended for teams):
   - Use template: `docs/handoff/HANDOFF-ISSUE-TEMPLATE.md`
   - Save as: `docs/handoff/HANDOFF-ISSUE-NNN.md` (use current issue number)
   - Fill out: accomplishments, technical context, next steps

2. **Review open issues** from roadmap:
   - List available issues (not yet started)
   - Check for blocking dependencies
   - Check for file conflicts (in-progress PRs)

3. **Analyze priority and impact**:
   - Confirm milestone alignment
   - Identify data dependencies
   - Note any prerequisite issues

4. **Select next issue** and document choice:
   - Rationale: why this issue next?
   - Proposed start: when?

5. **Ready incoming agent**:
   - Point to `docs/contributing/AGENT-WORKFLOW.md` Phase 2
   - Reference handoff document (if created)

---

## Output

**Handoff Document** (`docs/handoff/HANDOFF-ISSUE-NNN.md`):
- Summarizes current issue completion
- Lists learnings and decisions
- Guides next agent on setup and context

**Next Issue Selection**:
- Issue number chosen
- Rationale documented
- Ready to start `01p-start-issue.md` with new issue

---

## Workflow Continuation

After handoff:
1. Starting agent reads: `docs/handoff/HANDOFF-ISSUE-NNN.md` (optional)
2. Starting agent loads: `docs/contributing/AGENT-WORKFLOW.md` (Phase 2)
3. Starting agent runs: `01p-start-issue.md` with new issue number
4. Loop continues: Phase 2-6 repeats for each issue
