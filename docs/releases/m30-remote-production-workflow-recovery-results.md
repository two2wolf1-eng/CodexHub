# M30 Remote Production Workflow Recovery Results

## Scope

M30 extends recovery rehearsal and registry semantics to remote production
workflow templates: `github-draft-pr-chain` and `rework-cleanup`.

## Result

- Remote recovery is modeled through existing GitHub child control planes only.
- Branch publish, draft PR creation, PR lifecycle observation, remote supersede,
  and remote cleanup remain separate child capabilities.
- Each remote child action still requires its own enablement, hash binding,
  approval, evidence, and audit.
- No push, merge, force, update-ref, labels, reviewers, comments, releases,
  deployments, or arbitrary GitHub endpoint passthrough were added.

## Verification Evidence

- Recovery rehearsal scenarios cover all-pass, approval blocked, child dry-run
  failure, branch publish failure, draft PR failure, lifecycle checks failure,
  remote cleanup blocked, resume, and superseded source.

## Residual Risk

M30 coordinates existing remote write paths after separate approvals. The GitHub
provider boundary remains the place where endpoint allowlists and token handling
must be audited in future rounds.

