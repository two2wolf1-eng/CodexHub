import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, parse, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findAdversarialPublicOutputLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';

const cliSymlinkEscapeFixturePath =
  'packages/codex-kernel/fixtures/codexhub-cli-symlink-escape-test.jsonl';
const cliSymlinkEscapeAbsolutePath = join(
  findTestWorkspaceRoot(process.cwd()),
  ...cliSymlinkEscapeFixturePath.split('/'),
);
function findTestWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current || current === root) {
      return resolve(startDirectory);
    }

    current = parent;
  }
}

function expectNoForbiddenCliRawOutput(serialized: string): void {
  expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
}

function extractFunctionSource(source: string, functionName: string): string {
  const startPatterns = [
    `export async function ${functionName}`,
    `export function ${functionName}`,
    `async function ${functionName}`,
    `function ${functionName}`,
  ];
  const start = startPatterns
    .map((pattern) => source.indexOf(pattern))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (start === undefined) {
    throw new Error(`Missing function source for ${functionName}`);
  }

  const nextFunctionMatch = /\n(?:export\s+)?(?:async\s+)?function\s+[A-Za-z0-9_]+\s*\(/g;
  nextFunctionMatch.lastIndex = start + 1;

  const next = nextFunctionMatch.exec(source);

  return source.slice(start, next?.index ?? source.length);
}

function sourceWindow(source: string, startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);

  if (endMarker.length === 0) {
    return source.slice(start);
  }

  const end = source.indexOf(endMarker, start + startMarker.length);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

function expectNoCliLocalControlMutationSurface(source: string): void {
  expect(source).not.toContain("method: 'POST'");
  expect(source).not.toContain('method: "POST"');
  expect(source).not.toContain('createSupervisorPostHeaders');
  expect(source).not.toContain('LOCAL_CONTROL_ENV_VAR');
  expect(source).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
  expect(source).not.toContain('postControlledWriteCliMutation');
  expect(source).not.toContain('adapter.execute');
  expect(source).not.toContain('executeGithub');
  expect(source).not.toContain('.option(\'--token');
  expect(source).not.toContain('.option("--token');
}

describe('cli development mock-run fallback', () => {
  beforeEach(() => {
    process.env.CODEXHUB_SUPERVISOR_LOCAL_TOKEN = 'test-local-control-token';
  });

  it('keeps M45 controlled write CLI mutations exact, metadata-only, and env-token gated', () => {
    const cliSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const routeSetSource = sourceWindow(
      cliSource,
      'const controlledWriteCliMutationRoutes = new Set',
      'function registerControlledWriteCliFamily',
    );
    const helperSource = extractFunctionSource(cliSource, 'postControlledWriteCliMutation');
    const dryRunBodySource = extractFunctionSource(cliSource, 'createControlledWriteDryRunBody');
    const expectedRoutes = [
      '/api/browser/actions/dry-runs',
      '/api/browser/actions/approval-requests',
      '/api/browser/actions/runs',
      '/api/electron-cdp/main-inspector/dry-runs',
      '/api/electron-cdp/main-inspector/approval-requests',
      '/api/electron-cdp/main-inspector/runs',
      '/api/mcp/write-tools/dry-runs',
      '/api/mcp/write-tools/approval-requests',
      '/api/mcp/write-tools/runs',
    ];

    for (const route of expectedRoutes) {
      expect(routeSetSource).toContain(route);
    }

    expect(routeSetSource.match(/\/api\//g)).toHaveLength(expectedRoutes.length);
    expect(helperSource).toContain('controlledWriteCliMutationRoutes.has(route)');
    expect(helperSource).toContain("method: 'POST'");
    expect(helperSource).toContain('createSupervisorPostHeaders()');
    expect(cliSource).not.toContain(".option('--token");
    expect(cliSource).not.toContain('.option("--token');
    expect(cliSource).not.toContain('--local-token');
    expect(cliSource).not.toContain('--local-control-token');

    for (const forbidden of [
      'approvalArtifact:',
      'executionAuthority',
      'authority:',
      'childArtifacts',
      'rawSelector',
      'rawTypedText',
      'rawPatch',
      'rawPath',
    ]) {
      expect(helperSource).not.toContain(forbidden);
      expect(dryRunBodySource).not.toContain(forbidden);
    }

    for (const forbiddenRouteGuard of ['startsWith(', 'includes(', 'indexOf(']) {
      expect(helperSource).not.toContain(forbiddenRouteGuard);
      expect(routeSetSource).not.toContain(forbiddenRouteGuard);
    }
  });

  it('keeps CLI POST call sites exact, local-control gated, and free of token options', () => {
    const cliSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const postMatches = [...cliSource.matchAll(/method:\s*['"]POST['"]/g)];

    expect(postMatches).toHaveLength(25);
    expect(cliSource).not.toContain(".option('--token");
    expect(cliSource).not.toContain('.option("--token');
    expect(cliSource).not.toContain('--local-token');
    expect(cliSource).not.toContain('--local-control-token');
    expect(cliSource).not.toContain('localStorage');
    expect(cliSource).not.toContain('sessionStorage');
    expect(cliSource).not.toContain('indexedDB');

    for (const match of postMatches) {
      const index = match.index ?? -1;
      const window = cliSource.slice(Math.max(0, index - 500), index + 900);

      expect(window).toContain('createSupervisorPostHeaders()');
      expect(window).not.toContain("startsWith('/api/");
      expect(window).not.toContain('startsWith("/api/');
      expect(window).not.toContain("includes('/api/");
      expect(window).not.toContain('includes("/api/');
      expect(window).not.toContain("indexOf('/api/");
      expect(window).not.toContain('indexOf("/api/');
      expect(window).not.toContain('approvalArtifact:');
      expect(window).not.toContain('executionAuthority');
      expect(window).not.toContain('authority:');
      expect(window).not.toContain('token:');
      expect(window).not.toContain('rawPatch:');
      expect(window).not.toContain('rawCommand:');
    }
  });

  it('keeps CLI mutating POST calls owned by reviewed exact command helpers', () => {
    const cliSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const postMatches = [...cliSource.matchAll(/method:\s*['"]POST['"]/g)];
    const reviewedPostOwners = [
      'postControlledWriteCliMutation',
      'decideApproval',
      'dryRunWorkflow',
      'mockRunDevelopment',
      'replayCodexFixture',
      'dryRunCodexExec',
      'requestCodexExecApproval',
      'decideCodexExecApproval',
      'preflightCodexExec',
      'evaluateCodexExecGate',
      'createCodexExecAdrDecision',
      'simulateReadOnlyAdapterPreflightCommand',
      'createReadOnlyAdapterSimulatorReviewCommand',
      'createReadOnlyAdapterImplementationPlanReviewCommand',
      'createReadOnlyAdapterSkeletonReviewCommand',
      'runReadOnlyAdapterFixtureBoundaryCommand',
      'createReadOnlyAdapterFinalReadinessCommand',
      'createRealReadOnlyAdapterReadinessCommand',
      'createRealReadOnlyAdapterReadinessReviewCommand',
      'attemptRealReadOnlyAdapterCommand',
      'traceRealReadOnlyAdapterApprovalAuthorityCommand',
      'prepareRealReadOnlyAdapterPolicySourceCommand',
      'prepareRealReadOnlyAdapterPilotSourceCommand',
      'checkRealReadOnlyAdapterPilotPrerequisitesCommand',
      'createCodexExecReportReview',
    ];
    const ownerRegex = /\n(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/g;
    const postOwners = postMatches.map((match) => {
      const prefix = cliSource.slice(0, match.index ?? 0);
      const ownerMatches = [...prefix.matchAll(ownerRegex)];

      return ownerMatches.at(-1)?.[1] ?? '<missing-owner>';
    });

    expect(postOwners).toEqual(reviewedPostOwners);
    expect(new Set(postOwners).size).toBe(postOwners.length);
    expect(cliSource).not.toContain('postJson(');
    expect(cliSource).not.toContain('postSupervisor(');
    expect(cliSource).not.toContain('genericPost');
    expect(cliSource).not.toContain('mutationRoutePrefix');
    expect(cliSource).not.toContain('route.startsWith');
  });

  it('keeps registered read-only CLI command families free of local-control mutation helpers', () => {
    const cliSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const readOnlyRegistrations = [
      'registerGithubMergeReadOnlyCommands',
      'registerGithubActionsReadOnlyCommands',
      'registerGithubReleaseLifecycleReadOnlyCommands',
      'registerReleaseReadOnlyCommands',
      'registerDeploymentReadOnlyCommands',
      'registerRuntimeReadOnlyCommands',
      'registerExternalAgentReadOnlyCommands',
      'registerPlatformOperationsReadOnlyCommands',
      'registerProductionGaReadOnlyCommands',
      'registerSecretReadOnlyCommands',
      'registerGithubActionsObservationCommands',
      'registerGithubActionsRunControlCommands',
      'registerGithubActionsDispatchCommands',
      'registerGithubPrManagementReadOnlyCommands',
    ];

    for (const functionName of readOnlyRegistrations) {
      expectNoCliLocalControlMutationSurface(extractFunctionSource(cliSource, functionName));
    }
  });

  it('keeps runtime, external agent, platform operations, and Production GA CLI surfaces read-only', () => {
    const cliSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const runtimeRegistration = extractFunctionSource(cliSource, 'registerRuntimeReadOnlyCommands');
    const externalAgentRegistration = extractFunctionSource(
      cliSource,
      'registerExternalAgentReadOnlyCommands',
    );
    const platformOperationsRegistration = extractFunctionSource(
      cliSource,
      'registerPlatformOperationsReadOnlyCommands',
    );
    const productionGaRegistration = extractFunctionSource(
      cliSource,
      'registerProductionGaReadOnlyCommands',
    );
    const runtimeStatus = extractFunctionSource(cliSource, 'getRuntimeStatusForCli');
    const externalStatus = extractFunctionSource(cliSource, 'getExternalAgentStatusForCli');
    const platformStatus = extractFunctionSource(cliSource, 'getPlatformOperationsStatusForCli');
    const productionGaStatus = extractFunctionSource(cliSource, 'getProductionGaStatusForCli');

    for (const route of [
      '/api/runtime/jobs/dry-runs',
      '/api/runtime/jobs/runs',
      '/api/runtime/queue',
      '/api/runtime/locks',
      '/api/agents/external/dry-runs',
      '/api/agents/external/approvals',
      '/api/agents/external/runs',
      '/api/platform/backups',
      '/api/platform/restores',
      '/api/platform/migrations',
      '/api/platform/retention',
      '/api/platform/audit-exports',
      '/api/platform/operator-roles',
      '/api/production-ga/dry-runs',
      '/api/production-ga/signoffs',
      '/api/production-ga/rehearsals',
      '/api/production-ga/training-completions',
      '/api/production-ga/capability-matrix/latest',
      '/api/production-ga/threat-model/latest',
    ]) {
      expect(
        `${runtimeRegistration}\n${externalAgentRegistration}\n${platformOperationsRegistration}\n${productionGaRegistration}\n${productionGaStatus}`,
      ).toContain(route);
    }

    for (const source of [
      runtimeRegistration,
      externalAgentRegistration,
      platformOperationsRegistration,
      productionGaRegistration,
      runtimeStatus,
      externalStatus,
      platformStatus,
      productionGaStatus,
    ]) {
      expect(source).not.toContain("method: 'POST'");
      expect(source).not.toContain('createSupervisorPostHeaders');
      expect(source).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
      expect(source).not.toContain('adapter.execute');
      expect(source).not.toContain('rawPrompt:');
      expect(source).not.toContain('rawPatch:');
      expect(source).not.toContain('rawCommand:');
      expect(source).not.toContain('childArtifacts');
      expect(source).not.toContain('approvalArtifact:');
    }

    for (const forbiddenProductionGaMutationRoute of [
      '/api/production-ga/approval-requests',
      '/api/production-ga/manual-approvals',
    ]) {
      expect(productionGaRegistration).not.toContain(forbiddenProductionGaMutationRoute);
      expect(productionGaStatus).not.toContain(forbiddenProductionGaMutationRoute);
    }
  });

  it('lists MCP tools from the local read-only registry without invoking MCP', async () => {
    const { formatMcpToolsListOutput, listMcpToolsForCli } = await import('./m3b-readonly');
    const result = listMcpToolsForCli();
    const output = formatMcpToolsListOutput(result);

    expect(result.count).toBe(7);
    expect(result.tools.every((tool) => tool.actionMode === 'read')).toBe(true);
    expect(result.tools.every((tool) => tool.processBoundaryInvoked === false)).toBe(true);
    expect(output).toContain('Registry display only');
    expect(output).not.toContain('local-control');
  });

  it('shows one MCP tool without raw body or process state', async () => {
    const { formatMcpToolDetailOutput, getMcpToolForCli } = await import('./m3b-readonly');
    const result = getMcpToolForCli('codexhub.getPolicySummary');
    const output = formatMcpToolDetailOutput(result);

    expect(result.tool).toMatchObject({
      name: 'codexhub.getPolicySummary',
      actionMode: 'read',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    });
    expect(output).toContain('bodyStorage: hash-only');
    expect(output).not.toContain('stdout');
    expect(output).not.toContain('stderr');
  });

  it('shows policy backend and telemetry read-only status without creating authority or export', async () => {
    const {
      createPolicyBackendPlanForCli,
      formatPolicyBackendPlanOutput,
      formatPolicyBackendStatusOutput,
      formatTelemetryProjectionOutput,
      formatTelemetryStatusOutput,
      getPolicyBackendStatusForCli,
      getTelemetryStatusForCli,
      showTelemetryProjectionForCli,
    } = await import('./m3b-readonly');
    const policyStatus = await getPolicyBackendStatusForCli();
    const policyPlan = await createPolicyBackendPlanForCli({
      action: 'workspace.write',
      mode: 'write',
      risk: 'medium',
    });
    const telemetryStatus = getTelemetryStatusForCli();
    const telemetryProjection = showTelemetryProjectionForCli();
    const serialized = JSON.stringify({
      policyStatus,
      policyPlan,
      telemetryStatus,
      telemetryProjection,
    });

    expect(policyStatus.advisoryOnly).toBe(true);
    expect(policyStatus.processBoundaryInvoked).toBe(false);
    expect(policyPlan.actionMode).toBe('write');
    expect(policyPlan.advisoryOnly).toBe(true);
    expect(policyPlan.authorityCreated).toBe(false);
    expect(policyPlan.processBoundaryPlanned).toBe(false);
    expect(telemetryStatus.openTelemetrySdkLoaded).toBe(false);
    expect(telemetryStatus.networkExportAttempted).toBe(false);
    expect(telemetryStatus.evidenceAuditAuthoritative).toBe(false);
    expect(telemetryProjection.projection.networkExportAttempted).toBe(false);
    expect(telemetryProjection.projection.processBoundaryInvoked).toBe(false);
    expect(telemetryProjection.projection.evidenceAuditAuthoritative).toBe(false);
    expect(formatPolicyBackendStatusOutput(policyStatus)).toContain('advisoryOnly=true');
    expect(formatPolicyBackendPlanOutput(policyPlan)).toContain('authorityCreated=false');
    expect(formatTelemetryStatusOutput(telemetryStatus)).toContain('networkExportAttempted=false');
    expect(formatTelemetryProjectionOutput(telemetryProjection)).toContain(
      'evidenceAuditAuthoritative=false',
    );
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL');
    expect(serialized).not.toContain('.codexhub/policy-backend.fixture.json');
    expect(serialized).not.toContain('requestBody');
    expect(serialized).not.toContain('responseBody');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('cookie=');
    expect(serialized).not.toContain('session=');
  });

  it('applies shared forbidden raw-output checks to representative CLI summaries and rehearsals', async () => {
    const { formatMcpToolsListOutput, listMcpToolsForCli } = await import('./m3b-readonly');
    const { runReleaseLifecycleAcceptanceRehearsal } = await import(
      '@codexhub/release-lifecycle-kernel'
    );
    const {
      runDeploymentAcceptanceRehearsal,
      runDeploymentOperationAcceptanceRehearsal,
    } = await import('@codexhub/deployment-provider-adapter');
    const { runSecretGovernanceAcceptanceRehearsal } = await import(
      '@codexhub/secret-governance-kernel'
    );
    const {
      formatDeploymentAcceptanceRehearsalOutput,
      formatDeploymentOperationAcceptanceRehearsalOutput,
      formatGithubBranchPublishAcceptanceRehearsalOutput,
      formatGithubProviderStatusOutput,
      formatM10PilotAcceptanceRehearsalOutput,
      formatReleaseLifecycleAcceptanceRehearsalOutput,
      formatSecretGovernanceAcceptanceRehearsalOutput,
      getGithubProviderStatusForCli,
      runGithubBranchPublishAcceptanceRehearsalForCli,
      runM10PilotAcceptanceRehearsalForCli,
    } = await import('./main');
    const output = [
      formatMcpToolsListOutput(listMcpToolsForCli()),
      formatGithubProviderStatusOutput(getGithubProviderStatusForCli()),
      formatM10PilotAcceptanceRehearsalOutput(
        runM10PilotAcceptanceRehearsalForCli({ fixture: true, scenario: 'all-pass' }),
      ),
      formatGithubBranchPublishAcceptanceRehearsalOutput(
        runGithubBranchPublishAcceptanceRehearsalForCli({
          fixture: true,
          scenario: 'branch-exists',
        }),
      ),
      formatReleaseLifecycleAcceptanceRehearsalOutput(
        runReleaseLifecycleAcceptanceRehearsal({ scenario: 'tag-exists' }),
      ),
      formatDeploymentAcceptanceRehearsalOutput(
        runDeploymentAcceptanceRehearsal({
          provider: 'kubernetes',
          scenario: 'drift-detected',
        }),
      ),
      formatDeploymentOperationAcceptanceRehearsalOutput(
        runDeploymentOperationAcceptanceRehearsal({
          provider: 'helm',
          scenario: 'rollback-plan-missing',
        }),
      ),
      formatSecretGovernanceAcceptanceRehearsalOutput(
        runSecretGovernanceAcceptanceRehearsal({
          provider: 'vault',
          scenario: 'secret-value-rejected',
        }),
      ),
    ].join('\n');

    expect(output).toContain('Release lifecycle rehearsal');
    expect(output).toContain('Deployment observation rehearsal');
    expect(output).toContain('Deployment operation rehearsal');
    expect(output).toContain('Secrets governance rehearsal');
    expectNoForbiddenCliRawOutput(output);
    expect(output).not.toContain('local-control-secret');
    expect(output).not.toContain('Authorization');
  });

  it('keeps read-only CLI helpers away from local-control tokens, POST, and adapter execute calls', () => {
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const readOnlyHelperNames = [
      'runGoldenPathRehearsalForCli',
      'runM10PilotAcceptanceRehearsalForCli',
      'runM11PilotAcceptanceSmokeForCli',
      'runLocalRcAcceptanceRehearsalForCli',
      'runGithubDraftPrAcceptanceRehearsalForCli',
      'runGithubBranchPublishAcceptanceRehearsalForCli',
      'runGithubPublishDraftPrAcceptanceRehearsalForCli',
      'runGithubPrLifecycleAcceptanceRehearsalForCli',
      'runGithubMergeAcceptanceRehearsalForCli',
      'runGithubActionsAcceptanceRehearsalForCli',
      'runRemoteSupersedeAcceptanceRehearsalForCli',
      'runGithubRemoteCleanupAcceptanceRehearsalForCli',
      'runReworkLoopAcceptanceRehearsalForCli',
      'formatReleaseLifecycleAcceptanceRehearsalOutput',
      'formatDeploymentAcceptanceRehearsalOutput',
      'formatDeploymentOperationAcceptanceRehearsalOutput',
      'formatSecretGovernanceAcceptanceRehearsalOutput',
      'getGithubProviderStatusForCli',
      'createGithubRemoteTargetStatusForCli',
      'listCustomWorkflowCatalogForCli',
      'showCustomWorkflowCatalogEntryForCli',
      'getCustomWorkflowCatalogReadinessForCli',
      'listCustomWorkflowTemplatesForCli',
      'showCustomWorkflowTemplateForCli',
      'validateCustomWorkflowTemplateForCli',
      'rehearseCustomWorkflowForCli',
      'rehearseCustomWorkflowProductionForCli',
      'rehearseProductionWorkflowPilotForCli',
      'getLocalProductionWorkflowPilotReadinessForCli',
      'getProductionWorkflowOperationsStatusForCli',
      'getProductionWorkflowOperationsHistoryForCli',
      'runProductionWorkflowOperationsSmokeForCli',
      'rehearseProductionWorkflowRecoveryForCli',
    ];

    for (const helperName of readOnlyHelperNames) {
      const helperSource = extractFunctionSource(source, helperName);

      expect(helperSource, helperName).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
      expect(helperSource, helperName).not.toContain('createSupervisorPostHeaders');
      expect(helperSource, helperName).not.toContain('fetch(');
      expect(helperSource, helperName).not.toContain('process["env"]');
      expect(helperSource, helperName).not.toContain("process['env']");
      expect(helperSource, helperName).not.toContain("method: 'POST'");
      expect(helperSource, helperName).not.toContain('method: "POST"');
      expect(helperSource, helperName).not.toMatch(/\bexecute[A-Z][A-Za-z0-9_]*/);
    }
  });

  it('keeps operator smoke CLI list/show helpers GET-only and token-free', () => {
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const readOnlyGetHelperNames = [
      'listGovernanceRuns',
      'listGithubBranchPublishDryRuns',
      'listGithubBranchPublishApprovals',
      'listGithubBranchPublishRuns',
      'showGithubBranchPublishRun',
      'listGithubPrLifecycleDryRuns',
      'listGithubPrLifecycleApprovals',
      'listGithubPrLifecycleRuns',
      'showGithubPrLifecycleRun',
      'listGithubMergeDryRuns',
      'listGithubMergeApprovals',
      'listGithubMergeRuns',
      'showGithubMergeRun',
      'listGithubActionsObservationDryRuns',
      'listGithubActionsObservationApprovals',
      'listGithubActionsObservationRuns',
      'showGithubActionsObservationRun',
      'listGithubActionsRunControlDryRuns',
      'listGithubActionsRunControlApprovals',
      'listGithubActionsRunControlRuns',
      'listGithubActionsDispatchDryRuns',
      'listGithubActionsDispatchApprovals',
      'listGithubActionsDispatchRuns',
      'showGithubActionsDispatchRun',
      'listGithubRemoteCleanupDryRuns',
      'listGithubRemoteCleanupApprovals',
      'listGithubRemoteCleanupRuns',
      'showGithubRemoteCleanupRun',
      'listCustomWorkflowTemplatesForCli',
      'showCustomWorkflowTemplateForCli',
      'validateCustomWorkflowTemplateForCli',
      'rehearseCustomWorkflowForCli',
      'listApprovalDecisionHistory',
      'listProductionWorkflowRecoveryDryRuns',
      'listProductionWorkflowRecoveryApprovals',
      'listProductionWorkflowRecoveryRuns',
      'showProductionWorkflowRecoveryRun',
    ];

    for (const helperName of readOnlyGetHelperNames) {
      const helperSource = extractFunctionSource(source, helperName);

      expect(helperSource, helperName).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
      expect(helperSource, helperName).not.toContain('createSupervisorPostHeaders');
      expect(helperSource, helperName).not.toContain("method: 'POST'");
      expect(helperSource, helperName).not.toContain('method: "POST"');
      expect(helperSource, helperName).not.toContain('x-codexhub-local-token');
      expect(helperSource, helperName).not.toMatch(/\bexecute[A-Z][A-Za-z0-9_]*/);
      expect(helperSource, helperName).not.toContain('.execute(');
    }
  });

  it('formats custom workflow catalog metadata without raw output or write controls', async () => {
    const { createCustomWorkflowCatalog } = await import('@codexhub/workflow-kernel');
    const {
      formatCustomWorkflowCatalogDetailOutput,
      formatCustomWorkflowCatalogListOutput,
      formatCustomWorkflowCatalogReadinessOutput,
      formatCustomWorkflowRehearsalOutput,
      formatProductionWorkflowPilotRehearsalOutput,
      formatLocalProductionWorkflowPilotReadinessOutput,
      formatProductionWorkflowOperationsSmokeOutput,
      formatProductionWorkflowOperationsStatusOutput,
      formatProductionWorkflowRecoveryRehearsalOutput,
      rehearseCustomWorkflowProductionForCli,
      rehearseProductionWorkflowPilotForCli,
      getLocalProductionWorkflowPilotReadinessForCli,
      getProductionWorkflowOperationsStatusForCli,
      runProductionWorkflowOperationsSmokeForCli,
      rehearseProductionWorkflowRecoveryForCli,
    } = await import('./main');
    const catalog = createCustomWorkflowCatalog();
    const localPatch = catalog.entries.find((entry) => entry.templateId === 'local-patch-review');
    const readiness = catalog.readiness.find(
      (entry) => entry.templateId === 'local-patch-review',
    );
    const validation = catalog.validationSummaries.find(
      (entry) => entry.templateId === 'local-patch-review',
    );
    const listOutput = formatCustomWorkflowCatalogListOutput({
      records: catalog.entries,
      readiness: catalog.readiness,
      count: catalog.entries.length,
      readyCount: 0,
      blockedOrDisabledCount: catalog.entries.length,
      directAdapterExecutionAllowed: false,
      bodyStored: false,
      rawPathStored: false,
    });
    const detailOutput = formatCustomWorkflowCatalogDetailOutput({
      record: localPatch,
      readiness,
      validation,
      found: true,
      bodyStored: false,
      rawPathStored: false,
    });
    const readinessOutput = formatCustomWorkflowCatalogReadinessOutput({
      record: localPatch,
      readiness,
      found: true,
      bodyStored: false,
      rawPathStored: false,
    });
    const productionRehearsal = rehearseCustomWorkflowProductionForCli(
      'local-patch-review',
      'template-disabled',
    );
    const staleHashRehearsal = rehearseCustomWorkflowProductionForCli(
      'github-draft-pr-chain',
      'stale-template-hash',
    );
    const pilotRehearsal = rehearseProductionWorkflowPilotForCli(
      'github-draft-pr-chain',
      'remote-step-blocked',
    );
    const localPilotReadiness = getLocalProductionWorkflowPilotReadinessForCli();
    const operationsStatus = getProductionWorkflowOperationsStatusForCli();
    const operationsSmoke = runProductionWorkflowOperationsSmokeForCli(
      'local-patch-review',
      'rollback-required',
    );
    const recoveryRehearsal = rehearseProductionWorkflowRecoveryForCli(
      'github-draft-pr-chain',
      'child-approval-blocked',
    );
    const rehearsalOutput = formatCustomWorkflowRehearsalOutput(productionRehearsal);
    const pilotOutput = formatProductionWorkflowPilotRehearsalOutput(pilotRehearsal);
    const localPilotOutput =
      formatLocalProductionWorkflowPilotReadinessOutput(localPilotReadiness);
    const operationsOutput = formatProductionWorkflowOperationsStatusOutput(operationsStatus);
    const operationsSmokeOutput = formatProductionWorkflowOperationsSmokeOutput(operationsSmoke);
    const recoveryOutput =
      formatProductionWorkflowRecoveryRehearsalOutput(recoveryRehearsal);
    const serialized = [
      JSON.stringify(catalog),
      JSON.stringify({
        productionRehearsal,
        staleHashRehearsal,
        pilotRehearsal,
        localPilotReadiness,
        operationsStatus,
        operationsSmoke,
        recoveryRehearsal,
      }),
      listOutput,
      detailOutput,
      readinessOutput,
      rehearsalOutput,
      pilotOutput,
      localPilotOutput,
      operationsOutput,
      operationsSmokeOutput,
      recoveryOutput,
    ].join('\n');

    expect(listOutput).toContain('Custom workflow production catalog');
    expect(detailOutput).toContain('local-patch-review');
    expect(readinessOutput).toContain('status: disabled');
    expect(productionRehearsal).toMatchObject({
      found: true,
      productionRehearsal: true,
      fixtureOnly: true,
      directAdapterExecutionAllowed: false,
      supervisorPostAllowed: false,
    });
    expect((productionRehearsal.record as { scenario: string }).scenario).toBe('template-disabled');
    expect((staleHashRehearsal.record as { scenario: string }).scenario).toBe(
      'stale-template-hash',
    );
    expect(rehearsalOutput).toContain('scenario: template-disabled');
    expect(pilotRehearsal).toMatchObject({
      found: true,
      productionPilot: true,
      fixtureOnly: true,
      directAdapterExecutionAllowed: false,
      supervisorPostAllowed: false,
    });
    expect(pilotOutput).toContain('Production workflow pilot rehearsal');
    expect(pilotOutput).toContain('status: blocked');
    expect(localPilotOutput).toContain('Local production workflow pilot readiness');
    expect(localPilotOutput).toContain('localProductionPilotEnabled=false');
    expect(localPilotOutput).toContain('childRecordBindingRequired=true');
    expect(localPilotOutput).toContain('requestBodyChildStateTrusted=false');
    expect(operationsOutput).toContain('Production workflow operations status');
    expect(operationsSmokeOutput).toContain('Production workflow operations smoke');
    expect(recoveryOutput).toContain('Production workflow recovery rehearsal');
    expect(recoveryOutput).toContain('childApprovalsRemainSeparate=true');
    expect(serialized).toContain('directAdapterExecutionAllowed=false');
    expect(serialized).toContain('directChildExecutionAllowed=false');
    expectNoForbiddenCliRawOutput(serialized);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('diff --git');
  });

  it('creates an Nx verification dry-run summary without starting a process', async () => {
    const { createVerifyAffectedDryRunForCli, formatVerifyAffectedDryRunOutput } = await import(
      './m3b-readonly'
    );
    const result = createVerifyAffectedDryRunForCli({
      dryRun: true,
      targets: 'test,lint,test',
      base: 'main',
      head: 'HEAD',
    });
    const output = formatVerifyAffectedDryRunOutput(result);

    expect(result).toMatchObject({
      status: 'ready',
      targets: ['test', 'lint'],
      baseRef: 'main',
      headRef: 'HEAD',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
    });
    expect(output).toContain('cwdHash: sha256:');
    expect(JSON.stringify(result)).not.toContain(process.cwd());
  });

  it('rejects Nx verification planning unless dry-run is explicit', async () => {
    const { createVerifyAffectedDryRunForCli } = await import('./m3b-readonly');

    expect(() => createVerifyAffectedDryRunForCli({ targets: 'test' })).toThrow(
      'verify affected is dry-run only',
    );
  });

  it('blocks forbidden Nx verification dry-run inputs without invoking a process', async () => {
    const { createVerifyAffectedDryRunForCli } = await import('./m3b-readonly');
    const result = createVerifyAffectedDryRunForCli({
      dryRun: true,
      targets: 'lint,deploy',
      cwd: '..',
      requestedCommand: 'nx affected --target deploy',
      requestedArgs: ['--parallel=999'],
      shell: true,
    });

    expect(result.status).toBe('blocked');
    expect(result.processBoundaryInvoked).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.blockReasons).toEqual(
      expect.arrayContaining([
        'cwd_outside_allowlist',
        'target_forbidden',
        'arbitrary_command_forbidden',
        'arbitrary_args_forbidden',
        'shell_forbidden',
      ]),
    );
  });

  it('lists browser profile metadata without raw paths or process state', async () => {
    const { formatBrowserProfilesListOutput, listBrowserProfilesForCli } = await import(
      './m3b-readonly'
    );
    const result = listBrowserProfilesForCli();
    const output = formatBrowserProfilesListOutput(result);

    expect(result.profileCount).toBe(1);
    expect(result.profiles[0]?.profilePathHash).toMatch(/^sha256:/);
    expect(result.readiness.processBoundaryInvoked).toBe(false);
    expect(result.readiness.externalProcessStarted).toBe(false);
    expect(result.readiness.noRealWrite).toBe(true);
    expect(result.readiness.bodyStored).toBe(false);
    expect(output).not.toContain('codexhub-cli-browser-profile');
    expect(output).not.toContain('local-control');
  });

  it('creates browser observe dry-run plans and blocks browser act requests', async () => {
    const { createBrowserObserveDryRunForCli, formatBrowserObserveDryRunOutput } = await import(
      './m3b-readonly'
    );
    const ready = createBrowserObserveDryRunForCli({
      dryRun: true,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://127.0.0.1:4173',
      capabilities: 'title,url,console_summary',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
    });
    const blocked = createBrowserObserveDryRunForCli({
      dryRun: true,
      capabilities: 'title,storage_dump',
      requestedActions: 'click,type,cookie_extraction,token_extraction',
      screenshot: true,
      networkBody: true,
      bodyStorage: true,
    });
    const output = formatBrowserObserveDryRunOutput(ready);

    expect(ready.status).toBe('ready');
    expect(ready.profilePathHash).toMatch(/^sha256:/);
    expect(ready.runnerMode).toBe('controlled-local-browser');
    expect(ready.targetUrlHash).toMatch(/^sha256:/);
    expect(ready.processBoundaryPlanned).toBe(true);
    expect(ready.processBoundaryInvoked).toBe(false);
    expect(ready.externalProcessStarted).toBe(false);
    expect(ready.noRealWrite).toBe(true);
    expect(JSON.stringify(ready)).not.toContain('Chrome\\Default');
    expect(JSON.stringify(ready)).not.toContain('http://127.0.0.1:4173');
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockReasons).toEqual(
      expect.arrayContaining([
        'capability_forbidden',
        'screenshot_requires_approval',
        'network_body_forbidden',
        'forbidden_action_requested',
      ]),
    );
    expect(output).toContain('Browser observation dry-run');
  });

  it('rejects browser observation planning unless dry-run is explicit', async () => {
    const { createBrowserObserveDryRunForCli } = await import('./m3b-readonly');

    expect(() => createBrowserObserveDryRunForCli({ capabilities: 'title' })).toThrow(
      'browser observe is dry-run only',
    );
  });

  it('lists read-only runs using GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/workflows/runs')) {
        return new Response(
          JSON.stringify({
            runs: [{ id: 'workflow_1', workflowName: 'm3b.read_only', status: 'passed' }],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/development/mock-runs')) {
        return new Response(JSON.stringify({ runs: [] }), { status: 200 });
      }

      if (String(url).includes('/api/codex/exec/dry-runs')) {
        return new Response(JSON.stringify({ runs: [] }), { status: 200 });
      }

      if (String(url).includes('/api/browser/observation/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/electron-cdp/observation/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/github/metadata/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_metadata_run_1',
                dryRunId: 'github_metadata_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                existingPullRequestCount: 0,
                responseBodyHashes: ['sha256:repo-body'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_evidence_1'],
                auditEventIds: ['github_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/draft-prs/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_draft_pr_run_1',
                dryRunId: 'github_draft_pr_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                creationSummary: {
                  status: 'created',
                  created: true,
                  prNumberHash: 'sha256:pr-number',
                  prUrlHash: 'sha256:pr-url',
                  existingPullRequestCount: 0,
                },
                titleHash: 'sha256:title',
                bodyHash: 'sha256:body',
                bodySectionCount: 3,
                responseBodyHashes: ['sha256:post-response'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_draft_pr_evidence_1'],
                auditEventIds: ['github_draft_pr_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/branch-publishes/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_branch_publish_run_1',
                dryRunId: 'github_branch_publish_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-branch-publish',
                readinessStatus: 'ready_for_branch_publish',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:branch',
                },
                contentManifestHash: 'sha256:manifest',
                fileCount: 2,
                totalByteCount: 128,
                branchNameHash: 'sha256:branch',
                commitShaHash: 'sha256:commit',
                treeShaHash: 'sha256:tree',
                created: true,
                responseBodyHashes: ['sha256:repo-response', 'sha256:ref-response'],
                responseBodyHashCount: 2,
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                createRefAllowed: true,
                updateRefAllowed: false,
                forceAllowed: false,
                pushAllowed: false,
                mergeAllowed: false,
                rawFileContentStored: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_branch_publish_evidence_1'],
                auditEventIds: ['github_branch_publish_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/publish-draft-pr-chains/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_publish_draft_pr_chain_run_1',
                dryRunId: 'github_publish_draft_pr_chain_dry_run_1',
                status: 'completed',
                sourceKind: 'local_rc_readiness',
                sourceIdHash: 'sha256:source',
                branchPublishRunId: 'github_branch_publish_run_1',
                draftPrRunId: 'github_draft_pr_run_1',
                branchPublishStatus: 'completed',
                draftPrStatus: 'completed',
                lifecycleStatus: 'checks_passed',
                evidenceRefCount: 2,
                auditEventCount: 2,
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                rawPathStored: false,
                rawPrBodyStored: false,
                rawUrlStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/pr-lifecycle/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_pr_lifecycle_run_1',
                dryRunId: 'github_pr_lifecycle_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-pr-lifecycle',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                prNumberHash: 'sha256:pr-number',
                commitShaHash: 'sha256:commit',
                prStateSummary: 'open',
                combinedStatusState: 'success',
                statusContextCount: 2,
                checkRunCount: 3,
                responseBodyHashes: ['sha256:pr-response', 'sha256:checks-response'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                rawUrlStored: false,
                rawResponseBodyStored: false,
                rawPathStored: false,
                bodyStored: false,
                evidenceRefIds: ['github_pr_lifecycle_evidence_1'],
                auditEventIds: ['github_pr_lifecycle_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/cleanup/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/worktrees/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/review-packages/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/release-candidates/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/pilots/m11/local-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'm11_pilot_run_1',
                status: 'blocked',
                prDraftStatus: 'blocked',
                failureClassification: 'approval_blocked',
                evidenceRefIds: ['evidence_m11_1'],
                auditEventIds: ['audit_m11_1'],
                codexReadOnlyDryRunOnly: true,
                patchGenerationAllowed: false,
                pushAllowed: false,
                pullRequestOpened: false,
                rawPathStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });
    const { formatReadOnlyRunsListOutput, listReadOnlyRuns, showReadOnlyRun } = await import(
      './main'
    );
    const result = await listReadOnlyRuns();
    const detail = await showReadOnlyRun('workflow_1');
    const output = formatReadOnlyRunsListOutput(result);

    expect(result).toMatchObject({
      status: 'ready',
      count: 9,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
    });
    expect(detail.status).toBe('found');
    expect(output).toContain('workflow_1');
    expect(output).toContain('github_metadata_run_1');
    expect(output).toContain('github_draft_pr_run_1');
    expect(output).toContain('github_branch_publish_run_1');
    expect(output).toContain('github_publish_draft_pr_chain_run_1');
    expect(output).toContain('github_pr_lifecycle_run_1');
    expect(output).toContain('m11_pilot_run_1');
    expect(output).toContain('policy_backend_projection_local');
    expect(output).toContain('telemetry_projection_local');
    expect(fetchCalls).toHaveLength(38);
    expect(fetchCalls.some((call) => call.url.includes('/api/workflows/custom/runs'))).toBe(
      true,
    );
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
  });

  it('shows GitHub provider metadata using read-only status and GET endpoints', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/github/metadata/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_metadata_dry_run_record_1',
                dryRunId: 'github_metadata_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                requestedMetadata: ['repository', 'base_branch', 'head_branch'],
                networkBoundaryPlanned: true,
                networkBoundaryInvoked: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/github/metadata/runs/github_metadata_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'github_metadata_run_1',
            dryRunId: 'github_metadata_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-github-http',
            targetRef: {
              hostHash: 'sha256:host',
              ownerHash: 'sha256:owner',
              repoHash: 'sha256:repo',
              baseBranchHash: 'sha256:base',
              headBranchHash: 'sha256:head',
              rawOwnerStored: false,
              rawRepoStored: false,
              rawRefStored: false,
              rawUrlStored: false,
              rawPathStored: false,
              bodyStored: false,
            },
            repoMetadataHash: 'sha256:repo-metadata',
            baseBranchMetadataHash: 'sha256:base-metadata',
            headBranchMetadataHash: 'sha256:head-metadata',
            existingPullRequestCount: 0,
            responseBodyHashes: ['sha256:repo-response'],
            networkBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: true,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['github_evidence_1'],
            auditEventIds: ['github_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/metadata/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_metadata_run_1',
                dryRunId: 'github_metadata_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                existingPullRequestCount: 0,
                responseBodyHashes: ['sha256:repo-response'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_evidence_1'],
                auditEventIds: ['github_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatGithubMetadataDryRunsListOutput,
      formatGithubMetadataRunDetailOutput,
      formatGithubMetadataRunsListOutput,
      formatGithubProviderStatusOutput,
      createGithubRemoteTargetStatusForCli,
      getGithubProviderStatusForCli,
      listGithubMetadataDryRuns,
      listGithubMetadataRuns,
      showGithubMetadataRun,
    } = await import('./main');
    const status = getGithubProviderStatusForCli();
    const target = createGithubRemoteTargetStatusForCli(
      'https://github.com/two2wolf1-eng/CodexHub.git',
    );
    const dryRuns = await listGithubMetadataDryRuns();
    const runs = await listGithubMetadataRuns();
    const detail = await showGithubMetadataRun('github_metadata_run_1');
    const serialized = JSON.stringify({ status, target, dryRuns, runs, detail });
    const output = [
      formatGithubProviderStatusOutput(status),
      formatGithubMetadataDryRunsListOutput(dryRuns),
      formatGithubMetadataRunsListOutput(runs),
      formatGithubMetadataRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('GitHub provider status');
    expect(output).toContain('targetRemoteUrlHash');
    expect(target.localRemoteConfigured).toBe(true);
    expect(target.localRemoteMatchesTarget).toBe(true);
    expect(output).toContain('github_metadata_run_1');
    expect(output).toContain('networkBoundaryInvoked=true');
    expect(fetchCalls).toHaveLength(3);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('two2wolf1-eng');
    expect(serialized).not.toContain('CodexHub.git');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw remote response');
    expect(serialized).not.toContain('local-control');
  });

  it('shows GitHub draft PR metadata using GET endpoints only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/github/draft-prs/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_draft_pr_dry_run_record_1',
                dryRunId: 'github_draft_pr_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                readiness: {
                  status: 'ready_for_draft_pr',
                  blockerCount: 0,
                  draftOnly: true,
                },
                titleHash: 'sha256:title',
                bodyHash: 'sha256:body',
                bodySectionCount: 3,
                networkBoundaryPlanned: true,
                networkBoundaryInvoked: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/draft-prs/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                approvalArtifactId: 'github_draft_pr_approval_1',
                dryRunId: 'github_draft_pr_dry_run_1',
                status: 'approved',
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/github/draft-prs/runs/github_draft_pr_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'github_draft_pr_run_1',
            dryRunId: 'github_draft_pr_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-github-http',
            targetRef: {
              hostHash: 'sha256:host',
              ownerHash: 'sha256:owner',
              repoHash: 'sha256:repo',
              baseBranchHash: 'sha256:base',
              headBranchHash: 'sha256:head',
              rawOwnerStored: false,
              rawRepoStored: false,
              rawRefStored: false,
              rawUrlStored: false,
              rawPathStored: false,
              bodyStored: false,
            },
            creationSummary: {
              status: 'created',
              created: true,
              prNumberHash: 'sha256:pr-number',
              prUrlHash: 'sha256:pr-url',
              existingPullRequestCount: 0,
            },
            titleHash: 'sha256:title',
            bodyHash: 'sha256:body',
            bodySectionCount: 3,
            responseBodyHashes: ['sha256:post-response'],
            networkBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: false,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['github_draft_pr_evidence_1'],
            auditEventIds: ['github_draft_pr_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/draft-prs/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_draft_pr_run_1',
                dryRunId: 'github_draft_pr_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-http',
                targetRef: {
                  hostHash: 'sha256:host',
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                creationSummary: {
                  status: 'created',
                  created: true,
                  prNumberHash: 'sha256:pr-number',
                  prUrlHash: 'sha256:pr-url',
                  existingPullRequestCount: 0,
                },
                titleHash: 'sha256:title',
                bodyHash: 'sha256:body',
                bodySectionCount: 3,
                responseBodyHashes: ['sha256:post-response'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_draft_pr_evidence_1'],
                auditEventIds: ['github_draft_pr_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatGithubDraftPrApprovalsListOutput,
      formatGithubDraftPrAcceptanceRehearsalOutput,
      formatGithubDraftPrDryRunsListOutput,
      formatGithubDraftPrRunDetailOutput,
      formatGithubDraftPrRunsListOutput,
      listGithubDraftPrApprovals,
      listGithubDraftPrDryRuns,
      listGithubDraftPrRuns,
      runGithubDraftPrAcceptanceRehearsalForCli,
      showGithubDraftPrRun,
    } = await import('./main');
    const dryRuns = await listGithubDraftPrDryRuns();
    const approvals = await listGithubDraftPrApprovals();
    const runs = await listGithubDraftPrRuns();
    const detail = await showGithubDraftPrRun('github_draft_pr_run_1');
    const serialized = JSON.stringify({ dryRuns, approvals, runs, detail });
    const output = [
      formatGithubDraftPrDryRunsListOutput(dryRuns),
      formatGithubDraftPrApprovalsListOutput(approvals),
      formatGithubDraftPrRunsListOutput(runs),
      formatGithubDraftPrRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('GitHub draft PR runs');
    expect(output).toContain('github_draft_pr_run_1');
    expect(output).toContain('networkBoundaryInvoked=true');
    expect(output).toContain('prNumberHash');
    expect(fetchCalls).toHaveLength(4);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw response body');
    expect(serialized).not.toContain('local-control');

    const rehearsal = runGithubDraftPrAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'head-branch-missing',
    });
    const rehearsalOutput = formatGithubDraftPrAcceptanceRehearsalOutput(rehearsal);
    const rehearsalJson = JSON.stringify(rehearsal);

    expect(rehearsal.status).toBe('blocked');
    expect(rehearsal.readinessStatus).toBe('blocked_head_branch');
    expect(rehearsal.networkBoundaryInvoked).toBe(false);
    expect(rehearsalOutput).toContain('GitHub draft PR acceptance rehearsal');
    expect(rehearsalOutput).toContain('pushAllowed=false');
    expect(() => runGithubDraftPrAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(4);
    expect(rehearsalJson).not.toContain('octocat');
    expect(rehearsalJson).not.toContain('hello-world');
    expect(rehearsalJson).not.toContain('ghp_');
    expect(rehearsalJson).not.toContain('Authorization');
  });

  it('shows GitHub branch publish metadata using GET endpoints only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/github/branch-publishes/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_branch_publish_dry_run_record_1',
                dryRunId: 'github_branch_publish_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-github-branch-publish',
                readinessStatus: 'ready_for_branch_publish',
                sourceKind: 'local_rc_readiness',
                sourceIdHash: 'sha256:source',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:branch',
                },
                contentManifestHash: 'sha256:manifest',
                fileCount: 2,
                totalByteCount: 128,
                networkBoundaryInvoked: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                createRefAllowed: true,
                updateRefAllowed: false,
                forceAllowed: false,
                pushAllowed: false,
                mergeAllowed: false,
                rawFileContentStored: false,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/branch-publishes/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                approvalArtifactId: 'github_branch_publish_approval_1',
                dryRunId: 'github_branch_publish_dry_run_1',
                status: 'approved',
                runnerMode: 'controlled-github-branch-publish',
                readinessStatus: 'ready_for_branch_publish',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:branch',
                },
                contentManifestHash: 'sha256:manifest',
                fileCount: 2,
                totalByteCount: 128,
                networkBoundaryInvoked: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                createRefAllowed: true,
                updateRefAllowed: false,
                forceAllowed: false,
                pushAllowed: false,
                mergeAllowed: false,
                rawFileContentStored: false,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/github/branch-publishes/runs/github_branch_publish_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'github_branch_publish_run_1',
            dryRunId: 'github_branch_publish_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-github-branch-publish',
            readinessStatus: 'ready_for_branch_publish',
            sourceKind: 'local_rc_readiness',
            sourceIdHash: 'sha256:source',
            targetRef: {
              ownerHash: 'sha256:owner',
              repoHash: 'sha256:repo',
              baseBranchHash: 'sha256:base',
              headBranchHash: 'sha256:branch',
            },
            contentManifestHash: 'sha256:manifest',
            fileCount: 2,
            totalByteCount: 128,
            branchNameHash: 'sha256:branch',
            commitShaHash: 'sha256:commit',
            treeShaHash: 'sha256:tree',
            created: true,
            responseBodyHashes: ['sha256:repo-response', 'sha256:ref-response'],
            responseBodyHashCount: 2,
            networkBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: false,
            createRefAllowed: true,
            updateRefAllowed: false,
            forceAllowed: false,
            pushAllowed: false,
            mergeAllowed: false,
            rawFileContentStored: false,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['github_branch_publish_evidence_1'],
            auditEventIds: ['github_branch_publish_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/branch-publishes/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_branch_publish_run_1',
                dryRunId: 'github_branch_publish_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-branch-publish',
                readinessStatus: 'ready_for_branch_publish',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:branch',
                },
                contentManifestHash: 'sha256:manifest',
                fileCount: 2,
                totalByteCount: 128,
                branchNameHash: 'sha256:branch',
                commitShaHash: 'sha256:commit',
                treeShaHash: 'sha256:tree',
                created: true,
                responseBodyHashes: ['sha256:repo-response', 'sha256:ref-response'],
                responseBodyHashCount: 2,
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                createRefAllowed: true,
                updateRefAllowed: false,
                forceAllowed: false,
                pushAllowed: false,
                mergeAllowed: false,
                rawFileContentStored: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['github_branch_publish_evidence_1'],
                auditEventIds: ['github_branch_publish_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatGithubBranchPublishApprovalsListOutput,
      formatGithubBranchPublishAcceptanceRehearsalOutput,
      formatGithubBranchPublishDryRunsListOutput,
      formatGithubBranchPublishRunDetailOutput,
      formatGithubBranchPublishRunsListOutput,
      listGithubBranchPublishApprovals,
      listGithubBranchPublishDryRuns,
      listGithubBranchPublishRuns,
      runGithubBranchPublishAcceptanceRehearsalForCli,
      showGithubBranchPublishRun,
    } = await import('./main');
    const dryRuns = await listGithubBranchPublishDryRuns();
    const approvals = await listGithubBranchPublishApprovals();
    const runs = await listGithubBranchPublishRuns();
    const detail = await showGithubBranchPublishRun('github_branch_publish_run_1');
    const serialized = JSON.stringify({ dryRuns, approvals, runs, detail });
    const output = [
      formatGithubBranchPublishDryRunsListOutput(dryRuns),
      formatGithubBranchPublishApprovalsListOutput(approvals),
      formatGithubBranchPublishRunsListOutput(runs),
      formatGithubBranchPublishRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('GitHub branch publish runs');
    expect(output).toContain('github_branch_publish_run_1');
    expect(output).toContain('networkBoundaryInvoked=true');
    expect(output).toContain('commitShaHash');
    expect(fetchCalls).toHaveLength(4);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw file content');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('local-control');

    const rehearsal = runGithubBranchPublishAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'branch-exists',
    });
    const rehearsalOutput = formatGithubBranchPublishAcceptanceRehearsalOutput(rehearsal);
    const rehearsalJson = JSON.stringify(rehearsal);

    expect(rehearsal.status).toBe('blocked');
    expect(rehearsal.readinessStatus).toBe('blocked_existing_branch');
    expect(rehearsal.networkBoundaryInvoked).toBe(false);
    expect(rehearsalOutput).toContain('GitHub branch publish acceptance rehearsal');
    expect(rehearsalOutput).toContain('pushAllowed=false');
    expect(rehearsalOutput).toContain('createRefAllowed=true');
    expect(() => runGithubBranchPublishAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(4);
    expect(rehearsalJson).not.toContain('octocat');
    expect(rehearsalJson).not.toContain('hello-world');
    expect(rehearsalJson).not.toContain('ghp_');
    expect(rehearsalJson).not.toContain('Authorization');
  });

  it('shows GitHub publish to draft PR chain metadata using GET endpoints only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/github/publish-draft-pr-chains/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_publish_draft_pr_chain_dry_run_record_1',
                dryRunId: 'github_publish_draft_pr_chain_dry_run_1',
                status: 'planned',
                sourceKind: 'local_rc_readiness',
                sourceIdHash: 'sha256:source',
                branchPublishDryRunId: 'github_branch_publish_dry_run_1',
                draftPrDryRunId: 'github_draft_pr_dry_run_1',
                rawPathStored: false,
                rawPrBodyStored: false,
                rawUrlStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (
        String(url).endsWith(
          '/api/github/publish-draft-pr-chains/runs/github_publish_draft_pr_chain_run_1',
        )
      ) {
        return new Response(
          JSON.stringify({
            runId: 'github_publish_draft_pr_chain_run_1',
            dryRunId: 'github_publish_draft_pr_chain_dry_run_1',
            status: 'completed',
            sourceKind: 'local_rc_readiness',
            sourceIdHash: 'sha256:source',
            branchPublishRunId: 'github_branch_publish_run_1',
            draftPrRunId: 'github_draft_pr_run_1',
            branchPublishStatus: 'completed',
            draftPrStatus: 'completed',
            lifecycleStatus: 'checks_passed',
            evidenceRefCount: 2,
            auditEventCount: 2,
            networkBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: false,
            rawPathStored: false,
            rawPrBodyStored: false,
            rawUrlStored: false,
            bodyStored: false,
            summary: 'metadata-only chain run',
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/publish-draft-pr-chains/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_publish_draft_pr_chain_run_1',
                dryRunId: 'github_publish_draft_pr_chain_dry_run_1',
                status: 'completed',
                sourceKind: 'local_rc_readiness',
                sourceIdHash: 'sha256:source',
                branchPublishRunId: 'github_branch_publish_run_1',
                draftPrRunId: 'github_draft_pr_run_1',
                branchPublishStatus: 'completed',
                draftPrStatus: 'completed',
                lifecycleStatus: 'checks_passed',
                evidenceRefCount: 2,
                auditEventCount: 2,
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                rawPathStored: false,
                rawPrBodyStored: false,
                rawUrlStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatGithubPublishDraftPrAcceptanceRehearsalOutput,
      formatGithubPublishDraftPrChainDryRunsListOutput,
      formatGithubPublishDraftPrChainRunDetailOutput,
      formatGithubPublishDraftPrChainRunsListOutput,
      listGithubPublishDraftPrChainDryRuns,
      listGithubPublishDraftPrChainRuns,
      runGithubPublishDraftPrAcceptanceRehearsalForCli,
      showGithubPublishDraftPrChainRun,
    } = await import('./main');
    const dryRuns = await listGithubPublishDraftPrChainDryRuns();
    const runs = await listGithubPublishDraftPrChainRuns();
    const detail = await showGithubPublishDraftPrChainRun(
      'github_publish_draft_pr_chain_run_1',
    );
    const serialized = JSON.stringify({ dryRuns, runs, detail });
    const output = [
      formatGithubPublishDraftPrChainDryRunsListOutput(dryRuns),
      formatGithubPublishDraftPrChainRunsListOutput(runs),
      formatGithubPublishDraftPrChainRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('GitHub publish to draft PR chain runs');
    expect(output).toContain('github_publish_draft_pr_chain_run_1');
    expect(output).toContain('networkBoundaryInvoked=true');
    expect(output).toContain('lifecycleStatus=checks_passed');
    expect(fetchCalls).toHaveLength(3);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('local-control');

    const rehearsal = runGithubPublishDraftPrAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'checks-failed',
    });
    const rehearsalOutput = formatGithubPublishDraftPrAcceptanceRehearsalOutput(rehearsal);

    expect(rehearsal.status).toBe('failed');
    expect(rehearsal.lifecycleStatus).toBe('checks_failed');
    expect(rehearsal.networkBoundaryInvoked).toBe(false);
    expect(rehearsalOutput).toContain('GitHub publish to draft PR acceptance rehearsal');
    expect(rehearsalOutput).toContain('pushAllowed=false');
    expect(rehearsalOutput).toContain('updateRefAllowed=false');
    expect(() => runGithubPublishDraftPrAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(3);
  });

  it('shows GitHub PR lifecycle metadata using GET endpoints only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/github/pr-lifecycle/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_pr_lifecycle_dry_run_record_1',
                dryRunId: 'github_pr_lifecycle_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-github-pr-lifecycle',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                  rawOwnerStored: false,
                  rawRepoStored: false,
                  rawRefStored: false,
                  rawUrlStored: false,
                  rawPathStored: false,
                  bodyStored: false,
                },
                requestedMetadata: ['pr', 'branch_ref', 'combined_status', 'check_runs'],
                networkBoundaryPlanned: true,
                networkBoundaryInvoked: false,
                rawUrlStored: false,
                rawResponseBodyStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/pr-lifecycle/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'github_pr_lifecycle_approval_record_1',
                dryRunId: 'github_pr_lifecycle_dry_run_1',
                approvalArtifactId: 'github_pr_lifecycle_approval_1',
                status: 'approved',
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/github/pr-lifecycle/runs/github_pr_lifecycle_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'github_pr_lifecycle_run_1',
            dryRunId: 'github_pr_lifecycle_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-github-pr-lifecycle',
            targetRef: {
              ownerHash: 'sha256:owner',
              repoHash: 'sha256:repo',
              baseBranchHash: 'sha256:base',
              headBranchHash: 'sha256:head',
            },
            prNumberHash: 'sha256:pr-number',
            commitShaHash: 'sha256:commit',
            prStateSummary: 'open',
            combinedStatusState: 'success',
            statusContextCount: 2,
            checkRunCount: 3,
            responseBodyHashes: ['sha256:pr-response'],
            networkBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: true,
            rawUrlStored: false,
            rawResponseBodyStored: false,
            bodyStored: false,
            rawPathStored: false,
            summary: 'metadata-only lifecycle run',
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/github/pr-lifecycle/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'github_pr_lifecycle_run_1',
                dryRunId: 'github_pr_lifecycle_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-github-pr-lifecycle',
                targetRef: {
                  ownerHash: 'sha256:owner',
                  repoHash: 'sha256:repo',
                  baseBranchHash: 'sha256:base',
                  headBranchHash: 'sha256:head',
                },
                prNumberHash: 'sha256:pr-number',
                commitShaHash: 'sha256:commit',
                prStateSummary: 'open',
                combinedStatusState: 'success',
                statusContextCount: 2,
                checkRunCount: 3,
                responseBodyHashes: ['sha256:pr-response'],
                networkBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                rawUrlStored: false,
                rawResponseBodyStored: false,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatGithubPrLifecycleAcceptanceRehearsalOutput,
      formatGithubPrLifecycleApprovalsListOutput,
      formatGithubPrLifecycleDryRunsListOutput,
      formatGithubPrLifecycleRunDetailOutput,
      formatGithubPrLifecycleRunsListOutput,
      listGithubPrLifecycleApprovals,
      listGithubPrLifecycleDryRuns,
      listGithubPrLifecycleRuns,
      runGithubPrLifecycleAcceptanceRehearsalForCli,
      showGithubPrLifecycleRun,
    } = await import('./main');
    const dryRuns = await listGithubPrLifecycleDryRuns();
    const approvals = await listGithubPrLifecycleApprovals();
    const runs = await listGithubPrLifecycleRuns();
    const detail = await showGithubPrLifecycleRun('github_pr_lifecycle_run_1');
    const serialized = JSON.stringify({ dryRuns, approvals, runs, detail });
    const output = [
      formatGithubPrLifecycleDryRunsListOutput(dryRuns),
      formatGithubPrLifecycleApprovalsListOutput(approvals),
      formatGithubPrLifecycleRunsListOutput(runs),
      formatGithubPrLifecycleRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('GitHub PR lifecycle runs');
    expect(output).toContain('github_pr_lifecycle_run_1');
    expect(output).toContain('networkBoundaryInvoked=true');
    expect(output).toContain('combinedStatus=success');
    expect(fetchCalls).toHaveLength(4);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('check logs');
    expect(serialized).not.toContain('local-control');

    const rehearsal = runGithubPrLifecycleAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'checks-failed',
    });
    const rehearsalOutput = formatGithubPrLifecycleAcceptanceRehearsalOutput(rehearsal);

    expect(rehearsal.status).toBe('failed');
    expect(rehearsal.lifecycleStatus).toBe('checks_failed');
    expect(rehearsal.networkBoundaryInvoked).toBe(false);
    expect(rehearsalOutput).toContain('GitHub PR lifecycle acceptance rehearsal');
    expect(rehearsalOutput).toContain('rawResponseBodyStored=false');
    expect(() => runGithubPrLifecycleAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(4);
  });

  it('shows rework loop metadata using GET endpoints only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/rework-loops/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'rework_loop_dry_run_record_1',
                dryRunId: 'rework_loop_dry_run_1',
                status: 'planned',
                triggerKind: 'checks_failed',
                sourceRunIdHash: 'sha256:source-run',
                plannedBranchNameHash: 'sha256:branch',
                attemptCount: 1,
                childApprovalsRequired: true,
                directChildExecutionAllowed: false,
                rawDiffStored: false,
                rawPrBodyStored: false,
                rawReasonStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/rework-loops/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'rework_loop_approval_record_1',
                dryRunId: 'rework_loop_dry_run_1',
                approvalArtifactId: 'rework_loop_approval_1',
                status: 'approved',
                childApprovalsRequired: true,
                directChildExecutionAllowed: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/rework-loops/runs/rework_loop_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'rework_loop_run_1',
            dryRunId: 'rework_loop_dry_run_1',
            status: 'completed',
            triggerKind: 'checks_failed',
            sourceRunIdHash: 'sha256:source-run',
            sourcePackageIdHash: 'sha256:package',
            plannedBranchNameHash: 'sha256:branch',
            attemptCount: 2,
            childApprovalsRequired: true,
            directChildExecutionAllowed: false,
            patchExecuted: false,
            branchPublished: false,
            draftPrCreated: false,
            networkBoundaryInvoked: false,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: true,
            rawDiffStored: false,
            rawPrBodyStored: false,
            rawReasonStored: false,
            rawPathStored: false,
            bodyStored: false,
            evidenceRefIds: ['evidence_rework_1'],
            auditEventIds: ['audit_rework_1'],
            summary: 'metadata-only rework projection',
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/rework-loops/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'rework_loop_run_1',
                dryRunId: 'rework_loop_dry_run_1',
                status: 'completed',
                triggerKind: 'checks_failed',
                sourceRunIdHash: 'sha256:source-run',
                plannedBranchNameHash: 'sha256:branch',
                attemptCount: 2,
                childApprovalsRequired: true,
                directChildExecutionAllowed: false,
                patchExecuted: false,
                branchPublished: false,
                draftPrCreated: false,
                networkBoundaryInvoked: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                rawDiffStored: false,
                rawPrBodyStored: false,
                rawReasonStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      formatReworkLoopAcceptanceRehearsalOutput,
      formatReworkLoopApprovalsListOutput,
      formatReworkLoopDryRunsListOutput,
      formatReworkLoopRunDetailOutput,
      formatReworkLoopRunsListOutput,
      listReworkLoopApprovals,
      listReworkLoopDryRuns,
      listReworkLoopRuns,
      runReworkLoopAcceptanceRehearsalForCli,
      showReworkLoopRun,
    } = await import('./main');
    const dryRuns = await listReworkLoopDryRuns();
    const approvals = await listReworkLoopApprovals();
    const runs = await listReworkLoopRuns();
    const detail = await showReworkLoopRun('rework_loop_run_1');
    const serialized = JSON.stringify({ dryRuns, approvals, runs, detail });
    const output = [
      formatReworkLoopDryRunsListOutput(dryRuns),
      formatReworkLoopApprovalsListOutput(approvals),
      formatReworkLoopRunsListOutput(runs),
      formatReworkLoopRunDetailOutput(detail),
    ].join('\n');

    expect(output).toContain('Rework loop runs');
    expect(output).toContain('rework_loop_run_1');
    expect(output).toContain('directChildExecutionAllowed=false');
    expect(output).toContain('patchExecuted=false');
    expect(output).toContain('branchPublished=false');
    expect(output).toContain('draftPrCreated=false');
    expect(fetchCalls).toHaveLength(4);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL');
    expect(serialized).not.toContain('local-control');

    const rehearsal = runReworkLoopAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'branch-publish-failed',
    });
    const rehearsalOutput = formatReworkLoopAcceptanceRehearsalOutput(rehearsal);

    expect(rehearsal.status).toBe('failed');
    expect(rehearsal.childApprovalsRequired).toBe(true);
    expect(rehearsal.directChildExecutionAllowed).toBe(false);
    expect(rehearsal.networkBoundaryInvoked).toBe(false);
    expect(rehearsalOutput).toContain('Rework loop acceptance rehearsal');
    expect(rehearsalOutput).toContain('rawReasonStored=false');
    expect(() => runReworkLoopAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(4);
  });

  it('projects unified governance runs, evidence bundles, and audit chains read-only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/workflows/runs')) {
        return new Response(
          JSON.stringify({
            runs: [
              {
                id: 'workflow_1',
                schemaVersion: '2026-04-28.foundation',
                createdAt: '2026-04-28T00:00:00.000Z',
                workflowName: 'm8b.projection',
                status: 'completed',
                dryRun: true,
                evidenceRefs: [],
                steps: [],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/development/mock-runs')) {
        return new Response(JSON.stringify({ runs: [] }), { status: 200 });
      }

      if (String(url).includes('/api/codex/exec/dry-runs')) {
        return new Response(JSON.stringify({ runs: [] }), { status: 200 });
      }

      if (String(url).includes('/api/browser/observation/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/electron-cdp/observation/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/worktrees/cleanup/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/worktrees/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      if (String(url).includes('/api/review-packages/runs')) {
        return new Response(JSON.stringify({ records: [] }), { status: 200 });
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });
    const {
      formatGovernanceAuditChainOutput,
      formatGovernanceEvidenceBundleOutput,
      formatGovernanceRunDetailOutput,
      formatGovernanceRunsListOutput,
      getGovernanceAuditChain,
      getGovernanceEvidenceBundle,
      listGovernanceRuns,
      showGovernanceRun,
    } = await import('./main');
    const list = await listGovernanceRuns({ source: 'orchestrator' });
    const projection = (list.projections as Array<{ id: string }>)[0];
    const detail = await showGovernanceRun(projection?.id ?? 'missing');
    const evidenceBundle = await getGovernanceEvidenceBundle(projection?.id ?? 'missing');
    const auditChain = await getGovernanceAuditChain(projection?.id ?? 'missing');
    const serialized = JSON.stringify({ list, detail, evidenceBundle, auditChain });

    expect(list.count).toBe(1);
    expect(formatGovernanceRunsListOutput(list)).toContain('CodexHub unified governance runs');
    expect(formatGovernanceRunDetailOutput(detail)).toContain('source: orchestrator');
    expect(formatGovernanceEvidenceBundleOutput(evidenceBundle)).toContain('bodyStored=false');
    expect(formatGovernanceAuditChainOutput(auditChain)).toContain('rawPathStored=false');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('local-control');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
  });

  it('reports operator readiness without POST, local-control key reads, or raw config output', async () => {
    const {
      formatOperatorIntegrationReadinessOutput,
      formatOperatorReadinessReportOutput,
      getOperatorIntegrationReadinessForCli,
      getOperatorReadinessReportForCli,
    } = await import('./main');
    const report = await getOperatorReadinessReportForCli();
    const integration = await getOperatorIntegrationReadinessForCli('worktree-manager');
    const githubIntegration = await getOperatorIntegrationReadinessForCli('github-provider');
    const customWorkflowIntegration = await getOperatorIntegrationReadinessForCli(
      'custom-workflow-production',
    );
    const serialized = JSON.stringify({
      report,
      integration,
      githubIntegration,
      customWorkflowIntegration,
    });

    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.integrations.some((item) => item.name === 'github-provider')).toBe(true);
    expect(report.integrations.some((item) => item.name === 'custom-workflow-production')).toBe(
      true,
    );
    expect(JSON.stringify(githubIntegration)).toContain('github_remote_base_branch_not_observed');
    expect(JSON.stringify(customWorkflowIntegration)).toContain(
      'custom_workflow_production_execution_disabled',
    );
    expect(report.configHashes.every((config) => config.bodyStored === false)).toBe(true);
    expect(formatOperatorReadinessReportOutput(report)).toContain('CodexHub operator readiness');
    expect(formatOperatorIntegrationReadinessOutput(integration)).toContain(
      'CodexHub integration readiness',
    );
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('requestBody');
    expect(serialized).not.toContain('responseBody');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('shows M10 pilot checklist and runbook as read-only operator metadata', async () => {
    const {
      formatM10PilotChecklistOutput,
      formatM10PilotRunbookOutput,
      getM10PilotChecklistForCli,
      getM10PilotRunbookForCli,
    } = await import('./main');
    const checklist = await getM10PilotChecklistForCli();
    const runbook = await getM10PilotRunbookForCli();
    const output = [
      formatM10PilotChecklistOutput(checklist),
      formatM10PilotRunbookOutput(runbook),
    ].join('\n');
    const serialized = JSON.stringify({ checklist, runbook });

    expect(checklist.steps.length).toBeGreaterThan(0);
    expect(checklist.localControlKeyRead).toBe(false);
    expect(checklist.supervisorPostAllowed).toBe(false);
    expect(checklist.adapterExecuteAllowed).toBe(false);
    expect(runbook.localControlKeyRead).toBe(false);
    expect(runbook.supervisorPostAllowed).toBe(false);
    expect(runbook.adapterExecuteAllowed).toBe(false);
    expect(output).toContain('CodexHub M10 pilot checklist');
    expect(output).toContain('CodexHub M10 pilot runbook');
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
  });

  it('keeps M10 operator pilot CLI helpers local and non-mutating', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('M10 operator pilot CLI helpers must not call Supervisor');
    });
    const {
      getM10PilotChecklistForCli,
      getM10PilotRunbookForCli,
      runM10PilotAcceptanceRehearsalForCli,
    } = await import('./main');
    const checklist = await getM10PilotChecklistForCli();
    const runbook = await getM10PilotRunbookForCli();
    const rehearsal = runM10PilotAcceptanceRehearsalForCli({ fixture: true });
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const m10Source = source.slice(
      source.indexOf("const pilotM10Command = pilotCommand"),
      source.indexOf("const rehearsalCommand = program"),
    );

    expect(checklist.supervisorPostAllowed).toBe(false);
    expect(runbook.supervisorPostAllowed).toBe(false);
    expect(rehearsal.supervisorPostAllowed).toBe(false);
    expect(rehearsal.adapterExecuteAllowed).toBe(false);
    expect(m10Source).not.toContain('.execute(');
    expect(m10Source).not.toContain("method: 'POST'");
    expect(m10Source).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(m10Source).not.toContain('x-codexhub-local-token');
  });

  it('reads M11 pilot metadata through GET-only CLI helpers', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/pilots/m11/local-runs/m11_pilot_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'm11_pilot_run_1',
            status: 'blocked',
            readinessStatus: 'blocked',
            readinessBlockers: ['worktree_approval_artifact_id_required'],
            prDraftStatus: 'blocked',
            failureClassification: 'approval_blocked',
            recovery: {
              recoveryAction: 'request_worktree_approval',
              cleanupRequired: false,
              cleanupDeferred: false,
              cleanupCompleted: false,
              cleanupApprovalStatus: 'not_requested',
              rawPathStored: false,
              bodyStored: false,
            },
            evidenceRefIds: ['evidence_m11_1'],
            auditEventIds: ['audit_m11_1'],
            codexReadOnlyDryRunOnly: true,
            patchGenerationAllowed: false,
            pushAllowed: false,
            pullRequestOpened: false,
            rawPathStored: false,
            bodyStored: false,
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/pilots/m11/local-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'm11_pilot_run_1',
                status: 'blocked',
                readinessStatus: 'blocked',
                readinessBlockers: ['worktree_approval_artifact_id_required'],
                prDraftStatus: 'blocked',
                failureClassification: 'approval_blocked',
                recovery: {
                  recoveryAction: 'request_worktree_approval',
                  cleanupRequired: false,
                  cleanupDeferred: false,
                  cleanupCompleted: false,
                  cleanupApprovalStatus: 'not_requested',
                  rawPathStored: false,
                  bodyStored: false,
                },
                evidenceRefIds: ['evidence_m11_1'],
                auditEventIds: ['audit_m11_1'],
                codexReadOnlyDryRunOnly: true,
                patchGenerationAllowed: false,
                pushAllowed: false,
                pullRequestOpened: false,
                rawPathStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });
    const {
      formatM11PilotReadinessOutput,
      formatM11PilotRunShowOutput,
      formatM11PilotRunsListOutput,
      getM11PilotEnablementChecklistForCli,
      getM11PilotReadinessForCli,
      listM11PilotRunsForCli,
      showM11PilotRunForCli,
    } = await import('./main');
    const readiness = await getM11PilotReadinessForCli();
    const checklist = await getM11PilotEnablementChecklistForCli();
    const runs = await listM11PilotRunsForCli();
    const detail = await showM11PilotRunForCli('m11_pilot_run_1');
    const output = [
      formatM11PilotReadinessOutput(readiness),
      formatM11PilotRunsListOutput(runs),
      formatM11PilotRunShowOutput(detail),
    ].join('\n');
    const serialized = JSON.stringify({ readiness, checklist, runs, detail });
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const m11CommandSource = source.slice(
      source.indexOf("const pilotM11Command = pilotCommand"),
      source.indexOf("const rehearsalCommand = program"),
    );

    expect(readiness).toMatchObject({
      status: 'blocked',
      runSourceStatus: 'ready',
      enablementStatus: 'blocked',
      latestPrDraftStatus: 'blocked',
      latestFailureClassification: 'approval_blocked',
      latestRecoveryAction: 'request_worktree_approval',
      latestCleanupApprovalStatus: 'not_requested',
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      rawPathStored: false,
      bodyStored: false,
    });
    expect(checklist.requiredEnvFlags).toContain('CODEXHUB_M11_PRODUCTION_PILOT_ENABLED');
    expect(checklist.safeEnableBlockers).toContain('m11_pilot_not_safe_to_enable');
    expect((runs.records as unknown[])).toHaveLength(1);
    expect(detail.status).toBe('found');
    expect(output).toContain('CodexHub M11 pilot readiness');
    expect(output).toContain('recovery: request_worktree_approval');
    expect(output).toContain('cleanupApproval: not_requested');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(m11CommandSource).not.toContain('.execute(');
    expect(m11CommandSource).not.toContain("method: 'POST'");
    expect(m11CommandSource).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(m11CommandSource).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('local-control-secret');
  });

  it('runs the golden path rehearsal as fixture-only metadata', async () => {
    const {
      formatGoldenPathRehearsalOutput,
      runGoldenPathRehearsalForCli,
    } = await import('./main');
    const passed = runGoldenPathRehearsalForCli({ fixture: true, scenario: 'all-pass' });
    const failed = runGoldenPathRehearsalForCli({ fixture: true, scenario: 'nx-failed' });
    const serialized = JSON.stringify({ passed, failed });

    expect(passed.status).toBe('passed');
    expect(passed.prDraftStatus).toBe('ready');
    expect(failed.status).toBe('failed');
    expect(failed.prDraftStatus).toBe('blocked');
    expect(formatGoldenPathRehearsalOutput(passed)).toContain('CodexHub golden path rehearsal');
    expect(() => runGoldenPathRehearsalForCli({ fixture: false })).toThrow();
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('runs the M10 pilot acceptance rehearsal as fixture-only metadata', async () => {
    const {
      formatM10PilotAcceptanceRehearsalOutput,
      runM10PilotAcceptanceRehearsalForCli,
    } = await import('./main');
    const passed = runM10PilotAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'all-pass',
    });
    const readinessBlocked = runM10PilotAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'readiness-blocked',
    });
    const nxFailed = runM10PilotAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'nx-failed',
    });
    const serialized = JSON.stringify({ passed, readinessBlocked, nxFailed });

    expect(passed.status).toBe('passed');
    expect(passed.prActionStatus).toBe('not_ready_no_live_pr');
    expect(readinessBlocked.status).toBe('blocked');
    expect(nxFailed.status).toBe('failed');
    expect(nxFailed.prActionStatus).toBe('blocked');
    expect(formatM10PilotAcceptanceRehearsalOutput(passed)).toContain(
      'CodexHub M10 pilot acceptance rehearsal',
    );
    expect(() => runM10PilotAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('cookie=');
    expect(serialized).not.toContain('session=');
    expect(serialized).not.toContain('C:\\');
  });

  it('runs the M11 pilot acceptance smoke as fixture-only metadata', async () => {
    const {
      formatM11PilotAcceptanceSmokeOutput,
      runM11PilotAcceptanceSmokeForCli,
    } = await import('./main');
    const passed = runM11PilotAcceptanceSmokeForCli({
      fixture: true,
      scenario: 'all-pass',
    });
    const readinessBlocked = runM11PilotAcceptanceSmokeForCli({
      fixture: true,
      scenario: 'readiness-blocked',
    });
    const nxFailed = runM11PilotAcceptanceSmokeForCli({
      fixture: true,
      scenario: 'nx-failed',
    });
    const serialized = JSON.stringify({ passed, readinessBlocked, nxFailed });
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const m11CommandSource = source.slice(
      source.indexOf("const pilotM11Command = pilotCommand"),
      source.indexOf("const rehearsalCommand = program"),
    );

    expect(passed.status).toBe('passed');
    expect(passed.prDraftStatus).toBe('not_ready_no_patch');
    expect(readinessBlocked.status).toBe('blocked');
    expect(nxFailed.status).toBe('failed');
    expect(nxFailed.prDraftStatus).toBe('blocked');
    expect(formatM11PilotAcceptanceSmokeOutput(passed)).toContain(
      'CodexHub M11 pilot acceptance smoke',
    );
    expect(() => runM11PilotAcceptanceSmokeForCli({ fixture: false })).toThrow();
    expect(m11CommandSource).not.toContain('.execute(');
    expect(m11CommandSource).not.toContain("method: 'POST'");
    expect(m11CommandSource).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(m11CommandSource).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('cookie=');
    expect(serialized).not.toContain('session=');
    expect(serialized).not.toContain('C:\\');
  });

  it('runs the local RC acceptance rehearsal as fixture-only metadata', async () => {
    const {
      formatLocalRcAcceptanceRehearsalOutput,
      runLocalRcAcceptanceRehearsalForCli,
    } = await import('./main');
    const passed = runLocalRcAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'all-pass',
    });
    const reviewBlocked = runLocalRcAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'review-blocked',
    });
    const exportBlocked = runLocalRcAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'export-blocked',
    });
    const serialized = JSON.stringify({ passed, reviewBlocked, exportBlocked });
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const releaseCandidateCommandSource = source.slice(
      source.indexOf("const releaseCandidatesCommand = program"),
      source.indexOf("program\n    .command('workflow')"),
    );

    expect(passed.status).toBe('passed');
    expect(passed.operatorAcceptanceStatus).toBe('accepted');
    expect(reviewBlocked.status).toBe('blocked');
    expect(reviewBlocked.operatorAcceptanceStatus).toBe('not_ready');
    expect(exportBlocked.exportSummaryStatus).toBe('blocked');
    expect(passed.artifactWriteBoundaryInvoked).toBe(false);
    expect(formatLocalRcAcceptanceRehearsalOutput(passed)).toContain(
      'CodexHub local RC acceptance rehearsal',
    );
    expect(() => runLocalRcAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(releaseCandidateCommandSource).not.toContain('.execute(');
    expect(releaseCandidateCommandSource).not.toContain("method: 'POST'");
    expect(releaseCandidateCommandSource).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(releaseCandidateCommandSource).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('rawPullRequestBody');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('token=');
    expect(serialized).not.toContain('cookie');
  });

  it('reads local release candidate metadata with GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/release-candidates/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'rc_dry_run_record_1',
                dryRunId: 'rc_dry_run_1',
                status: 'planned',
                readinessStatus: 'ready_for_local_acceptance',
                reviewDecisionStatus: 'approved_for_local_rc',
                verificationStatus: 'passed',
                rcBundleHash: 'sha256:rc-bundle',
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/release-candidates/runs/rc_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'rc_run_1',
            dryRunId: 'rc_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-local-artifact-export',
            readinessStatus: 'ready_for_local_acceptance',
            reviewDecisionStatus: 'approved_for_local_rc',
            verificationStatus: 'passed',
            rcBundleHash: 'sha256:rc-bundle',
            artifactDirectoryHash: 'sha256:artifact-dir',
            fileCount: 2,
            byteCount: 512,
            artifactWriteBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: true,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['evidence_rc_1'],
            auditEventIds: ['audit_rc_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/release-candidates/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'rc_run_1',
                dryRunId: 'rc_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-local-artifact-export',
                readinessStatus: 'ready_for_local_acceptance',
                reviewDecisionStatus: 'approved_for_local_rc',
                verificationStatus: 'passed',
                rcBundleHash: 'sha256:rc-bundle',
                artifactDirectoryHash: 'sha256:artifact-dir',
                fileCount: 2,
                byteCount: 512,
                artifactWriteBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['evidence_rc_1'],
                auditEventIds: ['audit_rc_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    });
    const {
      formatReleaseCandidateReadinessOutput,
      formatReleaseCandidateRunDetailOutput,
      formatReleaseCandidateRunsListOutput,
      getReleaseCandidateReadiness,
      listReleaseCandidateRuns,
      showReleaseCandidateRun,
    } = await import('./main');
    const readiness = await getReleaseCandidateReadiness();
    const runs = await listReleaseCandidateRuns();
    const detail = await showReleaseCandidateRun('rc_run_1');
    const source = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const releaseCandidateCommandSource = source.slice(
      source.indexOf("const releaseCandidatesCommand = program"),
      source.indexOf("program\n    .command('workflow')"),
    );
    const serialized = JSON.stringify({ readiness, runs, detail });

    expect(readiness.latestReadinessStatus).toBe('ready_for_local_acceptance');
    expect((runs.records as unknown[]).length).toBe(1);
    expect(detail.status).toBe('found');
    expect(formatReleaseCandidateReadinessOutput(readiness)).toContain(
      'Local release candidate readiness',
    );
    expect(formatReleaseCandidateRunsListOutput(runs)).toContain('Local release candidate runs');
    expect(formatReleaseCandidateRunDetailOutput(detail)).toContain('Local release candidate run');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(releaseCandidateCommandSource).not.toContain('.execute(');
    expect(releaseCandidateCommandSource).not.toContain("method: 'POST'");
    expect(releaseCandidateCommandSource).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(releaseCandidateCommandSource).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw PR');
    expect(serialized).not.toContain('token=');
    expect(serialized).not.toContain('cookie=');
  });

  it('lists Electron CDP observation metadata using GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/electron-cdp/observation/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'electron_dry_run_record_1',
                dryRunId: 'electron_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-websocket-events',
                endpointIdHash: 'sha256:endpoint',
                targetIdHash: 'sha256:target',
                cdpHttpBoundaryPlanned: true,
                cdpWebSocketBoundaryPlanned: true,
                noRealWrite: true,
                bodyStored: false,
                rawPathStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/electron-cdp/observation/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'electron_approval_record_1',
                dryRunId: 'electron_dry_run_1',
                approvalArtifactId: 'electron_approval_1',
                status: 'approved',
                cdpHttpBoundaryInvoked: false,
                cdpWebSocketBoundaryInvoked: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/electron-cdp/observation/runs/electron_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'electron_run_1',
            dryRunId: 'electron_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-websocket-events',
            endpointIdHash: 'sha256:endpoint',
            targetIdHash: 'sha256:target',
            evidenceRefIds: ['evidence_1'],
            auditEventIds: ['audit_1'],
            eventSummary: {
              eventCount: 3,
              consoleEventCount: 1,
              networkEventCount: 2,
            },
            cdpHttpBoundaryInvoked: true,
            cdpWebSocketBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: true,
            bodyStored: false,
            rawPathStored: false,
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          records: [
            {
              runId: 'electron_run_1',
              dryRunId: 'electron_dry_run_1',
              status: 'completed',
              runnerMode: 'controlled-websocket-events',
              endpointIdHash: 'sha256:endpoint',
              targetIdHash: 'sha256:target',
              evidenceRefIds: ['evidence_1'],
              auditEventIds: ['audit_1'],
              eventSummary: {
                eventCount: 3,
                consoleEventCount: 1,
                networkEventCount: 2,
              },
              cdpHttpBoundaryInvoked: true,
              cdpWebSocketBoundaryInvoked: true,
              processBoundaryInvoked: false,
              externalProcessStarted: false,
              noRealWrite: true,
              bodyStored: false,
              rawPathStored: false,
            },
          ],
        }),
        { status: 200 },
      );
    });
    const {
      formatElectronCdpObservationApprovalsListOutput,
      formatElectronCdpObservationDryRunsListOutput,
      formatElectronCdpObservationRunDetailOutput,
      formatElectronCdpObservationRunsListOutput,
      formatReadOnlyRunsListOutput,
      listElectronCdpObservationApprovals,
      listElectronCdpObservationDryRuns,
      listElectronCdpObservationRuns,
      listReadOnlyRuns,
      showElectronCdpObservationRun,
    } = await import('./main');
    const dryRuns = await listElectronCdpObservationDryRuns();
    const approvals = await listElectronCdpObservationApprovals({
      dryRunId: 'electron_dry_run_1',
      status: 'approved',
    });
    const runs = await listElectronCdpObservationRuns();
    const detail = await showElectronCdpObservationRun('electron_run_1');
    const genericRuns = await listReadOnlyRuns();
    const serialized = JSON.stringify({ dryRuns, approvals, runs, detail, genericRuns });

    expect(formatElectronCdpObservationDryRunsListOutput(dryRuns)).toContain(
      'Electron/CDP observation dry-runs',
    );
    expect(formatElectronCdpObservationApprovalsListOutput(approvals)).toContain(
      'electron_approval_1',
    );
    expect(formatElectronCdpObservationRunsListOutput(runs)).toContain('electron_run_1');
    expect(formatElectronCdpObservationRunDetailOutput(detail)).toContain(
      'cdpWebSocketBoundaryInvoked=true',
    );
    expect(formatReadOnlyRunsListOutput(genericRuns)).toContain('electron_run_1');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('127.0.0.1');
    expect(serialized).not.toContain('9222');
    expect(serialized).not.toContain('Codex Desktop');
    expect(serialized).not.toContain('app://');
    expect(serialized).not.toContain('payload');
  });

  it('lists worktree create and cleanup metadata using GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/worktrees/cleanup/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'worktree_cleanup_dry_run_record_1',
                dryRunId: 'worktree_cleanup_dry_run_1',
                sourceRunId: 'worktree_run_1',
                status: 'ready',
                operationMode: 'cleanup',
                worktreePathHash: 'sha256:worktree',
                rawPathStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/cleanup/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'worktree_cleanup_approval_record_1',
                dryRunId: 'worktree_cleanup_dry_run_1',
                approvalArtifactId: 'worktree_cleanup_approval_1',
                status: 'approved',
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/worktrees/cleanup/runs/worktree_cleanup_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'worktree_cleanup_run_1',
            dryRunId: 'worktree_cleanup_dry_run_1',
            sourceRunId: 'worktree_run_1',
            status: 'completed',
            operationMode: 'cleanup',
            worktreePathHash: 'sha256:worktree',
            cleanupCompleted: true,
            cleanupRequired: false,
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['cleanup_evidence_1'],
            auditEventIds: ['cleanup_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/cleanup/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'worktree_cleanup_run_1',
                dryRunId: 'worktree_cleanup_dry_run_1',
                sourceRunId: 'worktree_run_1',
                status: 'completed',
                operationMode: 'cleanup',
                worktreePathHash: 'sha256:worktree',
                cleanupCompleted: true,
                cleanupRequired: false,
                gitProcessBoundaryInvoked: true,
                processBoundaryInvoked: true,
                externalProcessStarted: true,
                noRealWrite: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['cleanup_evidence_1'],
                auditEventIds: ['cleanup_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'worktree_dry_run_record_1',
                dryRunId: 'worktree_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-git-worktree',
                operationMode: 'create',
                worktreePathHash: 'sha256:worktree',
                baseRefHash: 'sha256:base',
                branchSlugHash: 'sha256:slug',
                gitProcessBoundaryPlanned: true,
                rawPathStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'worktree_approval_record_1',
                dryRunId: 'worktree_dry_run_1',
                approvalArtifactId: 'worktree_approval_1',
                status: 'approved',
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/worktrees/runs/worktree_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'worktree_run_1',
            dryRunId: 'worktree_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-git-worktree',
            operationMode: 'create',
            worktreePathHash: 'sha256:worktree',
            baseRefHash: 'sha256:base',
            branchSlugHash: 'sha256:slug',
            changedFileCount: 2,
            diffHash: 'sha256:diff',
            cleanupRequired: true,
            cleanupDeferred: true,
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            bodyStored: false,
            rawPathStored: false,
            evidenceRefIds: ['worktree_evidence_1'],
            auditEventIds: ['worktree_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/worktrees/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'worktree_run_1',
                dryRunId: 'worktree_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-git-worktree',
                operationMode: 'create',
                worktreePathHash: 'sha256:worktree',
                baseRefHash: 'sha256:base',
                branchSlugHash: 'sha256:slug',
                changedFileCount: 2,
                diffHash: 'sha256:diff',
                cleanupRequired: true,
                cleanupDeferred: true,
                gitProcessBoundaryInvoked: true,
                processBoundaryInvoked: true,
                externalProcessStarted: true,
                noRealWrite: false,
                bodyStored: false,
                rawPathStored: false,
                evidenceRefIds: ['worktree_evidence_1'],
                auditEventIds: ['worktree_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    });
    const {
      formatReadOnlyRunsListOutput,
      formatWorktreeApprovalsListOutput,
      formatWorktreeCleanupApprovalsListOutput,
      formatWorktreeCleanupDryRunsListOutput,
      formatWorktreeCleanupRunDetailOutput,
      formatWorktreeCleanupRunsListOutput,
      formatWorktreeDryRunsListOutput,
      formatWorktreeRunDetailOutput,
      formatWorktreeRunsListOutput,
      listReadOnlyRuns,
      listWorktreeApprovals,
      listWorktreeCleanupApprovals,
      listWorktreeCleanupDryRuns,
      listWorktreeCleanupRuns,
      listWorktreeDryRuns,
      listWorktreeRuns,
      showWorktreeCleanupRun,
      showWorktreeRun,
    } = await import('./main');
    const dryRuns = await listWorktreeDryRuns();
    const approvals = await listWorktreeApprovals({
      dryRunId: 'worktree_dry_run_1',
      status: 'approved',
    });
    const runs = await listWorktreeRuns();
    const detail = await showWorktreeRun('worktree_run_1');
    const cleanupDryRuns = await listWorktreeCleanupDryRuns();
    const cleanupApprovals = await listWorktreeCleanupApprovals({
      dryRunId: 'worktree_cleanup_dry_run_1',
      status: 'approved',
    });
    const cleanupRuns = await listWorktreeCleanupRuns();
    const cleanupDetail = await showWorktreeCleanupRun('worktree_cleanup_run_1');
    const genericRuns = await listReadOnlyRuns();
    const serialized = JSON.stringify({
      dryRuns,
      approvals,
      runs,
      detail,
      cleanupDryRuns,
      cleanupApprovals,
      cleanupRuns,
      cleanupDetail,
      genericRuns,
    });

    expect(formatWorktreeDryRunsListOutput(dryRuns)).toContain('Worktree dry-runs');
    expect(formatWorktreeApprovalsListOutput(approvals)).toContain('worktree_approval_1');
    expect(formatWorktreeRunsListOutput(runs)).toContain('worktree_run_1');
    expect(formatWorktreeRunDetailOutput(detail)).toContain('gitProcessBoundaryInvoked=true');
    expect(formatWorktreeCleanupDryRunsListOutput(cleanupDryRuns)).toContain(
      'Worktree cleanup dry-runs',
    );
    expect(formatWorktreeCleanupApprovalsListOutput(cleanupApprovals)).toContain(
      'worktree_cleanup_approval_1',
    );
    expect(formatWorktreeCleanupRunsListOutput(cleanupRuns)).toContain(
      'worktree_cleanup_run_1',
    );
    expect(formatWorktreeCleanupRunDetailOutput(cleanupDetail)).toContain(
      'cleanupCompleted=true',
    );
    expect(formatReadOnlyRunsListOutput(genericRuns)).toContain('worktree_run_1');
    expect(formatReadOnlyRunsListOutput(genericRuns)).toContain('worktree_cleanup_run_1');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('../CodexHub-worktrees');
    expect(serialized).not.toContain('git worktree');
    expect(serialized).not.toContain('diff --numstat');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('lists local review package metadata using GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/review-packages/dry-runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'review_package_dry_run_record_1',
                dryRunId: 'review_package_dry_run_1',
                status: 'ready',
                runnerMode: 'controlled-local-artifact-export',
                reviewPackageIdHash: 'sha256:review-package',
                packageHash: 'sha256:package',
                artifactDirectoryHash: 'sha256:artifact-dir',
                verificationStatus: 'passed',
                decisionStatus: 'pending',
                rawPathStored: false,
                bodyStored: false,
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/review-packages/approvals')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                recordId: 'review_package_approval_record_1',
                dryRunId: 'review_package_dry_run_1',
                approvalArtifactId: 'review_package_approval_1',
                status: 'approved',
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (String(url).endsWith('/api/review-packages/runs/review_package_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'review_package_run_1',
            dryRunId: 'review_package_dry_run_1',
            status: 'completed',
            runnerMode: 'controlled-local-artifact-export',
            reviewPackageIdHash: 'sha256:review-package',
            packageHash: 'sha256:package',
            artifactDirectoryHash: 'sha256:artifact-dir',
            fileCount: 2,
            byteCount: 512,
            contentHash: 'sha256:content',
            verificationStatus: 'passed',
            decisionStatus: 'pending',
            exported: true,
            artifactWriteBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            noRealWrite: false,
            rawPathStored: false,
            bodyStored: false,
            evidenceRefIds: ['review_package_evidence_1'],
            auditEventIds: ['review_package_audit_1'],
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/review-packages/runs')) {
        return new Response(
          JSON.stringify({
            records: [
              {
                runId: 'review_package_run_1',
                dryRunId: 'review_package_dry_run_1',
                status: 'completed',
                runnerMode: 'controlled-local-artifact-export',
                reviewPackageIdHash: 'sha256:review-package',
                packageHash: 'sha256:package',
                artifactDirectoryHash: 'sha256:artifact-dir',
                fileCount: 2,
                byteCount: 512,
                contentHash: 'sha256:content',
                verificationStatus: 'passed',
                decisionStatus: 'pending',
                exported: true,
                artifactWriteBoundaryInvoked: true,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: false,
                rawPathStored: false,
                bodyStored: false,
                evidenceRefIds: ['review_package_evidence_1'],
                auditEventIds: ['review_package_audit_1'],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    });
    const {
      formatReadOnlyRunsListOutput,
      formatReviewPackageDecisionsListOutput,
      formatReviewPackageDryRunsListOutput,
      formatReviewPackageRunDetailOutput,
      formatReviewPackageRunsListOutput,
      listReadOnlyRuns,
      listReviewPackageDecisions,
      listReviewPackageDryRuns,
      listReviewPackageRuns,
      showReviewPackageRun,
    } = await import('./main');
    const dryRuns = await listReviewPackageDryRuns();
    const runs = await listReviewPackageRuns();
    const detail = await showReviewPackageRun('review_package_run_1');
    const decisions = await listReviewPackageDecisions();
    const genericRuns = await listReadOnlyRuns();
    const serialized = JSON.stringify({ dryRuns, runs, detail, decisions, genericRuns });

    expect(formatReviewPackageDryRunsListOutput(dryRuns)).toContain(
      'Local review package dry-runs',
    );
    expect(formatReviewPackageRunsListOutput(runs)).toContain('review_package_run_1');
    expect(formatReviewPackageRunDetailOutput(detail)).toContain(
      'artifactWriteBoundaryInvoked=true',
    );
    expect(formatReviewPackageDecisionsListOutput(decisions)).toContain(
      'Local review package decisions',
    );
    expect(formatReadOnlyRunsListOutput(genericRuns)).toContain('review_package_run_1');
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw PR');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('reads approval inbox and records decisions only through Supervisor approval routes', async () => {
    const fetchCalls: Array<{ url: unknown; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: unknown, init?: RequestInit) => {
      fetchCalls.push({ url, init });

      if (String(url).includes('/api/approvals/inbox')) {
        return new Response(
          JSON.stringify({
            id: 'approval_inbox_projection_1',
            schemaVersion: '1.0.0',
            createdAt: '2026-05-04T00:00:00.000Z',
            items: [
              {
                id: 'approval_inbox_item_1',
                schemaVersion: '1.0.0',
                createdAt: '2026-05-04T00:00:00.000Z',
                approvalType: 'worktree',
                approvalRequestId: 'worktree_approval_request_1',
                status: 'requested',
                targetHash: 'sha256:target',
                evidenceRefIds: ['evidence_1'],
                auditEventIds: ['audit_1'],
                canApprove: true,
                canDeny: true,
                canRevoke: false,
                processBoundaryInvoked: false,
                externalProcessStarted: false,
                noRealWrite: true,
                rawPathStored: false,
                bodyStored: false,
                tokenStored: false,
                summary: 'Worktree approval pending.',
              },
            ],
            itemCount: 1,
            requestedCount: 1,
            approvedCount: 0,
            terminalCount: 0,
            typeBreakdown: { worktree: 1 },
            rawPathStored: false,
            bodyStored: false,
            tokenStored: false,
            summary: 'Approval inbox ready.',
          }),
          { status: 200 },
        );
      }

      if (String(url).includes('/api/approvals/decisions')) {
        return new Response(
          JSON.stringify({
            id: 'approval_decision_result_1',
            schemaVersion: '1.0.0',
            createdAt: '2026-05-04T00:00:00.000Z',
            approvalRequestId: 'worktree_approval_request_1',
            approvalType: 'worktree',
            decision: 'approved',
            status: 'approved',
            approved: true,
            evidenceRefIds: ['evidence_1'],
            auditEventIds: ['audit_1'],
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            rawPathStored: false,
            bodyStored: false,
            tokenStored: false,
            summary: 'Approval decision recorded.',
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
    });
    const {
      decideApproval,
      formatApprovalDecisionOutput,
      formatApprovalDecisionHistoryOutput,
      formatApprovalInboxOutput,
      listApprovalDecisionHistory,
      listApprovalInbox,
    } = await import('./main');
    const inbox = await listApprovalInbox({ type: 'worktree' });
    const history = await listApprovalDecisionHistory({ type: 'worktree', status: 'requested' });
    const decision = await decideApproval('worktree_approval_request_1', {
      type: 'worktree',
      decision: 'approved',
      reason: 'Reviewed evidence',
    });
    const serialized = JSON.stringify({ inbox, history, decision });

    expect(formatApprovalInboxOutput(inbox)).toContain('Approval inbox');
    expect(formatApprovalDecisionHistoryOutput(history)).toContain('Approval decision history');
    expect(formatApprovalDecisionHistoryOutput(history)).toContain('status=requested');
    expect(formatApprovalDecisionOutput(decision)).toContain('status: approved');
    expect(fetchCalls[0]?.init?.method).toBeUndefined();
    expect(fetchCalls[1]?.init?.method).toBeUndefined();
    expect(fetchCalls[2]?.init?.method).toBe('POST');
    expect(JSON.stringify(fetchCalls.map((call) => call.url))).not.toContain(
      process.env.CODEXHUB_SUPERVISOR_LOCAL_TOKEN,
    );
    expect(fetchCalls.every((call) => !String(call.url).includes('adapter'))).toBe(true);
    expect(fetchCalls.every((call) => !String(call.url).includes('execute'))).toBe(true);
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('lists browser observation runs using GET requests only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).endsWith('/api/browser/observation/runs/browser_run_1')) {
        return new Response(
          JSON.stringify({
            runId: 'browser_run_1',
            dryRunId: 'browser_dry_run_1',
            status: 'completed',
            evidenceRefIds: ['evidence_1'],
            auditEventIds: ['audit_1'],
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: true,
            bodyStored: false,
            rawPathStored: false,
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          records: [
            {
              runId: 'browser_run_1',
              dryRunId: 'browser_dry_run_1',
              status: 'completed',
              evidenceRefIds: ['evidence_1'],
              auditEventIds: ['audit_1'],
              processBoundaryInvoked: true,
              externalProcessStarted: true,
              noRealWrite: true,
              bodyStored: false,
              rawPathStored: false,
            },
          ],
        }),
        { status: 200 },
      );
    });
    const {
      formatBrowserObservationRunDetailOutput,
      formatBrowserObservationRunsListOutput,
      listBrowserObservationRuns,
      showBrowserObservationRun,
    } = await import('./main');
    const list = await listBrowserObservationRuns();
    const detail = await showBrowserObservationRun('browser_run_1');
    const listOutput = formatBrowserObservationRunsListOutput(list);
    const detailOutput = formatBrowserObservationRunDetailOutput(detail);

    expect(list).toMatchObject({
      status: 'ready',
      count: 1,
      liveExecution: false,
      noRealWrite: true,
    });
    expect(detail).toMatchObject({ status: 'found' });
    expect(listOutput).toContain('browser_run_1');
    expect(detailOutput).toContain('processBoundaryInvoked=true');
    expect(fetchCalls).toHaveLength(2);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(JSON.stringify({ list, detail })).not.toContain('http://');
    expect(JSON.stringify({ list, detail })).not.toContain('Chrome');
  });

  it('top-level evidence helpers remain GET-only and metadata-only', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });

      if (String(url).includes('/api/codex/exec/evidence/evidence_1')) {
        return new Response(
          JSON.stringify({
            detail: {
              status: 'found',
              evidenceRefId: 'evidence_1',
              kind: 'mcp.tool_manifest',
              hash: 'sha256:abc',
              summary: 'metadata only',
            },
            liveExecution: false,
            externalProcessStarted: false,
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          result: {
            count: 1,
            items: [
              {
                evidenceRefId: 'evidence_1',
                kind: 'mcp.tool_manifest',
                hash: 'sha256:abc',
              },
            ],
          },
          liveExecution: false,
          externalProcessStarted: false,
        }),
        { status: 200 },
      );
    });
    const {
      formatCodexExecDetailOutput,
      formatCodexExecEvidenceListOutput,
      getCodexExecEvidence,
      listCodexExecEvidence,
    } = await import('./main');
    const list = await listCodexExecEvidence({ kind: 'mcp.tool_manifest' });
    const detail = await getCodexExecEvidence('evidence_1');
    const listOutput = formatCodexExecEvidenceListOutput(list);
    const detailOutput = formatCodexExecDetailOutput('Evidence detail', detail);

    expect(listOutput).toContain('evidence_1');
    expect(detailOutput).toContain('sha256:abc');
    expect(fetchCalls).toHaveLength(2);
    expect(fetchCalls.every((call) => call.init?.method === undefined)).toBe(true);
    expect(JSON.stringify({ list, detail })).not.toContain('body');
  });

  afterEach(() => {
    rmSync(cliSymlinkEscapeAbsolutePath, { force: true });
    vi.unstubAllGlobals();
  });

  it('does not create mutating fallback records when the local control token is missing', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    delete process.env.CODEXHUB_SUPERVISOR_LOCAL_TOKEN;
    const { dryRunWorkflow } = await import('./main');

    await expect(dryRunWorkflow('development.bootstrap')).rejects.toThrow(
      'CODEXHUB_SUPERVISOR_LOCAL_TOKEN is required',
    );
  });

  it('falls back to local mock orchestration when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { mockRunDevelopment } = await import('./main');
    const result = await mockRunDevelopment(
      'Add Electron CDP read-only observation skeleton',
      'Create interfaces and tests only',
    );

    expect(result.summary).toMatchObject({
      requestTitle: 'Add Electron CDP read-only observation skeleton',
      mockOnly: true,
    });
  });

  it('replays a local codex fixture when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { replayCodexFixture } = await import('./main');
    const summary = await replayCodexFixture(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );

    expect(summary).toMatchObject({
      threadId: 'thread_fixture_basic',
      status: 'completed',
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
    });
  });

  it('blocks symlink escapes for local codex fixture fallback', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const escapedDir = mkdtempSync(join(tmpdir(), 'codexhub-cli-fixture-escape-'));
    const escapedFile = join(escapedDir, 'outside.jsonl');
    writeFileSync(escapedFile, '{"type":"thread.started","thread_id":"escaped"}\n');
    symlinkSync(escapedFile, cliSymlinkEscapeAbsolutePath);
    const { replayCodexFixture } = await import('./main');

    try {
      await expect(replayCodexFixture(cliSymlinkEscapeFixturePath)).rejects.toThrow(
        'must resolve inside',
      );
    } finally {
      rmSync(escapedDir, { recursive: true, force: true });
    }
  });

  it('creates a local codex dry-run control-plane record when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { dryRunCodexExec } = await import('./main');
    const result = await dryRunCodexExec('Summarize repository structure');

    expect(result).toMatchObject({
      title: 'Summarize repository structure',
      status: 'blocked',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      promptBodyStored: false,
    });
  });

  it('creates local preflight and gate results when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { preflightCodexExec, evaluateCodexExecGate, getCodexExecTimeline } =
      await import('./main');
    const preflight = await preflightCodexExec('codex_dry_run_fixture');
    const gate = await evaluateCodexExecGate('codex_dry_run_fixture');
    const timeline = await getCodexExecTimeline('codex_dry_run_fixture', {
      source: 'dry_run',
      includeEvidence: false,
      includeAudit: false,
    });

    expect(preflight).toMatchObject({
      preflightResult: {
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gate).toMatchObject({
      executionGateResult: {
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gate.executionGateResult).toMatchObject({
      status: 'blocked',
    });
    expect(JSON.stringify(gate)).not.toContain('approvalArtifact');
    expect(timeline).toMatchObject({
      timeline: {
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      (timeline.timeline as { events: Array<{ eventType: string }> }).events.map(
        (event) => event.eventType,
      ),
    ).toContain('codex.exec.dry_run.created');
    expect(
      (timeline.timeline as { events: Array<{ sourceKind: string }> }).events.every(
        (event) => event.sourceKind === 'dry_run',
      ),
    ).toBe(true);
  });

  it('formats timeline fallback output with no-live flags', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecTimelineOutput, getCodexExecTimeline } = await import('./main');
    const timeline = await getCodexExecTimeline('codex_dry_run_fixture', {
      includeEvidence: false,
      includeAudit: false,
    });
    const output = formatCodexExecTimelineOutput(timeline);

    expect(output).toContain('Codex control timeline');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
  });

  it('creates local implementation plan review records without execution approval', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createReadOnlyAdapterImplementationPlanReviewCommand,
      getReadOnlyAdapterImplementationPlanReviewCommand,
      getLatestReadOnlyAdapterImplementationPlanReviewCommand,
      listReadOnlyAdapterImplementationPlanReviewsCommand,
      formatReadOnlyAdapterImplementationPlanReviewOutput,
      formatReadOnlyAdapterImplementationPlanReviewListOutput,
    } = await import('./main');
    const created = await createReadOnlyAdapterImplementationPlanReviewCommand({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewer: 'local-operator',
      rationaleSummary: 'Skeleton planning only; execution remains unapproved.',
    });
    const fetched = await getReadOnlyAdapterImplementationPlanReviewCommand('review_1');
    const listed = await listReadOnlyAdapterImplementationPlanReviewsCommand({
      outcome: 'conditional_go_to_disabled_skeleton',
    });
    const latest = await getLatestReadOnlyAdapterImplementationPlanReviewCommand();
    const createdOutput = formatReadOnlyAdapterImplementationPlanReviewOutput(created);
    const listOutput = formatReadOnlyAdapterImplementationPlanReviewListOutput(listed);

    expect(created).toMatchObject({
      reviewRecord: {
        outcome: 'conditional_go_to_disabled_skeleton',
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
      },
      degraded: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched).toMatchObject({
      reviewRecord: {
        id: 'review_1',
        implementationApproved: false,
        processAdapterApproved: false,
      },
    });
    expect(listed).toMatchObject({
      reviews: [
        {
          outcome: 'conditional_go_to_disabled_skeleton',
          disabledSkeletonApproved: true,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      reviewRecord: {
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
    });
    expect(createdOutput).toContain('implementationApproved=false');
    expect(createdOutput).toContain('processAdapterApproved=false');
    expect(createdOutput).toContain('recommendationGrantsExecution=false');
    expect(createdOutput).toContain('does not approve process adapter work or execution');
    expect(listOutput).toContain('never grant execution');
  });

  it('uses local disabled skeleton and fixture-boundary fallbacks without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      getReadOnlyAdapterSkeletonPreviewCommand,
      createReadOnlyAdapterSkeletonReviewCommand,
      runReadOnlyAdapterFixtureBoundaryCommand,
      createReadOnlyAdapterFinalReadinessCommand,
      formatReadOnlyAdapterGenericOutput,
      formatReadOnlyAdapterSkeletonReviewOutput,
      formatReadOnlyAdapterFinalReadinessOutput,
    } = await import('./main');
    const preview = await getReadOnlyAdapterSkeletonPreviewCommand();
    const review = await createReadOnlyAdapterSkeletonReviewCommand({
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewer: 'local-operator',
      rationaleSummary: 'Fixture boundary only; execution remains unapproved.',
    });
    const fixtureBoundary = await runReadOnlyAdapterFixtureBoundaryCommand(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      {},
    );
    const finalReadiness = await createReadOnlyAdapterFinalReadinessCommand({
      outcome: 'ready_for_separate_read_only_adapter_adr',
      reviewer: 'local-operator',
      rationaleSummary: 'Separate ADR remains required.',
    });

    expect(preview).toMatchObject({
      preview: {
        status: 'disabled',
        noRunnableCommand: true,
        commandPreviewStored: false,
        argvStored: false,
        executablePathStored: false,
        shellSnippetStored: false,
        envPlanStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(review).toMatchObject({
      reviewRecord: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
    });
    expect(fixtureBoundary).toMatchObject({
      result: {
        fixtureOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
      },
      degraded: true,
    });
    expect(finalReadiness).toMatchObject({
      decisionRecord: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        realAdapterRequiresSeparateAdr: true,
        currentRoundApprovesProcessStart: false,
        currentRoundApprovesCodexExecution: false,
        currentRoundApprovesWorkspaceWrites: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
    });
    expect(formatReadOnlyAdapterGenericOutput(fixtureBoundary)).toContain('executionDisabled=true');
    expect(formatReadOnlyAdapterSkeletonReviewOutput(review)).toContain(
      'processAdapterApproved=false',
    );
    expect(formatReadOnlyAdapterFinalReadinessOutput(finalReadiness)).toContain(
      'realAdapterRequiresSeparateAdr=true',
    );
    expect(JSON.stringify(fixtureBoundary)).not.toContain('synthetic stdout body');
  });

  it('creates local real read-only adapter readiness fallback without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createRealReadOnlyAdapterReadinessCommand,
      formatRealReadOnlyAdapterReadinessListOutput,
      formatRealReadOnlyAdapterReadinessOutput,
      getLatestRealReadOnlyAdapterReadinessCommand,
      getRealReadOnlyAdapterReadinessCommand,
      listRealReadOnlyAdapterReadinessCommand,
    } = await import('./main');
    const created = await createRealReadOnlyAdapterReadinessCommand('codex_dry_run_fixture');
    const fetched = await getRealReadOnlyAdapterReadinessCommand('readiness_1');
    const listed = await listRealReadOnlyAdapterReadinessCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'blocked',
    });
    const latest = await getLatestRealReadOnlyAdapterReadinessCommand('codex_dry_run_fixture');
    const output = formatRealReadOnlyAdapterReadinessOutput(created);
    const listOutput = formatRealReadOnlyAdapterReadinessListOutput(listed);

    expect(created).toMatchObject({
      package: {
        dryRunId: 'codex_dry_run_fixture',
        status: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        symlinkEscapeVerificationPending: true,
      },
      degraded: true,
      notPersisted: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched).toMatchObject({
      package: {
        id: 'readiness_1',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
      notPersisted: true,
    });
    expect(listed).toMatchObject({
      summaries: [
        {
          status: 'blocked',
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
        },
      ],
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      package: {
        dryRunId: 'codex_dry_run_fixture',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
      notPersisted: true,
    });
    expect(output).toContain(
      'Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.',
    );
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('notPersisted=true');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('processAdapterApproved=false');
    expect(listOutput).not.toContain('execution approval');
    expect(JSON.stringify(created)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(created)).not.toContain('full report markdown');
    expect(JSON.stringify(created)).not.toContain('full command body');
  });

  it('refuses local readiness review creation fallback without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createRealReadOnlyAdapterReadinessReviewCommand,
      formatRealReadOnlyAdapterReadinessReviewListOutput,
      formatRealReadOnlyAdapterReadinessReviewOutput,
      getLatestRealReadOnlyAdapterReadinessReviewCommand,
      getRealReadOnlyAdapterReadinessReviewCommand,
      listRealReadOnlyAdapterReadinessReviewCommand,
    } = await import('./main');

    const created = await createRealReadOnlyAdapterReadinessReviewCommand(
      'codex_real_read_only_adapter_readiness_package_fixture',
      {
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewer: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    );
    const fetched = await getRealReadOnlyAdapterReadinessReviewCommand('readiness_review_1');
    const listed = await listRealReadOnlyAdapterReadinessReviewCommand({
      dryRun: 'codex_dry_run_fixture',
      outcome: 'conditional_go_to_separate_adr_draft',
    });
    const latest =
      await getLatestRealReadOnlyAdapterReadinessReviewCommand('codex_dry_run_fixture');
    const output = formatRealReadOnlyAdapterReadinessReviewOutput(created);
    const listOutput = formatRealReadOnlyAdapterReadinessReviewListOutput(listed);

    expect(created).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(created).not.toHaveProperty('reviewRecord');
    expect(fetched).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(fetched).not.toHaveProperty('reviewRecord');
    expect(listed).toMatchObject({
      summaries: [],
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(latest).not.toHaveProperty('reviewRecord');
    expect(output).toContain('notPersisted=true');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('notPersisted=true');
    expect(listOutput).not.toContain('execution approval');
  });

  it('blocks real read-only adapter CLI attempts when supervisor attempt path is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { attemptRealReadOnlyAdapterCommand, formatRealReadOnlyAdapterAttemptOutput } =
      await import('./main');
    const result = await attemptRealReadOnlyAdapterCommand('codex_dry_run_fixture', {
      approval: 'codex_approval_fixture',
      worktree: 'C:/safe/isolated-worktree',
      governedInput: '.codexhub/governed-input.md',
      governedInputHash: 'sha256:governed-input',
    });
    const output = formatRealReadOnlyAdapterAttemptOutput(result);

    expect(result).toMatchObject({
      status: 'blocked',
      attempt: {
        status: 'blocked',
        processBoundaryInvoked: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        argvStored: false,
        executablePathStored: false,
      },
      preflight: {
        status: 'failed',
      },
      degraded: true,
      notPersisted: true,
      fallbackRefused: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      (result.preflight as { checks: Array<{ code: string; status: string }> }).checks.map(
        (check) => check.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        'config_explicit_enable',
        'approval_artifact_exists',
        'dry_run_hash_match',
        'policy_hash_match',
        'isolated_worktree_clean',
        'governed_input_verified',
        'evidence_store_ready',
        'audit_store_ready',
      ]),
    );
    expect(output).toContain('processBoundaryInvoked=false');
    expect(output).toContain('operator prerequisites: explicit config');
    expect(output).toContain('abort/failure semantics: missing or mismatched gates');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('C:/safe/isolated-worktree');
    expect(JSON.stringify(result)).not.toContain('"argv":');
    expect(JSON.stringify(result)).not.toContain('"executablePath":');
  });

  it('sends runtime worktree input only to the supervisor attempt path', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    const rawWorktreePath = 'C:/safe/isolated-worktree-runtime';
    const governedInputRelativePath = '.codexhub/governed-input.md';
    const governedInputHash = 'sha256:governed-input';
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      if (String(url).endsWith('/health')) {
        const { REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION } =
          await import('@codexhub/codex-kernel');

        return new Response(
          JSON.stringify({
            service: 'codexhub-supervisor',
            status: 'ok',
            metadata: {
              realReadOnlyAdapterCodexCliInvocationContractVersion:
                REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          status: 'blocked',
          attempt: {
            status: 'blocked',
            processBoundaryInvoked: false,
            liveExecution: false,
            externalProcessStarted: false,
            executionDisabled: true,
            processAdapterStarted: false,
            implementationApproved: false,
            processAdapterApproved: false,
            recommendationGrantsExecution: false,
            workspaceWriteAllowed: false,
            dangerFullAccessAllowed: false,
            dashboardTriggerAllowed: false,
            argvStored: false,
            executablePathStored: false,
          },
          preflight: { status: 'failed', checks: [] },
          degraded: false,
          notPersisted: false,
          fallbackRefused: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          persisted: true,
          authoritative: true,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const { attemptRealReadOnlyAdapterCommand, formatRealReadOnlyAdapterAttemptOutput } =
        await import('./main');
      const result = await attemptRealReadOnlyAdapterCommand('codex_dry_run_fixture', {
        approval: 'codex_approval_fixture',
        worktree: rawWorktreePath,
        governedInput: governedInputRelativePath,
        governedInputHash,
      });
      const output = formatRealReadOnlyAdapterAttemptOutput(result);
      const requestBody = JSON.parse(String(fetchCalls[1]?.init?.body));

      expect(fetchCalls[0]?.url).toContain('/health');
      expect(fetchCalls[1]?.url).toContain('/api/codex/exec/real-read-only-adapter/attempt');
      expect(requestBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        isolatedWorktreeProvided: true,
        worktreePath: rawWorktreePath,
        governedInputRelativePath,
        governedInputContentHash: governedInputHash,
      });
      expect(result).toMatchObject({
        authoritative: true,
        degraded: false,
        notPersisted: false,
      });
      expect(JSON.stringify(result)).not.toContain(rawWorktreePath);
      expect(JSON.stringify(result)).not.toContain(governedInputRelativePath);
      expect(output).not.toContain(rawWorktreePath);
      expect(output).not.toContain(governedInputRelativePath);
      expect(output).not.toContain('execution approval');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('refuses attempt authority when supervisor invocation contract is stale', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          service: 'codexhub-supervisor',
          status: 'ok',
          metadata: {
            realReadOnlyAdapterCodexCliInvocationContractVersion: 'stale-contract',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const { attemptRealReadOnlyAdapterCommand } = await import('./main');
      const result = await attemptRealReadOnlyAdapterCommand('codex_dry_run_fixture', {
        approval: 'codex_approval_fixture',
        worktree: 'C:/safe/stale-supervisor-worktree',
        governedInput: '.codexhub/governed-input.md',
        governedInputHash: 'sha256:governed-input',
      });

      expect(fetchCalls).toHaveLength(1);
      expect(fetchCalls[0]?.url).toContain('/health');
      expect(result).toMatchObject({
        authoritative: false,
        degraded: true,
        notPersisted: true,
        fallbackRefused: true,
      });
      expect(JSON.stringify(result)).not.toContain('C:/safe/stale-supervisor-worktree');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('derives source-prep worktree hashes from runtime input without sending raw paths', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    const rawWorktreePath = 'C:/safe/isolated-source-worktree-runtime';
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          status: String(url).includes('pilot-prerequisites')
            ? 'ready_for_pilot_retry'
            : 'prepared',
          authoritative: true,
          supervisorBacked: true,
          persisted: true,
          degraded: false,
          notPersisted: false,
          fallbackUsedAsAuthority: false,
          pilotExecuted: false,
          adapterAttemptInvoked: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const {
        checkRealReadOnlyAdapterPilotPrerequisitesCommand,
        prepareRealReadOnlyAdapterPilotSourceCommand,
      } = await import('./main');
      const { hashRealReadOnlyAdapterRuntimeWorktreePath } = await import('@codexhub/codex-kernel');
      const expectedHash = hashRealReadOnlyAdapterRuntimeWorktreePath(rawWorktreePath);

      const sourceResult = await prepareRealReadOnlyAdapterPilotSourceCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_fixture',
          worktree: rawWorktreePath,
          worktreeLabel: 'isolated-fixture',
          worktreeStatus: 'clean',
          worktreePathHash: 'sha256:manual-stale-hash',
        },
      );
      const prerequisiteResult = await checkRealReadOnlyAdapterPilotPrerequisitesCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_fixture',
          worktree: rawWorktreePath,
          worktreeLabel: 'isolated-fixture',
          worktreeStatus: 'clean',
          worktreePathHash: 'sha256:manual-stale-hash',
          handoffContextComplete: true,
        },
      );
      const sourceBody = JSON.parse(String(fetchCalls[0]?.init?.body));
      const prerequisiteBody = JSON.parse(String(fetchCalls[1]?.init?.body));

      expect(sourceBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: expectedHash,
      });
      expect(prerequisiteBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: expectedHash,
        handoffContextComplete: true,
      });
      expect(sourceBody).not.toHaveProperty('worktreePath');
      expect(prerequisiteBody).not.toHaveProperty('worktreePath');
      expect(
        JSON.stringify({ sourceBody, prerequisiteBody, sourceResult, prerequisiteResult }),
      ).not.toContain(rawWorktreePath);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('passes approval authority trace input unchanged without invoking attempts', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          status: 'blocked',
          record: undefined,
          approvalAuthorityTraceRecord: undefined,
          authoritative: false,
          supervisorBacked: false,
          persisted: false,
          degraded: true,
          notPersisted: true,
          fallbackUsedAsAuthority: false,
          pilotExecuted: false,
          adapterAttemptInvoked: false,
          attemptPreflightWouldAccept: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const {
        formatRealReadOnlyAdapterApprovalAuthorityTraceOutput,
        traceRealReadOnlyAdapterApprovalAuthorityCommand,
      } = await import('./main');
      const result = await traceRealReadOnlyAdapterApprovalAuthorityCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_artifact_exact',
        },
      );
      const requestBody = JSON.parse(String(fetchCalls[0]?.init?.body));
      const output = formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(result);

      expect(fetchCalls[0]?.url).toContain(
        '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
      );
      expect(requestBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_artifact_exact',
      });
      expect(requestBody).not.toHaveProperty('worktreePath');
      expect(output).toContain('adapterAttemptInvoked=false');
      expect(output).toContain('does not create approvals');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses degraded read-only attempt query fallbacks without creating authoritative records', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatRealReadOnlyAdapterAttemptListOutput,
      formatRealReadOnlyAdapterAttemptOutput,
      formatRealReadOnlyAdapterAttemptTimelineOutput,
      getLatestRealReadOnlyAdapterAttemptCommand,
      getRealReadOnlyAdapterAttemptCommand,
      getRealReadOnlyAdapterAttemptTimelineCommand,
      listRealReadOnlyAdapterAttemptsCommand,
    } = await import('./main');
    const fetched = await getRealReadOnlyAdapterAttemptCommand('attempt_1');
    const listed = await listRealReadOnlyAdapterAttemptsCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'completed',
    });
    const latest = await getLatestRealReadOnlyAdapterAttemptCommand('codex_dry_run_fixture');
    const timeline = await getRealReadOnlyAdapterAttemptTimelineCommand('codex_dry_run_fixture', {
      includeEvidence: true,
      includeAudit: true,
    });
    const diagnosticOutput = formatRealReadOnlyAdapterAttemptOutput({
      attempt: {
        id: 'codex_real_read_only_adapter_attempt_diag',
        dryRunId: 'codex_dry_run_fixture',
        status: 'failed',
        processBoundaryInvoked: true,
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        postRunVerificationSkipReason: 'attempt_not_completed',
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          startFailureKind: 'none',
          enoentKind: 'none',
          platform: 'win32',
          resolvedExecutableKind: 'native_exe',
          spawnTargetKind: 'native_exe',
          cwdHash: 'sha256:safe-cwd-hash',
          cwdExists: true,
          cwdIsDirectory: true,
          executableHash: 'sha256:safe-executable-hash',
          executableExists: true,
          executableAccessible: true,
          executableResolutionSource: 'direct_path',
          dependencyResolutionStatus: 'not_applicable',
          envAllowlistKeyCount: 5,
          envAllowlistKeyHash: 'sha256:safe-env-keys-hash',
          exitCode: 2,
          nonzeroExitKind: 'codex_cli_usage_error_suspected',
          signal: 'SIGTERM',
          timedOut: false,
          cancelled: false,
          durationMs: 42,
          stdoutHash: 'sha256:safe-stdout-hash',
          stderrHash: 'sha256:safe-stderr-hash',
          stdoutByteLength: 12,
          stderrByteLength: 20,
          stdoutLineCount: 1,
          stderrLineCount: 2,
          stdoutTruncated: false,
          stderrTruncated: false,
        },
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      preflight: { status: 'passed', blockerCount: 0, failedGateCount: 0, checks: [] },
      degraded: false,
      notPersisted: false,
    });
    const deferredOutput = formatRealReadOnlyAdapterAttemptOutput({
      attempt: {
        id: 'codex_real_read_only_adapter_attempt_deferred',
        dryRunId: 'codex_dry_run_fixture',
        status: 'blocked',
        processBoundaryInvoked: false,
        boundaryDeferredReasonCode: 'executable_resolution_blocked',
        boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
        boundaryDeferredDiagnostics: {
          reasonCode: 'executable_resolution_blocked',
          reasonCodes: ['executable_resolution_blocked'],
          executableResolutionStatus: 'blocked',
          executableResolutionReasonCode: 'executable_inaccessible',
          cwdSelfCheckStatus: 'passed',
          processBoundaryReady: false,
        },
        boundaryDiagnosticsComplete: false,
        boundaryDiagnosticsMissingFields: [],
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      preflight: { status: 'passed', blockerCount: 0, failedGateCount: 0, checks: [] },
      degraded: false,
      notPersisted: false,
    });
    const deferredListOutput = formatRealReadOnlyAdapterAttemptListOutput({
      summaries: [
        {
          attemptId: 'codex_real_read_only_adapter_attempt_deferred',
          dryRunId: 'codex_dry_run_fixture',
          status: 'blocked',
          processBoundaryInvoked: false,
          boundaryDeferredReasonCode: 'executable_resolution_blocked',
          boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
          boundaryDiagnosticsComplete: false,
        },
      ],
      count: 1,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    const deferredTimelineOutput = formatRealReadOnlyAdapterAttemptTimelineOutput({
      timeline: {
        dryRunId: 'codex_dry_run_fixture',
        status: 'blocked',
        eventCount: 1,
        evidenceRefCount: 1,
        auditEventCount: 1,
        outputHashCount: 0,
        processBoundaryInvokedCount: 0,
        entries: [
          {
            attemptId: 'codex_real_read_only_adapter_attempt_deferred',
            dryRunId: 'codex_dry_run_fixture',
            status: 'blocked',
            occurredAt: '2026-04-28T00:00:00.000Z',
            evidenceRefCount: 1,
            auditEventCount: 1,
            processBoundaryInvoked: false,
            boundaryDeferredReasonCode: 'executable_resolution_blocked',
            boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
            boundaryDiagnosticsComplete: false,
          },
        ],
      },
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    const listOutput = formatRealReadOnlyAdapterAttemptListOutput(listed);
    const latestOutput = formatRealReadOnlyAdapterAttemptOutput(latest);
    const timelineOutput = formatRealReadOnlyAdapterAttemptTimelineOutput(timeline);

    expect(fetched).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched.attemptRecord).toBeUndefined();
    expect(listed).toMatchObject({
      attempts: [],
      summaries: [],
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(timeline).toMatchObject({
      timeline: {
        dryRunId: 'codex_dry_run_fixture',
        status: 'empty',
        eventCount: 0,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
    });
    expect(listOutput).toContain('notPersisted=true');
    expect(listOutput).toContain('state guide: blocked means gate refused');
    expect(listOutput).toContain('Records are metadata-only');
    expect(listOutput).not.toContain('execution approval');
    expect(latestOutput).toContain('notPersisted=true');
    expect(latestOutput).not.toContain('execution approval');
    expect(timelineOutput).toContain('Real read-only adapter attempt timeline');
    expect(timelineOutput).toContain('notPersisted=true');
    expect(timelineOutput).toContain('state guide: blocked means gate refused');
    expect(timelineOutput).toContain('metadata-only');
    expect(timelineOutput).not.toContain('execution approval');
    expect(diagnosticOutput).toContain('boundaryFailureCode=process_exit_nonzero');
    expect(diagnosticOutput).toContain('boundaryStartFailureKind=none');
    expect(diagnosticOutput).toContain('boundaryEnoentKind=none');
    expect(diagnosticOutput).toContain('boundaryNonzeroExitKind=codex_cli_usage_error_suspected');
    expect(diagnosticOutput).toContain('boundaryPlatform=win32');
    expect(diagnosticOutput).toContain('boundaryResolvedExecutableKind=native_exe');
    expect(diagnosticOutput).toContain('boundarySpawnTargetKind=native_exe');
    expect(diagnosticOutput).toContain('boundaryCwdHash=sha256:safe-cwd-hash');
    expect(diagnosticOutput).toContain('boundaryCwdExists=true');
    expect(diagnosticOutput).toContain('boundaryCwdIsDirectory=true');
    expect(diagnosticOutput).toContain('boundaryExecutableExists=true');
    expect(diagnosticOutput).toContain('boundaryExecutableAccessible=true');
    expect(diagnosticOutput).toContain('boundaryExecutableHash=sha256:safe-executable-hash');
    expect(diagnosticOutput).toContain('boundaryExecutableResolutionSource=direct_path');
    expect(diagnosticOutput).toContain('boundaryDependencyResolutionStatus=not_applicable');
    expect(diagnosticOutput).toContain('boundaryEnvAllowlistKeyCount=5');
    expect(diagnosticOutput).toContain('boundaryEnvAllowlistKeyHash=sha256:safe-env-keys-hash');
    expect(diagnosticOutput).toContain('boundaryDiagnosticsComplete=true');
    expect(diagnosticOutput).toContain('boundaryDiagnosticsMissingFields=none');
    expect(diagnosticOutput).toContain('boundaryExitCode=2');
    expect(diagnosticOutput).toContain('boundaryStdoutHash=sha256:safe-stdout-hash');
    expect(diagnosticOutput).toContain('boundarySignal=SIGTERM');
    expect(diagnosticOutput).toContain('boundaryStdoutByteLength=12');
    expect(diagnosticOutput).toContain('boundaryStderrByteLength=20');
    expect(diagnosticOutput).toContain('boundaryStdoutLineCount=1');
    expect(diagnosticOutput).toContain('boundaryStderrLineCount=2');
    expect(diagnosticOutput).toContain('boundaryStdoutTruncated=false');
    expect(diagnosticOutput).toContain('boundaryStderrTruncated=false');
    expect(diagnosticOutput).toContain('postRunVerificationSkipReason=attempt_not_completed');
    expect(deferredOutput).toContain('boundaryDeferredReasonCode=executable_resolution_blocked');
    expect(deferredOutput).toContain('boundaryDeferredReasonCodes=executable_resolution_blocked');
    expect(deferredOutput).toContain('boundaryDeferredExecutableResolutionStatus=blocked');
    expect(deferredOutput).toContain(
      'boundaryDeferredExecutableResolutionReasonCode=executable_inaccessible',
    );
    expect(deferredOutput).toContain('boundaryDeferredCwdSelfCheckStatus=passed');
    expect(deferredOutput).toContain('boundaryDeferredProcessBoundaryReady=false');
    expect(deferredListOutput).toContain(
      'boundaryDeferredReasonCode=executable_resolution_blocked',
    );
    expect(deferredTimelineOutput).toContain(
      'boundaryDeferredReasonCode=executable_resolution_blocked',
    );
    expect(deferredListOutput).not.toContain('raw stdout body');
    expect(deferredTimelineOutput).not.toContain('raw stderr body');
    expect(deferredListOutput).not.toContain('"executablePath":');
    expect(deferredTimelineOutput).not.toContain('"argv":');
    expect(diagnosticOutput).not.toContain('raw stdout body');
    expect(diagnosticOutput).not.toContain('raw stderr body');
    expect(diagnosticOutput).not.toContain('"argv":');
    expect(diagnosticOutput).not.toContain('"executablePath":');
  });

  it('uses degraded pilot prerequisite fallbacks without creating authoritative readiness', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      checkRealReadOnlyAdapterPilotPrerequisitesCommand,
      formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput,
      formatRealReadOnlyAdapterApprovalAuthorityTraceOutput,
      formatRealReadOnlyAdapterPolicySourceListOutput,
      formatRealReadOnlyAdapterPolicySourceOutput,
      formatRealReadOnlyAdapterPilotSourcePreparationListOutput,
      formatRealReadOnlyAdapterPilotSourcePreparationOutput,
      formatRealReadOnlyAdapterPilotPrerequisiteListOutput,
      formatRealReadOnlyAdapterPilotPrerequisiteOutput,
      getLatestRealReadOnlyAdapterPolicySourceCommand,
      getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand,
      getLatestRealReadOnlyAdapterPilotSourceCommand,
      getLatestRealReadOnlyAdapterPilotPrerequisiteCommand,
      getRealReadOnlyAdapterPolicySourceCommand,
      getRealReadOnlyAdapterApprovalAuthorityTraceCommand,
      getRealReadOnlyAdapterPilotSourceCommand,
      getRealReadOnlyAdapterPilotPrerequisiteCommand,
      listRealReadOnlyAdapterPolicySourcesCommand,
      listRealReadOnlyAdapterApprovalAuthorityTracesCommand,
      listRealReadOnlyAdapterPilotSourcesCommand,
      listRealReadOnlyAdapterPilotPrerequisitesCommand,
      prepareRealReadOnlyAdapterPolicySourceCommand,
      prepareRealReadOnlyAdapterPilotSourceCommand,
      traceRealReadOnlyAdapterApprovalAuthorityCommand,
    } = await import('./main');
    const preparedPolicySource =
      await prepareRealReadOnlyAdapterPolicySourceCommand('codex_dry_run_fixture');
    const fetchedPolicySource = await getRealReadOnlyAdapterPolicySourceCommand(
      'codex_real_read_only_adapter_policy_source_1',
    );
    const listedPolicySources = await listRealReadOnlyAdapterPolicySourcesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'aligned',
    });
    const latestPolicySource =
      await getLatestRealReadOnlyAdapterPolicySourceCommand('codex_dry_run_fixture');
    const tracedApproval = await traceRealReadOnlyAdapterApprovalAuthorityCommand(
      'codex_dry_run_fixture',
      { approval: 'codex_approval_fixture' },
    );
    const fetchedTrace = await getRealReadOnlyAdapterApprovalAuthorityTraceCommand(
      'codex_real_read_only_adapter_approval_authority_trace_1',
    );
    const listedTraces = await listRealReadOnlyAdapterApprovalAuthorityTracesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'aligned',
    });
    const latestTrace =
      await getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand('codex_dry_run_fixture');
    const preparedSource = await prepareRealReadOnlyAdapterPilotSourceCommand(
      'codex_dry_run_fixture',
      {
        approval: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:worktree',
      },
    );
    const fetchedSource = await getRealReadOnlyAdapterPilotSourceCommand(
      'codex_real_read_only_adapter_pilot_source_preparation_1',
    );
    const listedSources = await listRealReadOnlyAdapterPilotSourcesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'prepared',
    });
    const latestSource =
      await getLatestRealReadOnlyAdapterPilotSourceCommand('codex_dry_run_fixture');
    const checked = await checkRealReadOnlyAdapterPilotPrerequisitesCommand(
      'codex_dry_run_fixture',
      {
        approval: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:worktree',
      },
    );
    const fetched = await getRealReadOnlyAdapterPilotPrerequisiteCommand(
      'codex_real_read_only_adapter_pilot_prerequisite_1',
    );
    const listed = await listRealReadOnlyAdapterPilotPrerequisitesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'ready_for_pilot_retry',
    });
    const latest =
      await getLatestRealReadOnlyAdapterPilotPrerequisiteCommand('codex_dry_run_fixture');
    const sourceOutput = formatRealReadOnlyAdapterPilotSourcePreparationOutput(preparedSource);
    const sourceListOutput =
      formatRealReadOnlyAdapterPilotSourcePreparationListOutput(listedSources);
    const policySourceOutput = formatRealReadOnlyAdapterPolicySourceOutput(preparedPolicySource);
    const policySourceListOutput =
      formatRealReadOnlyAdapterPolicySourceListOutput(listedPolicySources);
    const traceOutput = formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(tracedApproval);
    const traceListOutput = formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput(listedTraces);
    const checkOutput = formatRealReadOnlyAdapterPilotPrerequisiteOutput(checked);
    const listOutput = formatRealReadOnlyAdapterPilotPrerequisiteListOutput(listed);
    const latestOutput = formatRealReadOnlyAdapterPilotPrerequisiteOutput(latest);

    expect(preparedPolicySource).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      readOnlyOnly: false,
      policyDecisionAllowsPilot: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetchedPolicySource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedPolicySources).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestPolicySource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(tracedApproval).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      attemptPreflightWouldAccept: false,
    });
    expect(fetchedTrace).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedTraces).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestTrace).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(preparedSource).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetchedSource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedSources).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestSource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(checked).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetched).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listed).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latest).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(checkOutput).toContain('status: blocked');
    expect(checkOutput).toContain('degraded=true');
    expect(checkOutput).toContain('notPersisted=true');
    expect(checkOutput).toContain('fallbackUsedAsAuthority=false');
    expect(checkOutput).toContain('pilotExecuted=false');
    expect(checkOutput).toContain('adapterAttemptInvoked=false');
    expect(checkOutput).toContain('authoritativeSourcePreparationPresent=false');
    expect(checkOutput).toContain('workspaceWriteAllowed=false');
    expect(checkOutput).toContain('dangerFullAccessAllowed=false');
    expect(checkOutput).toContain('dashboardTriggerAllowed=false');
    expect(checkOutput).toContain('degraded or notPersisted output is never ready');
    expect(checkOutput).not.toContain('execution approval');
    expect(sourceOutput).toContain('status: blocked');
    expect(sourceOutput).toContain('notPersisted=true');
    expect(sourceOutput).toContain('authoritativePolicySourcePresent=false');
    expect(sourceOutput).toContain('This source-preparation command does not invoke');
    expect(sourceOutput).not.toContain('execution approval');
    expect(policySourceOutput).toContain('status: blocked');
    expect(policySourceOutput).toContain('notPersisted=true');
    expect(policySourceOutput).toContain('fallbackUsedAsAuthority=false');
    expect(policySourceOutput).toContain('fallback output is never aligned');
    expect(policySourceOutput).not.toContain('execution approval');
    expect(policySourceListOutput).toContain('records: none');
    expect(policySourceListOutput).toContain('Policy-source records are metadata-only');
    expect(traceOutput).toContain('status: blocked');
    expect(traceOutput).toContain('attemptPreflightWouldAccept=false');
    expect(traceOutput).toContain('notPersisted=true');
    expect(traceOutput).toContain('does not create approvals');
    expect(traceOutput).not.toContain('execution approval');
    expect(traceListOutput).toContain('records: none');
    expect(traceListOutput).toContain('Approval-authority traces are metadata-only');
    expect(sourceListOutput).toContain('records: none');
    expect(sourceListOutput).toContain('Source-preparation records are metadata-only');
    expect(listOutput).toContain('Records are metadata-only');
    expect(listOutput).toContain('records: none');
    expect(latestOutput).toContain('notPersisted=true');
  });

  it('creates local config and manual approval records when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      getCodexExecConfig,
      requestCodexExecApproval,
      decideCodexExecApproval,
      listCodexExecApprovals,
    } = await import('./main');
    const config = await getCodexExecConfig();
    const request = await requestCodexExecApproval(
      'codex_dry_run_fixture',
      'manual private reason',
    );
    const decision = await decideCodexExecApproval(
      'codex_dry_run_fixture',
      'approved',
      'manual private reason',
    );
    const approvals = await listCodexExecApprovals();

    expect(config).toMatchObject({
      liveConfig: {
        liveEnabled: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(request).toMatchObject({
      approvalRequest: {
        status: 'pending',
        liveExecution: false,
      },
      approvalState: {
        status: 'pending',
        canDecide: true,
      },
    });
    expect(JSON.stringify(request)).not.toContain('manual private reason');
    expect(decision).toMatchObject({
      approvalDecision: {
        outcome: 'approved',
        approved: true,
      },
      approvalState: {
        status: 'approved',
      },
      approvalTransition: {
        allowed: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(approvals).toMatchObject({ approvals: [] });
  });

  it('creates local evidence, audit, and drilldown views when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatCodexExecDrilldownOutput,
      formatCodexExecEvidenceListOutput,
      getCodexExecAudit,
      getCodexExecDrilldown,
      getCodexExecEvidence,
      listCodexExecAudit,
      listCodexExecEvidence,
    } = await import('./main');
    const evidenceSearch = await listCodexExecEvidence({
      dryRun: 'codex_dry_run_fixture',
      kind: 'codex.exec.dry_run_plan',
    });
    const auditSearch = await listCodexExecAudit({
      dryRun: 'codex_dry_run_fixture',
      action: 'codex.exec.policy_evaluated',
    });
    const evidenceItem = (
      evidenceSearch.result as {
        items: Array<{ evidenceRefId: string }>;
      }
    ).items[0];
    const auditItem = (
      auditSearch.result as {
        items: Array<{ auditEventId: string }>;
      }
    ).items[0];
    const evidenceDetail = await getCodexExecEvidence(evidenceItem?.evidenceRefId ?? 'missing');
    const auditDetail = await getCodexExecAudit(auditItem?.auditEventId ?? 'missing');
    const drilldown = await getCodexExecDrilldown('codex_dry_run_fixture');

    expect(evidenceSearch).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            kind: 'codex.exec.dry_run_plan',
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditSearch).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            action: 'codex.exec.policy_evaluated',
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(evidenceDetail.detail).toMatchObject({
      status: 'not_found',
      bodyStored: false,
    });
    expect(auditDetail.detail).toMatchObject({
      status: 'not_found',
      bodyStored: false,
    });
    expect(drilldown).toMatchObject({
      drilldown: {
        status: 'found',
        evidenceCount: 3,
        auditEventCount: 4,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(formatCodexExecEvidenceListOutput(evidenceSearch)).toContain('liveExecution=false');
    expect(formatCodexExecDrilldownOutput(drilldown)).toContain('executionDisabled=true');
  });

  it('creates a local report when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecReportOutput, getCodexExecReport } = await import('./main');
    const result = await getCodexExecReport('codex_dry_run_fixture', {
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
    });
    const output = formatCodexExecReportOutput(result);

    expect(result).toMatchObject({
      report: {
        status: 'found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'markdown',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('# Codex Control-plane Report');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
    expect(output).not.toContain('Local control-plane fallback for');
  });

  it('guards report output paths', async () => {
    const { resolveCodexExecReportOutputPath } = await import('./main');

    expect(resolveCodexExecReportOutputPath('reports/foo.md').workspacePath).toBe('reports/foo.md');
    expect(resolveCodexExecReportOutputPath('tmp/foo.md').workspacePath).toBe('tmp/foo.md');
    expect(() => resolveCodexExecReportOutputPath('C:/tmp/foo.md')).toThrow('repository-relative');
    expect(() => resolveCodexExecReportOutputPath('../foo.md')).toThrow('traversal');
    expect(() => resolveCodexExecReportOutputPath('docs/foo.md')).toThrow('reports/ or tmp/');
  });

  it('creates a local ADR draft when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecAdrDraftOutput, getCodexExecAdrDraft } = await import('./main');
    const result = await getCodexExecAdrDraft('codex_dry_run_fixture', {
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
    });
    const output = formatCodexExecAdrDraftOutput(result);

    expect(result).toMatchObject({
      adrDraft: {
        format: 'markdown',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'markdown',
        recommendationGrantsExecution: false,
        draftOnly: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('# ADR Draft: Codex control\\-plane live adapter readiness');
    expect(output).toContain('does not grant execution');
    expect(output).toContain('draftOnly=true');
    expect(output).not.toContain('execution approval');
    expect(output).not.toContain('Local control-plane fallback for');
  });

  it('creates local ADR decision records without approving implementation', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createCodexExecAdrDecision,
      formatCodexExecAdrDecisionListOutput,
      formatCodexExecAdrDecisionOutput,
      getCodexExecAdrDecision,
      getLatestCodexExecAdrDecisionCommand,
      listCodexExecAdrDecisions,
    } = await import('./main');
    const result = await createCodexExecAdrDecision('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      rationaleSummary: 'Conditional read-only design only.',
      json: false,
    });
    const decisionId = (result.decisionRecord as { id: string }).id;
    const detail = await getCodexExecAdrDecision(decisionId);
    const list = await listCodexExecAdrDecisions({
      dryRun: 'codex_dry_run_fixture',
      status: 'recorded',
      decision: 'conditional_read_only_go',
    });
    const latest = await getLatestCodexExecAdrDecisionCommand('codex_dry_run_fixture');
    const output = formatCodexExecAdrDecisionOutput(result);
    const listOutput = formatCodexExecAdrDecisionListOutput(list);

    expect(result).toMatchObject({
      decisionRecord: {
        decision: 'conditional_read_only_go',
        status: 'recorded',
        allowedSandboxModes: ['read_only'],
        forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
        futureTriggerPolicy: 'cli_only',
        dashboardTriggerAllowed: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
    });
    expect(detail).toMatchObject({
      decisionRecord: {
        id: decisionId,
        implementationApproved: false,
        processAdapterApproved: false,
      },
    });
    expect(list).toMatchObject({
      decisions: [
        {
          decision: 'conditional_read_only_go',
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      decisionRecord: {
        decision: 'conditional_read_only_go',
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('does not approve implementation');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('processAdapterApproved=false');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
  });

  it('simulates read-only adapter preflight locally without implying execution approval', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatReadOnlyAdapterPreflightSimulationOutput,
      simulateReadOnlyAdapterPreflightCommand,
    } = await import('./main');
    const result = await simulateReadOnlyAdapterPreflightCommand('codex_dry_run_fixture', {
      isolatedWorktree: true,
      evidenceReady: true,
      auditReady: true,
      checklistComplete: true,
    });
    const output = formatReadOnlyAdapterPreflightSimulationOutput(result);

    expect(result).toMatchObject({
      simulationResult: {
        dryRunId: 'codex_dry_run_fixture',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: true,
    });
    expect(output).toContain('Read-only adapter preflight simulation');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
    expect(output).toContain('processAdapterStarted=false');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('dashboardTriggerAllowed=false');
    expect(output).toContain('does not grant execution permission');
    expect(output).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
  });

  it('creates local simulator review records without approving implementation', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createReadOnlyAdapterSimulatorReviewCommand,
      formatReadOnlyAdapterSimulatorReviewListOutput,
      formatReadOnlyAdapterSimulatorReviewOutput,
      getLatestReadOnlyAdapterSimulatorReviewCommand,
      getReadOnlyAdapterSimulatorReviewCommand,
      listReadOnlyAdapterSimulatorReviewsCommand,
    } = await import('./main');
    const result = await createReadOnlyAdapterSimulatorReviewCommand('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      outcome: 'go_to_implementation_planning',
      rationaleSummary:
        'Simulator review allows implementation planning only; implementation remains unapproved.',
    });
    const reviewId = (result.reviewRecord as { id: string }).id;
    const detail = await getReadOnlyAdapterSimulatorReviewCommand(reviewId);
    const list = await listReadOnlyAdapterSimulatorReviewsCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'recorded',
      outcome: 'go_to_implementation_planning',
    });
    const latest = await getLatestReadOnlyAdapterSimulatorReviewCommand('codex_dry_run_fixture');
    const output = formatReadOnlyAdapterSimulatorReviewOutput(result);
    const listOutput = formatReadOnlyAdapterSimulatorReviewListOutput(list);

    expect(result).toMatchObject({
      reviewRecord: {
        dryRunId: 'codex_dry_run_fixture',
        outcome: 'go_to_implementation_planning',
        status: 'recorded',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: true,
    });
    expect(detail).toMatchObject({
      reviewRecord: {
        id: reviewId,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
    });
    expect(list).toMatchObject({
      reviews: [
        {
          outcome: 'go_to_implementation_planning',
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      reviewRecord: {
        outcome: 'go_to_implementation_planning',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('does not approve implementation or execution');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('processAdapterApproved=false');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
  });

  it('creates local report review records when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createCodexExecReportReview,
      compareCodexExecReportReviewCommand,
      formatCodexExecGovernancePackageOutput,
      formatCodexExecReportReviewOutput,
      formatCodexExecReportReviewComparisonOutput,
      formatCodexExecReportReviewHandoffOutput,
      formatCodexExecReportReviewHistoryOutput,
      formatCodexExecReportReviewListOutput,
      getCodexExecGovernancePackage,
      getCodexExecReportReviewHandoff,
      getCodexExecReportReviewHistory,
      getCodexExecReportReview,
      getLatestCodexExecReportReviewCommand,
      listCodexExecReportReviews,
    } = await import('./main');
    const result = await createCodexExecReportReview('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
    });
    const output = formatCodexExecReportReviewOutput(result);
    const reviewId = (result.reviewRecord as { id: string }).id;
    const detail = await getCodexExecReportReview(reviewId);
    const list = await listCodexExecReportReviews({
      dryRun: 'codex_dry_run_fixture',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
    });
    const latest = await getLatestCodexExecReportReviewCommand('codex_dry_run_fixture');
    const history = await getCodexExecReportReviewHistory({
      dryRun: 'codex_dry_run_fixture',
    });
    const comparison = await compareCodexExecReportReviewCommand(
      'codex_report_review_left',
      'codex_report_review_right',
    );
    const handoff = await getCodexExecReportReviewHandoff('codex_dry_run_fixture', {
      from: 'local-operator',
      to: 'next-reviewer',
    });
    const governancePackage = await getCodexExecGovernancePackage('codex_dry_run_fixture', {
      includeEvidence: true,
      includeAudit: true,
    });
    const listOutput = formatCodexExecReportReviewListOutput(list);
    const historyOutput = formatCodexExecReportReviewHistoryOutput(history);
    const comparisonOutput = formatCodexExecReportReviewComparisonOutput(comparison);
    const handoffOutput = formatCodexExecReportReviewHandoffOutput(handoff);
    const governanceOutput = formatCodexExecGovernancePackageOutput(governancePackage);

    expect(result).toMatchObject({
      reviewRecord: {
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        recommendationGrantsExecution: false,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(detail).toMatchObject({
      reviewRecord: {
        id: reviewId,
        recommendationGrantsExecution: false,
      },
    });
    expect(list).toMatchObject({
      summaries: [
        {
          recommendationGrantsExecution: false,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      reviewRecord: {
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(history).toMatchObject({
      history: {
        historyCount: 2,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(comparison).toMatchObject({
      comparison: {
        comparable: true,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(handoff).toMatchObject({
      handoff: {
        fromReviewer: 'local-operator',
        toReviewer: 'next-reviewer',
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(governancePackage).toMatchObject({
      governancePackage: {
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        noLiveEvidence: {
          noRealCodexExec: true,
          noExternalProcessStarted: true,
        },
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('does not grant execution');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('grantsExecution=false');
    expect(historyOutput).toContain('recommendation grants execution: false');
    expect(comparisonOutput).toContain('recommendationGrantsExecution=false');
    expect(handoffOutput).toContain('does not grant execution');
    expect(governanceOutput).toContain('does not grant execution');
    expect(governanceOutput).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(history)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(comparison)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(handoff)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(governancePackage)).not.toContain('Local control-plane fallback for');
  });

  it('runs GitHub remote supersede and cleanup rehearsals as read-only CLI metadata', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response('{}', { status: 200 });
    });
    const {
      formatGithubRemoteCleanupAcceptanceRehearsalOutput,
      formatRemoteSupersedeAcceptanceRehearsalOutput,
      runGithubRemoteCleanupAcceptanceRehearsalForCli,
      runRemoteSupersedeAcceptanceRehearsalForCli,
    } = await import('./main');
    const supersede = runRemoteSupersedeAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'old-pr-open',
    });
    const cleanup = runGithubRemoteCleanupAcceptanceRehearsalForCli({
      fixture: true,
      scenario: 'branch-not-codexhub',
    });
    const supersedeOutput = formatRemoteSupersedeAcceptanceRehearsalOutput(supersede);
    const cleanupOutput = formatGithubRemoteCleanupAcceptanceRehearsalOutput(cleanup);
    const serialized = JSON.stringify({ supersede, cleanup });

    expect(supersede.status).toBe('passed');
    expect(supersede.remoteWriteInvoked).toBe(false);
    expect(cleanup.status).toBe('blocked');
    expect(cleanup.deleteNonCodexhubBranchAllowed).toBe(false);
    expect(cleanup.updateRefAllowed).toBe(false);
    expect(cleanup.forceAllowed).toBe(false);
    expect(cleanup.mergeAllowed).toBe(false);
    expect(cleanup.commentAllowed).toBe(false);
    expect(cleanup.labelAllowed).toBe(false);
    expect(cleanup.reviewerAllowed).toBe(false);
    expect(cleanup.networkBoundaryInvoked).toBe(false);
    expect(supersedeOutput).toContain('GitHub remote supersede acceptance rehearsal');
    expect(supersedeOutput).toContain('remoteWriteInvoked=false');
    expect(cleanupOutput).toContain('GitHub remote cleanup acceptance rehearsal');
    expect(cleanupOutput).toContain('deleteNonCodexhubBranchAllowed=false');
    expect(() => runRemoteSupersedeAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(() => runGithubRemoteCleanupAcceptanceRehearsalForCli({ fixture: false })).toThrow();
    expect(fetchCalls).toHaveLength(0);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('local-control');
  });
});
