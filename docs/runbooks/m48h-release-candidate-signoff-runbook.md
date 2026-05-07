# M48h Release Candidate Signoff Runbook

## Purpose

Use GA RC signoff only after the platform has complete metadata evidence for production readiness.

## Procedure

1. Confirm foundation gates are passed.
2. Confirm the capability matrix is complete.
3. Confirm the threat model is complete.
4. Confirm operator training is complete.
5. Confirm fixture E2E is all-pass.
6. Confirm conditional live smoke is completed or readiness-blocked only for environment configuration.
7. Confirm no unresolved critical residual risks remain.
8. Record two GA approvals from different operator hashes.
9. Run signoff and review the status.

## Status Rules

- `ready`: all required GA gates and live smoke are ready.
- `conditionally_ready`: all required GA gates are ready and only conditional live smoke is readiness-blocked.
- `blocked`: approval, training, matrix, threat model, evidence, audit, or risk requirements are incomplete.
- `failed`: fixture E2E or required gates report failure.
