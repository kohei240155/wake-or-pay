# Prompt: Start Work on Issue

Follow these steps to initialize context and environment for a new issue.

## Step 1: Context Loading
1. Read your repo's contribution guidelines (e.g., `docs/CONTRIBUTING.md` or `.github/CONTRIBUTING.md`).
2. Understand the repo structure, build process, and conventions.
3. **Environment Setup**: Install dependencies using your repo's package manager.
   - Examples: `npm install`, `pip install -r requirements.txt`, `cargo build`, `make install`, etc.
4. **Safety Check**: Ensure any local services are stopped or cleaned up appropriately.
5. **Resource Gate**: Before pulling large dependencies, confirm your environment can support them (disk space, memory, supported architectures).

## Step 2: Preparation
1. **Fetch Issue Context**: Run `gh issue view <ISSUE-NUMBER>` to get the full issue description, comments, and linked PRD/TRD/UXS.
   - Example: `gh issue view 42`
   - This ensures you have the latest issue updates and linked specifications from Phase 1.
2. Create Spec Directory: `mkdir -p specs/<issue-number>-<slug>/` (use the GitHub issue number with 3 digits, e.g., `specs/093-api-reference-docs/`).
3. **Copy Specs**: If Phase 1 created PRD/TRD/UXS in `docs/`, copy them to your issue-specific folder:
   ```bash
   cp docs/PRD-*.md specs/<issue-number>-<slug>/spec.md
   ```
4. Gain context by reading relevant source files and documentation.
5. Note any existing configurations or patterns you'll need to follow.

## Step 3: Environment Audit (Lean)
- **Baseline**: Understand current state (running services, dependencies, configuration).
- **Dependencies**: Identify what you'll need to change or add.
- **Existing Patterns**: Note how similar features are implemented in the codebase.

## Step 4: Ready for Spec-Driven Development
Wait for instructions to start your PRD/TRD/UXS workflow.
