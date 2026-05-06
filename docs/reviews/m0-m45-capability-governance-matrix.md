# M0-M45 Capability Governance Matrix

Status: completed

This matrix is the M45.10 baseline reference for future M46+ planning. It records the current governance posture without enabling new capability.

| Surface | Current Stage | Default State | Mutation Authority | Boundary | Public Output Rule |
| --- | --- | --- | --- | --- | --- |
| Contracts | M0-M45 | Enabled as shared language | None | Package entrypoints only | Schemas reject raw sensitive fields where applicable. |
| Codex patch | M12-M36 | Disabled unless governed | Store-resolved approval | Isolated worktree runner | Prompt, stdout, stderr, diff, path, and body stay metadata/hash-only. |
| Nx verification | M2-M36 | Disabled unless governed | Store-resolved approval when mutating boundary exists | Fixed verification runner | Counts, status, evidence, and audit only. |
| Worktree | M10-M36 | Disabled unless governed | Store-resolved approval | Controlled sibling worktree | Repo-root mutation remains blocked for governed pilot paths. |
| Review package | M13-M36 | Disabled unless governed | Store-resolved approval | Review package export control plane | Raw review bodies and paths are not public output. |
| Release candidate | M14-M36 | Disabled unless governed | Store-resolved approval | RC bundle control plane | Hashes, counts, status, evidence, and audit only. |
| GitHub metadata | M15-M19 | Disabled by default | Approval for live observation | Single GitHub HTTP boundary | Raw owner, repo, URL, response body, and token are not returned. |
| GitHub branch publish | M17-M18 | Disabled by default | Persisted approval | GitHub Git Data API boundary | Raw file content is transient only. |
| GitHub draft PR | M16-M18 | Disabled by default | Persisted approval | Fixed draft PR endpoint | Generated PR body is hash/summary-only. |
| GitHub PR lifecycle | M19-M22 | Disabled by default | Persisted approval for live observation/write paths | Fixed GitHub PR endpoints | Check logs, comments, review bodies, and response bodies are not public output. |
| GitHub PR management | M37 | Disabled by default | Per-family approval | Fixed labels, assignees, reviewers, milestones, comments endpoints | No raw body, URL, token, or response body. |
| GitHub merge | M38 | Disabled by default | Two persisted approvals | Fixed merge readiness and merge endpoint | Merge result is metadata/hash-only. |
| GitHub Actions | M39 | Disabled by default | Per-action approval | Fixed Actions observation, rerun, cancel, and dispatch endpoints | Raw logs are transient hash/count only; arbitrary inputs are rejected. |
| Release lifecycle | M40 | Disabled by default | Separate tag and draft approvals | Fixed GitHub tag and release draft endpoints | Version and changelog remain metadata plans; release publish is out of scope. |
| Deployment observation | M41 | Disabled by default | Persisted approval for live observation | Fixed provider read-only runners | Raw plan, diff, log, kubeconfig, URL, token, and env values are not public output. |
| Governed deployment | M42 | Disabled by default | Env-scoped approval, prod two approvals | Fixed provider operation boundary | Raw manifests, plans, diffs, logs, paths, and credentials are rejected. |
| Secrets governance | M43 | Disabled by default | Persisted approval for readiness runs | Metadata-only readiness kernel | Secret values are never read, stored, or printed. |
| Policy backend | M44 | Disabled by default | Persisted approval | Fixed OPA/Cedar local CLI or loopback HTTP boundary | Advisory only; security-kernel remains final authority. |
| Telemetry | M44 | Disabled by default | Persisted approval | In-memory or allowlisted OTLP exporter boundary | Telemetry never replaces evidence or audit; raw spans/logs are not persisted. |
| Browser controlled write | M45 | Disabled by default | Persisted high-risk approval | Fixed click/type boundary | Typed text is transient and hash-bound. |
| Electron main inspector | M45 | Disabled by default | Persisted critical approval | Fixed named snippet `Runtime.evaluate` boundary | Raw JavaScript source from request bodies is rejected. |
| MCP write tool | M45 | Disabled by default | Persisted critical approval | Fixed controlled worktree patch tool | No generic MCP write passthrough or repo-root mutation. |
| Dashboard | M0-M45 | Read-mostly | Only reviewed guided panels | Supervisor routes only | No token persistence; no direct adapter execute. |
| CLI | M0-M45 | Read-mostly | Approval decision plus exact governed commands | Supervisor routes only | No token arguments or token persistence. |
| MCP server | M0-M45 | Read-only except fixed future write surface | Store-resolved approval for fixed write tool | No process/network/env-token passthrough | Metadata-only evidence and audit. |

## Baseline Debug Net

- M45.1-M45.2 cover registration drift and public projection fuzzing.
- M45.3 covers metadata-only store round trips.
- M45.4-M45.5 cover Supervisor gate and approval/boundary semantics.
- M45.6 covers fixed adapter boundary drift.
- M45.7-M45.8 cover operator surfaces, rehearsals, and degraded states.
- M45.9 covers adversarial static audit negative fixtures.
- M45.10 registers this matrix as the final M0-M45 planning baseline.
