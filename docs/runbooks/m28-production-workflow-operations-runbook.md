# M28 Production Workflow Operations Runbook

## Purpose

Use M28 to inspect production workflow health and decide the next safe operator action.

## Read-Only Commands

```bash
codexhub doctor --json
codexhub workflows production operations status --json
codexhub workflows production operations history --json
codexhub workflows production operations smoke --fixture --scenario healthy --json
codexhub workflows production operations smoke --fixture --scenario rollback-required --json
```

## Interpreting States

- `healthy`: child records and template metadata are suitable for continued monitoring.
- `blocked`: a template, approval, or child record blocker must be resolved elsewhere.
- `rollback-required`: operator should inspect the source run and decide whether a governed child cleanup path is appropriate.
- `degraded`: an underlying pilot or child record failed or aborted.

## Safety Rules

- Do not treat a workflow approval as child authority.
- Do not run cleanup, remote writes, or retries from operations views.
- Do not store raw reason text, paths, prompts, diffs, tokens, env values, URLs, request bodies, or response bodies.

## Rollback

M28 itself has no live state to roll back. To stop operations visibility, leave production workflow execution disabled and ignore operations projections until a later governed control-plane milestone.
