# M10b Approval History Projection

## Summary

M10b adds a read-only approval decision history projection for operator review.
It reuses existing approval inbox and decision-result metadata and does not add a
Supervisor route, store repository, approval mutation, or adapter execution path.

## Delivered

- Added metadata-only approval history contracts:
  `ApprovalDecisionHistoryItem`, `ApprovalDecisionHistoryProjection`, and
  `ApprovalDecisionHistorySummary`.
- Added `createApprovalDecisionHistoryProjection()` in
  `@codexhub/approval-ux-kernel`.
- Added Dashboard decision history summary on `#/approvals`.
- Added CLI command:

```bash
codexhub approvals history [--type <type>] [--status <status>] [--json]
```

## Boundaries

- No new Supervisor route.
- No persisted decision-history store.
- No local-control key is read by the read-only CLI command.
- Dashboard history does not send POST requests and does not use approval tokens.
- Reasons are represented as hash/summary metadata only; raw reason, body, path,
  token, cookie, session, prompt, stdout, stderr, and diff content are not stored.

## Verification

M10b should be accepted only after focused contracts/kernel/Dashboard/CLI tests,
governance audits, and `pnpm verify:foundation` pass.
