import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const expectedProjects = [
  'browser-profile-kernel',
  'capability-adapter-kernel',
  'electron-cdp-adapter',
  'electron-cdp-kernel',
  'orchestrator-kernel',
  'evidence-kernel',
  'observer-kernel',
  'otel-adapter',
  'policy-backend-adapter',
  'security-kernel',
  'workflow-kernel',
  'skill-registry',
  'mcp-tool-contracts',
  'nx-verification-adapter',
  'playwright-observer-adapter',
  'worktree-manager',
  'codex-exec-adapter',
  'codex-kernel',
  'store-sqlite',
  'store-core',
  'contracts',
  'codexhub-mcp-server',
  'orchestrator',
  'supervisor',
  'dashboard',
  'cli',
].sort();

const requiredGovernanceFiles = [
  'AGENTS.md',
  '.codexhub/orchestration.yaml',
  '.codexhub/policies.yaml',
  '.codexhub/risk-matrix.yaml',
  '.codexhub/integrations.yaml',
  '.codexhub/policy-backend.fixture.json',
  '.codex/config.toml.example',
  '.codex/agents/architect.toml',
  '.codex/agents/implementer.toml',
  '.codex/agents/reviewer.toml',
  '.codex/agents/security.toml',
  '.codex/agents/qa.toml',
  'docs/integration-decisions/0001-codex-cli-adapter.md',
  'docs/integration-decisions/0002-mcp-typescript-sdk.md',
  'docs/integration-decisions/0003-nx-affected-adapter.md',
  'docs/integration-decisions/0004-playwright-observer.md',
  'docs/integration-decisions/0005-electron-cdp-boundary.md',
  'docs/integration-decisions/0006-opa-cedar-policy-backend-evaluation.md',
  'docs/integration-decisions/0007-opentelemetry-trace-boundary.md',
  'docs/integration-decisions/0008-minimal-orchestrator.md',
  'docs/integration-decisions/0009-capability-adapter-kernel.md',
  'docs/integration-decisions/0010-worktree-manager.md',
  'docs/releases/m8a-release-candidate-baseline.md',
  'docs/threat-model/m8a-release-candidate-threat-model.md',
  'docs/runbooks/m8a-release-candidate-operator-runbook.md',
  'docs/runbooks/m8a-release-candidate-rollback.md',
  'docs/checklists/m8a-operator-readiness-checklist.md',
];

const requiredContractExports = [
  'CapabilityKindSchema',
  'CapabilityManifestSchema',
  'CapabilityDryRunSchema',
  'ExecutionAuthoritySchema',
  'CapabilityExecutionResultSchema',
  'CapabilityAuditEventSchema',
  'McpToolNameSchema',
  'McpToolDefinitionSchema',
  'McpToolInvocationSummarySchema',
  'VerificationPlanSchema',
  'VerificationCommandResultSchema',
  'OrchestrationRunStatusSchema',
  'OrchestrationTimelineEventSchema',
  'OrchestrationRunSchema',
  'BrowserProfileRefSchema',
  'BrowserProfileReadinessSchema',
  'BrowserObservationRunnerModeSchema',
  'BrowserPageObservationPlanSchema',
  'BrowserPageObservationSummarySchema',
  'BrowserObservationRunSchema',
  'ElectronProcessSummarySchema',
  'ElectronDebugEndpointSummarySchema',
  'ElectronTargetSummarySchema',
  'ElectronCdpCommandAllowlistDecisionSchema',
  'ElectronCdpEventMetadataSummarySchema',
  'ElectronCdpObservationPlanSchema',
  'ElectronCdpObservationSummarySchema',
  'ElectronCdpObservationRunSchema',
  'ElectronCdpObservationRunnerModeSchema',
  'ElectronCdpObservationDryRunRecordSchema',
  'ElectronCdpObservationApprovalArtifactRecordSchema',
  'ElectronCdpObservationControlPlaneRunSchema',
  'ElectronCdpObservationTimelineEventSchema',
  'ElectronCdpControlPlaneApprovalStatusSchema',
  'WorktreePlanSchema',
  'WorktreeRunSchema',
  'PatchRunSchema',
  'PatchSummarySchema',
  'PullRequestSummaryDraftSchema',
  'ReleaseAuditDraftSchema',
  'PolicyBackendKindSchema',
  'PolicyBackendEvaluatorSourceSchema',
  'PolicyBackendEvaluationPlanSchema',
  'PolicyBackendRawEvaluationSummarySchema',
  'PolicyBackendNormalizedDecisionTraceSchema',
  'PolicyBackendEvaluationRunSchema',
  'TelemetrySignalKindSchema',
  'TelemetrySpanSummarySchema',
  'TelemetryTraceExportPlanSchema',
  'TelemetryExportRunSchema',
];

const projects = readNxProjects();
const missingProjects = expectedProjects.filter((project) => !projects.includes(project));
const extraProjects = projects.filter((project) => !expectedProjects.includes(project));
const missingGovernanceFiles = requiredGovernanceFiles.filter(
  (file) => !existsSync(resolve(workspaceRoot, file)),
);
const missingContractExports = readMissingContractExports();

if (
  missingProjects.length > 0 ||
  extraProjects.length > 0 ||
  missingGovernanceFiles.length > 0 ||
  missingContractExports.length > 0
) {
  console.error('Scaffold health failed.');

  for (const project of missingProjects) {
    console.error(`- Missing Nx project: ${project}`);
  }

  for (const project of extraProjects) {
    console.error(`- Unexpected Nx project: ${project}`);
  }

  for (const file of missingGovernanceFiles) {
    console.error(`- Missing governance file: ${file}`);
  }

  for (const contractExport of missingContractExports) {
    console.error(`- Missing contracts export: ${contractExport}`);
  }

  process.exit(1);
}

console.log(
  `Scaffold health passed: ${projects.length} Nx projects, ${requiredGovernanceFiles.length} governance files, and ${requiredContractExports.length} capability contracts verified.`,
);

function readNxProjects(): string[] {
  const projects: string[] = [];

  for (const root of ['apps', 'packages']) {
    const absoluteRoot = resolve(workspaceRoot, root);

    if (!existsSync(absoluteRoot)) {
      continue;
    }

    for (const entry of readdirSync(absoluteRoot)) {
      const projectRoot = resolve(absoluteRoot, entry);
      const projectJsonPath = resolve(projectRoot, 'project.json');

      if (!statSync(projectRoot).isDirectory() || !existsSync(projectJsonPath)) {
        continue;
      }

      const parsed = JSON.parse(readFileSync(projectJsonPath, 'utf8')) as { name?: unknown };

      if (typeof parsed.name === 'string' && parsed.name.length > 0) {
        projects.push(parsed.name);
      }
    }
  }

  return projects.sort();
}

function readMissingContractExports(): string[] {
  const contractsPath = resolve(workspaceRoot, 'packages', 'contracts', 'src', 'index.ts');

  if (!existsSync(contractsPath)) {
    return requiredContractExports;
  }

  const text = readFileSync(contractsPath, 'utf8');

  return requiredContractExports.filter((contractExport) => !text.includes(contractExport));
}
