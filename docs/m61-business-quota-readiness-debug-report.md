# M61 Business Quota Readiness Debug Report

## Decision

M61 status is **needs_adapter with manual checkpoint support**.

The project now has contracts, a pure debug kernel, SQLite metadata tables, and Supervisor projections for Business quota readiness. It still should not perform live quota reads until M62 confirms role, protocol compatibility, canary status, approval, and forbidden-path gates.

## Source Ranking

1. `app-server-rate-limits`: preferred machine-readable source for Codex quota status and count metadata.
2. `official-api` or `enterprise-analytics`: secondary source if documented and authorized for the workspace.
3. `business-credits`: useful for workspace credit/spend-control context when permission allows.
4. `manual-export`: future import candidate only after redaction and approval.
5. `ui-reference-only`: human reference only, not a machine data source.

## Permission Model

- `owner` and `admin`: can represent workspace-level readiness when confirmed.
- `analytics_viewer`: may represent aggregate analytics readiness, but member-level visibility is not assumed.
- `member`: own-quota readiness only.
- `unknown`: blocks live read and creates a manual checkpoint.

## Local Capability Baseline

- `chatgpt-business-adapter`: fixture-only in M61.
- `codex-app-server`: methods are modeled, live read remains gated.
- `codex-desktop-cdp`: health metadata only, not quota data.
- `profile-registry`: hash and health summary only.
- `store` and `supervisor`: metadata projection ready.

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
- page text extraction
- browser auth-state material
- human challenge material

## Failure Checkpoints

- `insufficient_role`: ask the operator to confirm admin/owner or analytics capability.
- `workspace_mismatch`: create a workspace selection checkpoint.
- `not_logged_in`: create a login checkpoint for the human operator.
- `source_unavailable`: keep quota unknown and block scheduling.
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

M62 is a conditional go for **read-only adapter activation work**, not live quota automation by default.

Before any live read smoke:

- role must be confirmed
- App Server protocol drift must be compatible
- canary must be green
- approval must exist
- no forbidden-path probe may be unknown
- Supervisor must continue to avoid direct adapter calls
