import {
  type BrowserObservationRun,
  type BrowserPageObservationSummary,
  type BrowserProfileReadiness,
  type EvidenceRef,
} from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';
import { type PlaywrightObserverAdapterPlan } from './plan';

export function createBrowserProfileReadinessEvidence(
  readiness: BrowserProfileReadiness,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'browser.profile_readiness',
    label: 'browser-profile-readiness',
    summary: readiness.summary,
    metadata: {
      readinessId: readiness.id,
      status: readiness.status,
      profilePathHash: readiness.profileRef.profilePathHash,
      blockReasons: readiness.blockReasons,
      allowedCapabilities: readiness.allowedCapabilities,
      forbiddenActionCount: readiness.forbiddenActions.length,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  });
}

export function createBrowserObservationPlanEvidence(
  plan: PlaywrightObserverAdapterPlan,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'browser.observation_plan',
    label: 'playwright-observer-plan',
    summary: plan.browserPlan.summary,
    metadata: {
      adapterName: plan.adapterName,
      planId: plan.id,
      dryRunId: plan.dryRunId,
      status: plan.status,
      profilePathHash: plan.profileRef.profilePathHash,
      requestedCapabilities: plan.requestedCapabilities,
      forbiddenActionCount: plan.forbiddenActions.length,
      blockReasons: plan.blockReasons,
      screenshotPlanned: false,
      networkBodyStorage: 'forbidden',
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  });
}

export function createBrowserObservationSummaryEvidence(
  summary: BrowserPageObservationSummary,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'browser.observation_summary',
    label: 'playwright-observer-summary',
    summary: summary.summary,
    metadata: {
      summaryId: summary.id,
      planId: summary.planId,
      profilePathHash: summary.profileRef.profilePathHash,
      titleObserved: summary.titleObserved,
      pageTitleHash: summary.pageTitleHash,
      urlObserved: summary.urlObserved,
      pageUrlHash: summary.pageUrlHash,
      accessibilitySnapshotHash: summary.accessibilitySnapshotHash,
      accessibilityNodeCount: summary.accessibilityNodeCount,
      consoleMessageCount: summary.consoleSummary.messageCount,
      consoleWarningCount: summary.consoleSummary.warningCount,
      consoleErrorCount: summary.consoleSummary.errorCount,
      networkRequestCount: summary.networkSummary.requestCount,
      networkResponseCount: summary.networkSummary.responseCount,
      networkFailedRequestCount: summary.networkSummary.failedRequestCount,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  });
}

export function createBrowserObservationRunEvidence(run: BrowserObservationRun): EvidenceRef {
  return createEvidenceRef({
    kind: 'browser.observation_run_summary',
    label: 'playwright-observer-run',
    summary: run.summary,
    metadata: {
      runId: run.id,
      status: run.status,
      planId: run.plan.id,
      profilePathHash: run.plan.profileRef.profilePathHash,
      evidenceRefCount: run.evidenceRefs.length,
      auditEventCount: run.auditEventIds.length,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  });
}
