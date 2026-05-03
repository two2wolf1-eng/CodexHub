# 0008 Minimal Governed Orchestrator

## Status

Accepted for M2c.

## Purpose

M2c adds the first thin orchestration loop:

```text
DevelopmentRequest
  -> codex-exec-adapter
  -> nx-verification-adapter
  -> Evidence/Audit summary
```

The Orchestrator is an authority-aware coordinator. It does not become a new execution provider and does not start processes directly.

## Provider Boundary

- Provider name: CodexHub Orchestrator kernel and local Orchestrator app.
- Adapter use: calls the existing `codex-exec-adapter` and `nx-verification-adapter`.
- Process boundary: no new boundary is introduced in M2c.
- Approved process boundaries used transitively:
  - `packages/codex-kernel/src/real-read-only-adapter-process.ts`
  - `packages/nx-verification-adapter/src/process-boundary.ts`

## License / Supply Chain

- License: CodexHub project code only; M2c does not add a third-party runtime provider.
- Version strategy: the Orchestrator depends on public CodexHub package entrypoints and existing pinned adapter dependencies.
- Sensitive data handling: the Orchestrator only returns summaries, counts, hashes, evidence IDs, audit IDs, and policy decision IDs.

## Authority Rules

- Codex execution requires a server-resolved persisted approval artifact.
- Request-body approval artifacts and execution authority objects are untrusted and must block the run.
- Nx verification is a read action, but still requires a policy decision and execution authority.
- Codex must complete before Nx runs.
- Failed or aborted verification prevents a passed orchestration status.

## Local Control Route Rules

- Mutating Orchestrator routes require a local control header.
- Browser-origin requests must come from trusted loopback origins.
- Default host is `127.0.0.1`; default port is `3334`.
- Dashboard write UI is not added in M2c.

## Evidence Policy

- Public responses include only summaries, counts, hashes, evidence IDs, audit IDs, and policy decision IDs.
- Prompt, stdout, stderr, JSONL, raw file content, and local paths are not returned as bodies.
- The first implementation stores recent runs in an in-memory ring buffer only.
- SQLite persistence for `OrchestrationRun` is deferred to a store-focused round.

## Rollback

Disable the Orchestrator app route surface and keep the M2a/M2b adapters available independently. No persisted migration is required for M2c because the run buffer is in memory.
