# M20 Rework Loop Operator Runbook

## Purpose

Use the M20 rework loop to inspect the next governed attempt after checks fail, review changes are requested, an operator asks for a retry, or a branch becomes stale.

## Operator Flow

1. Check readiness and current governance state with `codexhub doctor` and `codexhub governance runs list`.
2. Inspect PR lifecycle status or review decision metadata to confirm the rework trigger.
3. Review rework loop records with:
   - `codexhub rework-loops dry-runs list`
   - `codexhub rework-loops approvals list`
   - `codexhub rework-loops runs list`
   - `codexhub rework-loops runs show <runId>`
4. Rehearse failure handling without live execution:
   - `codexhub rework-loops rehearse --fixture --scenario checks-failed-rework`
   - `codexhub rework-loops rehearse --fixture --scenario review-changes-requested`
5. Use the child control planes for any real next step. Patch retry, branch publish, and draft PR creation require their own dry-run, persisted approval, execution authority, evidence, and audit.

## Safety Notes

- M20 does not execute a patch, publish a branch, create a draft PR, update a ref, merge, comment, label, request reviewers, push, or call GitHub directly.
- Rework output is metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, and audit ids.
- Never paste tokens, raw diff, raw PR markdown, raw reasons, raw paths, or response bodies into rework requests.

## Rollback

Disable `CODEXHUB_REWORK_LOOP_ENABLED` and ignore rework loop records. Existing child control planes remain unchanged.
