# Round 3Y Separate ADR Draft Go/No-Go

## Status

Recorded governance workflow, not execution approval.

## Decision

Round 3Y may record either:

- `no_go_to_separate_adr_draft`
- `conditional_go_to_separate_adr_draft`

The conditional outcome allows only preparation of a separate ADR draft. It does not approve implementation, process launch, Codex execution, workspace mutation, process adapter behavior, Dashboard triggers, `workspace_write`, or `danger_full_access`.

## Required Acknowledgement

When the underlying readiness package is `requires_review`, reviewer rationale must explicitly acknowledge unresolved finding codes. For the current known package, these include:

- `symlink_escape_verification_pending`
- `documented_only_3tw_evidence`

Without those acknowledgements, the governance API must reject conditional ADR drafting with a safe validation error.

## Future Scope

A future ADR may discuss a real read-only adapter. That future ADR must still be separate, explicit, and non-implicit. Round 3Y does not enable any process boundary or adapter implementation.
