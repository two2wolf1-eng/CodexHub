# Security Boundaries

Status: M49.1 boundary convergence baseline for M50+ real capability work.

This document defines the non-negotiable safety rules for future Browser,
Electron, Codex App Server, ChatGPT Business, Git, Worktree, GitHub, Approval,
Policy, Evidence, and Audit work. It is documentation and registration only; it
does not enable live automation.

## Authority Boundary

CodexHub governance remains authoritative:

- `security-kernel` decides policy.
- `workflow-kernel` coordinates governed flow.
- Approval authority is resolved from store records.
- Evidence and Audit are the fact chain.
- Capability providers execute or observe only after governance allows it.

Capability providers must never create their own `ExecutionAuthority`, trust
request-body approval artifacts, or let UI, CLI, MCP tools, tests, or routes call
adapter execution directly.

## Sensitive Data Boundary

The following values must not be collected, stored, printed, returned, indexed,
or placed in public summaries:

- token, cookie, session token, refresh token, MFA, password, passkey, private
  key, account secret, raw env, credential, browser credential store, raw profile
  material, or authorization header values;
- raw prompt, raw instruction, raw completion, raw tool output, raw stdout,
  raw stderr, raw JSONL event body, raw App Server response, or raw terminal body;
- raw diff, raw patch, raw file body, raw path, raw URL, raw request body,
  raw response body, raw trace payload, raw network body, raw audit body, or raw
  database row.

Allowed governed operational reads include account identity, workspace identity,
login/session health, quota/capacity, task state, and business administration
data when they are required by a registered manifest and pass policy, evidence,
and audit. Public/store-safe replacements are ids, hashes, counts, statuses,
timestamps, summaries, lengths, evidence refs, audit ids, and explicit boundary
booleans unless a privileged business store explicitly authorizes business-field
plaintext. Credential-bearing session material remains forbidden everywhere.

## Action Modes

| Mode | Allowed in M49/M50 | Rule |
| --- | --- | --- |
| `read` | Yes | Metadata-only reads may be exposed through read routes and read-only UX. |
| `dry-run` | Yes | Plans may be persisted when they contain hash-bound metadata only. |
| `write` | Shell only in M50 | Requires dry-run, policy decision, persisted approval, evidence, and audit before any later live boundary. |
| `admin` | No live admin in M49/M50 | Requires a future critical-risk milestone, explicit approvals, and new tests. |

M50 may add mutation shells for workflow dry-run, approval decision, task create,
and task recovery planning. Those shells must not call adapters directly and must
return metadata-only responses.

## Capability Boundaries

| Capability | Boundary |
| --- | --- |
| Browser | Read-only by default. No real profile connection, no cookie/session-token/token/storage extraction, and no click/type/submit automation in M49/M50. Later approved real automation rounds may read account/workspace/session-health state through registered manifests only. |
| Electron/CDP | Read-only and loopback-only by default. No main inspector, no `Runtime.evaluate`, no DOM mutation, no generic CDP passthrough. |
| Codex App Server | Missing real adapter. No process launch, no raw server response storage, no task dispatch, and no approval write-back before M54. |
| ChatGPT Business | Missing real adapter. Membership/quota work starts read-first; invite/remove/replace live admin actions remain disabled. |
| Git | Existing worktree manager may plan controlled git actions. Real git writes need explicit enablement and approval; push and hosted PR creation remain blocked. |
| Worktree | Use governed isolated sibling worktrees. Repo-root mutation is blocked by default. Cleanup is non-force unless a later milestone changes policy. |
| GitHub | Fixed route families only. No arbitrary API passthrough, no token value storage, no unapproved remote write, no release publish in M49/M50. |
| Approval | Store-resolved approvals only. Request-body approval artifacts and execution authorities are untrusted. |
| Policy | Policy backend remains advisory. It cannot grant authority or replace approval/evidence/audit. |
| Evidence | Metadata/hash-only evidence refs. Sensitive bodies are forbidden. |
| Audit | Must record liveExecution, externalProcessStarted, processBoundaryInvoked or equivalent boundary truth where relevant. |

## M50 Supervisor API Boundary

M50 Supervisor routes must follow these rules:

- `GET` routes may return only metadata-only projections.
- Every `POST` route must require the local-control token and trusted loopback
  Origin/Host gates.
- All mutating routes must reject request-body approval artifacts and request-body
  execution authority.
- Routes must call governance kernels or store repositories, not adapter execute
  functions.
- Responses must contain only hashes, summaries, statuses, evidence refs, audit
  ids, and safe ids.
- Missing store, missing config, disabled provider, or drift must return degraded
  metadata states instead of false success.

## Enablement Gates

Any future live boundary needs all of the following before it can run:

1. Contract schemas with positive and forbidden-output tests.
2. Store round-trip tests proving metadata-only persistence.
3. Dry-run plan with hash-bound target/input.
4. Policy decision from CodexHub governance.
5. Store-resolved approval when required by risk or action mode.
6. Evidence refs and audit events before and after the boundary attempt.
7. Boundary truth booleans for live execution and external process/network use.
8. Operator runbook, release note, review note, rollback or stop condition.
9. `audit:no-live-automation` coverage for the new boundary.
10. Full foundation verification before commit.

## Stop Conditions

Stop a round immediately if any of these appear:

- A route, CLI command, Dashboard view, MCP tool, or test calls an adapter execute
  function directly.
- A public response includes raw prompt, diff, path, URL, body, token, cookie,
  session token, MFA, credential, trace, log, browser credential store, raw
  profile material, or database row content.
- A write/admin action lacks dry-run, policy, approval, evidence, or audit.
- A request-body approval artifact or execution authority is accepted.
- A capability provider becomes an authority provider.
- A live boundary is reached without explicit environment enablement and
  persisted approval.
