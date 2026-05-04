# M13 Local Review Package Results

## Status

M13 delivers a local-only PR review package loop. It turns M12 patch lifecycle metadata into review package projections, supports governed local artifact export under the sibling artifact root, exposes read-only Dashboard/CLI views, and projects review decisions into local RC or M12 rework handoff metadata.

## Capability Matrix

| Slice | Status | Boundary | Approval | Output |
| --- | --- | --- | --- | --- |
| M13a review package projection | Complete | None | Not required | Package id/hash, changed-file hashes, verification/readiness status |
| M13b governed local export | Complete | Single review package artifact write boundary | Required | Fixed JSON/Markdown summaries, file counts, byte counts, content hashes |
| M13c read-only UX | Complete | None | Not required | Dashboard/CLI package run summaries and decision list |
| M13d review decision handoff | Complete | None | Not required | Reason hash, finding/blocker counts, local RC or M12 rework next action |
| M13.5 hardening review | Complete | None | No new authority | Review evidence, residual risks, release baseline |

## Safety Invariants

- Local review package export writes only to hash-bound sibling artifact roots under `../CodexHub-artifacts`.
- Repo-internal artifact roots, parent traversal, raw diff body, raw PR body, raw reason body, raw path body, command body, token, cookie, session, and request/response body data remain forbidden.
- Review decisions store only reason hashes, counts, statuses, and next-action summaries.
- Changes requested produces M12 retry/rework handoff metadata only; it does not execute retry.
- Dashboard and CLI review package views remain read-only and do not pass local-control credentials.
- No push, remote PR creation, GitHub/API integration, Browser/Electron/MCP expansion, or generic filesystem passthrough was added.

## Release Acceptance

- Review package contracts and kernel tests cover metadata-only package projection, export, and decision handoff.
- Supervisor export routes require local-control gate, store-resolved approval, execution authority, and hash-bound runtime input.
- Public export responses return ids, hashes, counts, statuses, summaries, evidence ids, audit ids, and boundary booleans only.
- Local review package decisions cannot make an RC ready by themselves; M14 RC readiness must also consider verification and operator readiness.

## Rollback

Rollback can remove M13.5 docs and scaffold registration without changing runtime behavior. Rolling back the M13 capability requires removing review package contracts, `review-package-kernel`, Supervisor review package routes, CLI/Dashboard read-only views, orchestration entries, and the no-live audit allowance for the single review package artifact boundary.
