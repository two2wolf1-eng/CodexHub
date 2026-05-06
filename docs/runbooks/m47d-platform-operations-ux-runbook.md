# M47d Platform Operations UX Runbook

## Dashboard

Open `#/operations` to inspect platform operations metadata:

- backup and restore record counts
- migration and retention status
- audit export status
- operator role records
- latest evidence and audit counts

The view is degraded-safe when Supervisor records are unavailable.

## CLI

Use read-only commands:

- `codexhub operations status`
- `codexhub operations backups list`
- `codexhub operations restores list`
- `codexhub operations migrations list`
- `codexhub operations retention list`
- `codexhub operations audit-exports list`
- `codexhub operations roles list`
- `codexhub operations rehearse --fixture --scenario backup-all-pass`

The CLI does not start platform operations and does not read a local-control token for these commands.
