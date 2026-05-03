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

## M7.5 Hardening

- Production source is audited to reject real OPA process entrypoints and Cedar runtime imports.
- Fixture backend output is tested as advisory even when it says allow or deny.
- CodexHub `security-kernel` remains the only normalized policy authority.

## M7b Controlled Fixture Experiment

- A repo-local JSON fixture config is available at `.codexhub/policy-backend.fixture.json`.
- The config is parsed only as fixture rules and stores config hash, rule count, match count, and summaries.
- Raw config body and raw config path are not stored in public records, evidence, or audit.
- Fixture config outcomes remain advisory; they cannot create or replace an `ExecutionAuthority`.

## M7d Read-Only UX

- Dashboard route `#/policy-telemetry` shows policy backend manifest metadata, disabled default state, backend kinds, evaluator sources, and advisory-only status.
- CLI commands `codexhub policy-backend status` and `codexhub policy-backend plan` are read-only helpers. They do not create `ExecutionAuthority`, do not call Supervisor POST routes, and do not execute backend runtimes.
- UX output remains hashes, counts, statuses, and summaries only.

## Rollback

Remove the package, path mapping, integration config entry, fixture config file, scaffold health expectations, M7.5 audit terms, M7d read-only UX, and contracts added for M7a/M7b. No persisted runtime data or process boundary exists in this stage.
