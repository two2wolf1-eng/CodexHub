import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Violation {
  file: string;
  term: string;
  line: number;
  reason: string;
}

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['apps', 'packages', 'tools'];
const allowedRoot = normalizePath(resolve(workspaceRoot, 'packages/store-sqlite'));
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const forbiddenTerms = ['node:' + 'sqlite', ['Database', 'Sync'].join('')];
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
  console.error(`SQLite isolation audit failed: ${violations.length} violation(s).`);

  for (const violation of violations) {
    console.error(
      `- ${toWorkspacePath(violation.file)}:${violation.line} contains "${violation.term}": ${violation.reason}`,
    );
  }

  process.exit(1);
}

console.log(
  `SQLite isolation audit passed: checked ${scanRoots.join(', ')}; SQLite runtime references are isolated to packages/store-sqlite.`,
);

function auditFile(file: string): void {
  const normalizedFile = normalizePath(file);

  if (normalizedFile.startsWith(`${allowedRoot}/`)) {
    return;
  }

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const term of forbiddenTerms) {
      if (line.includes(term)) {
        violations.push({
          file,
          term,
          line: index + 1,
          reason: 'Only packages/store-sqlite may reference SQLite runtime bindings.',
        });
      }
    }
  }
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
  return resolve(path).split(sep).join('/');
}
