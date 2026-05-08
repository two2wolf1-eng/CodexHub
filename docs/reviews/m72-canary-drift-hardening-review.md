# M72 Canary / Drift Hardening Review

## Review Summary

M72 makes readiness drift operationally meaningful for the Business admin automation path. A high-risk production readiness gate now blocks the fixed-flow admin write runner before it can be called, and it downgrades quota dispatch and quota fusion from ready to blocked.

## Safety Findings

- The new canary kinds are metadata-only classifications for existing production-readiness rehearsal records.
- `network-endpoint` drift joins the existing drift gate enum and still stores only hashes and counts.
- Admin UI execution short-circuits before runner invocation when readiness is blocked, even with an approval artifact id and the live write env gate enabled.
- Business quota read dry-runs and quota fusion use readiness blockers as a source-health failure, so Codex dispatch cannot proceed through stale canary state.
- Public responses expose only statuses, booleans, ids, hashes, counts, blocker names, evidence refs, audit ids, and summaries.

## Residual Risks

- The current hard gate checks recent stored readiness gate records. Operators must keep canaries fresh before enabling live admin writes.
- A later runtime pass can add freshness windows and explicit canary expiry metadata, but M72 does not add a new scheduler or route.

## Verification Notes

Focused tests cover owner-admin/network-endpoint drift, admin write runner bypass prevention, quota dispatch blocking, quota fusion blocking, and metadata-only output. Full foundation gates are required before commit.
