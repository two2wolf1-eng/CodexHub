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

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const approvedBoundaryFile = 'packages/codex-kernel/src/real-read-only-adapter-process.ts';
const scanRoots = ['apps', 'packages', 'tools'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const processModules = ['child_process', 'node:child_process'];
const disallowedCallNames = new Set(['exec', 'execFile', 'execSync', 'fork', 'spawnSync']);
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

if (!existsSync(resolve(workspaceRoot, approvedBoundaryFile))) {
  violations.push({
    file: resolve(workspaceRoot, approvedBoundaryFile),
    line: 1,
    term: approvedBoundaryFile,
    reason: 'Approved read-only adapter boundary module is missing.',
  });
}

if (violations.length > 0) {
  console.error(`Real adapter boundary audit failed: ${violations.length} violation(s).`);

  for (const violation of violations) {
    console.error(
      `- ${toWorkspacePath(violation.file)}:${violation.line} contains "${violation.term}": ${violation.reason}`,
    );
  }

  process.exit(1);
}

console.log(
  `Real adapter boundary audit passed: process boundary is isolated to ${approvedBoundaryFile}.`,
);

function auditFile(file: string): void {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const workspacePath = toWorkspacePath(file);

  auditImports(file, workspacePath, sourceFile, sourceText);
  auditCallExpressions(file, workspacePath, sourceFile);
  auditBoundaryShellOption(file, workspacePath, sourceText);
}

function auditImports(
  file: string,
  workspacePath: string,
  sourceFile: ts.SourceFile,
  sourceText: string,
): void {
  for (const importPath of collectModuleSpecifiers(sourceFile, sourceText)) {
    if (!processModules.includes(importPath)) {
      continue;
    }

    if (workspacePath === approvedBoundaryFile && importPath === 'node:child_process') {
      continue;
    }

    violations.push({
      file,
      line: 1,
      term: importPath,
      reason:
        'Process modules are forbidden except the single approved read-only adapter boundary module.',
    });
  }
}

function auditCallExpressions(file: string, workspacePath: string, sourceFile: ts.SourceFile): void {
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node)) {
      const callName = ts.isIdentifier(node.expression) ? node.expression.text : undefined;

      if (callName === 'spawn' && workspacePath !== approvedBoundaryFile) {
        violations.push({
          file,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          term: 'spawn(',
          reason: 'spawn is allowed only in the approved read-only adapter boundary module.',
        });
      }

      if (callName !== undefined && disallowedCallNames.has(callName)) {
        violations.push({
          file,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          term: `${callName}(`,
          reason: `${callName} is forbidden for the read-only adapter boundary.`,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function auditBoundaryShellOption(file: string, workspacePath: string, sourceText: string): void {
  if (workspacePath !== approvedBoundaryFile) {
    return;
  }

  if (sourceText.includes('shell: true')) {
    violations.push({
      file,
      line: lineForText(sourceText, 'shell: true'),
      term: 'shell: true',
      reason: 'The read-only adapter process boundary must never use shell mode.',
    });
  }

  if (!sourceText.includes('shell: false')) {
    violations.push({
      file,
      line: 1,
      term: 'shell: false',
      reason: 'The read-only adapter process boundary must explicitly disable shell mode.',
    });
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

function lineForText(sourceText: string, needle: string): number {
  const index = sourceText.indexOf(needle);

  if (index < 0) {
    return 1;
  }

  return sourceText.slice(0, index).split(/\r?\n/).length;
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
