# M48i Production GA Audit Hardening Runbook

## Operator Purpose

Use this runbook when reviewing whether Production GA signoff remains a governance aggregation surface rather than an execution surface.

## Required Checks

1. Run `pnpm audit:no-live-automation`.
2. Confirm the GA Dashboard panel keeps the local-control key in page memory only.
3. Confirm the GA Dashboard panel posts only to exact `/api/production-ga/*` routes.
4. Confirm GA signoff requests include two persisted approval artifact ids.
5. Confirm `production-ga-kernel` imports contracts/evidence helpers only, not child capability adapters.

## Blockers

- Any direct child adapter import from `production-ga-kernel`.
- Any GA signoff payload without approval artifact ids.
- Any raw E2E payload, child authority object, token, env value, path, request body, or response body in public output or Dashboard POST payloads.
- Any prefix, substring, or generic route guard for GA Dashboard mutation.

## Recovery

If the audit fails, treat it as a governance regression. Fix the narrow offending route, helper, or serializer first, then rerun `pnpm audit:no-live-automation` and the M48 closeout gates.
