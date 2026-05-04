# M17 GitHub Branch Publish Operator Runbook

## Before Enabling

1. Confirm `github-provider.enabled=false` remains the product default.
2. Configure `CODEXHUB_GITHUB_TOKEN` in the local environment. Do not paste it into Dashboard, CLI arguments, docs, evidence, or audit.
3. Enable only for a pilot repository with `CODEXHUB_GITHUB_PROVIDER_ENABLED=true` and `CODEXHUB_GITHUB_BRANCH_PUBLISH_ENABLED=true`.
4. Confirm the branch slug will produce a new `codexhub/*` branch and will not overwrite an existing branch.
5. Review the branch publish dry-run content manifest: file count, byte count, content hashes, and block reasons.

## Approval And Run

- Create a dry-run through the Supervisor local-control route.
- Request and approve using persisted approval records only.
- Run execution only with hash-bound owner/repo/base/branch/source/content runtime input.
- Treat any boundary-reached failure as approval-consuming and inspect evidence/audit ids.

## Stop Conditions

Stop before execution if readiness reports an existing branch, unsafe slug, oversized content, binary file, symlink, deletion, rename, repo-root target mutation, missing token, disabled provider flag, missing approval, or hash mismatch.

## Rollback

Set `CODEXHUB_GITHUB_BRANCH_PUBLISH_ENABLED=false`. If needed, also set `CODEXHUB_GITHUB_PROVIDER_ENABLED=false`. Do not delete remote branches automatically through CodexHub M17; record recovery metadata and handle remote cleanup manually outside this control plane.
