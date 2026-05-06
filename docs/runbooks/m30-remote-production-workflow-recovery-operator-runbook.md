# M30 Remote Production Workflow Recovery Operator Runbook

## Preconditions

1. GitHub provider remains configured through environment only.
2. Required child capabilities are enabled explicitly.
3. The workflow recovery dry-run and approval are persisted.
4. Every remote child dry-run and child approval is resolved from store.

## Remote Recovery Chain

For `github-draft-pr-chain`, recovery coordinates branch publish, draft PR, and
PR lifecycle observation child records. For `rework-cleanup`, recovery coordinates
PR lifecycle, supersede projection, and remote cleanup child records.

## Safety Rules

- Do not push.
- Do not merge.
- Do not update existing refs.
- Do not force.
- Do not label, request reviewers, comment, release, or deploy.
- Do not delete remote branches except through the existing governed remote
  cleanup control plane.

## Resume

If recovery pauses for child approval, submit a later recovery run after the child
approval is approved. The coordinator resumes from the last safe metadata step.

