# M8a Release Candidate Threat Model

Date: 2026-05-04

## Scope

This threat model covers the M0-M7 release candidate baseline:

- Governance core: contracts, security, workflow, evidence, audit, store, and
  Supervisor control planes.
- Capability providers: Codex, Nx, MCP, Browser observation, Electron/CDP,
  Worktree, Policy backend, and Telemetry projection.
- Human surfaces: Dashboard and CLI read-only views plus existing local-control
  POST paths.

M8a does not approve new runtime behavior.

## Assets

- Local control token and trusted loopback control plane.
- Policy decisions and persisted approval artifacts.
- Evidence refs, audit events, and run timelines.
- Hash-bound runtime inputs for Codex, Browser, Electron/CDP, and Worktree flows.
- Local repository, sibling worktree root, and SQLite-backed state.
- Metadata summaries for policy and telemetry.

## Trust Boundaries

| Boundary | Risk | Required Control |
| --- | --- | --- |
| Browser page to localhost control plane | Cross-site local POST attempt | Mutating routes require local token and trusted loopback Origin |
| CLI/Dashboard to Supervisor | Unauthorized mutation | Dashboard remains read-only; mutating CLI calls require local token |
| Supervisor to adapter | Capability provider bypass | Adapter execution must pass policy, approval when required, evidence, and audit |
| Adapter to external/local runtime | Process/network side effects | Only audited boundary files; product defaults disabled or gated |
| Evidence/Audit storage | Sensitive metadata leakage | Recursive redaction, hash-only bodies, raw path/body forbidden |
| Policy backend to security-kernel | Backend authority takeover | Backend output advisory only; CodexHub normalized `PolicyDecision` authoritative |
| Telemetry projection to Evidence/Audit | Fact chain replacement | `evidenceAuditAuthoritative=false` and Evidence/Audit ids remain source of truth |

## Primary Threats And Mitigations

| Threat | Affected Capability | Mitigation |
| --- | --- | --- |
| Request-body approval artifact spoofing | Codex, Browser, Electron/CDP, Worktree | Store-resolved approvals only; body artifacts rejected |
| Medium write bypassing approval | Worktree, future write tools | Action mode and risk are separate; real write requires approval |
| Process-start truth masking | Codex/Nx/Git boundaries | `processBoundaryInvoked` and `externalProcessStarted` are authoritative fields |
| Raw body/path leakage | All capabilities | Evidence stores hashes/counts/summaries; raw path/body fields forbidden |
| Browser automation becomes UI control | Browser observation | Click/type/submit forbidden by default; screenshots require approval |
| Electron/CDP becomes arbitrary command channel | Electron/CDP | Loopback only, fixed HTTP/WebSocket paths, command allowlist, no `Runtime.evaluate` |
| Worktree manager becomes remote repo actor | Worktree | No push, no PR creation, no arbitrary git command, no shell |
| Policy backend becomes authority provider | Policy backend | Raw evaluations are advisory; security-kernel normalizes final decision |
| Telemetry exports sensitive data | Telemetry | No SDK, no OTLP/network exporter, local projection metadata-only |

## Residual Risk

- Several live paths are implemented but disabled by default. Operators can still
  misconfigure environment flags, so the operator checklist is mandatory before
  any local pilot.
- Read-only Dashboard depends on Supervisor GET responses being metadata-only.
  Regression tests and public schemas must keep raw fields out.
- M8a does not provide a unified evidence bundle yet; M8b should add a common
  read-only run/evidence/audit projection.

## Release Candidate Decision

M8a can proceed only when:

- Foundation verification passes.
- No-live automation audit passes.
- Capability matrix and rollback documents are current.
- Product defaults remain conservative.
- No new feature code or runtime boundary is introduced by M8a.
