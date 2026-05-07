# M48e Operator Training

## Summary

M48e adds the Production GA operator training package. Training completion remains metadata-only: operator hashes, module ids/hashes, status, evidence refs, and audit ids.

## Training Modules

- Governance basics
- Approvals and authority
- Evidence and audit review
- GitHub lifecycle
- Release, deploy, and rollback
- Secrets handling
- Runtime and external agent safety
- Incident and disaster recovery

## Verification

- `pnpm scaffold:health`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

## Skills Used And Why

- `gsd-spec-driver`: preserved GA release readiness scope.
- `gstack-delivery-workflow`: delivered the training subround independently.
- `superpowers-engineering-discipline`: kept training as metadata and docs only.
- `codexhub-workflow-policy-reviewer`: checked training does not become authority.
- `codexhub-release-auditor`: recorded verification evidence.

## Skills Not Used And Why

- Runtime Browser/Electron/MCP/Policy/Telemetry/Deployment/External Agent skills were not used because this round only documents operator training.
