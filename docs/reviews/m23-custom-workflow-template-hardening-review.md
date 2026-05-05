# M23 Custom Workflow Template Hardening Review

## Review Scope

Reviewed the M23 template contracts, JSON loader, validator, planning helpers, fixture rehearsal, CLI commands, and Dashboard workflow view.

## Findings And Fixes

- Template validation blocks unknown step kinds, duplicate step ids, invalid version values, loop or branching fields, arbitrary config paths, and policy weakening fields.
- Contract parsing rejects raw prompt, stdout, stderr, diff, pull request body, path, URL, token, cookie, session, env, request body, and response body fields.
- CLI and Dashboard M23 workflow commands are read-only and do not read local-control tokens.

## Residual Risk

M23 does not execute workflows. The main residual risk is operator misunderstanding: templates are plans, not authority. M24 addresses this by requiring a separate custom workflow approval and keeping child approvals separate.

## Release Decision

M23 is suitable as a template foundation for M24 control-plane work.

