import {
  type BrowserConsoleSummary,
  type BrowserNetworkMetadataSummary,
  type BrowserObservationRun,
  type BrowserObservationRunStatus,
  type BrowserPageObservationSummary,
  type BrowserProfileReadiness,
  type BrowserProfileReadinessBlockReason,
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  type EvidenceRef,
  type ExecutionAuthority,
  BrowserObservationRunSchema,
  BrowserPageObservationSummarySchema,
  ExecutionAuthoritySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { createPlaywrightObserverAuditEvent } from './audit';
import {
  createBrowserObservationPlanEvidence,
  createBrowserObservationRunEvidence,
  createBrowserObservationSummaryEvidence,
  createBrowserProfileReadinessEvidence,
} from './evidence';
import {
  type PlaywrightObserverAdapterPlan,
} from './plan';
import { PLAYWRIGHT_OBSERVER_ADAPTER_NAME } from './manifest';

export interface PlaywrightObserverFixtureRunnerResult {
  status: 'completed' | 'failed' | 'aborted';
  pageTitle?: string;
  pageUrl?: string;
  accessibilitySnapshot?: string;
  accessibilityNodeCount?: number;
  consoleSummary?: BrowserConsoleSummary;
  networkSummary?: BrowserNetworkMetadataSummary;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  sourceLabel?: string;
  summary?: string;
  observedAt?: string;
}

export interface PlaywrightObserverRunner {
  observe(plan: PlaywrightObserverAdapterPlan): Promise<PlaywrightObserverFixtureRunnerResult>;
}

export type PlaywrightObserverFixtureRunner = PlaywrightObserverRunner;

export interface PlaywrightObserverAdapterExecuteInput {
  plan: PlaywrightObserverAdapterPlan;
  authority?: ExecutionAuthority;
  runner?: PlaywrightObserverRunner;
  readiness?: BrowserProfileReadiness;
  now?: () => string;
  actor?: string;
}

export interface PlaywrightObserverAdapterExecuteResult {
  status: BrowserObservationRunStatus;
  capabilityResult: CapabilityExecutionResult;
  browserRun: BrowserObservationRun;
  pageSummary?: BrowserPageObservationSummary;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
}

export async function executePlaywrightObserverAdapter(
  input: PlaywrightObserverAdapterExecuteInput,
): Promise<PlaywrightObserverAdapterExecuteResult> {
  const authorityBlockReason = validateAuthority(input.plan, input.authority, input.now);
  const blockReasons = [
    ...input.plan.blockReasons,
    ...(authorityBlockReason ? [authorityBlockReason] : []),
    ...(input.runner ? [] : (['fixture_runner_missing'] as const)),
  ];

  if (input.plan.status === 'blocked' || blockReasons.length > 0) {
    return createBlockedExecuteResult(input, blockReasons);
  }

  const runner = input.runner;

  if (!runner) {
    return createBlockedExecuteResult(input, ['fixture_runner_missing']);
  }

  try {
    const runnerResult = await runner.observe(input.plan);
    const boundaryTruth = getBoundaryTruth(runnerResult);
    const pageSummary =
      runnerResult.status === 'completed'
        ? createPageObservationSummary(input.plan, runnerResult)
        : undefined;
    const status = runnerResult.status;
    const evidenceRefs = createEvidenceRefs(input, pageSummary);
    const auditEvents = [
      createPlaywrightObserverAuditEvent({
        actor: input.actor,
        action: 'browser.observe.read_only',
        target: input.plan.profileRef.profilePathHash,
        reason: 'execution authority accepted for browser read-only observation',
        outcome: status,
        policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
        evidenceRefs,
        metadata: {
          dryRunId: input.plan.dryRunId,
          runnerMode: input.plan.runnerMode,
          pageSummaryCreated: pageSummary !== undefined,
        },
        processBoundaryInvoked: boundaryTruth.processBoundaryInvoked,
        externalProcessStarted: boundaryTruth.externalProcessStarted,
        liveExecution: boundaryTruth.processBoundaryInvoked,
      }),
    ];
    const browserRun = createBrowserRun({
      input,
      status,
      pageSummary,
      evidenceRefs,
      auditEvents,
      summary: runnerResult.summary ?? `Browser observation run ${status}.`,
      processBoundaryInvoked: boundaryTruth.processBoundaryInvoked,
      externalProcessStarted: boundaryTruth.externalProcessStarted,
    });
    const finalEvidenceRefs = [...evidenceRefs, createBrowserObservationRunEvidence(browserRun)];
    const finalBrowserRun = createBrowserRun({
      input,
      status,
      pageSummary,
      evidenceRefs: finalEvidenceRefs,
      auditEvents,
      summary: runnerResult.summary ?? `Browser observation run ${status}.`,
      processBoundaryInvoked: boundaryTruth.processBoundaryInvoked,
      externalProcessStarted: boundaryTruth.externalProcessStarted,
    });
    const finalAuditEvents = [
      {
        ...auditEvents[0],
        evidenceRefs: finalEvidenceRefs,
      },
    ];

    return {
      status,
      capabilityResult: createCapabilityExecutionResult({
        status: status === 'completed' ? 'completed' : status,
        evidenceRefs: finalEvidenceRefs,
        auditEvents: finalAuditEvents,
        summary: finalBrowserRun.summary,
        processBoundaryInvoked: boundaryTruth.processBoundaryInvoked,
        externalProcessStarted: boundaryTruth.externalProcessStarted,
      }),
      browserRun: finalBrowserRun,
      pageSummary,
      evidenceRefs: finalEvidenceRefs,
      auditEvents: finalAuditEvents,
    };
  } catch (error) {
    return createFailedFixtureResult(input, error);
  }
}

function validateAuthority(
  plan: PlaywrightObserverAdapterPlan,
  authority: ExecutionAuthority | undefined,
  now: (() => string) | undefined,
): BrowserProfileReadinessBlockReason | undefined {
  const parsedAuthority = authority ? ExecutionAuthoritySchema.safeParse(authority) : undefined;

  if (!authority) {
    return 'execution_authority_missing';
  }

  if (parsedAuthority?.success === false) {
    return 'execution_authority_invalid';
  }

  if (!authority.allowed) {
    return 'execution_authority_not_allowed';
  }

  if (
    authority.expiresAt &&
    Date.parse(authority.expiresAt) <= Date.parse((now ?? foundationTimestamp)())
  ) {
    return 'execution_authority_expired';
  }

  if (plan.processBoundaryPlanned && !authority.approvalArtifactId) {
    return 'approval_artifact_missing';
  }

  return undefined;
}

function createBlockedExecuteResult(
  input: PlaywrightObserverAdapterExecuteInput,
  blockReasons: readonly BrowserProfileReadinessBlockReason[],
): PlaywrightObserverAdapterExecuteResult {
  const evidenceRefs = createEvidenceRefs(input);
  const auditEvents = [
    createPlaywrightObserverAuditEvent({
      actor: input.actor,
      action: 'browser.observe.read_only',
      target: input.plan.profileRef.profilePathHash,
      reason: 'capability execution blocked by governance gate',
      outcome: 'blocked',
      policyDecisionId: input.authority?.policyDecisionId ?? 'blocked-before-policy',
      evidenceRefs,
      metadata: {
        dryRunId: input.plan.dryRunId,
        blockReasons,
        runnerMode: input.plan.runnerMode,
      },
    }),
  ];
  const browserRun = createBrowserRun({
    input,
    status: 'blocked',
    evidenceRefs,
    auditEvents,
    summary: `Browser observation execution blocked: ${blockReasons.join(', ')}.`,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  });
  const finalEvidenceRefs = [...evidenceRefs, createBrowserObservationRunEvidence(browserRun)];
  const finalBrowserRun = createBrowserRun({
    input,
    status: 'blocked',
    evidenceRefs: finalEvidenceRefs,
    auditEvents,
    summary: browserRun.summary,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  });
  const finalAuditEvents = [
    {
      ...auditEvents[0],
      evidenceRefs: finalEvidenceRefs,
    },
  ];

  return {
    status: 'blocked',
    capabilityResult: createCapabilityExecutionResult({
      status: 'blocked',
      evidenceRefs: finalEvidenceRefs,
      auditEvents: finalAuditEvents,
      summary: finalBrowserRun.summary,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    }),
    browserRun: finalBrowserRun,
    evidenceRefs: finalEvidenceRefs,
    auditEvents: finalAuditEvents,
  };
}

function createFailedFixtureResult(
  input: PlaywrightObserverAdapterExecuteInput,
  error: unknown,
): PlaywrightObserverAdapterExecuteResult {
  const evidenceRefs = createEvidenceRefs(input);
  const auditEvents = [
    createPlaywrightObserverAuditEvent({
      actor: input.actor,
      action: 'browser.observe.read_only',
      target: input.plan.profileRef.profilePathHash,
      reason: 'browser observation runner failed before producing a metadata summary',
      outcome: 'failed',
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        dryRunId: input.plan.dryRunId,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        runnerMode: input.plan.runnerMode,
      },
    }),
  ];
  const browserRun = createBrowserRun({
    input,
    status: 'failed',
    evidenceRefs,
    auditEvents,
    summary: 'Browser observation runner failed without storing raw output.',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  });
  const finalEvidenceRefs = [...evidenceRefs, createBrowserObservationRunEvidence(browserRun)];
  const finalBrowserRun = createBrowserRun({
    input,
    status: 'failed',
    evidenceRefs: finalEvidenceRefs,
    auditEvents,
    summary: browserRun.summary,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  });
  const finalAuditEvents = [
    {
      ...auditEvents[0],
      evidenceRefs: finalEvidenceRefs,
    },
  ];

  return {
    status: 'failed',
    capabilityResult: createCapabilityExecutionResult({
      status: 'failed',
      evidenceRefs: finalEvidenceRefs,
      auditEvents: finalAuditEvents,
      summary: finalBrowserRun.summary,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    }),
    browserRun: finalBrowserRun,
    evidenceRefs: finalEvidenceRefs,
    auditEvents: finalAuditEvents,
  };
}

function createEvidenceRefs(
  input: PlaywrightObserverAdapterExecuteInput,
  pageSummary?: BrowserPageObservationSummary,
): EvidenceRef[] {
  return [
    ...(input.readiness ? [createBrowserProfileReadinessEvidence(input.readiness)] : []),
    createBrowserObservationPlanEvidence(input.plan),
    ...(pageSummary ? [createBrowserObservationSummaryEvidence(pageSummary)] : []),
  ];
}

function createPageObservationSummary(
  plan: PlaywrightObserverAdapterPlan,
  result: PlaywrightObserverFixtureRunnerResult,
): BrowserPageObservationSummary {
  return BrowserPageObservationSummarySchema.parse({
    id: foundationId('browser_page_observation_summary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: result.observedAt ?? foundationTimestamp(),
    source: result.sourceLabel ?? `${PLAYWRIGHT_OBSERVER_ADAPTER_NAME}.fixture`,
    kind: 'browser.page.summary',
    severity: 'info',
    planId: plan.browserPlan.id,
    profileRef: plan.profileRef,
    titleObserved: result.pageTitle !== undefined,
    pageTitleHash: result.pageTitle ? `sha256:${hashText(result.pageTitle)}` : undefined,
    urlObserved: result.pageUrl !== undefined,
    pageUrlHash: result.pageUrl ? `sha256:${hashText(result.pageUrl)}` : undefined,
    accessibilitySnapshotHash: result.accessibilitySnapshot
      ? `sha256:${hashText(result.accessibilitySnapshot)}`
      : undefined,
    accessibilityNodeCount: result.accessibilityNodeCount,
    consoleSummary: result.consoleSummary ?? {
      messageCount: 0,
      warningCount: 0,
      errorCount: 0,
      bodyStored: false,
    },
    networkSummary: result.networkSummary ?? {
      requestCount: 0,
      responseCount: 0,
      failedRequestCount: 0,
      bodyStored: false,
    },
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: result.processBoundaryInvoked ?? false,
    externalProcessStarted: result.externalProcessStarted ?? false,
    summary: result.summary ?? 'Browser observation summary completed.',
  });
}

function createBrowserRun(input: {
  input: PlaywrightObserverAdapterExecuteInput;
  status: BrowserObservationRunStatus;
  pageSummary?: BrowserPageObservationSummary;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  summary: string;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
}): BrowserObservationRun {
  return BrowserObservationRunSchema.parse({
    id: foundationId('browser_observation_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: input.status,
    plan: input.input.plan.browserPlan,
    readiness: input.input.readiness,
    pageSummary: input.pageSummary,
    evidenceRefs: input.evidenceRefs,
    auditEventIds: input.auditEvents.map((event) => event.id),
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: input.processBoundaryInvoked,
    externalProcessStarted: input.externalProcessStarted,
    summary: input.summary,
  });
}

function createCapabilityExecutionResult(input: {
  status: CapabilityExecutionResult['status'];
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  summary: string;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
}): CapabilityExecutionResult {
  return {
    id: foundationId('capability_execution_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: input.status,
    processBoundaryInvoked: input.processBoundaryInvoked,
    externalProcessStarted: input.externalProcessStarted,
    noRealWrite: true,
    evidenceRefs: input.evidenceRefs.map((ref) => ref.id),
    auditEventIds: input.auditEvents.map((event) => event.id),
    summary: input.summary,
  };
}

function getBoundaryTruth(result: PlaywrightObserverFixtureRunnerResult): {
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
} {
  return {
    processBoundaryInvoked: result.processBoundaryInvoked ?? false,
    externalProcessStarted: result.externalProcessStarted ?? false,
  };
}
