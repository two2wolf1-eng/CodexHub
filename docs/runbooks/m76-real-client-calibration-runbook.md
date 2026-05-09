# M76 Real Client Calibration Runbook

## Preflight

1. Confirm the target Chrome/ChatGPT or Codex Desktop surface is registered server-side.
2. Confirm the operation manifest is reviewed and does not accept raw selector, endpoint, JavaScript, prompt, DOM, or body input.
3. Confirm the calibration target is pre-registered and marked `calibrationSafe=true` and `restoreAllowed=true`.
4. Confirm the target is not owner, admin, last-admin, unknown, or permission-ambiguous.
5. Enable only the required runtime gates for the calibration window.

## Live Member Remove/Add Calibration

1. Run session dry-run and inspect blocked reasons.
2. Create calibration authority grant with TTL.
3. Read before-state through registered surfaces.
4. Execute remove through the registered visible UI flow.
5. Verify removed state.
6. Execute add/invite back through the registered visible UI flow.
7. Verify restored or pending-invite state.
8. Persist metadata-only evidence, audit ids, selector samples, drift signatures, and correction proposals.

## Failure Handling

- If restore verification fails, stop automation and record `restore_failed`.
- If selectors, AX roles, workspace identity, or timing drift, record `drift_blocked`.
- If evidence is incomplete, do not apply correction proposals.
- If any credential, session, token, password, MFA, raw DOM, or raw network material is encountered, discard it and record a blocked calibration result.

## Retention

Calibration records keep hashes, counts, statuses, summaries, evidence refs, audit ids, and retention metadata. Raw artifacts remain forbidden except short-TTL encrypted break-glass records that still cannot contain secret material.
