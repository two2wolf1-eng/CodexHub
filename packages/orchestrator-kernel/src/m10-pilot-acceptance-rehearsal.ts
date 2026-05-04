import {
  M10PilotAcceptanceEvidenceSummarySchema,
  M10PilotAcceptanceRehearsalRunSchema,
  M10PilotAcceptanceStepSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type GoldenPathRehearsalRun,
  type M10PilotAcceptanceEvidenceSummary,
  type M10PilotAcceptanceRehearsalRun,
  type M10PilotAcceptanceScenario,
  type M10PilotAcceptanceStep,
} from '@codexhub/contracts';
import { runGoldenPathRehearsal, type GoldenPathRehearsalScenario } from './golden-path-rehearsal';

export interface M10PilotAcceptanceRehearsalInput {
  scenario?: M10PilotAcceptanceScenario;
  now?: () => string;
  goldenPathRunner?: (input: { scenario: GoldenPathRehearsalScenario }) => GoldenPathRehearsalRun;
}

export function runM10PilotAcceptanceRehearsal(
  input: M10PilotAcceptanceRehearsalInput = {},
): M10PilotAcceptanceRehearsalRun {
  const scenario = input.scenario ?? 'all-pass';
  const createdAt = (input.now ?? foundationTimestamp)();
  const runId = foundationId('m10_pilot_acceptance_rehearsal');
  const goldenPath = createGoldenPathForScenario(
    scenario,
    input.goldenPathRunner ?? runGoldenPathRehearsal,
  );
  const steps = createAcceptanceSteps({ scenario, createdAt, goldenPath });
  const evidenceSummary = createEvidenceSummary({ runId, steps, goldenPath, createdAt });
  const status = deriveAcceptanceStatus(scenario);
  const goldenPathStatus =
    scenario === 'readiness-blocked' || scenario === 'approval-blocked'
      ? 'blocked'
      : (goldenPath?.status ?? 'blocked');

  return M10PilotAcceptanceRehearsalRunSchema.parse({
    id: runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status,
    scenario,
    checklistId: stableId('m10_pilot_checklist', scenario),
    approvalHistoryProjectionId: stableId('approval_decision_history_projection', scenario),
    governanceProjectionHash: stableHash(`governance:${scenario}`),
    goldenPathRunId: goldenPath?.id ?? 'golden_path_not_invoked',
    goldenPathStatus,
    prActionStatus: scenario === 'all-pass' ? 'not_ready_no_live_pr' : 'blocked',
    steps,
    evidenceSummary,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    evidenceAuditAuthoritative: true,
    telemetryAuthoritative: false,
    summary: `M10 pilot acceptance rehearsal ${status}; scenario ${scenario}; no live execution or PR action.`,
  });
}

function createGoldenPathForScenario(
  scenario: M10PilotAcceptanceScenario,
  goldenPathRunner: (input: { scenario: GoldenPathRehearsalScenario }) => GoldenPathRehearsalRun,
): GoldenPathRehearsalRun | undefined {
  const goldenScenario = toGoldenPathScenario(scenario);

  return goldenScenario ? goldenPathRunner({ scenario: goldenScenario }) : undefined;
}

function toGoldenPathScenario(
  scenario: M10PilotAcceptanceScenario,
): GoldenPathRehearsalScenario | undefined {
  if (scenario === 'codex-failed') {
    return 'codex-failed';
  }

  if (scenario === 'nx-failed') {
    return 'nx-failed';
  }

  if (scenario === 'all-pass') {
    return 'all-pass';
  }

  return undefined;
}

function createAcceptanceSteps(input: {
  scenario: M10PilotAcceptanceScenario;
  createdAt: string;
  goldenPath?: GoldenPathRehearsalRun;
}): M10PilotAcceptanceStep[] {
  const readinessBlocked = input.scenario === 'readiness-blocked';
  const approvalBlocked = input.scenario === 'approval-blocked';
  const failed = input.scenario === 'codex-failed' || input.scenario === 'nx-failed';

  return [
    createStep({
      code: 'doctor_preflight',
      phase: 'doctor',
      status: readinessBlocked ? 'blocked' : 'passed',
      order: 0,
      createdAt: input.createdAt,
    }),
    createStep({
      code: 'pilot_checklist',
      phase: 'checklist',
      status: readinessBlocked ? 'blocked' : 'passed',
      order: 1,
      createdAt: input.createdAt,
    }),
    createStep({
      code: 'approval_history',
      phase: 'approval',
      status: readinessBlocked ? 'skipped' : approvalBlocked ? 'blocked' : 'passed',
      order: 2,
      createdAt: input.createdAt,
    }),
    createStep({
      code: 'governance_projection',
      phase: 'governance',
      status: readinessBlocked || approvalBlocked ? 'skipped' : 'passed',
      order: 3,
      createdAt: input.createdAt,
    }),
    createStep({
      code: 'fixture_pilot',
      phase: 'pilot',
      status: readinessBlocked || approvalBlocked ? 'skipped' : failed ? 'failed' : 'passed',
      order: 4,
      createdAt: input.createdAt,
      evidenceRefIds: input.goldenPath?.evidenceBundle.evidenceRefIds,
      auditEventIds: input.goldenPath?.evidenceBundle.auditEventIds,
    }),
    createStep({
      code: 'operator_review',
      phase: 'review',
      status: readinessBlocked || approvalBlocked ? 'skipped' : failed ? 'blocked' : 'passed',
      order: 5,
      createdAt: input.createdAt,
    }),
  ];
}

function createStep(input: {
  code: string;
  phase: M10PilotAcceptanceStep['phase'];
  status: M10PilotAcceptanceStep['status'];
  order: number;
  createdAt: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}): M10PilotAcceptanceStep {
  return M10PilotAcceptanceStepSchema.parse({
    id: stableId('m10_pilot_acceptance_step', `${input.code}:${input.status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    code: input.code,
    phase: input.phase,
    status: input.status,
    order: input.order,
    evidenceRefIds: [...(input.evidenceRefIds ?? [`evidence_m10_${input.code}`])],
    auditEventIds: [...(input.auditEventIds ?? [`audit_m10_${input.code}`])],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    summary: `${input.code} ${input.status}; fixture-only operator acceptance metadata.`,
  });
}

function createEvidenceSummary(input: {
  runId: string;
  steps: readonly M10PilotAcceptanceStep[];
  goldenPath?: GoldenPathRehearsalRun;
  createdAt: string;
}): M10PilotAcceptanceEvidenceSummary {
  const evidenceRefIds = uniqueSorted(input.steps.flatMap((step) => step.evidenceRefIds));
  const auditEventIds = uniqueSorted(input.steps.flatMap((step) => step.auditEventIds));

  return M10PilotAcceptanceEvidenceSummarySchema.parse({
    id: stableId('m10_pilot_acceptance_evidence_summary', input.runId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    rehearsalRunId: input.runId,
    evidenceRefIds,
    auditEventIds,
    evidenceCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    evidenceBundleHash: stableHash(JSON.stringify([evidenceRefIds, auditEventIds])),
    governanceProjectionHash: stableHash(`governance:${input.runId}`),
    telemetryProjectionHash: input.goldenPath?.telemetryProjectionHash ?? stableHash('telemetry:not-invoked'),
    evidenceAuditAuthoritative: true,
    telemetryAuthoritative: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `M10 acceptance evidence summary contains ${evidenceRefIds.length} evidence refs and ${auditEventIds.length} audit events.`,
  });
}

function deriveAcceptanceStatus(
  scenario: M10PilotAcceptanceScenario,
): M10PilotAcceptanceRehearsalRun['status'] {
  if (scenario === 'readiness-blocked' || scenario === 'approval-blocked') {
    return 'blocked';
  }

  return scenario === 'all-pass' ? 'passed' : 'failed';
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function stableHash(value: string): string {
  return `m10:${stableDigest(value)}`;
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
