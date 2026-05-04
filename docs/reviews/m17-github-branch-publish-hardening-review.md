# M17 GitHub Branch Publish Hardening Review

## Scope

Reviewed M17 branch publish contracts, GitHub provider adapter, HTTP boundary, Supervisor control plane, Dashboard/CLI read-only UX, governance config, and no-live automation audit.

## Findings And Fixes

- The GitHub provider configuration now distinguishes controlled `codexhub/*` ref creation from forbidden update-ref, force, overwrite, merge, labels, reviewers, comments, and arbitrary endpoint passthrough.
- Dashboard and CLI branch publish views are GET-only and do not accept local-control tokens or call adapter execution helpers.
- `audit:no-live-automation` recognizes the reviewed Git Data API terms only inside the single audited GitHub boundary file and continues to forbid generic remote mutation text elsewhere.
- Branch publish rehearsal remains fixture-only and never invokes the network boundary.

## Residual Risk

M17 introduces a real remote write boundary when explicitly enabled and approved. Raw file content is transiently read and sent to GitHub inside that boundary. Operators should enable M17 only for non-production pilot repositories until M18 chain hardening is complete.

## Acceptance Evidence

Required evidence is focused package tests, Dashboard/CLI read-only tests, no-live automation audit, scaffold health, and foundation verification.
