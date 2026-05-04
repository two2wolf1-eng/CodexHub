# M8 Release Candidate

Date: 2026-05-04

## Status

M8 is the release-candidate productization layer over the M0-M7 governance
foundation. It adds unified read-only projection, operator readiness reporting,
fixture-only golden path rehearsal, and this final RC audit baseline.

M8 does not add a write route, approval UI, remote PR creation, push behavior,
new account integration, new live browser or Electron capability, new MCP tool,
new process boundary, or new network exporter.

The release candidate baseline is:

```text
CodexHub remains the authority provider.
Capability providers remain governed and gated.
Evidence and Audit remain the fact chain.
Dashboard and CLI remain read-only for M8 product views.
```

## M8 Scope

| Round | Outcome | Commit | Runtime Expansion |
| --- | --- | --- | --- |
| M8a | Release-candidate hardening baseline, threat model, runbooks, rollback, operator checklist | `568cf39` | None |
| M8b | Unified Run / Evidence / Audit projection kernel, Dashboard `#/governance`, CLI governance commands | `e1d6bf2` | None |
| M8c | Operator readiness doctor kernel, Dashboard `#/readiness`, CLI doctor commands | `e718848` | None |
| M8d | Fixture-only golden path rehearsal and CLI rehearsal command | `dc9af60` | None |
| M8.5 | Final release candidate audit and scaffold health registration | This round | None |

## Capability Matrix

| Capability | Enabled State | Risk / Action | Approval | Evidence / Audit | Boundary | Read-Only Product View | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Codex CLI | Integration-gated; real execution requires governed authority | medium / dry-run | Required for real execution | stdout/stderr/jsonl hash or redacted summary; audit required | Existing audited Codex process boundary | Governance projection and Codex summaries | Disable integration and stop adapter handoff |
| Nx verification | Integration-gated; allowlisted targets only | low / read | Not required by default; policy decision required | output hash, affected counts, audit required | Existing audited Nx process boundary | Governance projection and verification summaries | Disable integration or block targets |
| MCP | Enabled as read-only tool surface | low / read | Write tools disabled or later approval-gated | invocation metadata evidence and audit when store is available | No external process boundary; HTTP is loopback/token-gated | MCP registry and governance summaries | Disable MCP server or HTTP mode |
| Browser observation | Disabled by default | medium / read | Required for live observation and screenshots | profile/path hashes, observation summaries, audit required | Existing audited Playwright boundary only when explicitly enabled | Browser summaries and governance projection | Disable observer env flag/integration |
| Electron/CDP | Disabled by default | medium / read | Required for live HTTP/WebSocket observation | endpoint/target/event hashes and counts, audit required | Existing audited HTTP and WebSocket CDP boundaries; no process start | Electron summaries and governance projection | Disable observer/events env flags |
| Worktree | Disabled by default | high / dry-run or git write | Required for create and cleanup | path/ref/diff/PR draft hashes and counts, audit required | Existing single audited git boundary; no push or remote PR | Worktree summaries and governance projection | Disable worktree env flag/integration |
| Policy backend | Disabled by default | low / read | Not required for fixture advisory evaluation | raw evaluation summary and normalized decision trace | No OPA/Cedar runtime, no process or network boundary | Policy status and governance projection | Disable fixture backend integration |
| Telemetry | Disabled by default | low / read | Not required for local projection | span/export hashes and counts; Evidence/Audit remain authoritative | No OpenTelemetry SDK or OTLP exporter | Telemetry status and governance projection | Disable telemetry integration |

## Product Readiness

- Unified governance view provides a single read-only index for run, evidence,
  and audit summaries across Codex, Nx, MCP, Browser, Electron/CDP, Worktree,
  Policy backend, Telemetry, and Orchestrator sources.
- Operator doctor reports integration state, environment readiness, store
  readiness, process boundary allowlist status, and config hashes without
  exposing secret values.
- Golden path rehearsal proves the fixture-level system chain from development
  request through worktree, Codex, Nx, PR draft, release audit, evidence, audit,
  and telemetry projection.
- Final RC documents and scaffold checks make the release criteria visible and
  repeatable.

## Release Gates

The M8 release candidate requires these checks before promotion:

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

## Residual Risks

- Real local execution surfaces remain deliberately gated and disabled by
  default; each operator enablement should start with a small local pilot.
- Dashboard and CLI do not include approval UI in M8. Approval operations remain
  controlled by existing local-control routes and store-resolved artifacts.
- The golden path is fixture-only. It proves orchestration shape and governance
  evidence, not hosted account or remote PR behavior.
- Any future push, hosted PR, Browser act, Electron main inspector, policy
  runtime, or network telemetry exporter must be implemented as a separate
  approval-gated milestone.

## Promotion Decision

M8 can be treated as the release candidate once the final M8.5 verification
commands pass and the working tree is clean.

