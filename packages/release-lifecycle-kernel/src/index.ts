import {
  type EvidenceRef,
  type GithubRemoteRefSummary,
  GithubReleaseDraftPlanSchema,
  type GithubReleaseDraftPlan,
  GithubReleaseTagPlanSchema,
  type GithubReleaseTagPlan,
  type PolicyDecision,
  PolicyDecisionSchema,
  ReleaseChangelogSummarySchema,
  type ReleaseChangelogSummary,
  ReleaseLifecycleAcceptanceRehearsalRunSchema,
  type ReleaseLifecycleAcceptanceRehearsalRun,
  type ReleaseLifecycleAcceptanceScenario,
  ReleaseVersionPlanSchema,
  type ReleaseVersionBumpKind,
  type ReleaseVersionPlan,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface ReleaseVersionPlanInput {
  currentVersion?: string;
  proposedVersion?: string;
  bumpKind?: ReleaseVersionBumpKind;
  sourceSummary?: string;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface ReleaseChangelogSummaryInput {
  sourceSummary?: string;
  changelogBody?: string;
  sectionCount?: number;
  changeCount?: number;
  breakingChangeCount?: number;
  now?: () => string;
}

export interface ReleaseTagPlanInput {
  targetRef: GithubRemoteRefSummary;
  baseRef?: string;
  tagName?: string;
  tagMessage?: string;
  targetSha?: string;
  versionPlan?: ReleaseVersionPlan;
  changelogSummary?: ReleaseChangelogSummary;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface ReleaseDraftPlanInput {
  targetRef: GithubRemoteRefSummary;
  tagName?: string;
  releaseName?: string;
  releaseBody?: string;
  changelogSummary?: ReleaseChangelogSummary;
  tagRunId?: string;
  blockReasons?: readonly string[];
  now?: () => string;
}

export function createReleaseVersionPlan(input: ReleaseVersionPlanInput = {}): ReleaseVersionPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  const plan = ReleaseVersionPlanSchema.parse({
    id: foundationId('release_version_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('release_version_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    currentVersionHash: hashText(input.currentVersion ?? '0.0.0'),
    proposedVersionHash: hashText(input.proposedVersion ?? '0.1.0'),
    bumpKind: input.bumpKind ?? 'minor',
    sourceSummaryHash: hashText(input.sourceSummary ?? 'metadata-only release source'),
    changedFileCount: 0,
    blockReasons,
    policyDecision: createReleasePolicyDecision('release.version.plan', 'dry-run', 'medium', now),
    requiresApproval: false,
    evidenceRefs: [
      createReleaseEvidenceRef(
        'release.version_plan',
        hashText(`version:${input.proposedVersion ?? '0.1.0'}`),
        'Version bump plan is stored as hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_release_version_plan')],
    networkBoundaryPlanned: false,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    rawVersionStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? 'Release version planning is blocked.'
        : 'Release version planning is metadata-only.',
  });

  return plan;
}

export function createReleaseChangelogSummary(
  input: ReleaseChangelogSummaryInput = {},
): ReleaseChangelogSummary {
  const now = input.now ?? foundationTimestamp;
  return ReleaseChangelogSummarySchema.parse({
    id: foundationId('release_changelog_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    sourceSummaryHash: hashText(input.sourceSummary ?? 'metadata-only release source'),
    changelogBodyHash: hashText(input.changelogBody ?? 'generated release summary'),
    sectionCount: input.sectionCount ?? 3,
    changeCount: input.changeCount ?? 0,
    breakingChangeCount: input.breakingChangeCount ?? 0,
    evidenceRefs: [
      createReleaseEvidenceRef(
        'release.changelog_summary',
        hashText(input.changelogBody ?? 'generated release summary'),
        'Changelog summary stores only a body hash and counts.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_release_changelog_summary')],
    rawChangelogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: 'Changelog summary is hash-only.',
  });
}

export function createGithubReleaseTagPlan(input: ReleaseTagPlanInput): GithubReleaseTagPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  return GithubReleaseTagPlanSchema.parse({
    id: foundationId('github_release_tag_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('github_release_tag_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    runnerMode: 'controlled-github-release-tag',
    targetRef: input.targetRef,
    baseRefHash: hashText(input.baseRef ?? 'main'),
    tagNameHash: hashText(input.tagName ?? 'v0.1.0'),
    tagMessageHash: hashText(input.tagMessage ?? 'CodexHub release tag'),
    targetShaHash: input.targetSha ? hashText(input.targetSha) : undefined,
    releaseVersionPlanId: input.versionPlan?.id,
    changelogSummaryId: input.changelogSummary?.id,
    blockReasons,
    policyDecision: createReleasePolicyDecision('github.release.tag', 'write', 'high', now),
    requiresApproval: true,
    evidenceRefs: [
      createReleaseEvidenceRef(
        'github.release_tag_plan',
        hashText(`${input.tagName ?? 'v0.1.0'}:${input.baseRef ?? 'main'}`),
        'GitHub release tag plan uses fixed API endpoints and hash-bound refs.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_github_release_tag_plan')],
    networkBoundaryPlanned: blockReasons.length === 0,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedEndpointOnly: true,
    localGitTagAllowed: false,
    pushAllowed: false,
    updateRefOutsideTagFlowAllowed: false,
    forceAllowed: false,
    releasePublishAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? 'GitHub release tag creation is blocked before network boundary.'
        : 'GitHub release tag creation is planned through the governed boundary.',
  });
}

export function createGithubReleaseDraftPlan(input: ReleaseDraftPlanInput): GithubReleaseDraftPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  return GithubReleaseDraftPlanSchema.parse({
    id: foundationId('github_release_draft_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('github_release_draft_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    runnerMode: 'controlled-github-release-draft',
    targetRef: input.targetRef,
    tagNameHash: hashText(input.tagName ?? 'v0.1.0'),
    releaseNameHash: hashText(input.releaseName ?? 'CodexHub release draft'),
    releaseBodyHash: hashText(input.releaseBody ?? 'metadata release draft body'),
    changelogSummaryId: input.changelogSummary?.id,
    tagRunId: input.tagRunId,
    blockReasons,
    policyDecision: createReleasePolicyDecision('github.release.draft', 'write', 'high', now),
    requiresApproval: true,
    evidenceRefs: [
      createReleaseEvidenceRef(
        'github.release_draft_plan',
        hashText(`${input.tagName ?? 'v0.1.0'}:${input.releaseName ?? 'draft'}`),
        'GitHub release draft plan stores only generated body hashes.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_github_release_draft_plan')],
    networkBoundaryPlanned: blockReasons.length === 0,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedEndpointOnly: true,
    draft: true,
    releasePublishAllowed: false,
    rawReleaseBodyStored: false,
    rawChangelogStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? 'GitHub release draft creation is blocked before network boundary.'
        : 'GitHub release draft creation is planned as a draft-only write.',
  });
}

export function runReleaseLifecycleAcceptanceRehearsal(input: {
  scenario: ReleaseLifecycleAcceptanceScenario;
  now?: () => string;
}): ReleaseLifecycleAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario;
  const passed = scenario === 'all-pass';
  const tagBlocked =
    scenario === 'tag-exists' || scenario === 'tag-approval-blocked' || scenario === 'tag-create-failed';
  const releaseBlocked =
    tagBlocked ||
    scenario === 'release-draft-approval-blocked' ||
    scenario === 'release-draft-failed' ||
    scenario === 'network-timeout';

  return ReleaseLifecycleAcceptanceRehearsalRunSchema.parse({
    id: foundationId('release_lifecycle_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: passed ? 'passed' : scenario.endsWith('failed') ? 'failed' : 'blocked',
    versionPlanStatus: scenario === 'version-plan-blocked' ? 'blocked' : 'fixture_completed',
    changelogStatus: scenario === 'changelog-blocked' ? 'blocked' : 'fixture_completed',
    tagStatus: tagBlocked ? (scenario === 'tag-create-failed' ? 'failed' : 'blocked') : 'fixture_completed',
    releaseDraftStatus: releaseBlocked
      ? scenario === 'release-draft-failed'
        ? 'failed'
        : 'blocked'
      : 'fixture_completed',
    stepCount: 4,
    blockerCount: passed ? 0 : 1,
    evidenceRefCount: 4,
    auditEventCount: 4,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedEndpointOnly: true,
    releasePublishAllowed: false,
    rawReleaseBodyStored: false,
    rawChangelogStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: passed
      ? 'Release lifecycle rehearsal passed with fixture-only evidence.'
      : `Release lifecycle rehearsal blocked for ${scenario}.`,
  });
}

function createReleasePolicyDecision(
  actionType: string,
  actionMode: 'dry-run' | 'write',
  riskLevel: 'medium' | 'high',
  now: () => string,
): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: foundationId('policy_release_lifecycle'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    actionId: foundationId(actionType.replaceAll('.', '_')),
    actionType,
    actionMode,
    riskLevel,
    outcome: actionMode === 'write' ? 'approval_required' : 'allow',
    reasons:
      actionMode === 'write'
        ? ['release lifecycle writes require persisted approval']
        : ['metadata-only release planning is allowed'],
    requiresDryRun: true,
    requiresApproval: actionMode === 'write',
  });
}

function createReleaseEvidenceRef(
  kind: EvidenceRef['kind'],
  hash: string,
  summary: string,
  now: () => string,
): EvidenceRef {
  return {
    id: foundationId('evidence_release_lifecycle'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    kind,
    hash,
    summary,
    redacted: true,
    labels: ['metadata-only'],
  };
}
