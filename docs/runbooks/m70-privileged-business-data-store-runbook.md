# M70 Privileged Business Data Store Runbook

## Operator Model

The privileged Business store is for approved Business administration data only. It may store member email, role, seat allocation, pending invite state, invoice summary, credit balance, and usage alert configuration summaries. It must never store cookies, sessions, tokens, MFA values, passwords, private keys, browser storage, raw network bodies, request bodies, or response bodies.

## Normal Flow

1. Operator reviews the dry-run and approval context outside the privileged store route.
2. Supervisor receives a local-control POST to `/api/business-quota/privileged-business-records` with approved Business fields and an approval artifact id.
3. The route rejects authority objects and credential-shaped fields.
4. The privileged record is stored in the isolated table family.
5. An access log records the operation without returning cleartext fields.
6. Public projections can be viewed through `/api/business-quota/privileged-business-store`.

## Export Manifest Flow

1. Operator requests `/api/business-quota/privileged-business-exports` with a high-privilege approval artifact id.
2. Supervisor builds a manifest from stored record ids and field hashes.
3. The response returns only ids, hashes, counts, safety booleans, evidence refs, and audit ids.
4. No raw export body is returned by this M70 route.

## Blocks

- Missing approval artifact id blocks privileged record creation and export manifest preparation.
- Any request-body authority or execution authority is rejected.
- Credential-like field keys or values are rejected.
- Public projections never return cleartext Business field values.

## Recovery

If a credential-like value was attempted, do not retry by changing route payload shape. Remove the credential material at source, regenerate a safe Business management summary, and repeat the approved flow.
