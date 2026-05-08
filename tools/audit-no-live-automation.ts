import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

interface Violation {
  file: string;
  line: number;
  term: string;
  reason: string;
}

interface AllowlistEntry {
  scope: 'production-source' | 'fixture' | 'test' | 'docs' | 'audit';
  file?: string;
  filePrefix?: string;
  fileSuffix?: string;
  terms: string[];
  reason: string;
}

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['apps', 'packages', 'tools'];
const approvedProcessBoundaryFiles = new Set([
  'packages/codex-kernel/src/real-read-only-adapter-process.ts',
  'packages/codex-app-server-adapter/src/stdio-process-boundary.ts',
  'packages/nx-verification-adapter/src/process-boundary.ts',
  'packages/policy-backend-adapter/src/real-policy-boundary.ts',
  'packages/worktree-manager/src/git-process-boundary.ts',
]);
const approvedGitBoundaryFiles = new Set([
  'packages/worktree-manager/src/git-process-boundary.ts',
]);
const approvedLocalArtifactWriteBoundaryFiles = new Set([
  'packages/review-package-kernel/src/artifact-export-boundary.ts',
  'packages/release-candidate-kernel/src/artifact-export-boundary.ts',
]);
const approvedLiveAutomationBoundaryFiles = new Set([
  'packages/playwright-observer-adapter/src/action-boundary.ts',
  'packages/playwright-observer-adapter/src/chrome-cdp-boundary.ts',
  'packages/playwright-observer-adapter/src/real-runner.ts',
]);
const approvedCdpHttpBoundaryFiles = new Set([
  'packages/electron-cdp-adapter/src/codex-desktop-cdp-readiness.ts',
  'packages/electron-cdp-adapter/src/controlled-http-runner.ts',
  'packages/electron-cdp-adapter/src/controlled-websocket-event-runner.ts',
  'packages/electron-cdp-adapter/src/main-inspector-boundary.ts',
]);
const approvedCdpWebSocketBoundaryFiles = new Set([
  'packages/electron-cdp-adapter/src/controlled-websocket-event-runner.ts',
  'packages/electron-cdp-adapter/src/main-inspector-boundary.ts',
]);
const approvedGithubHttpBoundaryFiles = new Set([
  'packages/github-provider-adapter/src/github-http-boundary.ts',
]);
const approvedPolicyTelemetryRuntimeBoundaryFiles = new Set([
  'packages/otel-adapter/src/real-exporter-boundary.ts',
  'packages/policy-backend-adapter/src/real-policy-boundary.ts',
]);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.jsonl']);
const customWorkflowTemplateForbiddenKeys = new Set([
  'prompt',
  'rawPrompt',
  'stdout',
  'stderr',
  'diff',
  'rawDiff',
  'diffBody',
  'pullRequestBody',
  'pullRequestMarkdown',
  'prBody',
  'prMarkdown',
  'path',
  'rawPath',
  'configPath',
  'url',
  'rawUrl',
  'token',
  'cookie',
  'session',
  'env',
  'envValue',
  'requestBody',
  'responseBody',
  'body',
  'rawBody',
  'approvalArtifact',
  'executionAuthority',
  'policyOverride',
  'approvalOverride',
]);
const externalProcessModules = [['child', '_process'].join(''), ['node:', 'child', '_process'].join('')];
const liveAutomationModules = ['playwright'];
const executableTextTerms = [
  ['codex', ' exec'].join(''),
  ['playwright', '.', 'chromium'].join(''),
  ['chromium', '.', 'launch'].join(''),
  ['connect', 'Over', 'CDP'].join(''),
];
const cdpHttpBoundaryTerms = ['/json/version', '/json/list'];
const cdpForbiddenTransportTerms = [
  ['ws', '://'].join(''),
  ['web', 'Socket', 'Debugger', 'Url'].join(''),
  ['globalThis', '.', 'Web', 'Socket'].join(''),
];
const cdpCommandPassthroughTerms = [
  ['cdp', '.', 'send'].join(''),
  ['client', '.', 'send'].join(''),
  ['send', 'Command'].join(''),
  ['execute', 'Cdp', 'Command'].join(''),
];
const gitBoundaryTerms = [
  ['worktree', ' add'].join(''),
  ['worktree', ' remove'].join(''),
  ['git', ' push'].join(''),
  ['diff', ' --name-only'].join(''),
  ['diff', ' --numstat'].join(''),
];
const localArtifactWriteTerms = [
  'review-package-summary.json',
  'review-package-summary.md',
  'release-candidate-summary.json',
  'release-candidate-summary.md',
];
const githubHttpBoundaryTerms = [
  'application/vnd.github+json',
  'x-github-api-version',
  '/pulls?state=open',
  '/pulls/',
  '/git/ref/heads/',
  '/commits/',
  '/check-runs',
  '/actions/runs',
  '/actions/workflows',
  '/git/blobs',
  '/git/trees',
  '/git/commits',
  '/git/refs',
];
const githubForbiddenRemoteMutationTerms = [
  '/git/refs',
  '/labels',
  '/comments',
  '/requested_reviewers',
  '/deployments',
  '/releases',
  'git push',
  'update-ref',
  'force=true',
  'force: true',
  'draft=false',
  'draft: false',
  "['git', 'refs'].join('/')",
  '["git", "refs"].join("/")',
  "'git', 'refs'].join('/')",
  '"git", "refs"].join("/")',
];
const policyTelemetryRuntimeTerms = [
  ['@open', 'telemetry/'].join(''),
  ['OTLP', 'Trace', 'Exporter'].join(''),
  ['OTLP', 'Metric', 'Exporter'].join(''),
  ['OTLP', 'Log', 'Exporter'].join(''),
  ['otlp', ' exporter'].join(''),
  ['otlp', 'http'].join(''),
  ['otlp', 'grpc'].join(''),
  ['Batch', 'Span', 'Processor'].join(''),
  ['opa', ' eval'].join(''),
  ['opa', ' run'].join(''),
  ['opa', '.exe'].join(''),
  ['cedar', ' runtime'].join(''),
  ['cedar', '-wasm'].join(''),
  ['@cedar', '-policy'].join(''),
];
const deploymentWritePassthroughTerms = [
  'kubectl apply',
  'helm upgrade',
  'argocd app sync',
  'terraform apply',
  'tofu apply',
  'docker compose up',
  'docker run',
  '["kubectl", "apply"]',
  "['kubectl', 'apply']",
  '["helm", "upgrade"]',
  "['helm', 'upgrade']",
  '["terraform", "apply"]',
  "['terraform', 'apply']",
  '["tofu", "apply"]',
  "['tofu', 'apply']",
];
const browserDirectActionTerms = ['page.click', 'page.type', 'keyboard.type', 'mouse.click'];
const electronRuntimeEvaluateTerms = ['Runtime.evaluate'];
const mcpWriteToolDirectTerms = ['workspace.applyPatchToControlledWorktree'];
const directAdapterExecuteTerms = discoverPublicExecuteTerms();
const directExternalAgentExecutionTerms = [
  'runExternalAgentPatchWithRunner',
  'buildExternalAgentBoundaryRequest',
];
const dynamicAdapterExecutePropertyTerms = [
  '["execute" +',
  "['execute' +",
  '["execute",',
  "['execute',",
  '.execute(',
  '["runExternalAgent" +',
  "['runExternalAgent' +",
];
const browserPersistenceTerms = ['localStorage', 'sessionStorage', 'indexedDB'];
const browserPersistenceWrapperTerms = [
  '["local" + "Storage"]',
  "['local' + 'Storage']",
  '["session" + "Storage"]',
  "['session' + 'Storage']",
  '["indexed" + "DB"]',
  "['indexed' + 'DB']",
];
const dashboardPersistenceTerms = [...browserPersistenceTerms, ...browserPersistenceWrapperTerms];
const dashboardRecoveryForbiddenPayloadTerms = [
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'childArtifacts',
  'childApprovalApproved',
  'childRunStatuses',
  'reason: recoveryReason',
  "startsWith('/api/workflows/production/recoveries/')",
];
const dashboardRecoveryExactPostRoutes = [
  '/api/workflows/production/recoveries/dry-runs',
  '/api/workflows/production/recoveries/approval-requests',
  '/api/workflows/production/recoveries/manual-approvals',
  '/api/workflows/production/recoveries/runs',
];
const dashboardRecoveryScopedPayloadTerms = [
  'reason:',
  'reasonSummary',
  'rawReason',
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'childArtifacts',
  'childApprovalApproved',
  'childRunStatuses',
];
const dashboardRecoveryRouteBypassTerms = [
  'startsWith',
  'indexOf(',
  "indexOf('/api/workflows/production/recoveries/')",
  'indexOf(recovery',
  'includes(',
  ".includes('/api/workflows/production/recoveries/')",
  'includes(recovery',
];
const dashboardMergeForbiddenPayloadTerms = [
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'rawPrBody',
  'rawUrl',
  'rawResponseBody',
  'CODEXHUB_GITHUB_TOKEN',
];
const dashboardMergeExactPostRoutes = [
  '/api/github/merges/dry-runs',
  '/api/github/merges/approval-requests',
  '/api/github/merges/manual-approvals',
  '/api/github/merges/runs',
];
const dashboardMergeScopedPayloadTerms = [
  'reason:',
  'rawReason',
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'rawPrBody',
  'rawUrl',
  'rawResponseBody',
  'CODEXHUB_GITHUB_TOKEN',
];
const dashboardMergeRouteBypassTerms = [
  'startsWith',
  'indexOf(',
  "indexOf('/api/github/merges/')",
  'indexOf(merge',
  'includes(',
  ".includes('/api/github/merges/')",
  'includes(merge',
];
const dashboardDeploymentOperationExactPostRoutes = [
  '/api/deployments/operations/dry-runs',
  '/api/deployments/operations/approval-requests',
  '/api/deployments/operations/manual-approvals',
  '/api/deployments/operations/rollback-plans',
  '/api/deployments/operations/runs',
];
const dashboardDeploymentOperationScopedPayloadTerms = [
  'reason:',
  'rawReason',
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'rawManifest',
  'rawPlan',
  'rawDiff',
  'rawLog',
  'rawPath',
  'CODEXHUB_DEPLOYMENT_',
];
const dashboardDeploymentOperationRouteBypassTerms = [
  'startsWith',
  'indexOf(',
  "indexOf('/api/deployments/operations/')",
  'indexOf(deployment',
  'includes(',
  ".includes('/api/deployments/operations/')",
  'includes(deployment',
];
const dashboardPolicyTelemetryExactPostRoutes = [
  '/api/policy-backends/evaluations/dry-runs',
  '/api/policy-backends/evaluations/approval-requests',
  '/api/policy-backends/evaluations/manual-approvals',
  '/api/policy-backends/evaluations/runs',
  '/api/telemetry/exports/dry-runs',
  '/api/telemetry/exports/approval-requests',
  '/api/telemetry/exports/manual-approvals',
  '/api/telemetry/exports/runs',
];
const dashboardPolicyTelemetryScopedPayloadTerms = [
  'reason:',
  'rawReason',
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'rawPolicySource',
  'rawPolicyInput',
  'rawTrace',
  'rawSpan',
  'rawLog',
  'rawUrl',
  'CODEXHUB_POLICY_BACKEND_',
  'CODEXHUB_OTEL_',
];
const dashboardPolicyTelemetryRouteBypassTerms = [
  'startsWith',
  'indexOf(',
  "indexOf('/api/policy-backends/evaluations/')",
  "indexOf('/api/telemetry/exports/')",
  'indexOf(policy',
  'indexOf(telemetry',
  'includes(',
  ".includes('/api/policy-backends/evaluations/')",
  ".includes('/api/telemetry/exports/')",
  'includes(policy',
  'includes(telemetry',
];
const dashboardProductionGaExactPostRoutes = [
  '/api/production-ga/dry-runs',
  '/api/production-ga/approval-requests',
  '/api/production-ga/manual-approvals',
  '/api/production-ga/signoffs',
  '/api/production-ga/rehearsals',
  '/api/production-ga/training-completions',
];
const dashboardProductionGaScopedPayloadTerms = [
  'reason:',
  'rawReason',
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'childArtifacts',
  'childAuthority',
  'childApprovalArtifact',
  'childExecutionAuthority',
  'rawE2EPayload',
  'rawE2ePayload',
  'e2ePayload',
  'rawDocs',
  'rawPath',
  'rawUrl',
  'rawBody',
  'rawTrace',
  'rawLog',
  'rawPatch',
  'rawDbRow',
  'rawAudit',
  'CODEXHUB_PRODUCTION_GA_',
];
const productionGaKernelForbiddenImports = [
  '@codexhub/github-provider-adapter',
  '@codexhub/deployment-provider-adapter',
  '@codexhub/playwright-observer-adapter',
  '@codexhub/electron-cdp-adapter',
  '@codexhub/external-agent-adapter',
  '@codexhub/policy-backend-adapter',
  '@codexhub/otel-adapter',
];
const dashboardProductionGaRouteBypassTerms = [
  'startsWith',
  'indexOf(',
  "indexOf('/api/production-ga/')",
  'indexOf(productionGa',
  'includes(',
  ".includes('/api/production-ga/')",
  'includes(productionGa',
];
const mcpBoundaryBypassTerms = [
  ['child', '_process'].join(''),
  ['node:', 'child', '_process'].join(''),
  'fetch(',
  'globalThis["fetch"]',
  "globalThis['fetch']",
  'process.env[',
  'process["env"]',
  "process['env']",
  'globalThis["process"]',
  "globalThis['process']",
  'CODEXHUB_GITHUB_TOKEN',
  'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
  'CODEXHUB_SUPERVISOR_LOCAL_',
];
const dashboardAllowedMutationRoutes = new Set([
  '/api/approvals/decisions',
  ...dashboardRecoveryExactPostRoutes,
  ...dashboardMergeExactPostRoutes,
  ...dashboardDeploymentOperationExactPostRoutes,
  ...dashboardPolicyTelemetryExactPostRoutes,
  ...dashboardProductionGaExactPostRoutes,
]);
const dashboardMutationSurfaceTerms = [
  "method: 'POST'",
  'method: "POST"',
  'x-codexhub-local-token',
  'createSupervisorPostHeaders',
];
const cliTokenOptionTerms = [
  ".option('--token",
  '.option("--token',
  '--local-token',
  '--local-control-token',
];
const cliControlledWriteForbiddenPayloadTerms = [
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'rawSelector',
  'rawTypedText',
  'rawPatch',
  'rawPath',
];
const cliProductionGaForbiddenMutationTerms = [
  "method: 'POST'",
  'method: "POST"',
  'createSupervisorPostHeaders',
  '/api/production-ga/approval-requests',
  '/api/production-ga/manual-approvals',
  'postProductionGa',
  'postGa',
  'genericPost',
];
const cliProductionGaForbiddenPayloadTerms = [
  'approvalArtifact:',
  'executionAuthority',
  'authority:',
  'childArtifacts',
  'childAuthority',
  'rawE2EPayload',
  'rawE2ePayload',
  'rawPayload',
  'rawBody',
  'rawPath:',
  'rawUrl:',
  'rawResponseBody:',
  'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
];
const cliControlledWriteRouteBypassTerms = [
  "startsWith('/api/browser/actions",
  'startsWith("/api/browser/actions',
  "startsWith('/api/electron-cdp/main-inspector",
  'startsWith("/api/electron-cdp/main-inspector',
  "startsWith('/api/mcp/write-tools",
  'startsWith("/api/mcp/write-tools',
  "includes('/api/browser/actions",
  'includes("/api/browser/actions',
  "includes('/api/electron-cdp/main-inspector",
  'includes("/api/electron-cdp/main-inspector',
  "includes('/api/mcp/write-tools",
  'includes("/api/mcp/write-tools',
];
const sensitiveConceptTerms = [
  ['coo', 'kie'].join(''),
  ['to', 'ken'].join(''),
  ['sess', 'ion'].join(''),
  ['M', 'F', 'A'].join(''),
];
const allTextTerms = [
  ...executableTextTerms,
  ...cdpHttpBoundaryTerms,
  ...cdpForbiddenTransportTerms,
  ...cdpCommandPassthroughTerms,
  ...gitBoundaryTerms,
  ...localArtifactWriteTerms,
  ...githubHttpBoundaryTerms,
  ...githubForbiddenRemoteMutationTerms,
  ...policyTelemetryRuntimeTerms,
  ...sensitiveConceptTerms,
];
const allowlistRules: AllowlistEntry[] = [
  {
    scope: 'production-source',
    file: 'packages/evidence-kernel/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'redaction vocabulary only; no external automation path',
  },
  {
    scope: 'production-source',
    file: 'packages/business-quota-kernel/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'M62 redaction vocabulary only; no credential read or persistence path',
  },
  {
    scope: 'production-source',
    file: 'packages/ui-automation-kernel/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'M63 UI automation policy vocabulary only; forbidden credential actions never execute',
  },
  {
    scope: 'production-source',
    file: 'packages/production-real-client-kernel/src/index.ts',
    terms: sensitiveConceptTerms,
    reason:
      'M74 production real-client forbidden capability and redaction vocabulary only; no credential read or persistence path',
  },
  {
    scope: 'production-source',
    file: 'packages/contracts/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'contract metadata flags and hash-only credential readiness schemas only',
  },
  {
    scope: 'production-source',
    file: 'packages/store-core/src/index.ts',
    terms: [['sess', 'ion'].join('')],
    reason: 'M51 metadata repository type names for session health only; no credential read path',
  },
  {
    scope: 'production-source',
    file: 'packages/store-sqlite/src/index.ts',
    terms: [['sess', 'ion'].join('')],
    reason: 'M51 metadata table/repository names for session health only; no credential read path',
  },
  {
    scope: 'production-source',
    file: 'apps/supervisor/src/server.ts',
    terms: sensitiveConceptTerms,
    reason:
      'M51 session metadata and M74 real-client forbidden-body/redaction vocabulary only; no credential read path',
  },
  {
    scope: 'production-source',
    file: 'packages/browser-profile-kernel/src/index.ts',
    terms: [['sess', 'ion'].join('')],
    reason: 'M53 metadata health model names only; no browser storage or credential read path',
  },
  {
    scope: 'production-source',
    file: 'packages/codex-app-server-adapter/src/index.ts',
    terms: [['sess', 'ion'].join('')],
    reason: 'M54 App Server session contract names only; no credential/session storage read path',
  },
  {
    scope: 'production-source',
    file: 'packages/orchestrator-kernel/src/index.ts',
    terms: [['sess', 'ion'].join('')],
    reason: 'M57 App Server session metadata-only preflight names only; no credential/session storage read path',
  },
  {
    scope: 'production-source',
    filePrefix: 'packages/github-provider-adapter/src/',
    terms: sensitiveConceptTerms,
    reason: 'GitHub provider token readiness exposes configured/hash-only metadata',
  },
  {
    scope: 'production-source',
    filePrefix: 'packages/secret-governance-kernel/src/',
    terms: sensitiveConceptTerms,
    reason: 'M43 secrets governance readiness exposes configured/hash-only metadata and never reads values',
  },
  {
    scope: 'test',
    file: 'packages/evidence-kernel/src/evidence-kernel.test.ts',
    terms: sensitiveConceptTerms,
    reason: 'redaction test fixture only; no external automation path',
  },
  {
    scope: 'test',
    file: 'packages/ui-automation-kernel/src/ui-automation-kernel.test.ts',
    terms: sensitiveConceptTerms,
    reason: 'M63 forbidden-action test fixture only; no external automation path',
  },
  {
    scope: 'audit',
    file: 'tools/audit-no-live-automation.ts',
    terms: allTextTerms,
    reason: 'audit vocabulary only',
  },
  {
    scope: 'audit',
    file: 'tools/scaffold-health.ts',
    terms: sensitiveConceptTerms,
    reason: 'scaffold health contract export vocabulary only',
  },
  {
    scope: 'audit',
    file: 'tools/scaffold-health.ts',
    terms: githubForbiddenRemoteMutationTerms,
    reason: 'scaffold health release-document path vocabulary only; no GitHub API operation path',
  },
  {
    scope: 'production-source',
    file: 'apps/cli/src/main.ts',
    terms: [
      '/actions/runs',
      '/releases',
      '/deployments',
      ...dashboardDeploymentOperationExactPostRoutes,
      ...dashboardPolicyTelemetryExactPostRoutes,
    ],
    reason:
      'M40-M45 CLI uses these as read-only or exact Supervisor route strings; no direct provider or generic mutating execution path',
  },
  {
    scope: 'production-source',
    file: 'apps/dashboard/src/App.tsx',
    terms: ['/actions/runs', '/releases', '/deployments', ...dashboardPolicyTelemetryExactPostRoutes],
    reason:
      'M40-M45 Dashboard uses these as governed release/deployment/policy telemetry route strings; no direct provider or ungoverned execution path',
  },
  {
    scope: 'production-source',
    file: 'apps/supervisor/src/server.ts',
    terms: [
      '/actions/runs',
      '/releases',
      '/deployments',
      ...dashboardDeploymentOperationExactPostRoutes,
      ...dashboardPolicyTelemetryExactPostRoutes,
    ],
    reason:
      'M40-M45 Supervisor owns the governed release, deployment, secrets, policy telemetry, and controlled-write control-plane routes',
  },
  {
    scope: 'fixture',
    filePrefix: 'packages/codex-kernel/fixtures/',
    terms: executableTextTerms,
    reason: 'synthetic fixture command text only; replay parser never starts a process',
  },
  {
    scope: 'test',
    fileSuffix: '.test.ts',
    terms: allTextTerms,
    reason: 'test files may contain explanatory vocabulary or synthetic assertions',
  },
  {
    scope: 'docs',
    filePrefix: 'docs/',
    terms: allTextTerms,
    reason: 'documentation may describe guarded concepts without executable paths',
  },
];
const violations: Violation[] = [];

validateBoundaryAllowlists();
validateAdversarialAuditSentinels();
auditCustomWorkflowTemplateFiles();

for (const root of scanRoots) {
  const absoluteRoot = resolve(workspaceRoot, root);

  if (!existsSync(absoluteRoot)) {
    continue;
  }

  for (const file of listSourceFiles(absoluteRoot)) {
    auditFile(file);
  }
}

if (violations.length > 0) {
  console.error(`Live automation audit failed: ${violations.length} violation(s).`);

  for (const violation of violations) {
    console.error(
      `- ${toWorkspacePath(violation.file)}:${violation.line} contains "${violation.term}": ${violation.reason}`,
    );
  }

  process.exit(1);
}

console.log(
  `Live automation audit passed: checked ${scanRoots.join(', ')}; no live external automation paths found.`,
);

function validateBoundaryAllowlists(): void {
  if (approvedCdpWebSocketBoundaryFiles.size !== 2) {
    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: 'approvedCdpWebSocketBoundaryFiles',
      reason:
        'Electron/CDP WebSocket observation and main-inspector write execution must have exactly two audited boundary files.',
    });
  }

  if (approvedGitBoundaryFiles.size !== 1) {
    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: 'approvedGitBoundaryFiles',
      reason: 'M6b controlled git worktree execution must have exactly one audited boundary file.',
    });
  }

  if (approvedLocalArtifactWriteBoundaryFiles.size !== 2) {
    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: 'approvedLocalArtifactWriteBoundaryFiles',
      reason: 'M13b/M14b local artifact export must have exactly one audited boundary file per package.',
    });
  }

  if (approvedGithubHttpBoundaryFiles.size !== 1) {
    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: 'approvedGithubHttpBoundaryFiles',
      reason: 'M15b GitHub provider HTTP metadata observation must have exactly one audited boundary file.',
    });
  }

  for (const workspacePath of [
    ...approvedProcessBoundaryFiles,
    ...approvedLiveAutomationBoundaryFiles,
    ...approvedCdpHttpBoundaryFiles,
    ...approvedCdpWebSocketBoundaryFiles,
    ...approvedGitBoundaryFiles,
    ...approvedLocalArtifactWriteBoundaryFiles,
    ...approvedGithubHttpBoundaryFiles,
    ...approvedPolicyTelemetryRuntimeBoundaryFiles,
  ]) {
    if (!existsSync(resolve(workspaceRoot, workspacePath))) {
      violations.push({
        file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
        line: 1,
        term: workspacePath,
        reason: 'Approved live boundary allowlist entry must point to an existing file.',
      });
    }
  }
}

function validateAdversarialAuditSentinels(): void {
  const sentinelCases = [
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText: 'executeGithubDraftPrCreation();',
      expectedTerm: 'executeGithubDraftPrCreation',
      description: 'direct adapter execute call from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText:
        'import { executeGithubBranchPublish as publish } from "@codexhub/github-provider-adapter"; const run = publish;',
      expectedTerm: 'executeGithubBranchPublish',
      description: 'indirect adapter execute import from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText:
        'import * as githubProvider from "@codexhub/github-provider-adapter"; const run = githubProvider.executeGithubBranchPublish;',
      expectedTerm: 'executeGithubBranchPublish',
      description: 'namespace alias adapter execute access from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText: 'const run = adapters["executeGithubRemoteCleanup"];',
      expectedTerm: 'executeGithubRemoteCleanup',
      description: 'adapter execute access through dynamic property lookup from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText:
        'const executeName = "executeGithubBranchPublish"; const run = adapters[executeName];',
      expectedTerm: 'executeGithubBranchPublish',
      description: 'adapter execute access through named dynamic property lookup from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText: 'const run = adapters["execute" + "GithubMerge"];',
      expectedTerm: '["execute" +',
      description: 'adapter execute access through split dynamic property lookup from CLI source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-readonly-command.ts',
      sourceText: "const run = adapters[['execute', 'GithubMerge'].join('')];",
      expectedTerm: "['execute',",
      description: 'adapter execute access through array-joined dynamic property lookup',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-process-boundary.ts',
      sourceText:
        'import { spawn as run } from "node:child_process"; const argv = process.argv.slice(2); run("git", argv);',
      expectedTerm: 'node:child_process',
      description: 'external process import alias with argv passthrough',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-process-boundary.ts',
      sourceText: 'spawn("kubectl", process.argv.slice(2));',
      expectedTerm: 'spawn(',
      description: 'bare process spawn call with argv passthrough',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-agent-run.ts',
      sourceText:
        'import { runExternalAgentPatchWithRunner } from "@codexhub/external-agent-adapter"; await runExternalAgentPatchWithRunner(request);',
      expectedTerm: 'runExternalAgentPatchWithRunner',
      description: 'direct external agent runner import from CLI source',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-agent-run.tsx',
      sourceText: 'const run = adapters["runExternalAgent" + "PatchWithRunner"];',
      expectedTerm: '["runExternalAgent" +',
      description: 'dynamic external agent runner access from Dashboard source',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-agent-run.ts',
      sourceText:
        'import { buildExternalAgentBoundaryRequest } from "@codexhub/external-agent-adapter"; const request = buildExternalAgentBoundaryRequest(plan);',
      expectedTerm: 'buildExternalAgentBoundaryRequest',
      description: 'direct external agent boundary request helper from MCP source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-policy.ts',
      sourceText: 'const command = "opa eval data.codexhub.allow";',
      expectedTerm: 'opa eval',
      description: 'OPA runtime command text outside the reviewed policy backend boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-telemetry.ts',
      sourceText: 'const exporter = "OTLPTraceExporter";',
      expectedTerm: 'OTLPTraceExporter',
      description: 'OpenTelemetry exporter runtime vocabulary outside the reviewed telemetry boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-deployment-boundary.ts',
      sourceText: 'const command = "kubectl apply -f manifest.yaml";',
      expectedTerm: 'kubectl apply',
      description: 'deployment apply command outside the reviewed deployment operation boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-deployment-boundary.ts',
      sourceText: 'const command = "terraform apply -auto-approve";',
      expectedTerm: 'terraform apply',
      description: 'Terraform apply passthrough outside the reviewed deployment operation boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-deployment-boundary.ts',
      sourceText: 'const command = ["kubectl", "apply"].join(" ");',
      expectedTerm: '["kubectl", "apply"]',
      description:
        'segmented kubectl apply command builder outside the reviewed deployment operation boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-deployment-boundary.ts',
      sourceText: "const command = ['terraform', 'apply'].join(' ');",
      expectedTerm: "['terraform', 'apply']",
      description:
        'segmented Terraform apply command builder outside the reviewed deployment operation boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-browser-boundary.ts',
      sourceText: 'await page.click(selector);',
      expectedTerm: 'page.click',
      description: 'direct Browser click call outside the reviewed Browser action boundary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-electron-boundary.ts',
      sourceText: 'const cdpCommand = "Runtime.evaluate";',
      expectedTerm: 'Runtime.evaluate',
      description: 'direct Electron Runtime.evaluate command text in an operator surface',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-write-boundary.ts',
      sourceText: 'const tool = "workspace.applyPatchToControlledWorktree";',
      expectedTerm: 'workspace.applyPatchToControlledWorktree',
      description: 'direct MCP workspace write tool exposure from MCP source',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-controlled-write-cli.ts',
      sourceText: "command.option('--token <token>', 'local control token');",
      expectedTerm: ".option('--token",
      description: 'CLI local-control token command-line option',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-controlled-write-cli.ts',
      sourceText: "const ok = path.startsWith('/api/browser/actions/');",
      expectedTerm: "startsWith('/api/browser/actions",
      description: 'CLI controlled write prefix route guard',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-controlled-write-cli.ts',
      sourceText: 'const body = { dryRunId, approvalArtifact: forgedArtifact };',
      expectedTerm: 'approvalArtifact:',
      description: 'CLI controlled write forged approval artifact payload',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-controlled-write-cli.ts',
      sourceText: 'const body = { rawPatch: patchText };',
      expectedTerm: 'rawPatch',
      description: 'CLI controlled write raw patch payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-approval-ui.tsx',
      sourceText:
        'const endpoint = "/api/approvals/decisions"; window.localStorage.setItem("approvalKey", "secret");',
      expectedTerm: 'localStorage',
      description: 'Dashboard approval token persistence',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-approval-ui.tsx',
      sourceText:
        'const endpoint = "/api/approvals/decisions"; globalThis["sessionStorage"].setItem("approvalKey", "secret");',
      expectedTerm: 'sessionStorage',
      description: 'Dashboard approval token persistence through storage alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-approval-ui.tsx',
      sourceText:
        'const endpoint = "/api/approvals/decisions"; window.indexedDB.open("codexhub-approval-key");',
      expectedTerm: 'indexedDB',
      description: 'Dashboard approval token persistence through IndexedDB alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const postJson = (path: string) => fetch(path, { method: "POST", headers: createSupervisorPostHeaders(token) }); postJson("/api/github/metadata/runs");',
      expectedTerm: 'method: "POST"',
      description: 'Dashboard generic POST helper outside the governed mutation surfaces',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const sendMutation = (route: string) => globalThis.fetch(route, { method: "POST" }); sendMutation("/api/github/metadata/runs");',
      expectedTerm: 'method: "POST"',
      description: 'Dashboard generic POST helper alias outside the governed mutation surfaces',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const sendMutation = globalThis["fetch"]; sendMutation("/api/runtime/jobs/runs", { method: \'POST\' });',
      expectedTerm: "method: 'POST'",
      description: 'Dashboard generic POST helper through bracket fetch alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const route = new URL("/api/production-ga/signoffs", supervisorUrl); fetch(route, { method: "POST" });',
      expectedTerm: 'method: "POST"',
      description: 'Dashboard generic URL builder combined with POST helper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText: 'window["localStorage"].setItem("codexhub-local-control", token);',
      expectedTerm: 'localStorage',
      description: 'Dashboard token persistence through bracket notation wrapper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText: 'window["local" + "Storage"].setItem("codexhub-local-control", token);',
      expectedTerm: '["local" + "Storage"]',
      description: 'Dashboard token persistence through split storage wrapper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const storage = globalThis["session" + "Storage"]; storage.setItem("codexhub-local-control", token);',
      expectedTerm: '["session" + "Storage"]',
      description: 'Dashboard token persistence through aliased split session storage wrapper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-generic-post.tsx',
      sourceText:
        'const db = window["indexed" + "DB"]; db.open("codexhub-local-control");',
      expectedTerm: '["indexed" + "DB"]',
      description: 'Dashboard token persistence through split indexedDB storage wrapper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/runs"; window.localStorage.setItem("recoveryKey", "secret");',
      expectedTerm: 'localStorage',
      description: 'Dashboard recovery key persistence',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/runs"; const body = { dryRunId, childApprovalApproved };',
      expectedTerm: 'childApprovalApproved',
      description: 'Dashboard recovery child auto-approval payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/runs"; const body = { dryRunId, executionAuthority: { allowed: true } };',
      expectedTerm: 'executionAuthority',
      description: 'Dashboard recovery request-body authority payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/approval-requests"; const body = { dryRunId, childArtifacts: [] };',
      expectedTerm: 'childArtifacts',
      description: 'Dashboard recovery child artifact payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/approval-requests"; const body = { dryRunId, reason: recoveryReason };',
      expectedTerm: 'reason: recoveryReason',
      description: 'Dashboard recovery raw reason payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/approval-requests"; const body = { dryRunId, reason: rawReason };',
      expectedTerm: 'reason:',
      description: 'Dashboard recovery raw reason payload alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/approval-requests"; const body = { dryRunId, reasonSummary: rawReason };',
      expectedTerm: 'reasonSummary',
      description: 'Dashboard recovery reason summary payload alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText: "const ok = path.startsWith('/api/workflows/production/recoveries/');",
      expectedTerm: "startsWith('/api/workflows/production/recoveries/')",
      description: 'Dashboard recovery prefix route guard',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const recoveryPrefix = "/api/workflows/production/recoveries/"; const ok = path.startsWith(recoveryPrefix);',
      expectedTerm: 'startsWith',
      description: 'Dashboard recovery prefix route guard alias',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-recovery-ui.tsx',
      sourceText:
        'const endpoint = "/api/workflows/production/recoveries/runs"; const ok = path.indexOf("/api/workflows/production/recoveries/") === 0;',
      expectedTerm: 'indexOf',
      description: 'Dashboard recovery indexOf route guard',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-merge-ui.tsx',
      sourceText:
        'const endpoint = "/api/github/merges/runs"; window.localStorage.setItem("mergeKey", "secret");',
      expectedTerm: 'localStorage',
      description: 'Dashboard merge key persistence',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-merge-ui.tsx',
      sourceText:
        'const endpoint = "/api/github/merges/runs"; const body = { dryRunId, executionAuthority: { allowed: true } };',
      expectedTerm: 'executionAuthority',
      description: 'Dashboard merge request-body authority payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-merge-ui.tsx',
      sourceText:
        'const endpoint = "/api/github/merges/manual-approvals"; const body = { dryRunId, approvalArtifact: { id: "forged" } };',
      expectedTerm: 'approvalArtifact:',
      description: 'Dashboard merge forged approval artifact payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-merge-ui.tsx',
      sourceText:
        'const endpoint = "/api/github/merges/manual-approvals"; const body = { dryRunId, reason: rawReason };',
      expectedTerm: 'reason:',
      description: 'Dashboard merge raw reason payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-merge-ui.tsx',
      sourceText: "const ok = path.startsWith('/api/github/merges/');",
      expectedTerm: "startsWith",
      description: 'Dashboard merge prefix route guard',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-deployment-ui.tsx',
      sourceText:
        'const endpoint = "/api/deployments/operations/runs"; window.localStorage.setItem("deploymentKey", "secret");',
      expectedTerm: 'localStorage',
      description: 'Dashboard deployment key persistence',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-deployment-ui.tsx',
      sourceText:
        'const endpoint = "/api/deployments/operations/runs"; const body = { dryRunId, executionAuthority: { allowed: true } };',
      expectedTerm: 'executionAuthority',
      description: 'Dashboard deployment request-body authority payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-deployment-ui.tsx',
      sourceText:
        'const endpoint = "/api/deployments/operations/manual-approvals"; const body = { dryRunId, approvalArtifact: { id: "forged" } };',
      expectedTerm: 'approvalArtifact:',
      description: 'Dashboard deployment forged approval artifact payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-deployment-ui.tsx',
      sourceText:
        'const endpoint = "/api/deployments/operations/dry-runs"; const body = { provider, rawManifest: manifestText };',
      expectedTerm: 'rawManifest',
      description: 'Dashboard deployment raw manifest payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-deployment-ui.tsx',
      sourceText: "const ok = path.startsWith('/api/deployments/operations/');",
      expectedTerm: 'startsWith',
      description: 'Dashboard deployment prefix route guard',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-policy-telemetry-ui.tsx',
      sourceText:
        'const endpoint = "/api/policy-backends/evaluations/runs"; const body = { dryRunId, executionAuthority: { allowed: true } };',
      expectedTerm: 'executionAuthority',
      description: 'Dashboard policy telemetry request-body authority payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-policy-telemetry-ui.tsx',
      sourceText:
        'const endpoint = "/api/telemetry/exports/runs"; const ok = path.startsWith("/api/telemetry/exports/");',
      expectedTerm: 'startsWith',
      description: 'Dashboard policy telemetry prefix route guard',
    },
    {
      workspacePath: 'packages/production-ga-kernel/src/adversarial-direct-adapter.ts',
      sourceText:
        'import { executeGithubMerge } from "@codexhub/github-provider-adapter"; export const run = executeGithubMerge;',
      expectedTerm: '@codexhub/github-provider-adapter',
      description: 'Production GA kernel direct child adapter import',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const endpoint = "/api/production-ga/signoffs"; const body = { dryRunId };',
      expectedTerm: 'approvalArtifactIds',
      description: 'Dashboard Production GA signoff without two approval artifact ids',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const endpoint = "/api/production-ga/signoffs"; const body = { dryRunId, approvalArtifactIds, rawE2EPayload: "patch verify pr merge release deploy observe rollback" };',
      expectedTerm: 'rawE2EPayload',
      description: 'Dashboard Production GA raw E2E payload persistence attempt',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const endpoint = "/api/production-ga/signoffs"; const body = { dryRunId, approvalArtifactIds, childAuthority: { approved: true } };',
      expectedTerm: 'childAuthority',
      description: 'Dashboard Production GA child authority payload',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const endpoint = "/api/production-ga/signoffs"; window.localStorage.setItem("production-ga-token", token);',
      expectedTerm: 'localStorage',
      description: 'Dashboard Production GA local-control token persistence wrapper',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const ok = path.includes("/api/production-ga/"); fetch(path, { method: "POST" });',
      expectedTerm: 'includes(',
      description: 'Dashboard Production GA generic route passthrough',
    },
    {
      workspacePath: 'apps/dashboard/src/adversarial-production-ga-ui.tsx',
      sourceText:
        'const endpoint = "/api/production-ga/dry-runs"; const enabled = process.env.CODEXHUB_PRODUCTION_GA_ENABLED;',
      expectedTerm: 'CODEXHUB_PRODUCTION_GA_',
      description: 'Dashboard Production GA live env read',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-production-ga-cli.ts',
      sourceText:
        'await fetch(`${supervisorUrl}/api/production-ga/signoffs`, { method: "POST", headers: createSupervisorPostHeaders(), body: JSON.stringify({ approvalArtifactIds }) });',
      expectedTerm: 'method: "POST"',
      description: 'CLI Production GA generic signoff POST helper',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-production-ga-cli.ts',
      sourceText:
        'await postGa("/api/production-ga/signoffs", { approvalArtifactIds, rawE2EPayload });',
      expectedTerm: 'postGa',
      description: 'CLI Production GA generic route passthrough helper',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-production-ga-cli.ts',
      sourceText:
        'const localToken = process.env["CODEXHUB_SUPERVISOR_LOCAL_TOKEN"]; const route = "/api/production-ga/signoffs";',
      expectedTerm: 'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
      description: 'CLI Production GA local-control token env read',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-production-ga-cli.ts',
      sourceText:
        'const route = "/api/production-ga/approval-requests"; const body = { dryRunId, childArtifacts: [] };',
      expectedTerm: '/api/production-ga/approval-requests',
      description: 'CLI Production GA approval-request mutation route',
    },
    {
      workspacePath: 'packages/production-ga-kernel/src/adversarial-direct-adapter.ts',
      sourceText:
        'import * as deployment from "@codexhub/deployment-provider-adapter"; export const run = deployment.executeDeploymentOperation;',
      expectedTerm: '@codexhub/deployment-provider-adapter',
      description: 'Production GA kernel namespace child adapter import',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-browser.ts',
      sourceText: 'const browser = await chromium.launch();',
      expectedTerm: 'chromium.launch',
      description: 'Browser automation launch outside the reviewed Browser action boundary',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'const boundary = await import("node:child_process");',
      expectedTerm: 'node:child_process',
      description: 'MCP dynamic process boundary import',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'await fetch("https://api.github.com/repos/example/example");',
      expectedTerm: 'fetch(',
      description: 'MCP direct network boundary',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: "const githubToken = process.env['CODEXHUB_GITHUB_TOKEN'];",
      expectedTerm: 'CODEXHUB_GITHUB_TOKEN',
      description: 'MCP bracket-notation GitHub token env read',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'const localToken = process.env["CODEXHUB_SUPERVISOR_LOCAL_TOKEN"];',
      expectedTerm: 'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
      description: 'MCP bracket-notation local-control token env read',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: "const envName = ['CODEXHUB', 'GITHUB', 'TOKEN'].join('_'); const token = process.env[envName];",
      expectedTerm: 'process.env[',
      description: 'MCP dynamic GitHub token env read',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText:
        "const envName = ['CODEXHUB', 'SUPERVISOR', 'LOCAL', 'TOKEN'].join('_'); const token = process.env[envName];",
      expectedTerm: 'process.env[',
      description: 'MCP dynamic local-control token env read',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'const envName = "CODEXHUB_SUPERVISOR_LOCAL_" + "TOKEN";',
      expectedTerm: 'CODEXHUB_SUPERVISOR_LOCAL_',
      description: 'MCP local-control token env prefix reconstruction',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'await globalThis.fetch("https://api.github.com/repos/example/example");',
      expectedTerm: 'fetch(',
      description: 'MCP indirect network boundary',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'await globalThis["fetch"]("https://api.github.com/repos/example/example");',
      expectedTerm: 'globalThis["fetch"]',
      description: 'MCP bracket-notation network boundary',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText: 'const env = process["env"];',
      expectedTerm: 'process["env"]',
      description: 'MCP indirect process env access',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText:
        'const env = globalThis["process"]["env"]; const token = env["CODEXHUB_SUPERVISOR_LOCAL_TOKEN"];',
      expectedTerm: 'globalThis["process"]',
      description: 'MCP globalThis process env access through bracket notation',
    },
    {
      workspacePath: 'apps/codexhub-mcp-server/src/adversarial-tool.ts',
      sourceText:
        "const env = globalThis['process']['env']; const token = env['CODEXHUB_GITHUB_TOKEN'];",
      expectedTerm: "globalThis['process']",
      description: 'MCP globalThis process env access through single-quote bracket notation',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const command = "git push origin codexhub/test";',
      expectedTerm: 'git push',
      description: 'CLI GitHub remote push vocabulary',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = "/repos/example/example/git/refs";',
      expectedTerm: '/git/refs',
      description: 'CLI arbitrary GitHub ref mutation endpoint',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = "/repos/example/example/labels";',
      expectedTerm: '/labels',
      description: 'CLI GitHub label mutation endpoint',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = "/repos/example/example/releases";',
      expectedTerm: '/releases',
      description: 'CLI GitHub release mutation endpoint',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = "/repos/example/example/pulls/1/merge";',
      expectedTerm: '/pulls/',
      description: 'CLI generic GitHub merge endpoint construction',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = "/repos/example/example/requested_reviewers";',
      expectedTerm: '/requested_reviewers',
      description: 'CLI GitHub reviewer request mutation endpoint',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const payload = { force: true };',
      expectedTerm: 'force: true',
      description: 'CLI force ref update payload',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const payload = { draft: false };',
      expectedTerm: 'draft: false',
      description: 'CLI non-draft pull request payload',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const command = "git update-ref refs/heads/main";',
      expectedTerm: 'update-ref',
      description: 'CLI existing ref update operation',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: "const endpoint = ['/repos', owner, repo, 'git', 'refs'].join('/');",
      expectedTerm: "'git', 'refs'].join('/')",
      description: 'CLI segmented generic GitHub ref endpoint construction',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = ["/repos", owner, repo, "git", "refs"].join("/");',
      expectedTerm: '"git", "refs"].join("/")',
      description: 'CLI segmented generic GitHub ref endpoint construction with double quotes',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-github.ts',
      sourceText: 'const endpoint = new URL("/repos/example/example/git/refs", "https://api.github.com");',
      expectedTerm: '/git/refs',
      description: 'CLI generic GitHub URL builder for ref mutation endpoint',
    },
    {
      workspacePath: 'apps/cli/src/adversarial-token-env.ts',
      sourceText: 'const localToken = process.env["CODEXHUB_SUPERVISOR_LOCAL_TOKEN"];',
      expectedTerm: 'token',
      description: 'CLI local-control token env read outside exact mutation helpers',
    },
  ];

  for (const sentinel of sentinelCases) {
    if (adversarialSentinelWouldViolate(sentinel.workspacePath, sentinel.sourceText, sentinel.expectedTerm)) {
      continue;
    }

    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: sentinel.expectedTerm,
      reason: `Adversarial no-live audit sentinel failed to catch ${sentinel.description}.`,
    });
  }
}

function auditCustomWorkflowTemplateFiles(): void {
  const workflowDirectory = resolve(workspaceRoot, '.codexhub', 'workflows');
  if (!existsSync(workflowDirectory)) {
    return;
  }

  for (const entry of readdirSync(workflowDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.workflow.json')) {
      continue;
    }

    const file = resolve(workflowDirectory, entry.name);
    const sourceText = readFileSync(file, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(sourceText);
    } catch {
      violations.push({
        file,
        line: 1,
        term: entry.name,
        reason: 'Production custom workflow templates must be valid JSON.',
      });
      continue;
    }

    auditCustomWorkflowTemplateValue(file, parsed);
  }
}

function auditCustomWorkflowTemplateValue(file: string, value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      auditCustomWorkflowTemplateValue(file, item);
    }
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (customWorkflowTemplateForbiddenKeys.has(key)) {
      violations.push({
        file,
        line: 1,
        term: key,
        reason:
          'Production custom workflow templates must not include raw bodies, paths, secrets, authority artifacts, or policy-weakening fields.',
      });
    }

    if (key === 'approvalRequired' && nested === false) {
      violations.push({
        file,
        line: 1,
        term: key,
        reason: 'Production custom workflow templates cannot weaken approval requirements.',
      });
    }

    auditCustomWorkflowTemplateValue(file, nested);
  }
}

function adversarialSentinelWouldViolate(
  workspacePath: string,
  sourceText: string,
  expectedTerm: string,
): boolean {
  const file = resolve(workspaceRoot, workspacePath);
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const before = violations.length;

  auditImports(file, sourceFile, sourceText);
  auditCallExpressions(file, sourceFile);
  auditTextTerms(file, sourceText);
  auditM9ApprovalUxGuards(file, sourceText);
  auditDashboardMutationSurfaceGuards(file, sourceText);
  auditDashboardRecoveryWizardScopedGuards(file, sourceText);
  auditDashboardMergeWizardScopedGuards(file, sourceText);
  auditDashboardDeploymentOperationWizardScopedGuards(file, sourceText);
  auditDashboardPolicyTelemetryWizardScopedGuards(file, sourceText);
  auditDashboardProductionGaWizardScopedGuards(file, sourceText);
  auditFixedAdapterBoundaryGuards(file, sourceText);
  auditCliControlledWriteSurfaceGuards(file, sourceText);
  auditCliProductionGaReadOnlyGuards(file, sourceText);

  const addedViolations = violations.splice(before);

  return addedViolations.some(
    (violation) => violation.term === expectedTerm || violation.term.includes(expectedTerm),
  );
}

function auditFile(file: string): void {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);

  auditImports(file, sourceFile, sourceText);
  auditCallExpressions(file, sourceFile);
  auditTextTerms(file, sourceText);
  auditM9ApprovalUxGuards(file, sourceText);
  auditDashboardMutationSurfaceGuards(file, sourceText);
  auditDashboardRecoveryWizardScopedGuards(file, sourceText);
  auditDashboardMergeWizardScopedGuards(file, sourceText);
  auditDashboardDeploymentOperationWizardScopedGuards(file, sourceText);
  auditDashboardPolicyTelemetryWizardScopedGuards(file, sourceText);
  auditDashboardProductionGaWizardScopedGuards(file, sourceText);
  auditFixedAdapterBoundaryGuards(file, sourceText);
  auditCliControlledWriteSurfaceGuards(file, sourceText);
  auditCliProductionGaReadOnlyGuards(file, sourceText);
}

function auditImports(file: string, sourceFile: ts.SourceFile, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  for (const importPath of collectModuleSpecifiers(sourceFile, sourceText)) {
    if (
      workspacePath.startsWith('packages/production-ga-kernel/src/') &&
      productionGaKernelForbiddenImports.includes(importPath)
    ) {
      violations.push({
        file,
        line: 1,
        term: importPath,
        reason:
          'Production GA kernel must aggregate child control-plane metadata only and must not import child capability adapters directly.',
      });
    }

    if (externalProcessModules.includes(importPath)) {
      if (isApprovedExternalProcessBoundary(workspacePath) && importPath === 'node:child_process') {
        continue;
      }

      violations.push({
        file,
        line: 1,
        term: importPath,
        reason:
          'External process modules are allowed only in the audited read-only adapter boundary module.',
      });
    }

    if (liveAutomationModules.includes(importPath) && !isApprovedLiveAutomationBoundary(workspacePath)) {
      violations.push({
        file,
        line: 1,
        term: importPath,
        reason: 'Live browser automation modules are allowed only in audited adapter boundary modules.',
      });
    }

    if (
      isPolicyTelemetryRuntimeImport(importPath) &&
      !isApprovedPolicyTelemetryRuntimeBoundary(workspacePath) &&
      !isAllowed(workspacePath, importPath)
    ) {
      violations.push({
        file,
        line: 1,
        term: importPath,
        reason:
          'Policy backend and telemetry foundation must not import OPA, Cedar, OpenTelemetry, or OTLP runtimes in production source.',
      });
    }
  }
}

function auditCallExpressions(file: string, sourceFile: ts.SourceFile): void {
  const workspacePath = toWorkspacePath(file);

  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const callName = node.expression.text;

      if (callName === 'spawn' || callName === 'exec') {
        if (isApprovedExternalProcessBoundary(workspacePath) && callName === 'spawn') {
          ts.forEachChild(node, visit);
          return;
        }

        violations.push({
          file,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          term: `${callName}(`,
          reason:
            'External process execution calls are allowed only in the audited read-only adapter boundary module.',
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function auditTextTerms(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);
  const lines = sourceText.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const lowerLine = line.toLowerCase();

    for (const term of executableTextTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedLiveAutomationBoundary(workspacePath) &&
        !isApprovedCdpWebSocketBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason: 'Live automation entrypoint text must not appear in executable source.',
        });
      }
    }

    for (const term of cdpHttpBoundaryTerms) {
      if (
        line.includes(term) &&
        !isApprovedCdpHttpBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'DevTools HTTP metadata endpoint text is allowed only in the audited Electron/CDP HTTP boundary module.',
        });
      }
    }

    for (const term of cdpForbiddenTransportTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedCdpWebSocketBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason: 'Electron/CDP WebSocket transport text is forbidden outside docs and tests.',
        });
      }
    }

    for (const term of cdpCommandPassthroughTerms) {
      if (lowerLine.includes(term.toLowerCase()) && !isAllowed(workspacePath, term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason: 'Generic CDP command passthrough text is forbidden outside docs and tests.',
        });
      }
    }

    for (const term of gitBoundaryTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedGitBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Controlled git command text is allowed only in the audited worktree boundary module, docs, or tests.',
        });
      }
    }

    for (const term of localArtifactWriteTerms) {
      if (
        line.includes(term) &&
        !isApprovedLocalArtifactWriteBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Local artifact file writes are allowed only in audited local package export boundary modules, docs, or tests.',
        });
      }
    }

    for (const term of githubHttpBoundaryTerms) {
      if (
        line.includes(term) &&
        !isApprovedGithubHttpBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'GitHub HTTP metadata endpoint/header text is allowed only in the audited GitHub provider boundary module, docs, or tests.',
        });
      }
    }

    for (const term of githubForbiddenRemoteMutationTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedGithubHttpBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'GitHub remote mutation endpoint text is allowed only in the audited GitHub provider boundary module, docs, or tests.',
        });
      }
    }

    for (const term of policyTelemetryRuntimeTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedPolicyTelemetryRuntimeBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Real policy backend runtimes and telemetry exporters are forbidden outside docs, tests, and audit vocabulary.',
        });
      }
    }

    for (const term of sensitiveConceptTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isAllowedSensitiveMetadataLine(lowerLine, term) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason: 'Credential or account-control vocabulary is only allowed in documented redaction placeholders.',
        });
      }
    }
  }
}

function auditFixedAdapterBoundaryGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);
  if (workspacePath === 'tools/audit-no-live-automation.ts' || workspacePath.endsWith('.test.ts')) {
    return;
  }

  const lines = sourceText.split(/\r?\n/);
  const isOperatorSource =
    workspacePath.startsWith('apps/cli/src/') ||
    workspacePath.startsWith('apps/dashboard/src/') ||
    workspacePath.startsWith('apps/codexhub-mcp-server/src/');
  const isCliOrMcpSource =
    workspacePath.startsWith('apps/cli/src/') ||
    workspacePath.startsWith('apps/codexhub-mcp-server/src/');

  for (const [index, line] of lines.entries()) {
    const lowerLine = line.toLowerCase();

    for (const term of deploymentWritePassthroughTerms) {
      if (lowerLine.includes(term.toLowerCase()) && !isAllowed(workspacePath, term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Deployment write command text is allowed only through reviewed deployment operation boundaries, docs, or tests.',
        });
      }
    }

    for (const term of browserDirectActionTerms) {
      if (
        lowerLine.includes(term.toLowerCase()) &&
        !isApprovedLiveAutomationBoundary(workspacePath) &&
        !isAllowed(workspacePath, term)
      ) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Direct Browser action calls are forbidden outside the reviewed Browser action boundary, docs, or tests.',
        });
      }
    }

    for (const term of electronRuntimeEvaluateTerms) {
      if (isOperatorSource && line.includes(term) && !isAllowed(workspacePath, term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Electron Runtime.evaluate command text must not appear in operator surfaces outside governed metadata views.',
        });
      }
    }

    for (const term of mcpWriteToolDirectTerms) {
      if (isCliOrMcpSource && line.includes(term) && !isAllowed(workspacePath, term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'MCP workspace write tool names must not be exposed directly by CLI or MCP production source.',
        });
      }
    }
  }
}

function auditCliControlledWriteSurfaceGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (!workspacePath.startsWith('apps/cli/src/') || workspacePath.endsWith('.test.ts')) {
    return;
  }

  const lines = sourceText.split(/\r?\n/);
  const controlledWriteWindow = getCliControlledWriteWindow(workspacePath, sourceText);

  for (const [index, line] of lines.entries()) {
    for (const term of cliTokenOptionTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'CLI mutation commands must read local-control tokens from environment only; token command-line options are forbidden.',
        });
      }
    }
  }

  if (controlledWriteWindow === undefined) {
    return;
  }

  const controlledWriteLines = controlledWriteWindow.source.split(/\r?\n/);

  for (const [index, line] of controlledWriteLines.entries()) {
    for (const term of cliControlledWriteRouteBypassTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: controlledWriteWindow.startLine + index,
          term,
          reason:
            'M45 controlled write CLI routes must stay exact; prefix, substring, and dynamic route guards are forbidden.',
        });
      }
    }

    for (const term of cliControlledWriteForbiddenPayloadTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: controlledWriteWindow.startLine + index,
          term,
          reason:
            'M45 controlled write CLI payloads may send only ids, hashes, and metadata; authority artifacts and raw input are forbidden.',
        });
      }
    }
  }
}

function auditCliProductionGaReadOnlyGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (!workspacePath.startsWith('apps/cli/src/') || workspacePath.endsWith('.test.ts')) {
    return;
  }

  if (!sourceText.includes('/api/production-ga/')) {
    return;
  }

  const windows = getCliProductionGaReadOnlyWindows(workspacePath, sourceText);

  for (const window of windows) {
    const lines = window.source.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      for (const term of cliProductionGaForbiddenMutationTerms) {
        if (line.includes(term)) {
          violations.push({
            file,
            line: window.startLine + index,
            term,
            reason:
              'CLI Production GA commands must remain read-only GET/local projection helpers; GA signoff mutation belongs to the Supervisor/Dashboard guided control plane, not CLI generic POST helpers.',
          });
        }
      }

      for (const term of cliProductionGaForbiddenPayloadTerms) {
        if (line.includes(term)) {
          violations.push({
            file,
            line: window.startLine + index,
            term,
            reason:
              'CLI Production GA read-only output must not send authority, forged artifacts, raw E2E payloads, raw transport data, or local-control tokens.',
          });
        }
      }
    }
  }
}

function getCliProductionGaReadOnlyWindows(
  workspacePath: string,
  sourceText: string,
): { source: string; startLine: number }[] {
  if (workspacePath.includes('adversarial-production-ga-cli')) {
    return [{ source: sourceText, startLine: 1 }];
  }

  const windows: { source: string; startLine: number }[] = [];

  for (const [startMarker, endMarker] of [
    ['function registerProductionGaReadOnlyCommands', 'interface ControlledWriteCliOptions'],
    ['async function getProductionGaStatusForCli', 'function normalizeRuntimeSchedulerRehearsalScenario'],
  ] as const) {
    const start = sourceText.indexOf(startMarker);
    if (start < 0) {
      continue;
    }

    const end = sourceText.indexOf(endMarker, start);
    const source = sourceText.slice(start, end >= 0 ? end : sourceText.length);
    const startLine = sourceText.slice(0, start).split(/\r?\n/).length;
    windows.push({ source, startLine });
  }

  return windows;
}

function getCliControlledWriteWindow(
  workspacePath: string,
  sourceText: string,
): { source: string; startLine: number } | undefined {
  if (workspacePath.includes('adversarial-controlled-write-cli')) {
    return { source: sourceText, startLine: 1 };
  }

  const start = sourceText.indexOf('const controlledWriteCliMutationRoutes');
  if (start < 0) {
    return undefined;
  }

  const endMarker = 'function registerSecretReadOnlyCommands';
  const end = sourceText.indexOf(endMarker, start);
  const source = sourceText.slice(start, end >= 0 ? end : sourceText.length);
  const startLine = sourceText.slice(0, start).split(/\r?\n/).length;

  return { source, startLine };
}

function auditM9ApprovalUxGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);
  const isDashboardSource = workspacePath.startsWith('apps/dashboard/src/');
  const isCliSource = workspacePath.startsWith('apps/cli/src/');
  const isMcpSource = workspacePath.startsWith('apps/codexhub-mcp-server/src/');

  if ((!isDashboardSource && !isCliSource && !isMcpSource) || workspacePath.endsWith('.test.ts')) {
    return;
  }

  const lines = sourceText.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const term of directAdapterExecuteTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Dashboard, CLI, and MCP tools must not directly call capability adapter execute functions; mutations must go through Supervisor/workflow governance.',
        });
      }
    }

    for (const term of directExternalAgentExecutionTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Dashboard, CLI, and MCP tools must not directly call external agent execution helpers; agent runs must resolve through Supervisor and workflow governance.',
        });
      }
    }

    for (const term of dynamicAdapterExecutePropertyTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Dashboard, CLI, and MCP tools must not reconstruct adapter execute helpers through dynamic property access.',
        });
      }
    }

    if (isMcpSource) {
      for (const term of mcpBoundaryBypassTerms) {
        if (term === 'process.env[' && isAllowedMcpLocalHttpGateEnvLine(workspacePath, line)) {
          continue;
        }

        if (line.includes(term)) {
          violations.push({
            file,
            line: index + 1,
            term,
            reason:
              'MCP tools must remain read-only and must not start process/network boundaries, read GitHub tokens, read local-control tokens, or bypass Supervisor governance.',
          });
        }
      }
    }
  }

  const hasGovernedDashboardMutation =
    sourceText.includes('/api/approvals/decisions') ||
    sourceText.includes('/api/workflows/production/recoveries/') ||
    sourceText.includes('/api/github/merges/') ||
    sourceText.includes('/api/deployments/operations/') ||
    sourceText.includes('/api/policy-backends/evaluations/') ||
    sourceText.includes('/api/telemetry/exports/');

  if (!isDashboardSource || !hasGovernedDashboardMutation) {
    return;
  }

  for (const [index, line] of lines.entries()) {
    for (const term of dashboardPersistenceTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
            'Dashboard approval UX must keep the local control token in session memory only; browser storage is forbidden.',
        });
      }
    }

    if (sourceText.includes('/api/workflows/production/recoveries/')) {
      for (const term of dashboardRecoveryForbiddenPayloadTerms) {
        if (line.includes(term)) {
          violations.push({
            file,
            line: index + 1,
            term,
            reason:
              'Dashboard recovery wizard may only send ids and hashes to the recovery control plane; request-body authority, child artifacts, and child auto-approval payloads are forbidden.',
          });
        }
      }
    }

  }
}

function auditDashboardMutationSurfaceGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (!workspacePath.startsWith('apps/dashboard/src/') || workspacePath.endsWith('.test.ts')) {
    return;
  }

  const lines = sourceText.split(/\r?\n/);
  const isAllowedDashboardMutationFile = workspacePath === 'apps/dashboard/src/App.tsx';

  for (const [index, line] of lines.entries()) {
    for (const term of dashboardPersistenceTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason:
          'Dashboard local-control tokens must stay in component memory only; browser storage wrappers are forbidden.',
        });
      }
    }

    for (const term of dashboardMutationSurfaceTerms) {
      if (!line.includes(term)) {
        continue;
      }

      if (isAllowedDashboardMutationFile && isAllowedDashboardMutationLine(lines, index)) {
        continue;
      }

      violations.push({
        file,
        line: index + 1,
        term,
        reason:
          'Dashboard mutating HTTP helpers are allowed only in the approval decision UI, recovery wizard, merge wizard, deployment wizard, policy telemetry wizard, and Production GA panel, with exact route allowlists.',
      });
    }
  }
}

function isAllowedDashboardMutationLine(lines: string[], index: number): boolean {
  const window = lines
    .slice(Math.max(0, index - 12), Math.min(lines.length, index + 12))
    .join('\n');

  return (
    window.includes('/api/approvals/decisions') ||
    (window.includes('recoveryDashboardPostRoutes.has(path)') &&
      dashboardRecoveryExactPostRoutes.every((route) => lines.join('\n').includes(route))) ||
    (window.includes('mergeDashboardPostRoutes.has(path)') &&
      dashboardMergeExactPostRoutes.every((route) => lines.join('\n').includes(route))) ||
    (window.includes('deploymentOperationDashboardPostRoutes.has(path)') &&
      dashboardDeploymentOperationExactPostRoutes.every((route) =>
        lines.join('\n').includes(route),
      )) ||
    (window.includes('policyTelemetryDashboardPostRoutes.has(path)') &&
      dashboardPolicyTelemetryExactPostRoutes.every((route) => lines.join('\n').includes(route))) ||
    (window.includes('productionGaDashboardPostRoutes.has(path)') &&
      dashboardProductionGaExactPostRoutes.every((route) => lines.join('\n').includes(route)))
  );
}

function auditDashboardRecoveryWizardScopedGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (
    workspacePath !== 'apps/dashboard/src/App.tsx' &&
    !workspacePath.includes('adversarial-recovery-ui')
  ) {
    return;
  }

  if (!sourceText.includes('/api/workflows/production/recoveries/')) {
    return;
  }

  if (workspacePath.includes('adversarial-recovery-ui')) {
    auditDashboardRecoverySnippetGuards(file, sourceText);
    return;
  }

  for (const route of dashboardRecoveryExactPostRoutes) {
    if (!sourceText.includes(route)) {
      violations.push({
        file,
        line: 1,
        term: route,
        reason: 'Dashboard recovery wizard must keep every allowed POST route explicit.',
      });
    }
  }

  const approvalRequestWindow = getWindowBetween(
    sourceText,
    'async function requestRecoveryApproval',
    'async function approveRecoveryRequest',
  );
  const manualApprovalWindow = getWindowBetween(
    sourceText,
    'async function approveRecoveryRequest',
    'async function runRecovery',
  );
  const runWindow = getWindowBetween(
    sourceText,
    'async function runRecovery',
    'if (activeView ===',
  );
  const postWindow = getWindowBetween(sourceText, 'async function postRecoveryJson', '');

  for (const [name, window] of [
    ['requestRecoveryApproval', approvalRequestWindow],
    ['approveRecoveryRequest', manualApprovalWindow],
    ['runRecovery', runWindow],
  ] as const) {
    auditDashboardRecoveryPayloadWindow(file, name, window);
  }

  if (!postWindow.includes('recoveryDashboardPostRoutes.has(path)')) {
    violations.push({
      file,
      line: findLineNumber(sourceText, 'async function postRecoveryJson'),
      term: 'recoveryDashboardPostRoutes.has(path)',
      reason: 'Dashboard recovery POST helper must enforce the exact route allowlist.',
    });
  }

  for (const term of dashboardRecoveryRouteBypassTerms) {
    if (postWindow.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(sourceText, term),
        term,
        reason:
          'Dashboard recovery POST helper must not use prefix, substring, or dynamic route guards.',
      });
    }
  }
}

function auditDashboardRecoverySnippetGuards(file: string, sourceText: string): void {
  for (const term of dashboardRecoveryScopedPayloadTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard recovery wizard may only send ids and hashes; raw reasons, authority objects, child artifacts, and child auto-approval payloads are forbidden.',
      });
    }
  }

  for (const term of dashboardRecoveryRouteBypassTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard recovery wizard route checks must use the exact recovery route allowlist.',
      });
    }
  }
}

function auditDashboardRecoveryPayloadWindow(file: string, name: string, window: string): void {
  if (window.length === 0) {
    violations.push({
      file,
      line: 1,
      term: name,
      reason: `Dashboard recovery wizard function ${name} must remain present for scoped audit coverage.`,
    });
    return;
  }

  for (const term of dashboardRecoveryScopedPayloadTerms) {
    if (window.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(window, term),
        term,
        reason:
          'Dashboard recovery wizard may only send ids and hashes to the recovery control plane; raw reasons, request-body authority, child artifacts, and child auto-approval payloads are forbidden.',
      });
    }
  }
}

function auditDashboardMergeWizardScopedGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (
    workspacePath !== 'apps/dashboard/src/App.tsx' &&
    !workspacePath.includes('adversarial-merge-ui')
  ) {
    return;
  }

  if (!sourceText.includes('/api/github/merges/')) {
    return;
  }

  if (workspacePath.includes('adversarial-merge-ui')) {
    auditDashboardMergeSnippetGuards(file, sourceText);
    return;
  }

  for (const route of dashboardMergeExactPostRoutes) {
    if (!sourceText.includes(route)) {
      violations.push({
        file,
        line: 1,
        term: route,
        reason: 'Dashboard merge wizard must keep every allowed POST route explicit.',
      });
    }
  }

  const dryRunWindow = getWindowBetween(
    sourceText,
    'async function createMergeDryRun',
    'async function requestMergeApproval',
  );
  const approvalRequestWindow = getWindowBetween(
    sourceText,
    'async function requestMergeApproval',
    'async function approveMergeRequest',
  );
  const manualApprovalWindow = getWindowBetween(
    sourceText,
    'async function approveMergeRequest',
    'async function runMerge',
  );
  const runWindow = getWindowBetween(sourceText, 'async function runMerge', 'if (activeView ===');
  const postWindow = getWindowBetween(sourceText, 'async function postMergeJson', '');

  for (const [name, window] of [
    ['createMergeDryRun', dryRunWindow],
    ['requestMergeApproval', approvalRequestWindow],
    ['approveMergeRequest', manualApprovalWindow],
    ['runMerge', runWindow],
  ] as const) {
    auditDashboardMergePayloadWindow(file, name, window);
  }

  if (!postWindow.includes('mergeDashboardPostRoutes.has(path)')) {
    violations.push({
      file,
      line: findLineNumber(sourceText, 'async function postMergeJson'),
      term: 'mergeDashboardPostRoutes.has(path)',
      reason: 'Dashboard merge POST helper must enforce the exact route allowlist.',
    });
  }

  for (const term of dashboardMergeRouteBypassTerms) {
    if (postWindow.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(sourceText, term),
        term,
        reason:
          'Dashboard merge POST helper must not use prefix, substring, or dynamic route guards.',
      });
    }
  }
}

function auditDashboardMergeSnippetGuards(file: string, sourceText: string): void {
  for (const term of dashboardMergeScopedPayloadTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard merge wizard may only send ids, hashes, fixed strategy, and approver tags; raw reasons, authority objects, forged artifacts, raw GitHub data, and token payloads are forbidden.',
      });
    }
  }

  for (const term of dashboardMergeRouteBypassTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason: 'Dashboard merge wizard route checks must use the exact merge route allowlist.',
      });
    }
  }
}

function auditDashboardMergePayloadWindow(file: string, name: string, window: string): void {
  if (window.length === 0) {
    violations.push({
      file,
      line: 1,
      term: name,
      reason: `Dashboard merge wizard function ${name} must remain present for scoped audit coverage.`,
    });
    return;
  }

  for (const term of dashboardMergeScopedPayloadTerms) {
    if (window.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(window, term),
        term,
        reason:
          'Dashboard merge wizard may only send ids, hashes, fixed strategy, and approver tags to the merge control plane; raw reasons, request-body authority, forged artifacts, raw GitHub data, and token payloads are forbidden.',
      });
    }
  }
}

function auditDashboardDeploymentOperationWizardScopedGuards(
  file: string,
  sourceText: string,
): void {
  const workspacePath = toWorkspacePath(file);

  if (
    workspacePath !== 'apps/dashboard/src/App.tsx' &&
    !workspacePath.includes('adversarial-deployment-ui')
  ) {
    return;
  }

  if (!sourceText.includes('/api/deployments/operations/')) {
    return;
  }

  if (workspacePath.includes('adversarial-deployment-ui')) {
    auditDashboardDeploymentOperationSnippetGuards(file, sourceText);
    return;
  }

  for (const route of dashboardDeploymentOperationExactPostRoutes) {
    if (!sourceText.includes(route)) {
      violations.push({
        file,
        line: 1,
        term: route,
        reason: 'Dashboard deployment wizard must keep every allowed POST route explicit.',
      });
    }
  }

  const dryRunWindow = getWindowBetween(
    sourceText,
    'async function createDeploymentOperationDryRun',
    'async function requestDeploymentOperationApproval',
  );
  const approvalRequestWindow = getWindowBetween(
    sourceText,
    'async function requestDeploymentOperationApproval',
    'async function approveDeploymentOperationRequest',
  );
  const manualApprovalWindow = getWindowBetween(
    sourceText,
    'async function approveDeploymentOperationRequest',
    'async function createDeploymentRollbackPlan',
  );
  const rollbackPlanWindow = getWindowBetween(
    sourceText,
    'async function createDeploymentRollbackPlan',
    'async function runDeploymentOperation',
  );
  const runWindow = getWindowBetween(
    sourceText,
    'async function runDeploymentOperation',
    'return (',
  );
  const postWindow = getWindowBetween(
    sourceText,
    'async function postDeploymentOperationJson',
    '',
  );

  for (const [name, window] of [
    ['createDeploymentOperationDryRun', dryRunWindow],
    ['requestDeploymentOperationApproval', approvalRequestWindow],
    ['approveDeploymentOperationRequest', manualApprovalWindow],
    ['createDeploymentRollbackPlan', rollbackPlanWindow],
    ['runDeploymentOperation', runWindow],
  ] as const) {
    auditDashboardDeploymentOperationPayloadWindow(file, name, window);
  }

  if (!postWindow.includes('deploymentOperationDashboardPostRoutes.has(path)')) {
    violations.push({
      file,
      line: findLineNumber(sourceText, 'async function postDeploymentOperationJson'),
      term: 'deploymentOperationDashboardPostRoutes.has(path)',
      reason: 'Dashboard deployment POST helper must enforce the exact route allowlist.',
    });
  }

  for (const term of dashboardDeploymentOperationRouteBypassTerms) {
    if (postWindow.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(sourceText, term),
        term,
        reason:
          'Dashboard deployment POST helper must not use prefix, substring, or dynamic route guards.',
      });
    }
  }
}

function auditDashboardDeploymentOperationSnippetGuards(file: string, sourceText: string): void {
  for (const term of dashboardDeploymentOperationScopedPayloadTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard deployment wizard may only send ids, hashes, provider/action/environment metadata, and approver tags; raw deployment bodies, authority objects, forged artifacts, and env payloads are forbidden.',
      });
    }
  }

  for (const term of dashboardDeploymentOperationRouteBypassTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason: 'Dashboard deployment wizard route checks must use the exact route allowlist.',
      });
    }
  }
}

function auditDashboardDeploymentOperationPayloadWindow(
  file: string,
  name: string,
  window: string,
): void {
  if (window.length === 0) {
    violations.push({
      file,
      line: 1,
      term: name,
      reason: `Dashboard deployment wizard function ${name} must remain present for scoped audit coverage.`,
    });
    return;
  }

  for (const term of dashboardDeploymentOperationScopedPayloadTerms) {
    if (window.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(window, term),
        term,
        reason:
          'Dashboard deployment wizard may only send ids, hashes, provider/action/environment metadata, and approver tags to the deployment operation control plane; raw deployment bodies, request-body authority, forged artifacts, and env payloads are forbidden.',
      });
    }
  }
}

function auditDashboardPolicyTelemetryWizardScopedGuards(
  file: string,
  sourceText: string,
): void {
  const workspacePath = toWorkspacePath(file);

  if (
    workspacePath !== 'apps/dashboard/src/App.tsx' &&
    !workspacePath.includes('adversarial-policy-telemetry-ui')
  ) {
    return;
  }

  if (
    !sourceText.includes('/api/policy-backends/evaluations/') &&
    !sourceText.includes('/api/telemetry/exports/')
  ) {
    return;
  }

  if (workspacePath.includes('adversarial-policy-telemetry-ui')) {
    auditDashboardPolicyTelemetrySnippetGuards(file, sourceText);
    return;
  }

  for (const route of dashboardPolicyTelemetryExactPostRoutes) {
    if (!sourceText.includes(route)) {
      violations.push({
        file,
        line: 1,
        term: route,
        reason: 'Dashboard policy telemetry wizard must keep every allowed POST route explicit.',
      });
    }
  }

  const dryRunWindow = getWindowBetween(
    sourceText,
    'async function createPolicyTelemetryDryRun',
    'async function requestPolicyTelemetryApproval',
  );
  const approvalRequestWindow = getWindowBetween(
    sourceText,
    'async function requestPolicyTelemetryApproval',
    'async function approvePolicyTelemetryRequest',
  );
  const manualApprovalWindow = getWindowBetween(
    sourceText,
    'async function approvePolicyTelemetryRequest',
    'async function runPolicyTelemetry',
  );
  const runWindow = getWindowBetween(
    sourceText,
    'async function runPolicyTelemetry',
    'async function submitApprovalDecision',
  );
  const postWindow = getWindowBetween(sourceText, 'async function postPolicyTelemetryJson', '');

  for (const [name, window] of [
    ['createPolicyTelemetryDryRun', dryRunWindow],
    ['requestPolicyTelemetryApproval', approvalRequestWindow],
    ['approvePolicyTelemetryRequest', manualApprovalWindow],
    ['runPolicyTelemetry', runWindow],
  ] as const) {
    auditDashboardPolicyTelemetryPayloadWindow(file, name, window);
  }

  if (!postWindow.includes('policyTelemetryDashboardPostRoutes.has(path)')) {
    violations.push({
      file,
      line: findLineNumber(sourceText, 'async function postPolicyTelemetryJson'),
      term: 'policyTelemetryDashboardPostRoutes.has(path)',
      reason: 'Dashboard policy telemetry POST helper must enforce the exact route allowlist.',
    });
  }

  for (const term of dashboardPolicyTelemetryRouteBypassTerms) {
    if (postWindow.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(sourceText, term),
        term,
        reason:
          'Dashboard policy telemetry POST helper must not use prefix, substring, or dynamic route guards.',
      });
    }
  }
}

function auditDashboardPolicyTelemetrySnippetGuards(file: string, sourceText: string): void {
  for (const term of dashboardPolicyTelemetryScopedPayloadTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard policy telemetry wizard may only send ids, hashes, fixed provider/runtime metadata, and approver tags; raw policy, telemetry, authority, forged artifacts, and env payloads are forbidden.',
      });
    }
  }

  for (const term of dashboardPolicyTelemetryRouteBypassTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason: 'Dashboard policy telemetry wizard route checks must use the exact route allowlist.',
      });
    }
  }
}

function auditDashboardPolicyTelemetryPayloadWindow(
  file: string,
  name: string,
  window: string,
): void {
  if (window.length === 0) {
    violations.push({
      file,
      line: 1,
      term: name,
      reason: `Dashboard policy telemetry wizard function ${name} must remain present for scoped audit coverage.`,
    });
    return;
  }

  for (const term of dashboardPolicyTelemetryScopedPayloadTerms) {
    if (window.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(window, term),
        term,
        reason:
          'Dashboard policy telemetry wizard may only send ids, hashes, fixed provider/runtime metadata, and approver tags to the M44 control planes; raw policy, telemetry, request-body authority, forged artifacts, and env payloads are forbidden.',
      });
    }
  }
}

function auditDashboardProductionGaWizardScopedGuards(file: string, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  if (
    workspacePath !== 'apps/dashboard/src/App.tsx' &&
    !workspacePath.includes('adversarial-production-ga-ui')
  ) {
    return;
  }

  if (!sourceText.includes('/api/production-ga/')) {
    return;
  }

  if (workspacePath.includes('adversarial-production-ga-ui')) {
    auditDashboardProductionGaSnippetGuards(file, sourceText);
    return;
  }

  for (const route of dashboardProductionGaExactPostRoutes) {
    if (!sourceText.includes(route)) {
      violations.push({
        file,
        line: 1,
        term: route,
        reason: 'Dashboard Production GA panel must keep every allowed POST route explicit.',
      });
    }
  }

  const dryRunWindow = getWindowBetween(
    sourceText,
    'async function createProductionGaDryRun',
    'async function requestProductionGaApproval',
  );
  const approvalRequestWindow = getWindowBetween(
    sourceText,
    'async function requestProductionGaApproval',
    'async function approveProductionGaRequest',
  );
  const manualApprovalWindow = getWindowBetween(
    sourceText,
    'async function approveProductionGaRequest',
    'async function runProductionGaSignoff',
  );
  const signoffWindow = getWindowBetween(
    sourceText,
    'async function runProductionGaSignoff',
    'async function runProductionGaRehearsal',
  );
  const rehearsalWindow = getWindowBetween(
    sourceText,
    'async function runProductionGaRehearsal',
    'async function recordProductionGaTrainingCompletion',
  );
  const trainingWindow = getWindowBetween(
    sourceText,
    'async function recordProductionGaTrainingCompletion',
    'async function submitApprovalDecision',
  );
  const postWindow = getWindowBetween(sourceText, 'async function postProductionGaJson', '');

  for (const [name, window] of [
    ['createProductionGaDryRun', dryRunWindow],
    ['requestProductionGaApproval', approvalRequestWindow],
    ['approveProductionGaRequest', manualApprovalWindow],
    ['runProductionGaSignoff', signoffWindow],
    ['runProductionGaRehearsal', rehearsalWindow],
    ['recordProductionGaTrainingCompletion', trainingWindow],
  ] as const) {
    auditDashboardProductionGaPayloadWindow(file, name, window);
  }

  if (!postWindow.includes('productionGaDashboardPostRoutes.has(path)')) {
    violations.push({
      file,
      line: findLineNumber(sourceText, 'async function postProductionGaJson'),
      term: 'productionGaDashboardPostRoutes.has(path)',
      reason: 'Dashboard Production GA POST helper must enforce the exact route allowlist.',
    });
  }

  for (const term of dashboardProductionGaRouteBypassTerms) {
    if (postWindow.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(sourceText, term),
        term,
        reason:
          'Dashboard Production GA POST helper must not use prefix, substring, or dynamic route guards.',
      });
    }
  }
}

function auditDashboardProductionGaSnippetGuards(file: string, sourceText: string): void {
  if (sourceText.includes('/api/production-ga/signoffs') && !sourceText.includes('approvalArtifactIds')) {
    violations.push({
      file,
      line: 1,
      term: 'approvalArtifactIds',
      reason:
        'Dashboard Production GA signoff requests must include two store-resolved approval artifact ids.',
    });
  }

  for (const term of dashboardProductionGaScopedPayloadTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason:
          'Dashboard Production GA panel may only send ids, hashes, scenario ids, and approver tags; raw E2E, authority, forged artifacts, and env payloads are forbidden.',
      });
    }
  }

  for (const term of dashboardProductionGaRouteBypassTerms) {
    if (sourceText.includes(term)) {
      violations.push({
        file,
        line: 1,
        term,
        reason: 'Dashboard Production GA route checks must use the exact route allowlist.',
      });
    }
  }
}

function auditDashboardProductionGaPayloadWindow(
  file: string,
  name: string,
  window: string,
): void {
  if (window.length === 0) {
    violations.push({
      file,
      line: 1,
      term: name,
      reason: `Dashboard Production GA function ${name} must remain present for scoped audit coverage.`,
    });
    return;
  }

  if (name === 'runProductionGaSignoff' && !window.includes('approvalArtifactIds')) {
    violations.push({
      file,
      line: 1,
      term: 'approvalArtifactIds',
      reason:
        'Dashboard Production GA signoff requests must stay bound to two persisted approval artifact ids.',
    });
  }

  for (const term of dashboardProductionGaScopedPayloadTerms) {
    if (window.includes(term)) {
      violations.push({
        file,
        line: findLineNumber(window, term),
        term,
        reason:
          'Dashboard Production GA panel may only send ids, hashes, scenario ids, and approver tags to the GA control plane; raw E2E payloads, request-body authority, forged artifacts, and env payloads are forbidden.',
      });
    }
  }
}

function getWindowBetween(sourceText: string, startMarker: string, endMarker: string): string {
  const start = sourceText.indexOf(startMarker);

  if (start < 0) {
    return '';
  }

  if (endMarker.length === 0) {
    return sourceText.slice(start);
  }

  const end = sourceText.indexOf(endMarker, start + startMarker.length);

  return end < 0 ? sourceText.slice(start) : sourceText.slice(start, end);
}

function findLineNumber(sourceText: string, term: string): number {
  const index = sourceText.indexOf(term);

  if (index < 0) {
    return 1;
  }

  return sourceText.slice(0, index).split(/\r?\n/).length;
}

function isAllowedMcpLocalHttpGateEnvLine(workspacePath: string, line: string): boolean {
  return (
    workspacePath === 'apps/codexhub-mcp-server/src/security.ts' &&
    line.includes('process.env[MCP_LOCAL_ENV_VAR]')
  );
}

function discoverPublicExecuteTerms(): string[] {
  const discovered = new Set<string>();

  for (const root of ['apps', 'packages']) {
    const absoluteRoot = resolve(workspaceRoot, root);

    if (!existsSync(absoluteRoot)) {
      continue;
    }

    for (const file of listSourceFiles(absoluteRoot)) {
      const workspacePath = toWorkspacePath(file);

      if (workspacePath.endsWith('.test.ts') || workspacePath.includes('/fixtures/')) {
        continue;
      }

      const sourceText = readFileSync(file, 'utf8');
      const exportPattern =
        /\bexport\s+(?:(?:async\s+)?function|const)\s+(execute[A-Za-z0-9_]*)\s*(?:\(|=)/g;

      for (const match of sourceText.matchAll(exportPattern)) {
        if (match[1]) {
          discovered.add(match[1]);
        }
      }
    }
  }

  return [...discovered].sort();
}

function isAllowedSensitiveMetadataLine(lowerLine: string, term: string): boolean {
  const tokenTerm = ['to', 'ken'].join('');
  const metadataFlags = [
    ['to', 'ken', 'stored'].join('').toLowerCase(),
    ['to', 'ken', 'value', 'stored'].join('').toLowerCase(),
  ];

  return term === tokenTerm && metadataFlags.some((metadataFlag) => lowerLine.includes(metadataFlag));
}

function collectModuleSpecifiers(sourceFile: ts.SourceFile, sourceText: string): string[] {
  const imports: string[] = [];

  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      imports.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      imports.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const requirePattern = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of sourceText.matchAll(requirePattern)) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }

  return imports;
}

function isAllowed(workspacePath: string, term: string): boolean {
  return allowlistRules.some(
    (entry) =>
      (entry.file === workspacePath ||
        (entry.filePrefix !== undefined && workspacePath.startsWith(entry.filePrefix)) ||
        (entry.fileSuffix !== undefined && workspacePath.endsWith(entry.fileSuffix))) &&
      entry.terms.some((allowedTerm) => allowedTerm === term),
  );
}

function isApprovedExternalProcessBoundary(workspacePath: string): boolean {
  return approvedProcessBoundaryFiles.has(workspacePath);
}

function isApprovedLiveAutomationBoundary(workspacePath: string): boolean {
  return approvedLiveAutomationBoundaryFiles.has(workspacePath);
}

function isApprovedCdpHttpBoundary(workspacePath: string): boolean {
  return approvedCdpHttpBoundaryFiles.has(workspacePath);
}

function isApprovedCdpWebSocketBoundary(workspacePath: string): boolean {
  return approvedCdpWebSocketBoundaryFiles.has(workspacePath);
}

function isApprovedGitBoundary(workspacePath: string): boolean {
  return approvedGitBoundaryFiles.has(workspacePath);
}

function isApprovedLocalArtifactWriteBoundary(workspacePath: string): boolean {
  return approvedLocalArtifactWriteBoundaryFiles.has(workspacePath);
}

function isApprovedGithubHttpBoundary(workspacePath: string): boolean {
  return approvedGithubHttpBoundaryFiles.has(workspacePath);
}

function isApprovedPolicyTelemetryRuntimeBoundary(workspacePath: string): boolean {
  return approvedPolicyTelemetryRuntimeBoundaryFiles.has(workspacePath);
}

function isPolicyTelemetryRuntimeImport(importPath: string): boolean {
  const normalized = importPath.toLowerCase();

  return (
    normalized.startsWith('@opentelemetry/') ||
    normalized.includes('otlp') ||
    normalized.includes('cedar-wasm') ||
    normalized.startsWith('@cedar-policy') ||
    normalized === 'opa' ||
    normalized.endsWith('/opa')
  );
}

function listSourceFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root)) {
    const absolute = resolve(root, entry);
    const stat = statSync(absolute);

    if (stat.isDirectory()) {
      if (['node_modules', 'dist', 'coverage'].includes(entry)) {
        continue;
      }

      files.push(...listSourceFiles(absolute));
      continue;
    }

    if (stat.isFile() && sourceExtensions.has(getExtension(entry))) {
      files.push(absolute);
    }
  }

  return files;
}

function getExtension(fileName: string): string {
  const match = /\.[^.]+$/.exec(fileName);
  return match?.[0] ?? '';
}

function toWorkspacePath(path: string): string {
  return relative(workspaceRoot, path).split(sep).join('/');
}
