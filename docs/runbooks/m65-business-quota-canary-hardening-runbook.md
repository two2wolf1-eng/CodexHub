# M65 Business Quota Canary And Hardening Runbook

## Canary Checklist

- App Server account and rate-limit read canary is green.
- Business page DOM/AX quota observation canary is green after redaction.
- Workspace visible-state and login visible-state canaries are green.
- Electron renderer target and Codex Desktop health canaries are green.
- Selector and redaction drift gates are compatible.
- Audit export contains only manifest, hash, count, status, evidence, and audit refs.

## Dispatch Rule

Real dispatch is blocked when any canary is failed, blocked, unknown, or skipped for a required source. Real dispatch is also blocked when App Server protocol drift, Desktop target drift, selector drift, or redaction drift is unknown or incompatible.

## Recovery Playbook

- Login or MFA: create a human checkpoint and wait.
- Workspace mismatch: request human workspace selection.
- Desktop unresponsive: create an approved restart plan before any restart.
- App Server unresponsive: reconnect through approved recovery.
- Selector/redaction drift: update manifest, rerun canary, then retry readiness.
