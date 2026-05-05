# M25 Custom Workflow Catalog Operator Runbook

## Purpose

Use the catalog to inspect built-in production workflow templates and understand why they are disabled or blocked before attempting any governed production operation.

## Read-Only Checks

```bash
codexhub workflows catalog list
codexhub workflows catalog show local-patch-review
codexhub workflows catalog readiness local-patch-review
```

The same metadata is visible in Dashboard `#/workflows`.

## Expected Default State

- Production workflow execution is disabled.
- Catalog entries are discoverable.
- Readiness shows disabled/blocker state until later M26 control-plane binding is enabled and approved.
- Child capabilities remain independently governed.

## Safety Rules

- Do not place raw prompts, diffs, PR markdown, paths, URLs, tokens, cookies, sessions, env values, request bodies, or response bodies in workflow templates.
- Do not add approval overrides or policy overrides to templates.
- Do not execute child adapters directly from UI, CLI, MCP, or workflow templates.

## Rollback

If a catalog template is unsafe or confusing, remove or revert the matching `.workflow.json` file and rerun the workflow-kernel tests plus governance audits.
