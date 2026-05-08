# M66 High-Privilege UI Authority Runbook

## Purpose

Use M66 records to inspect whether a future Business admin UI action has a dry-run, target fingerprint, authority projection, and run projection. Do not treat M66 as an execution surface.

## Operator Flow

1. Create an admin UI dry-run through `/api/business-quota/admin-ui/dry-runs`.
2. Inspect the returned action class, risk level, target fingerprint hash, and block state.
3. Create an approval request projection through `/api/business-quota/admin-ui/approval-requests`.
4. Resolve authority only from approved metadata references.
5. Inspect `/api/business-quota/admin-ui/runs` for metadata-only status.

## Safety Rules

- Do not paste selectors, page bodies, tokens, cookies, sessions, MFA codes, passwords, or browser storage into requests.
- Do not use M66 routes to claim a real write occurred.
- Do not bypass policy, approval, evidence, or audit gates.
- Real visible UI execution remains disabled until the M71 executor round.

## Blockers

Execution must remain blocked if any of these are true:

- Missing dry-run.
- Missing approval.
- Request body contains authority, approval artifact, raw selector, raw script, raw payload, raw path, token, cookie, session, storage, or credential material.
- Target fingerprint is missing or mismatched.
- Action is `credential-input`, `mfa-input`, or `session-storage-read`.
