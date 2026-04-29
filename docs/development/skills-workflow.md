# Skills Workflow

CodexHub development rounds combine workflow skills and project/domain skills.

Workflow skills are mandatory for every round:

1. `gsd-spec-driver` turns a request into a bounded spec: goal, scope, non-scope, acceptance criteria, hard boundaries, affected projects, and risk.
2. `gstack-delivery-workflow` turns the spec into delivery steps: plan, build, review, QA, ship, and retro.
3. `superpowers-engineering-discipline` keeps engineering discipline explicit: tests where practical, small steps, YAGNI, DRY, evidence over claims, clean git state, and no scope creep.

Project/domain skills are selected by the touched area. CodexHub custom skills add project-specific rules for contracts, policy, Codex control-plane work, observer modules, QA, and release audit.

## Required Round Flow

Every round should start by declaring:

- GSD Spec: goal, scope, non-scope, acceptance criteria, hard boundaries, affected apps/packages, and risk level.
- GStack Plan: plan, build, review, QA, ship, and retro steps.
- Superpowers Checklist: small steps, tests first where practical, YAGNI, DRY, evidence-over-claims, clean git before/after, no scope creep, and no unreviewed live automation.
- Workflow Skills Used and Why: always include the three workflow skills.
- Project Skills Used and Why: list relevant CodexHub project/domain skills and why each applies.
- Skills Not Used and Why: state why obvious project skills were not used.

Every round should end with:

- Verification evidence.
- Diff or changed-file summary.
- Known TODOs.
- Commit hash when committed.
- Next recommended round.

## Example: Modifying codex-kernel

Workflow skills:

- `gsd-spec-driver`: required to define the goal, scope, non-scope, acceptance criteria, hard boundaries, affected packages, and risk.
- `gstack-delivery-workflow`: required to structure plan, build, review, QA, ship, and retro.
- `superpowers-engineering-discipline`: required to enforce small steps, tests where practical, YAGNI, evidence-over-claims, and no scope creep.

Project skills:

- `codexhub-codex-exec-adapter`: required because the change touches `packages/codex-kernel` and Codex exec control-plane behavior.
- `codexhub-workflow-policy-reviewer`: required because policy, evidence, approval, and audit semantics are affected.
- `codexhub-contract-designer`: required if contracts, Zod schemas, DTOs, or inferred shared types change.
- `codexhub-release-auditor`: required for closeout, verification, commit, and summary.

Skills not used:

- Electron/CDP and Browser Profile observer skills are not used unless those modules are touched.
- Playwright QA is not used unless Dashboard/browser QA behavior changes.
- Architecture planner is not used unless package boundaries or cross-plane architecture change.

Expected process:

1. Write the GSD spec and identify that live process execution is non-scope.
2. Review the relevant skill files before editing.
3. Update contracts first if shared models change.
4. Update kernel logic through public package entrypoints.
5. Add focused tests for policy, evidence, audit, and disabled states.
6. Run no-live audits and foundation verification.
7. Commit only after the worktree contains only intended changes.

The result should be a small, auditable change with clear evidence and no live automation path.
