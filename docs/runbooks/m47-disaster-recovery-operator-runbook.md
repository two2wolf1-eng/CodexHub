# M47 Disaster Recovery Operator Runbook

## Purpose

Use this runbook to rehearse platform recovery without changing the active store.

## Standard Flow

1. Review the latest platform operation status in Dashboard `#/operations`.
2. Run a fixture rehearsal with `codexhub operations rehearse --fixture --scenario disaster-recovery-drill`.
3. Confirm backup, restore, migration, retention, audit export, and role summaries are metadata-only.
4. For real backup or restore work, start with a dry-run and wait for persisted approval before any run.
5. Keep active store replacement disabled unless a disaster recovery incident explicitly requires it.

## Stop Conditions

- Backup manifest hash mismatch.
- Restore replacement requested without two approvals.
- Scheduler is not quiescent.
- Migration id is not built in.
- Retention lacks a backup-ready summary.
- Operator role scope is missing or insufficient.

## Safety Notes

M47 does not allow network backup export, arbitrary migration text, raw database row export, or unapproved active store replacement.
