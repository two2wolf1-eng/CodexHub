# M22 Remote Cleanup Operator Runbook

## Purpose

Use M22 to close an old CodexHub draft PR and delete its old `codexhub/*` branch after a newer governed attempt supersedes it.

## Enablement Checklist

- `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`
- `CODEXHUB_GITHUB_REMOTE_CLEANUP_ENABLED=true`
- `CODEXHUB_GITHUB_TOKEN` configured in the local environment
- Local-control token configured for Supervisor POST routes
- Supersede metadata shows a successor run and cleanup readiness
- Cleanup dry-run and approval are persisted in the store

## Operator Flow

1. Review supersede metadata:
   - `codexhub github supersedes runs list`
   - `codexhub github supersedes runs show <runId>`
2. Create a remote cleanup dry-run through the governed Supervisor route.
3. Request and approve cleanup through the approval control plane.
4. Execute cleanup through the governed Supervisor route with hash-bound runtime inputs.
5. Inspect read-only cleanup results:
   - `codexhub github remote-cleanups dry-runs list`
   - `codexhub github remote-cleanups approvals list`
   - `codexhub github remote-cleanups runs list`
   - `codexhub github remote-cleanups runs show <runId>`
6. Rehearse failure paths without live GitHub access:
   - `codexhub github remote-cleanups rehearse --fixture --scenario branch-not-codexhub`
   - `codexhub github remote-cleanups rehearse --fixture --scenario delete-ref-failed`

## Safety Notes

- Cleanup never touches non-CodexHub branches.
- Cleanup never merges, pushes, updates refs, force updates, comments, labels, requests reviewers, creates releases, or creates deployments.
- Tokens, raw refs, raw URLs, raw request or response bodies, and local-control credentials must never be stored or displayed.

## Rollback

Disable `CODEXHUB_GITHUB_REMOTE_CLEANUP_ENABLED`. Existing cleanup records remain as audit metadata; no automatic retry or further remote mutation occurs.
