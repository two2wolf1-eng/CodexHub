# 0006 OPA/Cedar Policy Backend Evaluation

Date: 2026-05-04

## Decision

CodexHub will prepare a policy backend adapter surface for future OPA and Cedar experiments, but M7a does not run either runtime.

The backend is advisory only. CodexHub `security-kernel` remains the authority provider and must continue to produce the normalized `PolicyDecision` used by workflow gates, execution authorities, evidence, and audit.

## Provider

- Provider names: OPA, Cedar, fixture.
- M7a adapter: `policy-backend-adapter`.
- Runtime status: disabled and fixture-only.
- License/runtime pinning: deferred until a real OPA or Cedar runtime is added.

## Boundary

- Starts external process: no.
- Reads local policy source files: no.
- Touches network: no.
- Handles sensitive data: only metadata and hashes in M7a.
- Raw policy source storage: forbidden.
- Raw request or response body storage: forbidden.
- Raw path storage: forbidden.

## Policy Model

- Backend raw evaluation is recorded as `policy_backend.raw_evaluation_summary`.
- CodexHub normalized decision trace is recorded as `policy_backend.normalized_decision_trace`.
- `backendAdvisoryOnly=true` and `authorityProvider=codexhub` are required.
- Backend output must not become an `ExecutionAuthority`.

## Evidence And Audit

- Evidence is metadata/hash-only.
- Audit events must include actor, action, target, reason, policyDecisionId, evidenceRefs, `liveExecution=false`, and `externalProcessStarted=false`.
- Evidence/Audit remain CodexHub-owned.

## Rollback

Remove the package, path mapping, integration config entry, scaffold health expectations, and contracts added for M7a. No persisted runtime data or process boundary exists in this stage.
