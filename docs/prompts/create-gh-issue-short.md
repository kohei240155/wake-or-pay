# Create a GitHub Issue (Quick Guide)

**Prerequisite**: `gh` CLI is installed and authenticated (`gh auth status`).

## Quick Steps

1. **Choose Issue Type**: Pick from `.github/ISSUE_TEMPLATE/`:
   - **Bug**: Something broke
   - **Feature**: New capability  
   - **Documentation**: Docs/guides
   - **Refactor**: Code quality
   - **Technical Debt**: Cleanup

2. **Fill Required Fields**:
   - **Title**: `[Type]: [Component] - [Brief summary]`
   - **Description**: What is this? (1–3 sentences)
   - **Acceptance Criteria (Gherkin)**: `Given.../When.../Then...`
   - **Spec Reference** (optional): PRD-R#, TRD-R#, UXS-R# for traceability

3. **If issue has dependencies**, reference them in the body.

---

## Example: Feature from PRD-R1

```bash
gh issue create \
  --title "Feature: User Auth - Add login flow" \
  --body "## Why: Covers PRD-R1

## Acceptance Criteria (Gherkin)
Given unauthenticated user,
When they click Sign in,
Then they see OAuth options." \
  --label "enhancement"
```

---

## Learn More
- GitHub CLI: `gh issue create --help`
- Issue templates: `.github/ISSUE_TEMPLATE/`
