# M48e Operator Training Runbook

## Purpose

Before Production GA signoff, operators must understand how CodexHub keeps automation governed: dry-runs, approvals, evidence, audit, boundary truth, rollback, and disaster recovery.

## Completion Rules

- Completion stores operator hash only.
- Completion stores module hashes only.
- Raw operator identity is not persisted.
- Training is required for GA readiness but does not grant execution authority.

## Review Procedure

1. Open the Production GA training document.
2. Confirm each required module is complete.
3. Record completion through the GA training-completion control plane.
4. Review evidence and audit ids.
5. Block GA signoff if critical training gaps remain.
