# M47-D4 Public Projection Round Trip Review

Status: completed

## Finding Fixed

- MCP development request summaries previously projected `run.summary.requestTitle` and `run.summary` directly from store records. The default fake store was empty, so the leak was latent. D4 now hashes the run id, title, and summary before returning public output.

## Safety Notes

- No route/provider/store/live-boundary changes.
- No MCP write tool exposure.
- The MCP tool remains read-only and still records evidence plus audit for successful invocations.
- Public output is limited to hashes, counts, statuses, evidence refs, and audit ids.

## Residual Risk

- D4 covered public projection paths. D5 will continue into persistence round trips for store-core/store-sqlite records.
