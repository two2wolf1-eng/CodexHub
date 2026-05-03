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
]);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.jsonl']);
const externalProcessModules = [['child', '_process'].join(''), ['node:', 'child', '_process'].join('')];
const executableTextTerms = [
  ['codex', ' exec'].join(''),
  ['playwright', '.', 'chromium'].join(''),
  ['chromium', '.', 'launch'].join(''),
  ['connect', 'Over', 'CDP'].join(''),
];
const sensitiveConceptTerms = [
  ['coo', 'kie'].join(''),
  ['to', 'ken'].join(''),
  ['sess', 'ion'].join(''),
  ['M', 'F', 'A'].join(''),
];
const allTextTerms = [...executableTextTerms, ...sensitiveConceptTerms];
const allowlistRules: AllowlistEntry[] = [
  {
    scope: 'production-source',
    file: 'packages/evidence-kernel/src/index.ts',
    terms: sensitiveConceptTerms,
    reason: 'redaction vocabulary only; no external automation path',
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

function auditFile(file: string): void {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);

  auditImports(file, sourceFile, sourceText);
  auditCallExpressions(file, sourceFile);
  auditTextTerms(file, sourceText);
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
      if (lowerLine.includes(term.toLowerCase()) && !isAllowed(workspacePath, term)) {
        violations.push({
          file,
          line: index + 1,
          term,
          reason: 'Live automation entrypoint text must not appear in executable source.',
        });
      }
    }

    for (const term of sensitiveConceptTerms) {
      if (lowerLine.includes(term.toLowerCase()) && !isAllowed(workspacePath, term)) {
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
