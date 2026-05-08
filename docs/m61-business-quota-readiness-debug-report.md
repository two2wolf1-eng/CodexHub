# M61 Business Quota Readiness Debug Report

## Decision

M61 status is **governed_automation_ready with adapter activation required**.

The project now has contracts, a pure debug kernel, SQLite metadata tables, Supervisor projections, and a revised automation stance for Business quota readiness. Browser DOM/AX, Browser CDP, Electron renderer CDP, Codex Desktop UI metadata, App Server, Supervisor, Store, and Scheduler can all participate as real automation paths when they pass dry-run, policy, approval, evidence, audit, redaction, drift, and canary gates.

The compliance floor remains strict: no credential harvesting, no login or MFA bypass, no quota or workspace-governance bypass, and no persistence of raw page, transport, identity, local path, prompt, diff, or body material.

## Source Ranking

1. `app-server-rate-limits`: preferred machine-readable source for Codex quota status and count metadata.
2. `official-api` or `enterprise-analytics`: secondary source if documented and authorized for the workspace.
3. `business-credits`: useful for workspace credit/spend-control context when permission allows.
4. `business-page-dom`, `browser-cdp-dom`, `electron-renderer-dom`, and `codex-desktop-ui`: allowed machine-readable observation sources after selector allowlist, redaction, drift, and canary gates.
5. `redacted-export`: import candidate only when pre-redacted and rejected if identity or raw payload columns appear.

## Permission Model

- `owner` and `admin`: can represent workspace-level readiness when confirmed.
- `analytics_viewer`: may represent aggregate analytics readiness, but member-level visibility is not assumed.
- `member`: own-quota readiness only.
- `unknown`: blocks live read and creates a manual checkpoint.

## Local Capability Baseline

- `chatgpt-business-adapter`: ready for governed read-only activation after M62/M63.
- `codex-app-server`: account and rate-limit reads are modeled; live read remains gated by approval, drift, and canary.
- `codex-desktop-cdp`: renderer metadata and governed UI observation are valid automation sources after redaction.
- `profile-registry`: hash and health summary only.
- `store` and `supervisor`: metadata projection ready.
- `scheduler`: must block real dispatch when quota, canary, drift, or redaction state is unknown or failed.

## Evidence Model

Allowed persisted fields:

- ids and record refs
- hashes
- summaries
- statuses
- counts
- boundary booleans
- evidence refs and audit ids

Forbidden persisted material:

- raw identity values
- raw workspace or account identifiers
- raw local profile locations
- raw transport payloads
- raw page, DOM, AX, console, or network body
- browser or desktop auth-state material
- human challenge material
- caller-supplied authority

Allowed in-memory transient parsing:

- DOM/AX quota labels and visible state, only long enough to produce counts, statuses, hashes, redaction reports, evidence refs, and audit ids.
- CDP target, frame, console, and network metadata summaries, never bodies.
- Desktop UI health signals, never main-inspector mutation by default.

## Failure Checkpoints

- `insufficient_role`: ask the operator to confirm admin/owner or analytics capability.
- `workspace_mismatch`: create a workspace selection checkpoint.
- `not_logged_in`: create a login checkpoint for the human operator.
- `source_unavailable`: keep quota unknown and block scheduling.
- `selector_drift`: block live dispatch and require selector review.
- `redaction_failed`: reject persistence and create a redaction checkpoint.
- `protocol_drift`: block live read until drift is reviewed.
- `forbidden_path_requested`: reject and record a blocked forbidden-path probe.

## Implemented Interfaces

- Contracts:
  - `BusinessQuotaSourceProbe`
  - `BusinessQuotaPermissionProbe`
  - `LocalCapabilityProbe`
  - `ForbiddenPathProbe`
  - `QuotaEvidenceMatrix`
  - `QuotaReadinessDebugReport`
- Kernel:
  - `@codexhub/business-quota-debug-kernel`
- Store tables:
  - `business_quota_source_probes`
  - `business_quota_permission_probes`
  - `local_capability_probes`
  - `forbidden_path_probes`
  - `quota_evidence_matrices`
  - `quota_readiness_debug_reports`
- Supervisor:
  - `GET /api/business-quota-debug/probes`
  - `GET /api/business-quota-debug/report`
  - `POST /api/business-quota-debug/rehearsals`

## Sources

- [Managing credits and spend controls in ChatGPT Business](https://help.openai.com/en/articles/20001155-managing-credits-and-spend-controls-in-chatgpt-business)
- [Managing members, seat types, and roles in ChatGPT Business](https://help.openai.com/en/articles/8542216-managing-members-seat-types-and-roles-in-chatgpt-business)
- [OpenAI Codex App Server README](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md)

## M62 Go/No-Go

M62 is a go for **quota contracts and store**, and M63 is a go for **real read-only plus governed UI automation** inside the compliance floor.

Before any live read smoke:

- role must be confirmed
- App Server protocol drift must be compatible
- canary must be green
- approval must exist
- no forbidden-path probe may be unknown
- Supervisor must continue to avoid direct adapter calls
- redaction and selector drift gates must be compatible
