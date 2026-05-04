# M15 GitHub Provider Threat Model

Scope: GitHub provider contracts, token readiness, metadata planning, and future governed GitHub HTTP boundary.

Primary risks:

- Credential exposure through logs, public responses, evidence, audit, Dashboard, or CLI.
- Remote provider becoming an authority provider.
- Generic HTTP or GitHub API passthrough.
- Accidental push, ref creation, merge, label/reviewer/comment mutation, or non-draft PR creation.
- Request-body approval artifact or execution authority forgery.

Controls:

- `CODEXHUB_GITHUB_TOKEN` is read only for configured/hash readiness.
- Public records expose ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.
- GitHub integration is disabled by default.
- All future POST routes must use local-control token and trusted loopback Origin.
- Approval artifacts and execution authority must be resolved server-side.
- Only a reviewed GitHub HTTP boundary may contain fixed GitHub API endpoint text.

Residual risk: enabling remote network actions still requires operator review and a narrow allowlist. No production remote mutation is allowed until M16 draft PR creation is separately approved.
