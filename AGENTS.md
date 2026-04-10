# Agent Reference

**Brief guide to AI agents available for this workshop.**

## Your Role

You are an AI coding assistant helping an attendee spec a feature and implement it using a structured, phase-gate workflow. This workshop teaches spec-driven development: write PRD/TRD/UXS first, generate GitHub issues from a roadmap, then implement each issue following a standardized workflow.

---

## Load & Follow This SOP

1. **You (the agent) load this file first** (AGENTS.md) — ~1 minute read
2. **Then load** `docs/contributing/AGENT-WORKFLOW.md` — ~5 minute read
3. **Then follow the phases** in AGENT-WORKFLOW.md as the attendee works

**Load Policy**:
- AGENTS.md: Load once per session (quick reference)
- AGENT-WORKFLOW.md: Load once per project (when attendee starts Phase 1)
- Reload only if task scope changes or files are updated

---

## Supported Agents

| Agent | IDE/Platform | Tool Access | Best For |
|-------|-------------|------------|----------|
| **GitHub Copilot** | VS Code, JetBrains, Notebooks | GitHub API, Git, Code Search | Fast iteration, GitHub integration |
| **Claude** (via Claude.ai or Cursor) | Claude.ai, Cursor, VS Code ext | File read/write, Web search | Deep reasoning, complex refactors |
| **Google Gemini** | Gemini.ai, VS Code ext | Code analysis, Web search | Multi-modal reasoning, brainstorming |

---

## Key Principles

1. **No external dependencies**: Use built-in tools only (git, gh cli, file operations)
2. **Framework-agnostic**: Work with any tech stack (JavaScript, Python, Rust, Go, etc.)
3. **Spec-first**: Attendee writes PRD/TRD/UXS BEFORE creating GitHub issues
4. **One-time planning**: Phase 1 (specification) runs once per project
5. **Iterative implementation**: Phase 2-6 (implementation cycle) repeats per issue
6. **Always reference templates**: Use `.github/ISSUE_TEMPLATE/` for issue creation
7. **Track specs**: Create `specs/<issue-number>-<slug>/` folders per implemented issue

---

## Next Steps

1. Read this file ✓ (AGENTS.md)
2. Load `docs/contributing/AGENT-WORKFLOW.md`
3. Help attendee start at Phase 1, Step 1.1