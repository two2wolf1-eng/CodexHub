# M37 GitHub PR Production Lifecycle Review

## Scope

Reviewed the GitHub PR management extension for fixed endpoint use, approval separation, request-body authority rejection, token handling, metadata-only public output, and Dashboard/CLI read-only boundaries.

Touched areas:

- `packages/contracts`
- `packages/github-provider-adapter`
- `packages/store-core`
- `packages/store-sqlite`
- `apps/supervisor`
- `apps/cli`
- `apps/dashboard`
- Governance config, docs, and scaffold health

## Findings

- PR management actions are split into five independent control planes, each with its own dry-run, approval, and run records.
- The GitHub HTTP boundary remains a single reviewed file and only allows the fixed PR management endpoint sequences.
- Supervisor routes reject request-body authority and raw body fields before execution.
- CLI and Dashboard PR management surfaces are read-only and use list/show/rehearsal views only.

## Residual Risk

- M37 opens additional remote write categories when explicitly enabled, so each family must remain disabled by default and separately approved.
- GitHub comments are generated from metadata summaries only; any future free-form comment support would require a separate high-risk review.
- Merge and branch mutation remain out of scope and must not be inferred from PR management approval.

## Closeout Checklist

- No arbitrary GitHub endpoint construction.
- No merge, push, update-ref, force, labels removal, reviewer dismissal, milestone clearing, or comment edit/delete path.
- Approval is consumed only after the network boundary is reached.
- Raw token, URL, request body, response body, and comment body are not persisted or returned.
- Dashboard and CLI do not directly call adapter execute helpers.
