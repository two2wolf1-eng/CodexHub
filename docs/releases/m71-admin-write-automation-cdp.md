# M71 Admin Write Automation via Fixed Business UI Flow

## Summary

M71 turns the M66 admin UI authority shell into a governed fixed-flow execution model for Business administration writes. A run can now represent an approved visible UI submission only when the live gate is enabled, a fixed Business admin runner is configured, authority is store-resolved, selector and final confirmation fingerprints match, and post-write verification produces hash-only evidence.

Public responses remain metadata-only: ids, hashes, statuses, booleans, summaries, evidence refs, and audit ids. Request-body authority, raw selectors, raw scripts, raw payloads, credential material, browser storage, and network bodies remain rejected.

## Scope

- Extended `AdminWriteRun` with fixed-flow execution, fingerprint match, post-write verification, duplicate submit, owner self-protection, and raw passthrough denial fields.
- Updated `ui-automation-kernel` so approved admin writes are executable only through fixed-flow safeguards.
- Added injected Supervisor fixed-flow runner support for `/api/business-quota/admin-ui/runs` and `/api/business-quota/admin-ui/post-write-verifications`.
- Added tests for approved execution, owner self-protection, duplicate submit blocking, fingerprint drift blocking, and metadata-only output.

## Non-Scope

- No generic browser click/type automation.
- No generic CDP command passthrough.
- No request-body execution authority.
- No credential entry, credential collection, browser storage read, or network body read.
- No direct UI, CLI, or MCP adapter execution.

## Verification

- Focused contracts and UI automation kernel tests cover schema and fixed-flow behavior.
- Supervisor tests cover M66 compatibility plus M71 fixed-flow success and blocked owner/fingerprint paths.
- Full closeout gates must still pass before M71 is considered complete.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for scope and acceptance, `gstack-delivery-workflow` for staged delivery, `superpowers-engineering-discipline` for small-step critical-risk execution.
- Project Skills Used and Why: `codexhub-architecture-planner` for runner injection boundaries, `codexhub-contract-designer` for run schema changes, `codexhub-workflow-policy-reviewer` for approval/evidence/audit invariants, `codexhub-browser-profile-observer` for Browser/Profile safety rules, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime are not expanded in M71.
