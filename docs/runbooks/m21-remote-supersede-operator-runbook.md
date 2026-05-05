# M21 Remote Supersede Operator Runbook

## Purpose

Use M21 to inspect whether an older CodexHub-created draft PR or `codexhub/*` branch has been superseded by a newer governed attempt.

## Operator Flow

1. Check current platform state with `codexhub doctor`.
2. Inspect branch publish, draft PR, PR lifecycle, and rework metadata in the governance view.
3. Review supersede metadata:
   - `codexhub github supersedes dry-runs list`
   - `codexhub github supersedes runs list`
   - `codexhub github supersedes runs show <runId>`
4. Rehearse expected outcomes without live GitHub access:
   - `codexhub github supersedes rehearse --fixture --scenario all-pass`
   - `codexhub github supersedes rehearse --fixture --scenario no-successor`
5. If cleanup is recommended, use the separate M22 remote cleanup control plane. M21 itself cannot close PRs or delete branches.

## Safety Notes

- M21 does not create, update, close, delete, merge, comment, label, request review, or call GitHub.
- Public output is metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, and audit ids.
- Do not paste raw refs, raw URLs, PR bodies, tokens, response bodies, or local-control credentials into supersede records.

## Rollback

Ignore supersede projections and disable any related UX entry points. No remote state is modified by M21.
