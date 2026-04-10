<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).
Modified principles: N/A (initial adoption)
Added sections:
  - Core Principles (I–VI)
  - Technology & Architecture Constraints
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check references generic principles)
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ⚠ pending — test-related task categories should be treated as optional for MVP per Principle IV
  - .specify/templates/commands/*.md ✅ not present in this install
Deferred items: None
-->

# Wake or Pay Constitution

## Core Principles

### I. Next.js 15 App Router + TypeScript + Tailwind

All application code MUST be written for Next.js 15 using the App Router, in
TypeScript (strict mode), and styled with Tailwind CSS. No alternative
frameworks, routers, or styling systems may be introduced without a constitution
amendment. Rationale: a single, modern stack keeps the MVP small, portable, and
well-supported on Vercel.

### II. Vercel-Native Deployment

The project MUST deploy to Vercel. Any feature that cannot run on Vercel's
serverless/edge runtimes is out of scope. Environment configuration, secrets,
and build settings MUST assume Vercel as the target. Rationale: avoids
infrastructure drift and keeps operations at zero-ops.

### III. Serverless, No Database

The system MUST remain stateless and serverless. A managed database (SQL or
NoSQL) MUST NOT be introduced. Persistent state, if unavoidable, MUST be
delegated to the approved external services (see Principle V) or to short-lived
request/response payloads. Rationale: eliminates operational burden and cost
during MVP; forces simpler designs.

### IV. MVP First — Tests Deferred

Automated tests (unit, integration, E2E) are NOT required during the MVP phase
and SHOULD NOT block delivery. Contributors MUST instead rely on type safety,
manual verification, and small, reviewable changes. This principle will be
revisited once the MVP ships. Rationale: the product risk is market fit, not
regression; testing overhead is deferred until the shape of the system is
stable.

### V. Approved External Services Only

The only sanctioned external services are:
- **Upstash QStash** for scheduled/delayed HTTP delivery and queues.
- **OpenAI API** for LLM/AI capabilities.

Adding any other third-party service (auth providers, analytics, storage,
email, etc.) requires a constitution amendment. Rationale: keeps the dependency
surface auditable and the cost model predictable.

### VI. One File, One Responsibility — Keep It Simple

Every source file MUST have a single, clearly-named responsibility. Files that
accumulate unrelated concerns MUST be split. Abstractions, helpers, and
configuration layers MUST NOT be introduced speculatively — YAGNI applies.
Rationale: simplicity is the primary quality gate for this project; complexity
must be earned.

## Technology & Architecture Constraints

- **Runtime**: Next.js 15 App Router, React Server Components where appropriate,
  TypeScript strict mode, Tailwind CSS.
- **Hosting**: Vercel only. Route handlers, Server Actions, and Edge/Node
  serverless functions are the only supported execution environments.
- **Persistence**: No database. Application state MUST be derived from request
  input, environment variables, or the approved external services.
- **External services**: Upstash QStash and OpenAI API only. Credentials MUST be
  supplied via environment variables; no secrets in the repository.
- **Dependencies**: Prefer zero-dependency or Vercel/Next-native solutions.
  Adding a new npm dependency requires explicit justification in the PR
  description.

## Development Workflow

- **Change size**: PRs SHOULD be small and focused; prefer multiple small PRs
  over one large one.
- **Type safety**: `tsc --noEmit` MUST pass before merge. Type errors are
  treated as build failures.
- **Manual verification**: Each change MUST be manually exercised against the
  affected flow before merging. A short verification note SHOULD accompany the
  PR.
- **Testing (deferred)**: Writing automated tests is optional during MVP (see
  Principle IV). Contributors MAY add tests when they materially reduce risk,
  but MUST NOT gate merges on test presence.
- **Simplicity review**: Reviewers MUST challenge any new abstraction, helper,
  or file that does not carry a single clear responsibility (Principle VI).

## Governance

This constitution supersedes all other development practices for this
repository. All PRs and reviews MUST verify compliance with the Core Principles
and the Technology & Architecture Constraints. Any deviation MUST be justified
in writing in the PR description and approved by the project owner.

**Amendment procedure**: Amendments are proposed via a PR that modifies this
file. The PR MUST include a Sync Impact Report (as an HTML comment at the top
of the file) describing the version bump, affected principles/sections, and
downstream template impacts.

**Versioning policy**: Semantic versioning applies to this document.
- MAJOR: Backward-incompatible removal or redefinition of a principle or
  governance rule.
- MINOR: New principle or materially expanded section.
- PATCH: Clarifications, wording, or non-semantic refinements.

**Compliance review**: The project owner reviews the constitution at least
once per milestone (e.g., MVP launch) to decide whether deferred items (notably
the testing discipline in Principle IV) should be promoted to requirements.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
