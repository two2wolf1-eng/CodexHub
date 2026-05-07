# M48b Production GA Kernel Store Runbook

## Operator Notes

M48b is not an operator-facing execution feature. It prepares metadata stores used by the later Production GA control plane.

## Safety Rules

- Do not treat GA signoff as child action authority.
- Do not paste raw E2E payloads, logs, traces, diffs, patches, paths, tokens, or environment values into GA records.
- GA records should reference existing child control-plane evidence by id/hash only.

## Checks

- Confirm GA kernel tests pass.
- Confirm SQLite round-trip tests show no raw adversarial output.
- Confirm no direct child adapter imports exist in `packages/production-ga-kernel`.
