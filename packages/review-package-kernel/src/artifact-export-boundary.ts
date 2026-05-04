import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { LocalReviewPackageRun } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export const REVIEW_PACKAGE_EXPORT_FILE_NAMES = [
  'review-package-summary.json',
  'review-package-summary.md',
] as const;

export interface LocalReviewPackageArtifactRuntimeInput {
  workspaceRoot: string;
  artifactRoot?: string;
  packageId: string;
}

export interface LocalReviewPackageArtifactTarget {
  workspaceRootHash: string;
  artifactRootHash: string;
  artifactDirectoryHash: string;
  packageIdHash: string;
  blockReasons: string[];
  artifactRoot: string;
  artifactDirectory: string;
}

export interface LocalReviewPackageArtifactExportResult {
  fileCount: number;
  byteCount: number;
  contentHash: string;
}

export function resolveLocalReviewPackageArtifactTarget(
  input: LocalReviewPackageArtifactRuntimeInput,
): LocalReviewPackageArtifactTarget {
  const workspaceRoot = resolve(input.workspaceRoot);
  const defaultArtifactRoot = resolve(dirname(workspaceRoot), 'CodexHub-artifacts');
  const artifactRoot = resolve(input.artifactRoot ?? defaultArtifactRoot);
  const safePackageId = sanitizeArtifactSegment(input.packageId);
  const artifactDirectory = resolve(artifactRoot, 'review-packages', safePackageId);
  const blockReasons: string[] = [];

  if (safePackageId !== input.packageId || safePackageId.length === 0) {
    blockReasons.push('unsafe_package_id');
  }

  if (artifactRoot !== defaultArtifactRoot) {
    blockReasons.push('artifact_root_not_allowlisted');
  }

  if (isInside(workspaceRoot, artifactRoot) || isInside(workspaceRoot, artifactDirectory)) {
    blockReasons.push('repo_internal_artifact_root_forbidden');
  }

  if (!isInside(artifactRoot, artifactDirectory)) {
    blockReasons.push('artifact_directory_traversal');
  }

  return {
    workspaceRootHash: stableHash(workspaceRoot),
    artifactRootHash: stableHash(artifactRoot),
    artifactDirectoryHash: stableHash(artifactDirectory),
    packageIdHash: stableHash(safePackageId),
    blockReasons,
    artifactRoot,
    artifactDirectory,
  };
}

export async function exportLocalReviewPackageArtifact(input: {
  target: LocalReviewPackageArtifactTarget;
  reviewPackage: LocalReviewPackageRun;
}): Promise<LocalReviewPackageArtifactExportResult> {
  if (input.target.blockReasons.length > 0) {
    throw new Error('unsafe local review package artifact target');
  }

  const jsonBody = JSON.stringify(createReviewPackageJsonSummary(input.reviewPackage), null, 2);
  const markdownBody = createReviewPackageMarkdownSummary(input.reviewPackage);
  const files = [
    { name: REVIEW_PACKAGE_EXPORT_FILE_NAMES[0], body: jsonBody },
    { name: REVIEW_PACKAGE_EXPORT_FILE_NAMES[1], body: markdownBody },
  ];

  await mkdir(input.target.artifactDirectory, { recursive: true });

  let byteCount = 0;
  const contentHashes: string[] = [];

  for (const file of files) {
    const filePath = join(input.target.artifactDirectory, file.name);
    if (!isInside(input.target.artifactDirectory, filePath)) {
      throw new Error('review package export file escaped artifact directory');
    }
    await writeFile(filePath, file.body, 'utf8');
    byteCount += Buffer.byteLength(file.body, 'utf8');
    contentHashes.push(stableHash(file.body));
  }

  return {
    fileCount: files.length,
    byteCount,
    contentHash: stableHash(contentHashes.join(':')),
  };
}

function createReviewPackageJsonSummary(reviewPackage: LocalReviewPackageRun) {
  return {
    schemaVersion: reviewPackage.schemaVersion,
    reviewPackageIdHash: stableHash(reviewPackage.id),
    status: reviewPackage.packageSummary.status,
    packageHash: reviewPackage.packageSummary.packageHash,
    changedFileCount: reviewPackage.packageSummary.changedFileCount,
    diffHash: reviewPackage.packageSummary.diffHash,
    verificationStatus: reviewPackage.packageSummary.verificationStatus,
    readyForReviewDraftOnly: reviewPackage.packageSummary.readyForReviewDraftOnly,
    evidenceRefIds: reviewPackage.evidenceRefIds,
    auditEventIds: reviewPackage.auditEventIds,
    findingCount: reviewPackage.decision.findingCount,
    blockerCount: reviewPackage.decision.blockerCount,
    decisionStatus: reviewPackage.decision.status,
    rawPathStored: false,
    bodyStored: false,
  };
}

function createReviewPackageMarkdownSummary(reviewPackage: LocalReviewPackageRun): string {
  const lines = [
    '# CodexHub Local Review Package',
    '',
    `Status: ${reviewPackage.packageSummary.status}`,
    `Package hash: ${reviewPackage.packageSummary.packageHash}`,
    `Changed file count: ${reviewPackage.packageSummary.changedFileCount}`,
    `Verification status: ${reviewPackage.packageSummary.verificationStatus}`,
    `Ready for review draft only: ${reviewPackage.packageSummary.readyForReviewDraftOnly}`,
    `Evidence refs: ${reviewPackage.evidenceRefIds.length}`,
    `Audit events: ${reviewPackage.auditEventIds.length}`,
    `Finding count: ${reviewPackage.decision.findingCount}`,
    `Blocker count: ${reviewPackage.decision.blockerCount}`,
    '',
    'Raw paths, raw diff bodies, PR markdown, command bodies, and review reasons are not stored in this package.',
    '',
  ];

  return lines.join('\n');
}

function sanitizeArtifactSegment(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]/g, '-');
}

function isInside(parent: string, child: string): boolean {
  const parentPath = resolve(parent);
  const childPath = resolve(child);
  const relativePath = relative(parentPath, childPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`));
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}
