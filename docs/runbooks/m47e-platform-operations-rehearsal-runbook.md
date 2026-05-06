# M47e Platform Operations Rehearsal Runbook

## Command

Use the fixture-only rehearsal:

```bash
codexhub operations rehearse --fixture --scenario disaster-recovery-drill
```

Useful scenarios:

- `backup-all-pass`
- `backup-hash-mismatch`
- `restore-second-approval-missing`
- `migration-failed`
- `retention-preview`
- `retention-backup-required`
- `audit-export-pass`
- `role-insufficient`
- `disaster-recovery-drill`

## Safety

The rehearsal never writes backups, restores stores, runs migrations, deletes retained records, exports audit data, or changes operator roles.
