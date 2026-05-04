import {
  GoldenPathEvidenceBundleSchema,
  GoldenPathRehearsalRunSchema,
  GoldenPathStepSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type GoldenPathEvidenceBundle,
  type GoldenPathRehearsalRun,
  type GoldenPathStep,
  type GoldenPathStepStatus,
} from '@codexhub/contracts';
import { planLocalTelemetryProjection } from '@codexhub/otel-adapter';

export type GoldenPathRehearsalScenario = 'all-pass' | 'codex-failed' | 'nx-failed';

export interface GoldenPathRehearsalInput {
  scenario?: GoldenPathRehearsalScenario;
  title?: string;
  description?: string;
  now?: () => string;
}

export function runGoldenPathRehearsal(
  input: GoldenPathRehearsalInput = {},
): GoldenPathRehearsalRun {
  const scenario = input.scenario ?? 'all-pass';
  const createdAt = (input.now ?? foundationTimestamp)();
  const requestId = foundationId('golden_path_development_request');
  const codexStatus = scenario === 'codex-failed' ? 'failed' : 'completed';
  const verificationStatus =
    scenario === 'codex-failed' ? 'blocked' : scenario === 'nx-failed' ? 'failed' : 'passed';
  const finalStatus = scenario === 'all-pass' ? 'passed' : 'failed';
  const prDraftStatus = scenario === 'all-pass' ? 'ready' : 'blocked';
  const steps = [
    createGoldenPathStep({
      phase: 'development-request.fixture',
      status: 'completed',
      order: 0,
      evidenceRefIds: ['evidence_golden_request'],
      auditEventIds: ['audit_golden_request'],
      createdAt,
    }),
    createGoldenPathStep({
      phase: 'worktree.fixture',
      status: 'completed',
      order: 1,
      evidenceRefIds: ['evidence_golden_worktree'],
      auditEventIds: ['audit_golden_worktree'],
      createdAt,
    }),
    createGoldenPathStep({
      phase: 'codex.fixture',
      status: codexStatus,
      order: 2,
      evidenceRefIds: ['evidence_golden_codex'],
      auditEventIds: ['audit_golden_codex'],
      createdAt,
    }),
    createGoldenPathStep({
      phase: 'verification.fixture',
      status: verificationStatus,
      order: 3,
      evidenceRefIds: ['evidence_golden_verification'],
      auditEventIds: ['audit_golden_verification'],
      createdAt,
    }),
    createGoldenPathStep({
      phase: 'pr-draft.fixture',
      status: prDraftStatus,
      order: 4,
      evidenceRefIds: ['evidence_golden_pr_draft'],
      auditEventIds: ['audit_golden_pr_draft'],
      createdAt,
    }),
    createGoldenPathStep({
      phase: 'release-audit.fixture',
      status: prDraftStatus,
      order: 5,
      evidenceRefIds: ['evidence_golden_release_audit'],
      auditEventIds: ['audit_golden_release_audit'],
      createdAt,
    }),
  ];
  const telemetryProjection = planLocalTelemetryProjection(
    steps.map((step) => ({
      sourceKind:
        step.phase === 'verification.fixture'
          ? 'verification'
          : step.phase === 'worktree.fixture'
            ? 'worktree'
            : 'workflow',
      sourceId: step.id,
      status: step.status,
      evidenceRefIds: step.evidenceRefIds,
      auditEventIds: step.auditEventIds,
      count: 1,
    })),
  );
  const telemetryStep = createGoldenPathStep({
    phase: 'telemetry-projection.fixture',
    status: 'completed',
    order: 6,
    evidenceRefIds: ['evidence_golden_telemetry'],
    auditEventIds: ['audit_golden_telemetry'],
    createdAt,
  });
  const allSteps = [...steps, telemetryStep];
  const evidenceBundle = createGoldenPathEvidenceBundle({
    rehearsalRunId: requestId,
    steps: allSteps,
    createdAt,
  });

  return GoldenPathRehearsalRunSchema.parse({
    id: foundationId('golden_path_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status: finalStatus,
    scenario,
    requestId,
    requestTitleHash: stableHash(input.title ?? 'CodexHub golden path rehearsal'),
    requestDescriptionHash: stableHash(input.description ?? 'Fixture-only release rehearsal'),
    steps: allSteps,
    evidenceBundle,
    telemetryProjectionHash: telemetryProjection.projectionSummary.projectionHash,
    prDraftStatus,
    releaseAuditStatus: prDraftStatus,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    evidenceAuditAuthoritative: true,
    telemetryAuthoritative: false,
    pushAllowed: false,
    pullRequestOpened: false,
    summary: `Golden path fixture rehearsal ${finalStatus}; PR draft ${prDraftStatus}.`,
  });
}

function createGoldenPathStep(input: {
  phase: string;
  status: GoldenPathStepStatus;
  order: number;
  evidenceRefIds: readonly string[];
  auditEventIds: readonly string[];
  createdAt: string;
}): GoldenPathStep {
  return GoldenPathStepSchema.parse({
    id: stableId('golden_path_step', `${input.phase}:${input.order}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    phase: input.phase,
    status: input.status,
    order: input.order,
    evidenceRefIds: [...input.evidenceRefIds],
    auditEventIds: [...input.auditEventIds],
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.phase} completed with status ${input.status}.`,
  });
}

function createGoldenPathEvidenceBundle(input: {
  rehearsalRunId: string;
  steps: readonly GoldenPathStep[];
  createdAt: string;
}): GoldenPathEvidenceBundle {
  const evidenceRefIds = input.steps.flatMap((step) => step.evidenceRefIds);
  const auditEventIds = input.steps.flatMap((step) => step.auditEventIds);

  return GoldenPathEvidenceBundleSchema.parse({
    id: stableId('golden_path_evidence_bundle', input.rehearsalRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    rehearsalRunId: input.rehearsalRunId,
    evidenceRefIds,
    auditEventIds,
    evidenceCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    bundleHash: stableHash(JSON.stringify([evidenceRefIds, auditEventIds])),
    rawPathStored: false,
    bodyStored: false,
    summary: `Golden path evidence bundle contains ${evidenceRefIds.length} evidence refs and ${auditEventIds.length} audit events.`,
  });
}

function stableHash(value: string): string {
  return `golden:${stableDigest(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${stableDigest(value).slice(0, 16)}`;
}

function stableDigest(value: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA = Math.imul(hashA ^ code, 0x01000193);
    hashB = Math.imul(hashB ^ code, 0x811c9dc5);
  }

  return `${(hashA >>> 0).toString(16).padStart(8, '0')}${(hashB >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}
