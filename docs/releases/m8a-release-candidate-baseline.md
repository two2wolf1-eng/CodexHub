# M8a Release Candidate Baseline

Date: 2026-05-04

## Status

M8a is a documentation and release-hardening baseline for M0-M7. It does not
add a route, adapter, process boundary, network exporter, browser action,
Electron main-inspector path, policy runtime, push, PR creation, or Dashboard/CLI
write entry.

The release candidate rule is:

```text
CodexHub governance remains authority.
Capability providers remain controlled providers.
Evidence and Audit remain the fact chain.
Product defaults remain conservative.
```

## Capability Matrix

| Capability | Package/App | Product Default | Risk / Action | Approval | Evidence / Audit | Process / Network Boundary | Read-Only UX | RC Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex CLI execution | `codex-exec-adapter`, `codex-kernel` | Disabled in integration config | medium / dry-run | Required for real execution | stdout/stderr/jsonl hash or redacted summary; audit required | Existing audited Codex process boundary only | Codex run/evidence summaries | Implemented, gated |
| Nx affected verification | `nx-verification-adapter` | Disabled in integration config | low / read | Not required by default; policy decision still required | command output hash and affected summary; audit required | Existing audited Nx process boundary only | Verification dry-run summaries | Implemented, gated |
| MCP read-only tools | `codexhub-mcp-server`, `mcp-tool-contracts` | Enabled, read-only tools only | low/read per tool | Write tools disabled or approval-gated later | MCP invocation metadata evidence and audit when store is available | No external process boundary; HTTP is loopback/token-gated | MCP tools list/show | Implemented, read-only |
| Browser observation | `playwright-observer-adapter`, `browser-profile-kernel` | Disabled | medium/read, browser act forbidden by default | Required for live observation and screenshots | profile/path hashes, observation summaries, no cookie/session/token body | Existing audited Playwright boundary only when explicitly enabled | Browser profile/run summaries | Implemented, gated |
| Electron/CDP observation | `electron-cdp-adapter`, `electron-cdp-kernel` | Disabled | medium/read | Required for HTTP/WebSocket observation | endpoint/target/event hashes and counts; audit required | Existing audited HTTP and WebSocket CDP boundaries; no process start | Electron observation summaries | Implemented, gated |
| Worktree and PR draft | `worktree-manager`, `orchestrator-kernel` | Disabled | high/dry-run or git write | Required for worktree create and cleanup | path/ref/diff/PR draft hashes and counts; audit required | Existing single audited git boundary; no push or remote PR | Worktree create/cleanup summaries | Implemented, gated |
| Policy backend | `policy-backend-adapter` | Disabled | low/read | Not required for fixture advisory evaluation | raw evaluation hash and normalized decision trace; audit required | No process or network boundary; no OPA/Cedar runtime | Policy status and plan | Implemented, advisory-only |
| Telemetry projection | `otel-adapter` | Disabled | low/read | Not required for local projection | span/export hashes and counts; audit required if executed | No process or network boundary; no OpenTelemetry SDK or OTLP exporter | Telemetry status and projection | Implemented, local-only |

## Authority Baseline

- `security-kernel` remains the final policy authority.
- Request-body approval artifacts are untrusted.
- Store-resolved, unexpired, unused approvals are required where configured.
- Capability adapter manifests, dry-runs, execution envelopes, evidence, and audit
  are required for controlled providers.
- Policy backend outcomes are advisory; they cannot create `ExecutionAuthority`.
- Telemetry projections can reference Evidence/Audit ids but cannot replace them.

## Release Gates

Before promoting any M8 release candidate:

```powershell
pnpm scaffold:health
pnpm audit:boundaries
pnpm audit:sqlite-isolation
pnpm audit:no-live-automation
pnpm audit:skills
pnpm verify:foundation
git diff --check
git status --short --branch
```

Expected result: all checks pass and the working tree is clean.

## Stop Conditions

Stop the release candidate if any of these appear:

- A new route, process boundary, WebSocket boundary, or network exporter is added.
- Dashboard or read-only CLI starts sending local-control credentials.
- Any capability provider becomes an authority provider.
- Raw prompt, stdout, stderr, diff, trace payload, target URL, profile path,
  worktree path, token, cookie, session, MFA, or credential-like body is persisted.
- A write/admin action bypasses dry-run, policy, approval, evidence, or audit.

## Related Documents

- [M8a threat model](../threat-model/m8a-release-candidate-threat-model.md)
- [M8a operator runbook](../runbooks/m8a-release-candidate-operator-runbook.md)
- [M8a rollback plan](../runbooks/m8a-release-candidate-rollback.md)
- [M8a operator checklist](../checklists/m8a-operator-readiness-checklist.md)
