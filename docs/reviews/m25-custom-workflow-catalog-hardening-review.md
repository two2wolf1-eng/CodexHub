# M25 Custom Workflow Catalog Hardening Review

## Review Scope

Reviewed the M25 catalog contracts, built-in templates, workflow-kernel loader/readiness helpers, Dashboard/CLI read-only UX, governance config, and audit tooling.

## Findings

No governance bypass was intentionally added. The catalog remains a discovery and readiness surface only.

## Fixes

- Catalog public output uses ids, hashes, counts, statuses, summaries, and boolean safety flags.
- Template files are audited for raw prompt, stdout, stderr, diff, path, URL, body, token, cookie, session, env, request/response body, authority, and policy override fields.
- Dashboard and CLI catalog views stay read-only and do not use local-control credentials.

## Residual Risk

M26 will bind existing Supervisor dry-run/run routes to catalog templates. That is the next higher-risk step because it changes control-plane behavior, even though it will not add new routes or execution providers.

## Verification Evidence

Focused package tests and lint/build passed for contracts, workflow-kernel, CLI, and Dashboard during the M25 round.
