# 0009 Capability Adapter Kernel

## Decision

CodexHub adds `packages/capability-adapter-kernel` as the shared validation layer for capability provider adapters. The package is internal governance infrastructure, not a new external integration.

## Purpose

The kernel keeps adapter behavior aligned before M5 adds Electron/CDP. It validates:

- `CapabilityManifest`
- `CapabilityDryRun`
- execution authority presence and approval requirements
- `CapabilityExecutionResult` process-boundary truth
- evidence/audit id consistency
- metadata-only foundation expectations

## Boundary

The kernel does not start processes, connect browsers, inspect Electron, execute shell commands, mutate files, or store evidence. It only validates envelopes that other governed packages already produce.

## License / Supply Chain

- License: CodexHub project code only; no external capability provider is introduced by this package.
- Version strategy: depend on public CodexHub contracts and evidence/security abstractions already pinned by the workspace.
- Sensitive data handling: the package validates metadata-only envelopes and does not ingest or persist raw runtime bodies.

## Authority Model

Capability providers remain non-authoritative. The kernel does not decide whether an action is allowed; it verifies that any adapter execution envelope carries a CodexHub `ExecutionAuthority`, evidence, and audit shape that downstream control planes can trust.

## Process Boundary

No new process boundary is introduced. Existing audited boundaries remain:

- `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- `packages/nx-verification-adapter/src/process-boundary.ts`
- `packages/playwright-observer-adapter/src/real-runner.ts`

## Evidence Policy

The kernel requires evidence metadata and audit consistency, but it never stores raw stdout, stderr, prompt, profile path, URL body, network body, token, cookie, session, or storage data.

## Rollback

Rollback is safe by removing `packages/capability-adapter-kernel`, its package path mapping, scaffold health entry, and adapter test imports. No persisted store schema or runtime route depends on this package in M4.5.
