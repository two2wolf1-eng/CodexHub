# M0-M24 Governance Meta-Audit Review

## Scope

M24.8 reviewed the M0-M24 governance baseline after the M24.7 deep governance hardening pass. The review focused on meta-audit coverage for future regressions: UI, CLI, and MCP direct-execute boundaries; late-stage Supervisor route gates; request-body authority rejection; GitHub remote-operation vocabulary; and metadata-only serialization.

## Findings And Fixes

- The no-live automation audit now checks MCP production source for process boundary imports, network fetch, GitHub token env usage, local-control token env usage, and public adapter execute helper references.
- GitHub remote mutation vocabulary scanning now covers additional forbidden long-chain operations: deployments, releases, local `git push`, and update-ref text outside approved boundary, docs, tests, and audit vocabulary.
- Supervisor regression coverage now table-drives late-stage control-plane POST routes across review package export, RC export, GitHub metadata, draft PR, branch publish, publish-to-draft-chain, PR lifecycle, remote cleanup, rework, and custom workflow.
- Late-stage approval and run routes now have a shared regression test that caller-supplied `approvalArtifact`, `executionAuthority`, and `authority` objects are not accepted or echoed.
- Dashboard and CLI tests now include shared forbidden raw-output term checks for representative read-only summaries and fixture rehearsals.
- MCP read-only source tests now cover all production source files, not only `tools.ts`.

## Rechecked Invariants

- Mutating Supervisor routes require a local-control token and reject malicious Origin headers before route logic.
- Trusted loopback Origin plus token reaches route validation without wildcard CORS.
- Request-body approval artifacts and authority objects remain untrusted.
- UI, CLI, and MCP production source do not call public adapter `execute*` helpers directly.
- Read-only UX summaries remain metadata-only and do not expose raw prompt, stdout, stderr, diff, path, URL, body, file content, PR markdown, reason text, token, cookie, session, env value, or response body examples.

## Residual Risk

- This round is a regression-hardening pass, not a full production automation enablement pass.
- The repository still contains approved live boundaries from prior milestones: Codex/Nx process boundaries, browser observation, Electron/CDP HTTP/WebSocket observation, worktree git, local artifact export, and GitHub HTTP. They remain governed, disabled where designed, and audit-allowlisted.
- Route coverage is intentionally gate-focused. Capability-specific success and failure semantics continue to be covered by the corresponding package and Supervisor tests.

## Release Decision

M0-M24 remains suitable as the pre-M25 governance baseline. M24.8 raises the cost of accidental regressions in UI/CLI/MCP read-only behavior, late-stage route gates, and metadata-only public output.
