# M18 Remote Publish Draft PR Hardening Review

## Scope

Reviewed M18 publish-to-draft-PR contracts, GitHub provider adapter projection helpers, Supervisor chain projection routes, Dashboard/CLI read-only UX, governance config, and no-live automation posture.

## Findings And Fixes

- The M18 chain requires separate branch-publish and draft-PR approval records; it does not collapse two remote writes into one authority decision.
- Dashboard and CLI publish-to-draft-PR views are GET-only and do not accept local-control tokens or call adapter execution helpers.
- PR lifecycle observation is metadata-only in this slice and does not add live status/check GET calls.
- The fixture rehearsal covers publish blocked, draft PR blocked, pending checks, failed checks, passed checks, stale branch, and network timeout outcomes without invoking the network boundary.

## Residual Risk

M18 composes two high-risk child capabilities: remote branch publish and remote draft PR creation. The chain layer is projection-only, but operators must still review the child run evidence and audit ids before treating a published branch plus draft PR as acceptable.

## Acceptance Evidence

Required evidence is focused package tests, Dashboard/CLI read-only tests, no-live automation audit, scaffold health, and foundation verification.
