# Workshop Kickoff: Getting Started with Spec-Driven Development

Welcome! This guide will help you kick off a feature using **spec-driven development** workflow.

---

## The Pattern

Before writing code, we **specify everything clearly**:

1. **PRD** — What are we building and why?
2. **TRD** — How do we build it technically?
3. **UXS** — What does the user/developer experience look like?
4. **Issue** — Create GitHub issue linked to specs
5. **Implementation** — Follow a phase-gate workflow to build, review, and merge

This ensures clarity, alignment, and fewer surprises during implementation.

---

## The 3-Step Spec Process

### Step 1: Product Requirements (PRD)
**File**: `01-PRD-Prompt.md` in this folder

- Answer: What? Why? Who benefits?
- Include: Feature description, user goals, business context
- Define acceptance criteria using **Gherkin** (Given/When/Then)
- **Output**: PRD document (1-2 pages)

### Step 2: Technical Requirements (TRD)
**File**: `02-TRD-Prompt.md` in this folder

- Answer: How do we build this?
- Include: Architecture, APIs, external services, dependencies
- Define technical constraints and assumptions
- List what technology/frameworks you'll use
- **Output**: TRD document (1-2 pages)

### Step 3: User/Developer Experience Spec (UXS)
**File**: `03-USX-Prompt.md` in this folder

- Answer: How does the feature work day-to-day?
- Include: User workflows, outputs, examples
- Define edge cases and error handling
- **Output**: UXS document (1-2 pages)

---

## Before You Start

1. **Have an idea?** Great! Pick a feature or improvement
2. **Know your tech stack?** Identify languages/frameworks
3. **Time to write specs?** Plan for 15-30 minutes per spec
4. **Want feedback?** Share specs with collaborators before implementing

---

## What Comes Next

After you have written PRD + TRD + UXS:

1. **Validate**: Check against `docs/prompts/spec-review-checklist.md`
2. **Create Issue**: Use template from `.github/ISSUE_TEMPLATE/`
   - Reference: PRD-R1, TRD-R1, UXS-R1 (or your doc naming)
   - Include acceptance criteria (Gherkin)
3. **Start Work**: Follow `docs/contributing/AGENT-WORKFLOW.md` Phase 2 onwards

---

## Spec Files to Follow

In this folder:

- **01-PRD-Prompt.md** — Product Requirements template & guidance
- **02-TRD-Prompt.md** — Technical Requirements template & guidance
- **03-USX-Prompt.md** — User Experience Spec template & guidance
- **04-Roadmap.md** — Release planning & prioritization

---

## Example Flow

```
You: "I want to add X to the project"
    ↓
You: Read 00-KICKOFF.md (this file) ✓
    ↓
You: Write PRD (01-PRD-Prompt.md)
    ↓
You: Write TRD (02-TRD-Prompt.md)
    ↓
You: Write UXS (03-USX-Prompt.md)
    ↓
You: Validate specs (spec-review-checklist.md)
    ↓
You: Create GitHub issue (.github/ISSUE_TEMPLATE/)
    ↓
You: Share issue with others (async feedback)
    ↓
You: Follow AGENT-WORKFLOW.md to implement
```

---

## Tips

✅ **Do this**:
- Write specs even if they feel obvious — clarity saves rework
- Use Gherkin for acceptance criteria (Given/When/Then)
- Reference external APIs or services by exact name
- Include "What breaks?" in your TRD
- Ask for spec feedback before coding

❌ **Don't do this**:
- Skip specs and jump straight to coding
- Use vague language ("user-friendly", "fast")
- Leave acceptance criteria open-ended
- Assume dependencies are available
- Start implementation before issue is created

---

## Next Step

**Ready?** Open **`01-PRD-Prompt.md`** and start writing your PRD!

Questions? Check the relevant prompt file, or refer to `AGENT-WORKFLOW.md` for the full workflow.