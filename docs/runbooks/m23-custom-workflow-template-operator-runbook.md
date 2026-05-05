# M23 Custom Workflow Template Operator Runbook

## Purpose

Use M23 to inspect custom workflow templates before any governed run exists.

## Operator Flow

1. List templates with `codexhub workflows templates list`.
2. Inspect a template with `codexhub workflows templates show <templateId>`.
3. Validate a template with `codexhub workflows validate --template-id <templateId>`.
4. Rehearse fixture scenarios with `codexhub workflows rehearse --template-id <templateId> --fixture --scenario all-pass`.
5. Review Dashboard `#/workflows` for the same read-only summary.

## Stop Conditions

- Validation status is not `valid`.
- Any policy weakening issue appears.
- Any raw body, path, URL, token, cookie, session, env, or response body appears in output.
- A template tries to call an adapter directly.

## Boundaries

M23 has no run route, no approval route, no process boundary, no network boundary, and no child control-plane invocation.

