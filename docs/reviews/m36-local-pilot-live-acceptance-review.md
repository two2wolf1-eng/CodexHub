# M36 Local Pilot Live Acceptance Review

## Scope

Reviewed the local production pilot acceptance path for `local-patch-review`, focusing on readiness blockers, store-resolved child references, child approval separation, metadata-only public output, and conditional live smoke behavior.

Touched areas:

- `packages/contracts`
- `packages/workflow-kernel`
- `apps/supervisor`
- `apps/cli`
- `apps/dashboard`
- Governance config, docs, and scaffold health

## Findings

- The local pilot remains runtime-gated and disabled by default.
- Store-resolved child record references remain the only trusted child state for recovery runs.
- Fixture acceptance now covers missing child refs and hash mismatches, closing the main rehearsal gap left after M35.
- Dashboard and CLI expose readiness and rehearsal summaries without adding child approval buttons or new workflow execution commands.

## Residual Risk

- A real local smoke depends on operator runtime configuration and existing child approvals. When those are absent, the correct outcome is readiness-blocked.
- The live smoke touches existing local child boundaries only after the operator has explicitly enabled the required gates and approvals.
- Cleanup remains a handoff; M36 does not auto-clean worktrees or artifacts.

## Closeout Checklist

- Request-body child state remains untrusted.
- Workflow approval does not replace child approval.
- Nx failure prevents review package export.
- Public responses remain metadata-only.
- Dashboard and CLI do not add new mutation paths.
