# M77 Codex Desktop Structure Map Results

## Summary

M77 adds a governed Codex Desktop CDP structure-map path. It uses fixed multi-domain CDP read probes to build a metadata-only structure map for the Desktop client.

## Implemented

- Added contracts for probe summaries, DOM structure summaries, DOMSnapshot summaries, layout regions, panel maps, blocked controls, locator candidates, drift signatures, and structure-map runs.
- Added a fixed Electron/CDP adapter path for Target/Page/DOM/DOMSnapshot/CSS/Accessibility/Network/Log/Runtime metadata and safe read-click probes.
- Added a Supervisor calibration route for `POST /api/real-client-calibration/codex-desktop/structure-map-runs`.
- Updated route matrix and audit boundary allowlists for the reviewed structure-map boundary.

## Boundaries

- Raw DOM and DOMSnapshot data are transient only.
- No cookies, session tokens, passwords, MFA fields, browser storage, network bodies, generic CDP passthrough, arbitrary JS, or arbitrary selector runner are added.
- Logout, purchase, upgrade, add credits, save, submit, delete, account switch, Git write, and new-task controls are identified as blocked controls, not executed.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run electron-cdp-adapter:test --skip-nx-cache`
