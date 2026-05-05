# M23 Custom Workflow Template Results

## Scope

M23 adds JSON custom workflow templates as metadata-only governance inputs. Templates live under `.codexhub/workflows/*.workflow.json` and are validated by `workflow-kernel`.

## Delivered

- Added custom workflow template, validation, plan, and rehearsal contracts.
- Added JSON-only loader and validator for version `1` templates.
- Added metadata-only planning and fixture rehearsal helpers.
- Added read-only Dashboard and CLI workflow views.

## Safety

- No new execution provider was added.
- No Supervisor write route was added in M23.
- Templates cannot enable adapter execution, weaken approval policy, add loops, add branching, or reference arbitrary config paths.
- Public output is limited to ids, hashes, counts, statuses, summaries, evidence refs, and audit ids.

## Verification

- Focused tests cover contracts, workflow validation, planning, rehearsal, CLI, and Dashboard read-only paths.
- M24 control-plane tests cover persisted records and Supervisor gates.

