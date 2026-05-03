# 0002 MCP TypeScript SDK

## Status

Accepted for M3a read-only integration.

## Provider

- Project: Model Context Protocol TypeScript SDK
- Package: `@modelcontextprotocol/sdk`
- Version: `1.29.0`
- License: MIT
- CodexHub app: `apps/codexhub-mcp-server`
- Contract package: `packages/mcp-tool-contracts`

## Purpose

CodexHub uses the official SDK to expose a local MCP server for read-only governance context. The SDK is a protocol/runtime provider only; CodexHub remains the authority provider through contracts, policy, evidence, audit, and store rules.

## Transports

- `stdio`: default local MCP transport. It does not bind a port.
- Streamable HTTP: optional local transport on `127.0.0.1:3335` with endpoint `/mcp` and health endpoint `/health`.
- HTTP is stateless for M3a. SSE and persistent server-side sessions are not enabled.

## Security Boundary

- No new external process boundary is introduced.
- The MCP server must not import `node:child_process`.
- HTTP requests must use loopback `Host`.
- HTTP requests with `Origin` must use trusted loopback origins.
- HTTP MCP requests must provide the CodexHub local control header.
- Wildcard CORS is forbidden.
- Write and admin tools are disabled in M3a.
- Tool success requires evidence and audit store availability.

## Tools

M3a enables only these read-only tools:

- `codexhub.getArchitectureMap`
- `codexhub.getPolicySummary`
- `codexhub.getRiskMatrix`
- `codexhub.getEvidenceSummary`
- `codexhub.getOpenDevelopmentRequests`
- `codexhub.getAffectedProjectsDryRun`
- `codexhub.readObservationSnapshot`

`codexhub.getAffectedProjectsDryRun` creates an adapter plan only. It does not execute Nx and does not start a process.

## Evidence And Audit

Each successful or policy-blocked tool invocation records:

- `PolicyDecision`
- metadata-only `EvidenceRef`
- `CapabilityAuditEvent`
- invocation summary with hashes/counts/summaries only

Prompt bodies, file bodies, stdout/stderr, JSONL bodies, and local paths are not returned or persisted.

## Rollback

Disable `integrations.mcp-server.enabled` in `.codexhub/integrations.yaml` and stop invoking `apps/codexhub-mcp-server`. No schema migration is required for rollback because M3a stores only generic evidence and audit records.
