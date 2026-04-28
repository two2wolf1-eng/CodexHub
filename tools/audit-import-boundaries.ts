import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

interface Violation {
  file: string;
  importPath: string;
  reason: string;
}

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['apps', 'packages'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const violations: Violation[] = [];

for (const root of scanRoots) {
  const absoluteRoot = resolve(workspaceRoot, root);

  if (existsSync(absoluteRoot)) {
    for (const file of listSourceFiles(absoluteRoot)) {
      auditFile(file);
    }
  }
}

if (violations.length > 0) {
  console.error(`Import boundary audit failed: ${violations.length} violation(s).`);

  for (const violation of violations) {
    console.error(
      `- ${toWorkspacePath(violation.file)} imports "${violation.importPath}": ${violation.reason}`,
    );
  }

  process.exit(1);
}

console.log(
  `Import boundary audit passed: scanned ${scanRoots.join(', ')} source files; no internal package imports found.`,
);

function auditFile(file: string): void {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const currentProjectRoot = getProjectRoot(file);

  for (const importPath of collectModuleSpecifiers(sourceFile, sourceText)) {
    const scopedPackageMatch = /^@codexhub\/[^/]+\/.+/.exec(importPath);

    if (scopedPackageMatch) {
      violations.push({
        file,
        importPath,
        reason: 'Use the package public entrypoint, e.g. @codexhub/package-name.',
      });
      continue;
    }

    if (!importPath.startsWith('.')) {
      continue;
    }

    const resolvedImport = resolve(dirname(file), importPath);
    const importedProjectRoot = getProjectRoot(resolvedImport);

    if (importedProjectRoot && currentProjectRoot && importedProjectRoot !== currentProjectRoot) {
      violations.push({
        file,
        importPath,
        reason: `Relative import crosses project boundary into ${toWorkspacePath(importedProjectRoot)}.`,
      });
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

function getProjectRoot(path: string): string | undefined {
  const normalized = normalizePath(resolve(path));
  const parts = normalized.split('/');
  const appsIndex = parts.lastIndexOf('apps');
  const packagesIndex = parts.lastIndexOf('packages');
  const rootIndex = Math.max(appsIndex, packagesIndex);

  if (rootIndex < 0 || !parts[rootIndex + 1]) {
    return undefined;
  }

  return parts.slice(0, rootIndex + 2).join('/');
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

function normalizePath(path: string): string {
  return path.split(sep).join('/');
}
