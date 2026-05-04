import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const expectedProjects = [
  'approval-ux-kernel',
  'browser-profile-kernel',
  'capability-adapter-kernel',
  'electron-cdp-adapter',
  'electron-cdp-kernel',
  'orchestrator-kernel',
  'evidence-kernel',
  'governance-projection-kernel',
  'github-provider-adapter',
  'operator-readiness-kernel',
  'observer-kernel',
  'otel-adapter',
  'policy-backend-adapter',
  'release-candidate-kernel',
  'review-package-kernel',
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
  'docs/integration-decisions/0011-github-provider.md',
  'docs/releases/m8a-release-candidate-baseline.md',
  'docs/releases/m8-release-candidate.md',
  'docs/releases/m9-local-pilot-results.md',
  'docs/releases/m10a-pilot-productization.md',
  'docs/releases/m10b-approval-history-projection.md',
  'docs/releases/m10c-pilot-acceptance-rehearsal.md',
  'docs/releases/m10.5-operator-pilot-hardening.md',
  'docs/releases/m11a-production-pilot-narrow-path.md',
  'docs/releases/m11b-pilot-operator-enablement.md',
  'docs/releases/m11c-pilot-failure-recovery-projection.md',
  'docs/releases/m11d-pilot-acceptance-smoke.md',
  'docs/releases/m11-production-pilot-results.md',
  'docs/releases/m12a-controlled-patch-lifecycle-foundation.md',
  'docs/releases/m12b-governed-codex-patch-worktree.md',
  'docs/releases/m12c-patch-verification-readiness-gate.md',
  'docs/releases/m12d-patch-retry-cleanup-lifecycle.md',
  'docs/releases/m12-controlled-patch-results.md',
  'docs/releases/m13-local-review-package-results.md',
  'docs/releases/m14-local-release-candidate-results.md',
  'docs/releases/m14.6-local-rc-acceptance.md',
  'docs/releases/m15-github-provider-results.md',
  'docs/releases/m16-github-draft-pr-results.md',
  'docs/releases/m17-github-branch-publish-results.md',
  'docs/releases/m18-remote-publish-draft-pr-results.md',
  'docs/releases/m18.6-remote-acceptance-smoke.md',
  'docs/reviews/m8-final-release-audit.md',
  'docs/reviews/m9-approval-ux-hardening.md',
  'docs/reviews/m10-operator-pilot-hardening-review.md',
  'docs/reviews/m11-pilot-hardening-review.md',
  'docs/reviews/m12-patch-lifecycle-hardening-review.md',
  'docs/reviews/m13-review-package-hardening-review.md',
  'docs/reviews/m14-local-rc-hardening-review.md',
  'docs/reviews/m15-github-provider-hardening-review.md',
  'docs/reviews/m16-github-draft-pr-hardening-review.md',
  'docs/reviews/m17-github-branch-publish-hardening-review.md',
  'docs/reviews/m18-remote-publish-hardening-review.md',
  'docs/threat-model/m8a-release-candidate-threat-model.md',
  'docs/threat-model/m15-github-provider-threat-model.md',
  'docs/runbooks/m8a-release-candidate-operator-runbook.md',
  'docs/runbooks/m8a-release-candidate-rollback.md',
  'docs/runbooks/m10-local-pilot-operator-runbook.md',
  'docs/runbooks/m11-production-pilot-narrow-path.md',
  'docs/runbooks/m14-local-rc-operator-runbook.md',
  'docs/runbooks/m15-github-provider-operator-runbook.md',
  'docs/runbooks/m16-github-draft-pr-operator-runbook.md',
  'docs/runbooks/m17-github-branch-publish-operator-runbook.md',
  'docs/runbooks/m18-remote-publish-operator-runbook.md',
  'docs/checklists/m8a-operator-readiness-checklist.md',
  'docs/checklists/m10-local-pilot-checklist.md',
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
  'ControlledPatchPlanSchema',
  'ControlledPatchRunSchema',
  'DiffReviewSummarySchema',
  'ControlledPatchReadinessSchema',
  'ControlledPatchVerificationGateSchema',
  'ControlledPatchRetryCleanupProjectionSchema',
  'ControlledPatchLifecycleRunSchema',
  'LocalReviewPackagePlanSchema',
  'LocalReviewPackageSummarySchema',
  'LocalReviewPackageRunSchema',
  'LocalReviewPackageDryRunRecordSchema',
  'LocalReviewPackageApprovalArtifactRecordSchema',
  'LocalReviewPackageControlPlaneRunSchema',
  'LocalReviewFindingSummarySchema',
  'LocalReviewDecisionProjectionSchema',
  'LocalRcReadinessPlanSchema',
  'LocalRcReadinessSummarySchema',
  'LocalRcEvidenceBundleSchema',
  'LocalRcAuditChainSchema',
  'LocalRcBundleDryRunRecordSchema',
  'LocalRcBundleApprovalArtifactRecordSchema',
  'LocalRcBundleControlPlaneRunSchema',
  'LocalRcAcceptanceRehearsalScenarioSchema',
  'LocalRcAcceptanceRehearsalStepSchema',
  'LocalRcAcceptanceRehearsalRunSchema',
  'GithubProviderHostSchema',
  'GithubTokenReadinessSchema',
  'GithubRemoteRefSummarySchema',
  'GithubMetadataDryRunRecordSchema',
  'GithubMetadataApprovalArtifactRecordSchema',
  'GithubMetadataControlPlaneRunSchema',
  'GithubDraftPrReadinessSchema',
  'GithubDraftPrPlanSchema',
  'GithubDraftPrApprovalArtifactRecordSchema',
  'GithubDraftPrCreationSummarySchema',
  'RemotePrAuditChainSchema',
  'GithubDraftPrRunSchema',
  'GithubDraftPrAcceptanceRehearsalRunSchema',
  'GithubCommitContentManifestSchema',
  'GithubBranchPublishReadinessSchema',
  'GithubBranchPublishPlanSchema',
  'GithubBranchPublishApprovalArtifactRecordSchema',
  'GithubRemoteCommitSummarySchema',
  'GithubBranchPublishRunSchema',
  'GithubBranchPublishAcceptanceRehearsalRunSchema',
  'GithubPublishDraftPrChainPlanSchema',
  'GithubPublishDraftPrChainStepSchema',
  'GithubPublishDraftPrChainRunSchema',
  'GithubRemotePrLifecycleSummarySchema',
  'GithubPublishDraftPrAcceptanceRehearsalRunSchema',
  'GovernedCodexPatchPlanSchema',
  'GovernedCodexPatchRunSchema',
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
  'UnifiedRunSourceSchema',
  'UnifiedTimelineEventSchema',
  'UnifiedRunProjectionSchema',
  'EvidenceBundleProjectionSchema',
  'AuditChainProjectionSchema',
  'GovernanceProjectionSummarySchema',
  'OperatorReadinessStatusSchema',
  'OperatorReadinessCheckSchema',
  'IntegrationReadinessSummarySchema',
  'ConfigHashSummarySchema',
  'OperatorReadinessReportSchema',
  'M10PilotOperatorStepSchema',
  'M10PilotChecklistSchema',
  'M10PilotRunbookSummarySchema',
  'M11PilotEnablementStepSchema',
  'M11PilotEnablementChecklistSchema',
  'M11PilotEnablementRunbookSummarySchema',
  'M10PilotAcceptanceStepSchema',
  'M10PilotAcceptanceEvidenceSummarySchema',
  'M10PilotAcceptanceRehearsalRunSchema',
  'GoldenPathStepSchema',
  'GoldenPathEvidenceBundleSchema',
  'GoldenPathRehearsalRunSchema',
  'M9PilotRunSchema',
  'M9PilotStepSchema',
  'M9PilotReadinessSchema',
  'M9PilotEvidenceSummarySchema',
  'M11PilotRunSchema',
  'M11PilotStepSchema',
  'M11PilotReadinessSchema',
  'M11PilotEvidenceSummarySchema',
  'M11PilotFailureSummarySchema',
  'M11PilotRecoveryActionSchema',
  'M11PilotCleanupApprovalStatusSchema',
  'M11PilotCleanupHandoffSchema',
  'M11PilotRecoveryProjectionSchema',
  'M11PilotAcceptanceScenarioSchema',
  'M11PilotAcceptanceSmokeStepSchema',
  'M11PilotAcceptanceSmokeRunSchema',
  'ApprovalUxTypeSchema',
  'ApprovalInboxItemSchema',
  'ApprovalInboxProjectionSchema',
  'ApprovalDecisionRequestSchema',
  'ApprovalDecisionResultSchema',
  'ApprovalDecisionHistoryItemSchema',
  'ApprovalDecisionHistoryProjectionSchema',
  'ApprovalDecisionHistorySummarySchema',
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
