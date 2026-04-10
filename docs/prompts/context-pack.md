# Prompt Context Pack (Load-Once Policy)

Use this context for recurring workflow turns.

## Load Policy
- Load once per session/task from authoritative sources (instructions and task-specific prompts)
- Reload only when one of these triggers occurs:
  1. A loaded instruction file changes
  2. A new task-specific prompt is introduced
  3. The task scope changes (e.g., issue switch or new objective)

## Reload Triggers (Reportable)
When reloading, record:
- Reload count (increment per issue cycle)
- Reload reason (file changed / new prompt / scope change)

## Recurring Guardrails
- Run full validation suite before long CI/test reruns
- Require explicit confirmation before repeating long-running validation in same cycle
- Keep gates deterministic and report final status
