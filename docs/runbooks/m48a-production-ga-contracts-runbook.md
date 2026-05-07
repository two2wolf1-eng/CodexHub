# M48a Production GA Contracts Runbook

## Purpose

Use this runbook when reviewing or extending the Production GA contract surface.

## Checklist

1. Add shared GA language in `packages/contracts` before kernels or apps.
2. Keep public output metadata-only.
3. Reject request-body authority, approval artifacts, raw E2E payloads, raw docs, raw paths, token/env values, logs, traces, patches, database rows, and audit bodies.
4. Require two distinct approvals for GA signoff.
5. Block GA signoff when unresolved critical risk exists.

## Stop Conditions

- Any GA contract accepts raw release/deploy/log/patch/database/audit body metadata.
- GA approval can replace child approval.
- GA contracts imply direct child adapter execution.
