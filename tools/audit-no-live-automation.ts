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
  'packages/nx-verification-adapter/src/process-boundary.ts',
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
  'packages/playwright-observer-adapter/src/real-runner.ts',
]);
const approvedCdpHttpBoundaryFiles = new Set([
  'packages/electron-cdp-adapter/src/controlled-http-runner.ts',
  'packages/electron-cdp-adapter/src/controlled-websocket-event-runner.ts',
]);
const approvedCdpWebSocketBoundaryFiles = new Set([
  'packages/electron-cdp-adapter/src/controlled-websocket-event-runner.ts',
]);
const approvedGithubHttpBoundaryFiles = new Set([
  'packages/github-provider-adapter/src/github-http-boundary.ts',
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
const directAdapterExecuteTerms = discoverPublicExecuteTerms();
const browserPersistenceTerms = ['localStorage', 'sessionStorage', 'indexedDB'];
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
const mcpBoundaryBypassTerms = [
  ['child', '_process'].join(''),
  ['node:', 'child', '_process'].join(''),
  'fetch(',
  'globalThis["fetch"]',
  "globalThis['fetch']",
  'process.env[',
  'process["env"]',
  "process['env']",
  'CODEXHUB_GITHUB_TOKEN',
  'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
  'CODEXHUB_SUPERVISOR_LOCAL_',
];
const dashboardAllowedMutationRoutes = new Set([
  '/api/approvals/decisions',
  ...dashboardRecoveryExactPostRoutes,
  ...dashboardMergeExactPostRoutes,
  ...dashboardDeploymentOperationExactPostRoutes,
]);
const dashboardMutationSurfaceTerms = [
  "method: 'POST'",
  'method: "POST"',
  'x-codexhub-local-token',
  'createSupervisorPostHeaders',
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
    file: 'packages/contracts/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'contract metadata flags and hash-only credential readiness schemas only',
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
    terms: ['/releases', '/deployments', ...dashboardDeploymentOperationExactPostRoutes],
    reason:
      'M40-M43 CLI uses these as read-only Supervisor route strings; no direct provider or mutating execution path',
  },
  {
    scope: 'production-source',
    file: 'apps/dashboard/src/App.tsx',
    terms: ['/releases', '/deployments'],
    reason:
      'M40-M43 Dashboard uses these as governed release/deployment route strings; no direct provider or ungoverned execution path',
  },
  {
    scope: 'production-source',
    file: 'apps/supervisor/src/server.ts',
    terms: ['/releases', '/deployments', ...dashboardDeploymentOperationExactPostRoutes],
    reason:
      'M40-M43 Supervisor owns the governed release, deployment, and secrets control-plane routes',
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
  if (approvedCdpWebSocketBoundaryFiles.size !== 1) {
    violations.push({
      file: resolve(workspaceRoot, 'tools', 'audit-no-live-automation.ts'),
      line: 1,
      term: 'approvedCdpWebSocketBoundaryFiles',
      reason: 'Electron/CDP WebSocket observation must have exactly one audited boundary file.',
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
      sourceText: 'window["localStorage"].setItem("codexhub-local-control", token);',
      expectedTerm: 'localStorage',
      description: 'Dashboard token persistence through bracket notation wrapper',
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
  const before = violations.length;

  auditTextTerms(file, sourceText);
  auditM9ApprovalUxGuards(file, sourceText);
  auditDashboardMutationSurfaceGuards(file, sourceText);
  auditDashboardRecoveryWizardScopedGuards(file, sourceText);
  auditDashboardMergeWizardScopedGuards(file, sourceText);
  auditDashboardDeploymentOperationWizardScopedGuards(file, sourceText);

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
}

function auditImports(file: string, sourceFile: ts.SourceFile, sourceText: string): void {
  const workspacePath = toWorkspacePath(file);

  for (const importPath of collectModuleSpecifiers(sourceFile, sourceText)) {
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

    if (isPolicyTelemetryRuntimeImport(importPath) && !isAllowed(workspacePath, importPath)) {
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
      if (lowerLine.includes(term.toLowerCase()) && !isAllowed(workspacePath, term)) {
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
    sourceText.includes('/api/deployments/operations/');

  if (!isDashboardSource || !hasGovernedDashboardMutation) {
    return;
  }

  for (const [index, line] of lines.entries()) {
    for (const term of browserPersistenceTerms) {
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
    for (const term of browserPersistenceTerms) {
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
          'Dashboard mutating HTTP helpers are allowed only in the approval decision UI, recovery wizard, and merge wizard, with exact route allowlists.',
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
      ))
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
