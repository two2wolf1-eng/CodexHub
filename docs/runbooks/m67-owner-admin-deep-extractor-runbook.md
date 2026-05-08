# M67 Owner Admin Deep Extractor Runbook

## Operator Flow

1. Create a metadata extraction rehearsal through `/api/business-quota/owner-admin-extractions`.
2. Inspect `/api/business-quota/owner-admin-report` for surface counts, roster counts, billing counts, and blockers.
3. Inspect `/api/business-quota/member-roster`, `/pending-invites`, and `/seat-allocation` for operational readiness.

## Safety Rules

- Do not paste raw page content, selectors, emails, invoices, tokens, cookies, sessions, MFA codes, passwords, or browser storage.
- Treat all M67 data as hash/count/status metadata.
- Do not use M67 as proof that a real owner admin UI action occurred.

## Blockers

- Credential fields detected.
- Raw DOM/AX/network body in request or store projection.
- Owner admin extraction status is `blocked`, `failed`, `drifted`, or `unknown`.
- Missing roster or billing summary when a downstream stage requires it.
