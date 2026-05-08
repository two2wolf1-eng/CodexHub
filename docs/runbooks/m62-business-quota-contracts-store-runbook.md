# M62 Operator Runbook

## Operator Steps

1. Review quota source health records before enabling any quota-dependent dispatch.
2. Confirm redaction reports are `passed` before trusting page or CDP observations.
3. Treat `unknown`, `blocked`, `unavailable`, `redaction_failed`, or `canary_failed`
   as dispatch blockers.
4. Use UI automation dry-runs to request approval; never provide authority in request bodies.

## Rollback

Revert the M62 commit. The new SQLite tables are additive metadata JSON tables and do not
alter existing rows.
