# M0-M24 Foundation Hardening Review

## Review Scope

Reviewed the M0-M24 foundation as the baseline for later production automation. The review covered shared contracts, governance kernels, evidence redaction, Supervisor local-control gates, store repositories, Dashboard and CLI read-only surfaces, GitHub remote control planes, local artifact export boundaries, rework/supersede/cleanup projections, and custom workflow coordination.

## Capability Matrix

| Capability | State | Risk | Approval | Evidence / Audit | Boundary |
| --- | --- | --- | --- | --- | --- |
| Codex exec | gated | high | persisted approval for live execution | hash-only prompt/stdout/stderr summaries | approved Codex process boundary |
| Nx verification | gated | medium | authority required for execution | output hash and command summary | approved Nx process boundary |
| MCP read-only | enabled read-only | low | not required for read-only tools | tool invocation summary | no write boundary |
| Browser observation | disabled by default | high | approval for controlled observation | hashes/counts/summaries only | approved Playwright observer boundary |
| Electron/CDP | disabled by default | high | approval for HTTP/WebSocket observation | target/event hashes and counts | audited HTTP/WebSocket boundaries |
| Worktree | disabled by default | high | persisted approval for git create/cleanup | path hashes and diff summary | single audited git boundary |
| Policy backend | disabled by default | medium | authority required for fixture execution | advisory raw-eval summary | no real OPA/Cedar runtime |
| Telemetry | disabled by default | medium | authority required for fixture projection | span/export hashes only | no OTLP/exporter runtime |
| GitHub provider | disabled by default | high | persisted approval for metadata/write runs | response hashes and remote ref hashes | single audited GitHub HTTP boundary |
| Review package | disabled by default | high | persisted approval for local export | artifact content hashes | audited local artifact boundary |
| Release candidate | disabled by default | high | persisted approval for local export | bundle hashes and audit chain | audited local artifact boundary |
| Rework loop | disabled by default | high | workflow and child approvals | supersede metadata only | no direct child execution |
| Remote supersede | projection-only | medium | not required for read-only projection | ids/hashes/statuses | no write boundary |
| Remote cleanup | disabled by default | high | persisted approval | old PR/ref hashes | audited GitHub HTTP boundary |
| Custom workflows | disabled by default | high | custom workflow and child approvals | template/run hashes | no new provider boundary |

## Findings And Fixes

- Current baseline gates pass: scaffold health, import boundaries, SQLite isolation, no-live automation, skills audit, and full foundation verification.
- Supervisor mutating routes use local-control token and trusted Origin gates through global hooks.
- Store-resolved approval artifacts are used for governed control planes; request-body approval artifacts and authority objects remain untrusted.
- Evidence metadata redaction is recursive and hashes path-like metadata by default.
- Dashboard approval UX keeps the local-control key in page memory only; static audit blocks browser storage terms.
- Static no-live audit now covers late-stage execute function names so Dashboard and CLI cannot directly call GitHub, review package, RC bundle, telemetry projection, or rework execution helpers.
- Dashboard gstack smoke covered governance, readiness, GitHub, workflows, approvals, and pilot routes with clean console output and no mutating network request.
- CLI smoke covered read-only doctor, governance, GitHub, workflows, approvals history, and pilot commands without local-control token, secret, or direct execute output.

## Residual Risk

- GitHub remote write paths are intentionally present but disabled by default and approval-gated. They must remain behind the single audited HTTP boundary until M25+ explicitly expands production automation.
- Custom workflows make long chains easier to request. They do not grant child authority, but future official templates should get separate release review.
- Dashboard smoke in this round is read-only and degraded-safe; it does not exercise real browser, GitHub, or Electron live sessions.

## Release Decision

M0-M24 is suitable as a pre-M25 governance baseline. The foundation has broad capability coverage, but production-level automation should still be opened by capability class, with separate dry-run, approval, evidence, audit, and rollback for each new live action.
