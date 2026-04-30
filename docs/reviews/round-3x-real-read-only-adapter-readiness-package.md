# Round 3X Real Read-only Adapter Readiness Package Review

## Executive Summary

Round 3X adds a metadata-only readiness package for a future separate real read-only adapter ADR review. It is not the ADR itself, not an implementation plan, and not an adapter implementation.

The readiness package is intentionally conservative. A missing persisted Round 3S `conditional_go_to_disabled_skeleton` decision is a hard blocker. Pending symlink escape verification forces `requires_review`, even when all other gates pass. Documented-only Round 3T-W evidence is accepted as review input, but it also forces `requires_review`.

## Scope

- Contracts for readiness gates, blockers, findings, checklist items, package, summary, and query.
- Codex kernel pure builders and classifiers.
- Store repository and SQLite JSON payload persistence for metadata-only package records.
- Supervisor read-only governance endpoints.
- CLI read-only governance commands with degraded, not-persisted fallback.
- Dashboard read-only summary panel.

## Non-scope

- No real Codex execution.
- No process adapter.
- No external process launch.
- No Dashboard trigger.
- No workspace write.
- No `workspace_write` or `danger_full_access`.
- No execution permission or implementation approval.

## Preconditions

- Round 3S conditional decision must exist with outcome `conditional_go_to_disabled_skeleton`.
- Round 3T-W disabled skeleton evidence must remain disabled-by-default.
- Fixture-backed replay boundary evidence may be persisted or documented.
- Round 3T-W final readiness may be persisted or documented.
- No-live audits must pass before this package is used as ADR input.

## Readiness Classification

- `blocked`: forbidden capability appears, process adapter approval appears, execution approval appears, Dashboard trigger appears, `workspace_write` or `danger_full_access` appears, or required Round 3S conditional decision is missing.
- `not_ready`: a hard gate other than Round 3S evidence is missing.
- `requires_review`: symlink verification is pending, Round 3T-W evidence is documented-only, source records are degraded, noncritical metadata is missing, operator checklist is incomplete, or handoff context is incomplete.
- `ready_for_separate_adr`: all hard gates pass, no forbidden capability exists, symlink verification is complete, and Round 3T-W evidence is persisted.

`ready_for_separate_adr` means: Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.

## Evidence Rules

The package persists only metadata:

- document refs
- hashes
- section summaries
- timestamps
- gate results
- blockers
- findings
- evidence ref ids
- audit event ids

It must not persist full ADR or review Markdown bodies, prompt body, command body, stdout/stderr body, agent message body, or reasoning body.

## Current Known Review Finding

`documented_only_3tw_evidence` is expected when Round 3T-W final readiness or fixture boundary evidence is represented by documents instead of persisted records.

Symlink escape verification remains a required review item before any real process boundary can be considered.

## No-live Boundary Confirmation

Round 3X does not approve implementation, process adapter, process launch, or execution. Any future real read-only adapter still requires a separate ADR / go-no-go review.
