# Skills Workflow

CodexHub development rounds combine four layers:

1. GSD turns a request into a bounded spec: goal, scope, non-scope, acceptance criteria, hard boundaries, affected projects, and risk.
2. GStack turns the spec into delivery steps: plan, build, review, QA, ship, and retro.
3. Superpowers keeps engineering discipline explicit: tests where practical, small steps, YAGNI, DRY, evidence over claims, clean git state, and no scope creep.
4. CodexHub custom skills add project-specific rules for contracts, policy, Codex control-plane work, observer modules, QA, and release audit.

## Required Round Flow

Every round should start by declaring:

- GSD Spec: goal, scope, non-scope, acceptance criteria, hard boundaries, affected apps/packages, and risk level.
- GStack Plan: plan, build, review, QA, ship, and retro steps.
- Superpowers Checklist: small steps, tests first where practical, YAGNI, DRY, evidence-over-claims, clean git before/after, no scope creep, and no unreviewed live automation.
- CodexHub Skills Used: list relevant `.agents/skills/*` names and why each applies.

Every round should end with:

- Verification evidence.
- Diff or changed-file summary.
- Known TODOs.
- Commit hash when committed.
- Next recommended round.

## Example: Modifying codex-kernel

Declaration:

- `codexhub-codex-exec-adapter`: required because the change touches `packages/codex-kernel` and Codex exec control-plane behavior.
- `codexhub-workflow-policy-reviewer`: required because policy, evidence, approval, and audit semantics are affected.
- `codexhub-contract-designer`: required if contracts, Zod schemas, DTOs, or inferred shared types change.
- `codexhub-release-auditor`: required for closeout, verification, commit, and summary.

Expected process:

1. Write the GSD spec and identify that live process execution is non-scope.
2. Review the relevant skill files before editing.
3. Update contracts first if shared models change.
4. Update kernel logic through public package entrypoints.
5. Add focused tests for policy, evidence, audit, and disabled states.
6. Run no-live audits and foundation verification.
7. Commit only after the worktree contains only intended changes.

The result should be a small, auditable change with clear evidence and no live automation path.
