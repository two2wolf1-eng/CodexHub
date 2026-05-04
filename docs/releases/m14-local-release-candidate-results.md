# M14 Local Release Candidate Results

## Status

M14 completes the local-only release candidate loop. It turns M13 review package decisions and M12 verification readiness into a local RC readiness projection, supports governed local RC bundle export, adds fixture-only acceptance rehearsal, and exposes read-only operator UX.

No remote provider, GitHub API, token, push, or pull request creation is enabled.

## Capability Matrix

| Slice | Status | Boundary | Approval | Output |
| --- | --- | --- | --- | --- |
| M14a local RC readiness projection | Complete | None | Not required | RC readiness, evidence bundle, audit chain metadata |
| M14b governed local RC bundle export | Complete | Single local RC artifact write boundary | Required | Fixed JSON/Markdown summaries, content hashes, file/byte counts |
| M14c local acceptance rehearsal | Complete | None | Not required | Fixture-only acceptance outcomes and bundle hash |
| M14d operator RC UX | Complete | None | Not required | Dashboard/CLI read-only RC readiness, runs, acceptance summaries |
| M14.5 hardening review | Complete | None | No new authority | Release evidence, runbook, residual risk record |

## Safety Invariants

- Local RC bundle export writes only to hash-bound sibling artifact roots under `../CodexHub-artifacts`.
- RC bundles contain metadata JSON/Markdown summaries only: capability matrix, verification summary, review decision summary, evidence ids, audit ids, and rollback notes.
- Raw diff body, PR body, review reason, command body, path body, env value, token, cookie, session, request body, and response body data remain forbidden.
- RC readiness cannot be ready when review, verification, or operator readiness is blocked.
- Acceptance rehearsal is fixture-only and does not invoke export, Git, Codex, Nx, Browser, Electron/CDP, MCP, network, push, or PR creation.
- Dashboard and CLI RC views are read-only and do not read local-control keys, send POST requests, or call exporter execution helpers.

## Release Acceptance

- M14 contracts and kernel tests cover readiness, export, and acceptance rehearsal metadata.
- Supervisor RC export routes require local-control gate, store-resolved approval, execution authority, and hash-bound runtime input.
- Dashboard `#/release-candidates` and CLI `codexhub release-candidates ...` commands expose metadata only.
- Unified governance includes local RC run summaries without raw artifacts.
- No-live automation audit continues to allow only the reviewed local artifact boundary and forbids remote provider operations.

## Rollback

Rollback can remove M14.5 docs and scaffold registration without changing runtime behavior. Rolling back the full M14 capability requires removing local RC contracts, `release-candidate-kernel`, Supervisor release candidate routes, CLI/Dashboard read-only views, orchestration/integration entries, and the no-live audit allowance for the RC artifact boundary.
