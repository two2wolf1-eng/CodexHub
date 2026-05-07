# M49 Real Capability Development Queue Review

Status: planning review.

## Findings

No product-code findings were introduced in this round because the change is
documentation and registration only.

## Review Scope

Reviewed:

- Future real-capability milestone mapping.
- P0/P1/P2/P3/P4 issue backlog structure.
- Safety boundaries for ChatGPT Business, Chrome profile, Codex App Server,
  Codex Desktop, Electron/CDP, diagnosis, recovery, worktree, and GitHub PR loop.
- Registration in orchestration, integrations, and scaffold health.

Not reviewed:

- Live adapter behavior.
- Real App Server transport.
- Real Chrome profile or Electron connection.
- Actual account, quota, login, or task execution.

## Boundary Review

The planning queue keeps the following non-negotiable constraints:

- No token, cookie, session, MFA, password, raw env, private key, or account
  credential collection.
- No raw prompt, diff, patch, event body, log body, response body, or raw path
  persistence.
- Browser and Electron work remains read-only until a future separately approved
  milestone expands the boundary.
- Codex App Server integration must verify protocol drift before live dispatch.
- Write/admin actions require dry-run, persisted approval, evidence, and audit.
- Capability providers remain non-authoritative.

## Residual Risks

- The future roadmap is intentionally critical-risk and must not be implemented
  in one large round.
- Codex App Server API compatibility must be verified against the local installed
  Codex version before any live adapter work.
- ChatGPT Business UI and workspace pages may drift; browser-side observations
  must degrade safely and never scrape secrets.
- Account switching and login recovery require explicit human checkpoints for
  MFA, captcha, passkey, and ambiguous identity.

## Recommended Next Round

Start with M49.1:

- Add `docs/real-capability-matrix.md`.
- Add `docs/security-boundaries.md`.
- Add a planning-only policy note for future real capability gates.
- Do not implement live adapters yet.

## Skills

Workflow Skills Used and Why:

- `gsd-spec-driver`: review scope is tied to the planning spec.
- `gstack-delivery-workflow`: review follows Plan, Build, Review, QA, Ship.
- `superpowers-engineering-discipline`: review checks for scope creep and
  unreviewed live automation.

Project Skills Used and Why:

- `codexhub-architecture-planner`: reviewed package and control-plane boundaries.
- `codexhub-contract-designer`: reviewed future shared DTO requirements.
- `codexhub-workflow-policy-reviewer`: reviewed approval/evidence/audit
  invariants.
- `codexhub-codex-exec-adapter`: reviewed future Codex execution constraints.
- `codexhub-browser-profile-observer`: reviewed Chrome profile privacy rules.
- `codexhub-electron-cdp-observer`: reviewed Electron/CDP read-only rules.
- `codexhub-release-auditor`: reviewed closeout expectations.

Skills Not Used and Why:

- `codexhub-playwright-qa`: no Dashboard UI behavior changed.
- Runtime Browser, Electron/CDP, MCP, policy backend, telemetry exporter,
  deployment, and external agent runtime skills were not used because this round
  does not execute or expand live surfaces.
