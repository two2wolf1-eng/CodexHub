# M9 Approval UX Hardening Review

## Scope

This review covers the M9 local pilot and governed approval UX. It checks the approval inbox, approval decision route, Dashboard approval page, CLI approval commands, and pilot failure handling.

## Findings Addressed

- Dashboard approval control key is held in React state only. Hardening audit now fails if the approval decision page uses `localStorage`, `sessionStorage`, or `indexedDB`.
- CLI approval decisions read the local-control token from the environment-backed Supervisor header helper only. There is no token command argument.
- Dashboard and CLI are guarded against direct calls to capability adapter execute functions.
- Codex dry-run failure and Nx verification failure now have focused pilot regression tests. Neither path can mark the pilot as passed or the PR draft as ready.

## Regression Coverage

- M9 pilot blocks before boundaries when required flags or approvals are absent.
- Codex dry-run failure leaves verification unset and PR draft blocked.
- Nx verification failure keeps PR draft blocked and preserves Nx boundary truth.
- Approval inbox projection remains metadata-only.
- Approval decision requests accept only id, type, decision, and reason.

## Governance Invariants

- Capability providers are still not authority providers.
- Persisted server-side approval records remain the source of truth.
- Mutating approval decisions go through Supervisor local-control protection.
- UI and CLI do not execute adapters directly.
- Runtime output remains metadata-only and must not include raw prompt, stdout, stderr, diff, path, URL, token, cookie, session, or body content.

## M10 Preconditions

- Keep `pnpm verify:foundation` green before starting M10.
- Keep `audit:no-live-automation` green after any UI or CLI change.
- Treat any new approval surface as high risk and require its own hardening round.
