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
  '/git/ref/heads/',
  '/git/blobs',
  '/git/trees',
  '/git/commits',
  '/git/refs',
];
const githubForbiddenRemoteMutationTerms = [
  '/git/refs',
  '/merges',
  '/labels',
  '/comments',
  '/requested_reviewers',
  'force=true',
  'force: true',
  'draft=false',
  'draft: false',
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
const directAdapterExecuteTerms = [
  'executeCodexExecAdapter',
  'executeNxVerificationAdapter',
  'executeWorktreeManager',
  'executeWorktreeCleanup',
  'executePlaywrightObserverAdapter',
  'executeElectronCdpAdapter',
  'executePolicyBackendEvaluation',
  'executeTelemetryExport',
];
const browserPersistenceTerms = ['localStorage', 'sessionStorage', 'indexedDB'];
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

function auditFile(file: string): void {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);

  auditImports(file, sourceFile, sourceText);
  auditCallExpressions(file, sourceFile);
  auditTextTerms(file, sourceText);
  auditM9ApprovalUxGuards(file, sourceText);
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

  if ((!isDashboardSource && !isCliSource) || workspacePath.endsWith('.test.ts')) {
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
            'Dashboard and CLI must not directly call capability adapter execute functions; mutations must go through Supervisor/workflow governance.',
        });
      }
    }
  }

  if (!isDashboardSource || !sourceText.includes('/api/approvals/decisions')) {
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
  }
}

function isAllowedSensitiveMetadataLine(lowerLine: string, term: string): boolean {
  const tokenTerm = ['to', 'ken'].join('');
  const metadataFlag = ['to', 'ken', 'stored'].join('').toLowerCase();

  return term === tokenTerm && lowerLine.includes(metadataFlag);
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
