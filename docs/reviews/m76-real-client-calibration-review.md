# M76 Real Client Calibration Review

## Findings

No open critical findings in the implemented M76 control plane. The new routes reject request-body authority, raw endpoints, selectors, JavaScript, prompts, DOM, request/response bodies, and credential material before resolving calibration sessions or authority grants.

## Boundary Review

- Live writes are disabled unless `CODEXHUB_REAL_CLIENT_CALIBRATION_ENABLED`, `CODEXHUB_REAL_CLIENT_CALIBRATION_LIVE_WRITES_ENABLED`, and the operation-specific gate are enabled.
- Admin member remove/add requires delegated-admin authority and a registered calibration-safe target.
- Codex Desktop task dispatch calibration requires the existing task dispatch gate and registered M74/M75 surface/manifest ids.
- Manifest corrections produce proposals; they do not create an arbitrary selector or script runner.

## Residual Risk

Real browser UI and Codex Desktop surfaces can drift. M76 records selector samples and drift signatures so operators can update manifests deliberately instead of falling back to generic automation.

## Live-Touch Review

The local smoke touched real clients without crossing write boundaries:

- Chrome CDP target listing succeeded with metadata-only counts.
- Codex Desktop OS window focus succeeded.
- Codex Desktop CDP remained unreachable, so Desktop CDP calibration is correctly blocked until a registered loopback endpoint is available.

The smoke did not read page content, DOM, storage, cookies, sessions, tokens, passwords, MFA fields, prompts, or network bodies.
