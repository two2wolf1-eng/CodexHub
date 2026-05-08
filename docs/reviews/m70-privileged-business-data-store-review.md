# M70 Privileged Business Data Store Review

## Review Summary

M70 introduces a deliberately narrow exception to the project’s metadata-only default: approved Business administration cleartext can be stored in an isolated privileged table family. The public control plane still returns only safe summaries and hashes. This is the right boundary for the user-selected “business cleartext database” mode because it avoids mixing privileged Business fields into the normal projection store.

## Safety Findings

- Credential material is rejected by contract refinements and kernel normalization before persistence.
- Supervisor privileged record and export routes reject request-body authority, approval artifacts, raw DOM/AX/network/path/payload fields, and credential-shaped keys or values.
- Privileged record creation and export manifest preparation require an approval artifact id; missing approval blocks before any record is created.
- Public GET projections use `projectM51ProjectionRecord`, so Business fields are not included in response bodies.
- SQLite isolation is maintained with explicit privileged Business tables rather than reusing ordinary quota projections.

## Residual Risks

- M70 does not yet store a fully resolved approval object; it binds to the provided approval artifact id hash. M71 live admin writes must resolve approvals through the existing approval store before execution.
- Export manifests prepare ids and hashes only. Actual privileged local export file handling remains out of scope and must require a separate high-privilege approval if added later.

## Verification Notes

Focused tests cover schema rejection, store round trips, Supervisor route behavior, public projection redaction, and route drift matrix registration.

## Next Step

M71 should use the privileged store as supporting Business context, but live UI submission must still require dry-run, policy, store-resolved approval, visible execution, post-write verification, evidence, and audit.
