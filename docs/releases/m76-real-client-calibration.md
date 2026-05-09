# M76 Real Client Calibration

## Summary

M76 introduces the first explicit live calibration stage for Chrome/ChatGPT and Codex Desktop automation. It can enter live write surfaces only inside a TTL-bound calibration session with registered surfaces, reviewed manifests, store-resolved calibration authority, evidence, audit, runtime gates, and retention policy.

## Key Changes

- Added `real-client-calibration-kernel` for calibration planning, authority validation, drift signatures, selector samples, correction proposals, live run summaries, and retention policy.
- Added Supervisor routes under `/api/real-client-calibration/*`.
- Added SQLite metadata repositories for sessions, authority grants, observations, drift signatures, selector samples, correction proposals, runs, and retention policies.
- Added M76 operation kinds for Codex Desktop live state calibration, Codex Desktop task dispatch calibration, ChatGPT workspace member remove/add calibration, Chrome/ChatGPT UI calibration, and manifest correction calibration.
- Added Dashboard `#/real-calibration` as an ops view with metadata-only sessions, observations, drift, corrections, and acceptance state.

## Safety Model

The default admin rehearsal is `chatgpt.workspace.calibration_member_remove_then_add.v1`. It requires a server/store registered target with `calibrationSafe=true`, `restoreAllowed=true`, workspace hash, member ref, and delegated-admin authority. Owner, admin, last-admin, and unknown targets are blocked.

Forbidden materials remain impossible: cookies, session tokens, passwords, MFA fields, credential stores, raw endpoints, raw selectors, raw JavaScript, raw prompts, raw DOM, and network bodies.

## Local Live-Touch Smoke

This round included a bounded local live-touch smoke against the current operator machine:

- Chrome was reached through an existing loopback CDP endpoint discovered from a running Chrome process. The smoke recorded only product/version class, target count, and ChatGPT/Codex-like target counts.
- Codex Desktop had a visible window and was brought to foreground through the OS window handle. No text was typed, no task was submitted, and no window content was read.
- Codex Desktop CDP was not reachable in this environment, so any Desktop CDP calibration remains `readiness_blocked` until a registered loopback endpoint is available.

No raw endpoint URL, page URL, title, selector, DOM, network body, cookie, session token, password, MFA field, browser storage, or prompt text was stored or printed.
