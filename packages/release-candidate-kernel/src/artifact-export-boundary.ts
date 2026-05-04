import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type {
  LocalRcAuditChain,
  LocalRcEvidenceBundle,
  LocalRcReadinessPlan,
  LocalRcReadinessSummary,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export const RC_BUNDLE_EXPORT_FILE_NAMES = [
  'release-candidate-summary.json',
  'release-candidate-summary.md',
] as const;

export interface LocalRcBundleArtifactRuntimeInput {
  workspaceRoot: string;
  artifactRoot?: string;
  bundleId: string;
}

export interface LocalRcBundleArtifactTarget {
  workspaceRootHash: string;
  artifactRootHash: string;
  artifactDirectoryHash: string;
  bundleIdHash: string;
  blockReasons: string[];
  artifactRoot: string;
  artifactDirectory: string;
}

export interface LocalRcBundleArtifactExportResult {
  fileCount: number;
  byteCount: number;
  contentHash: string;
}

export interface LocalRcBundleArtifactExportInput {
  target: LocalRcBundleArtifactTarget;
  readinessPlan: LocalRcReadinessPlan;
  readinessSummary: LocalRcReadinessSummary;
  evidenceBundle: LocalRcEvidenceBundle;
  auditChain: LocalRcAuditChain;
}

export function resolveLocalRcBundleArtifactTarget(
  input: LocalRcBundleArtifactRuntimeInput,
): LocalRcBundleArtifactTarget {
  const workspaceRoot = resolve(input.workspaceRoot);
  const defaultArtifactRoot = resolve(dirname(workspaceRoot), 'CodexHub-artifacts');
  const artifactRoot = resolve(input.artifactRoot ?? defaultArtifactRoot);
  const safeBundleId = sanitizeArtifactSegment(input.bundleId);
  const artifactDirectory = resolve(artifactRoot, 'release-candidates', safeBundleId);
  const blockReasons: string[] = [];

  if (safeBundleId !== input.bundleId || safeBundleId.length === 0) {
    blockReasons.push('unsafe_bundle_id');
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
    bundleIdHash: stableHash(safeBundleId),
    blockReasons,
    artifactRoot,
    artifactDirectory,
  };
}

export async function exportLocalRcBundleArtifact(
  input: LocalRcBundleArtifactExportInput,
): Promise<LocalRcBundleArtifactExportResult> {
  if (input.target.blockReasons.length > 0) {
    throw new Error('unsafe local RC bundle artifact target');
  }

  const jsonBody = JSON.stringify(createRcBundleJsonSummary(input), null, 2);
  const markdownBody = createRcBundleMarkdownSummary(input);
  const files = [
    { name: RC_BUNDLE_EXPORT_FILE_NAMES[0], body: jsonBody },
    { name: RC_BUNDLE_EXPORT_FILE_NAMES[1], body: markdownBody },
  ];

  await mkdir(input.target.artifactDirectory, { recursive: true });

  let byteCount = 0;
  const contentHashes: string[] = [];

  for (const file of files) {
    const filePath = join(input.target.artifactDirectory, file.name);
    if (!isInside(input.target.artifactDirectory, filePath)) {
      throw new Error('RC bundle export file escaped artifact directory');
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

function createRcBundleJsonSummary(input: LocalRcBundleArtifactExportInput) {
  return {
    schemaVersion: input.readinessSummary.schemaVersion,
    rcReadinessIdHash: stableHash(input.readinessSummary.id),
    status: input.readinessSummary.status,
    reviewDecisionStatus: input.readinessSummary.reviewDecisionStatus,
    verificationStatus: input.readinessSummary.verificationStatus,
    operatorReadinessStatus: input.readinessSummary.operatorReadinessStatus,
    blockerCount: input.readinessSummary.blockerCount,
    localAcceptanceReady: input.readinessSummary.localAcceptanceReady,
    evidenceRefIds: input.evidenceBundle.evidenceRefIds,
    evidenceCount: input.evidenceBundle.evidenceCount,
    evidenceBundleHash: input.evidenceBundle.bundleHash,
    auditEventIds: input.auditChain.auditEventIds,
    auditEventCount: input.auditChain.auditEventCount,
    auditChainHash: input.auditChain.chainHash,
    processBoundaryCount: input.auditChain.processBoundaryCount,
    externalProcessStartedCount: input.auditChain.externalProcessStartedCount,
    networkBoundaryCount: input.auditChain.networkBoundaryCount,
    rollbackNotesIncluded: true,
    rawPathStored: false,
    bodyStored: false,
  };
}

function createRcBundleMarkdownSummary(input: LocalRcBundleArtifactExportInput): string {
  const lines = [
    '# CodexHub Local Release Candidate Bundle',
    '',
    `Status: ${input.readinessSummary.status}`,
    `Review decision: ${input.readinessSummary.reviewDecisionStatus}`,
    `Verification status: ${input.readinessSummary.verificationStatus}`,
    `Operator readiness: ${input.readinessSummary.operatorReadinessStatus}`,
    `Blockers: ${input.readinessSummary.blockerCount}`,
    `Local acceptance ready: ${input.readinessSummary.localAcceptanceReady}`,
    `Evidence refs: ${input.evidenceBundle.evidenceCount}`,
    `Audit events: ${input.auditChain.auditEventCount}`,
    `Process boundaries: ${input.auditChain.processBoundaryCount}`,
    `External processes started: ${input.auditChain.externalProcessStartedCount}`,
    `Network boundaries: ${input.auditChain.networkBoundaryCount}`,
    '',
    'Rollback: disable local release-candidate export and discard the sibling artifact directory if no longer needed.',
    '',
    'Raw paths, raw diffs, PR markdown, command bodies, environment values, and review reasons are not stored in this bundle.',
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
