# M21 Remote Supersede Results

## Scope

M21 adds a metadata-only remote supersede projection for old GitHub draft PR and branch artifacts after a newer CodexHub attempt exists.

## Delivered

- Added contracts for remote supersede plans, runs, target summaries, cleanup readiness, chain projection, and fixture rehearsals.
- Added GitHub provider helpers that aggregate branch publish, draft PR, PR lifecycle, and rework metadata without invoking GitHub.
- Added CLI and Dashboard read-only supersede views and fixture rehearsal summaries.
- Updated GitHub integration governance to document supersede as projection-only.

## Safety

- No Supervisor POST routes were added for M21.
- No GitHub network write or read boundary is invoked by supersede projection.
- Outputs are ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.
- Raw owner, repo, branch, URL, PR body, response body, reason, token, cookie, session, and env values remain forbidden.

## Verification Evidence

M21 acceptance is covered by focused contracts, GitHub provider, CLI, Dashboard, and governance audit checks in the M21/M22 release gate.
