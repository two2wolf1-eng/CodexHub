# M40 Release / Version / Tag Lifecycle Results

## Scope

M40 adds a governed release pre-artifact chain:

- metadata-only version bump planning
- metadata-only changelog summaries
- governed GitHub annotated tag and tag ref creation planning/runs
- governed GitHub draft release creation planning/runs

Release publish, local `git tag`, version file mutation, and raw changelog/release body storage remain out of scope.

## Implementation Summary

- Added release lifecycle contracts in `packages/contracts`.
- Added `packages/release-lifecycle-kernel` for version/changelog planning and fixture rehearsal.
- Extended the existing GitHub HTTP boundary for fixed tag and draft release endpoints only.
- Added store/Supervisor records and routes for version plans, release tags, and release drafts.
- Added CLI/Dashboard read-only release views.

## Safety

- Product defaults remain disabled.
- GitHub token values are never stored or rendered.
- Tag creation and draft release creation each require persisted approval.
- Public responses contain ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.
- Release publishing remains blocked.

## Residual Risk

M40 creates the governed control plane and metadata projections. Real operator use still requires explicit runtime enablement, local-control gate, persisted approval, and GitHub provider readiness.
