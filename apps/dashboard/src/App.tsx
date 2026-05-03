import { useEffect, useState } from 'react';
import type {
  CodexExecControlPlaneTimeline,
  CodexExecControlPlaneDrilldownView,
  CodexExecControlPlaneReport,
  CodexExecGovernanceReviewPackage,
  CodexExecLiveAdapterAdrDecisionSummary,
  CodexExecLiveAdapterAdrDraft,
  CodexExecReadOnlyAdapterPreflightSimulationResult,
  CodexExecReadOnlyAdapterSimulatorReviewSummary,
  CodexExecReadOnlyAdapterImplementationPlanReviewSummary,
  CodexExecReadOnlyAdapterSkeletonPreview,
  CodexExecReadOnlyAdapterSkeletonReviewSummary,
  CodexExecReadOnlyAdapterFixtureBoundarySummary,
  CodexExecReadOnlyAdapterFinalReadinessSummary,
  CodexExecRealReadOnlyAdapterReadinessSummary,
  CodexExecRealReadOnlyAdapterReadinessReviewSummary,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummary,
  CodexExecReportReviewComparison,
  CodexExecReportReviewHistoryView,
  CodexExecReportReviewRecord,
  CodexExecReviewerHandoffSummary,
  CodexExecTimelineDetailView,
  CodexExecLiveConfig,
  CodexExecLiveRunRecord,
  CodexExecConfigLoadResult,
  CodexExecManualApprovalRecord,
  CodexReplaySummary,
  SourceHealth,
  WorkflowRun,
} from '@codexhub/contracts';
import type { MockDevelopmentOrchestrationResult } from '@codexhub/orchestrator-kernel';
import {
  DASHBOARD_VIEWS,
  type DashboardView,
  createBrowserProfilesReadOnlySummary,
  createElectronCdpReadOnlySummary,
  createVerificationReadinessPreview,
  getDashboardHash,
  getDashboardViewFromHash,
  summarizeDegradedState,
  summarizeMcpTools,
} from './read-only-ux';

interface OverviewState {
  status: 'loading' | 'ready' | 'degraded';
  health?: Record<string, unknown>;
  runs: WorkflowRun[];
  sourceHealth: SourceHealth[];
  developmentRuns: MockDevelopmentOrchestrationResult[];
  codexReplayRuns: CodexReplaySummary[];
  codexExecDryRuns: CodexExecLiveRunRecord[];
  codexExecLiveConfig?: CodexExecLiveConfig;
  codexExecConfigLoadResult?: CodexExecConfigLoadResult;
  codexExecApprovals: CodexExecManualApprovalRecord[];
  codexExecTimelines: CodexExecControlPlaneTimeline[];
  codexExecTimelineDetails: CodexExecTimelineDetailView[];
  codexExecDrilldowns: CodexExecControlPlaneDrilldownView[];
  codexExecReports: CodexExecControlPlaneReport[];
  codexExecGovernancePackages: CodexExecGovernanceReviewPackage[];
  codexExecAdrDecisions: CodexExecLiveAdapterAdrDecisionSummary[];
  codexExecAdrDrafts: CodexExecLiveAdapterAdrDraft[];
  codexExecReadOnlyAdapterPreflightSimulations: CodexExecReadOnlyAdapterPreflightSimulationResult[];
  codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewSummary[];
  codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewSummary[];
  codexExecReadOnlyAdapterSkeletonPreview?: CodexExecReadOnlyAdapterSkeletonPreview;
  codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewSummary[];
  codexExecReadOnlyAdapterFixtureBoundaries: CodexExecReadOnlyAdapterFixtureBoundarySummary[];
  codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessSummary[];
  codexExecRealReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessSummary[];
  codexExecRealReadOnlyAdapterReadinessReviews: CodexExecRealReadOnlyAdapterReadinessReviewSummary[];
  codexExecRealReadOnlyAdapterAttemptTimelines: CodexExecRealReadOnlyAdapterAttemptTimelineSummary[];
  codexExecReportReviews: CodexExecReportReviewRecord[];
  codexExecReportReviewHistories: CodexExecReportReviewHistoryView[];
  codexExecReportReviewComparisons: CodexExecReportReviewComparison[];
  codexExecReviewerHandoffs: CodexExecReviewerHandoffSummary[];
  codexExecEvidenceSearch?: Record<string, unknown>;
  browserObservationDryRuns: BrowserObservationControlSummary[];
  browserObservationApprovals: BrowserObservationControlSummary[];
  browserObservationRuns: BrowserObservationControlSummary[];
  electronCdpObservationDryRuns: ElectronCdpObservationControlSummary[];
  electronCdpObservationApprovals: ElectronCdpObservationControlSummary[];
  electronCdpObservationRuns: ElectronCdpObservationControlSummary[];
  message?: string;
}

interface BrowserObservationControlSummary {
  recordId?: string;
  dryRunId?: string;
  runId?: string;
  status?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
}

interface ElectronCdpObservationControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  endpointIdHash?: string;
  targetIdHash?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  eventSummary?: {
    eventCount?: number;
    consoleEventCount?: number;
    networkEventCount?: number;
  };
  cdpHttpBoundaryPlanned?: boolean;
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryPlanned?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
}

const supervisorUrl = import.meta.env.VITE_CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';

export function App() {
  const [overview, setOverview] = useState<OverviewState>({
    status: 'loading',
    runs: [],
    sourceHealth: [],
    developmentRuns: [],
    codexReplayRuns: [],
    codexExecDryRuns: [],
    codexExecApprovals: [],
    codexExecTimelines: [],
    codexExecTimelineDetails: [],
    codexExecDrilldowns: [],
    codexExecReports: [],
    codexExecGovernancePackages: [],
    codexExecAdrDecisions: [],
    codexExecAdrDrafts: [],
    codexExecReadOnlyAdapterPreflightSimulations: [],
    codexExecReadOnlyAdapterSimulatorReviews: [],
    codexExecReadOnlyAdapterImplementationPlanReviews: [],
    codexExecReadOnlyAdapterSkeletonReviews: [],
    codexExecReadOnlyAdapterFixtureBoundaries: [],
    codexExecReadOnlyAdapterFinalReadiness: [],
    codexExecRealReadOnlyAdapterReadiness: [],
    codexExecRealReadOnlyAdapterReadinessReviews: [],
    codexExecRealReadOnlyAdapterAttemptTimelines: [],
    codexExecReportReviews: [],
    codexExecReportReviewHistories: [],
    codexExecReportReviewComparisons: [],
    codexExecReviewerHandoffs: [],
    browserObservationDryRuns: [],
    browserObservationApprovals: [],
    browserObservationRuns: [],
    electronCdpObservationDryRuns: [],
    electronCdpObservationApprovals: [],
    electronCdpObservationRuns: [],
  });
  const [activeView, setActiveView] = useState<DashboardView>(() =>
    getDashboardViewFromHash(window.location.hash),
  );
  const mcpSummary = summarizeMcpTools();
  const verificationPreview = createVerificationReadinessPreview();
  const browserProfilesSummary = createBrowserProfilesReadOnlySummary({
    dryRunCount: overview.browserObservationDryRuns.length,
    approvalCount: overview.browserObservationApprovals.length,
    runCount: overview.browserObservationRuns.length,
    latestRunStatus: overview.browserObservationRuns[0]?.status,
  });
  const electronCdpSummary = createElectronCdpReadOnlySummary({
    dryRunCount: overview.electronCdpObservationDryRuns.length,
    approvalCount: overview.electronCdpObservationApprovals.length,
    runCount: overview.electronCdpObservationRuns.length,
    latestRunStatus: overview.electronCdpObservationRuns[0]?.status,
    runnerModes: overview.electronCdpObservationDryRuns
      .map((record) => record.runnerMode)
      .filter((runnerMode): runnerMode is string => runnerMode !== undefined),
    cdpHttpBoundaryInvoked: overview.electronCdpObservationRuns.some(
      (record) => record.cdpHttpBoundaryInvoked === true,
    ),
    cdpWebSocketBoundaryInvoked: overview.electronCdpObservationRuns.some(
      (record) => record.cdpWebSocketBoundaryInvoked === true,
    ),
  });

  useEffect(() => {
    function onHashChange() {
      setActiveView(getDashboardViewFromHash(window.location.hash));
    }

    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const health = await getJson<Record<string, unknown>>('/health');
        const [
          runsResponse,
          observationsResponse,
          developmentRunsResponse,
          codexReplayRunsResponse,
          codexExecDryRunsResponse,
          codexExecConfigResponse,
          codexExecApprovalsResponse,
          readOnlyAdapterPreflightSimulationsResponse,
          readOnlyAdapterSimulatorReviewsResponse,
          readOnlyAdapterImplementationPlanReviewsResponse,
          readOnlyAdapterSkeletonPreviewResponse,
          readOnlyAdapterSkeletonReviewsResponse,
          readOnlyAdapterFixtureBoundariesResponse,
          readOnlyAdapterFinalReadinessResponse,
          realReadOnlyAdapterReadinessResponse,
          realReadOnlyAdapterReadinessReviewsResponse,
          codexExecReportReviewsResponse,
          codexExecEvidenceResponse,
        ] = await Promise.all([
          getJson<{ runs: WorkflowRun[] }>('/api/workflows/runs'),
          getJson<{ sourceHealth: SourceHealth[] }>('/api/observations'),
          getJson<{ runs: MockDevelopmentOrchestrationResult[] }>('/api/development/mock-runs'),
          getJson<{ runs: CodexReplaySummary[] }>('/api/codex/replay-fixtures'),
          getJson<{ runs: CodexExecLiveRunRecord[]; liveConfig?: CodexExecLiveConfig }>(
            '/api/codex/exec/dry-runs',
          ),
          getJson<{
            configLoadResult?: CodexExecConfigLoadResult;
            liveConfig?: CodexExecLiveConfig;
          }>('/api/codex/exec/config'),
          getJson<{ approvals: CodexExecManualApprovalRecord[] }>('/api/codex/exec/approvals'),
          getJson<{
            simulations: CodexExecReadOnlyAdapterPreflightSimulationResult[];
          }>('/api/codex/exec/read-only-adapter/preflight-simulations?limit=5'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterSimulatorReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/simulator-reviews?limit=5'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterImplementationPlanReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/implementation-plan-reviews?limit=5'),
          getJson<{
            preview: CodexExecReadOnlyAdapterSkeletonPreview;
          }>('/api/codex/exec/read-only-adapter/skeleton-preview'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterSkeletonReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/skeleton-reviews?limit=5'),
          getJson<{
            summaries: CodexExecReadOnlyAdapterFixtureBoundarySummary[];
          }>('/api/codex/exec/read-only-adapter/fixture-boundaries'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterFinalReadinessSummary[];
          }>('/api/codex/exec/read-only-adapter/final-readiness?limit=5'),
          getJson<{
            summaries: CodexExecRealReadOnlyAdapterReadinessSummary[];
          }>('/api/codex/exec/real-read-only-adapter/readiness-packages?limit=5'),
          getJson<{
            summaries: CodexExecRealReadOnlyAdapterReadinessReviewSummary[];
          }>('/api/codex/exec/real-read-only-adapter/readiness-reviews?limit=5'),
          getJson<{ reviews: CodexExecReportReviewRecord[] }>(
            '/api/codex/exec/report-reviews?limit=10',
          ),
          getJson<Record<string, unknown>>('/api/codex/exec/evidence?limit=20'),
        ]);
        const codexExecTimelines = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ timeline: CodexExecControlPlaneTimeline }>(
                  `/api/codex/exec/timeline/${encodeURIComponent(run.id)}`,
                );
                return response.timeline;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((timeline): timeline is CodexExecControlPlaneTimeline => timeline !== undefined);
        const codexExecTimelineDetails = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ detail: CodexExecTimelineDetailView }>(
                  `/api/codex/exec/timeline/${encodeURIComponent(
                    run.id,
                  )}/detail?includeEvidence=true&includeAudit=true`,
                );
                return response.detail;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((detail): detail is CodexExecTimelineDetailView => detail !== undefined);
        const codexExecDrilldowns = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ drilldown: CodexExecControlPlaneDrilldownView }>(
                  `/api/codex/exec/drilldown/${encodeURIComponent(run.id)}`,
                );
                return response.drilldown;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (drilldown): drilldown is CodexExecControlPlaneDrilldownView => drilldown !== undefined,
        );
        const codexExecReports = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ report: CodexExecControlPlaneReport }>(
                  `/api/codex/exec/report/${encodeURIComponent(
                    run.id,
                  )}?format=json&includeEvidence=true&includeAudit=true`,
                );
                return response.report;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((report): report is CodexExecControlPlaneReport => report !== undefined);
        const reviewDryRunIds = uniqueReviewDryRunIds(codexExecReportReviewsResponse.reviews);
        const codexExecReportReviewHistories = (
          await Promise.all(
            reviewDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{ history: CodexExecReportReviewHistoryView }>(
                  `/api/codex/exec/report-reviews/history?dryRunId=${encodeURIComponent(
                    dryRunId,
                  )}&limit=10`,
                );
                return response.history;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((history): history is CodexExecReportReviewHistoryView => history !== undefined);
        const codexExecReviewerHandoffs = (
          await Promise.all(
            reviewDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{ handoff: CodexExecReviewerHandoffSummary }>(
                  `/api/codex/exec/report-reviews/handoff/${encodeURIComponent(dryRunId)}`,
                );
                return response.handoff;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((handoff): handoff is CodexExecReviewerHandoffSummary => handoff !== undefined);
        const codexExecReportReviewComparisons = codexExecReportReviewHistories
          .map((history) => history.comparison)
          .filter(
            (comparison): comparison is CodexExecReportReviewComparison => comparison !== undefined,
          );
        const governanceDryRunIds = uniqueGovernanceDryRunIds(
          codexExecDryRunsResponse.runs,
          codexExecReportReviewsResponse.reviews,
        );
        const codexExecGovernancePackages = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  governancePackage: CodexExecGovernanceReviewPackage;
                }>(
                  `/api/codex/exec/governance-package/${encodeURIComponent(
                    dryRunId,
                  )}?includeEvidence=true&includeAudit=true`,
                );
                return response.governancePackage;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (governancePackage): governancePackage is CodexExecGovernanceReviewPackage =>
            governancePackage !== undefined,
        );
        const codexExecAdrDrafts = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  adrDraft: CodexExecLiveAdapterAdrDraft;
                }>(
                  `/api/codex/exec/adr-draft/${encodeURIComponent(
                    dryRunId,
                  )}?format=markdown&includeEvidence=true&includeAudit=true`,
                );
                return response.adrDraft;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((adrDraft): adrDraft is CodexExecLiveAdapterAdrDraft => adrDraft !== undefined);
        const codexExecAdrDecisions = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  summary: CodexExecLiveAdapterAdrDecisionSummary;
                }>(
                  `/api/codex/exec/live-adapter-adr-decision/latest/${encodeURIComponent(
                    dryRunId,
                  )}`,
                );
                return response.summary;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (decision): decision is CodexExecLiveAdapterAdrDecisionSummary => decision !== undefined,
        );
        const realAdapterTimelineDryRunIds = uniqueRealAdapterTimelineDryRunIds(
          codexExecDryRunsResponse.runs,
          realReadOnlyAdapterReadinessResponse.summaries,
        );
        const codexExecRealReadOnlyAdapterAttemptTimelines = (
          await Promise.all(
            realAdapterTimelineDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  timeline: CodexExecRealReadOnlyAdapterAttemptTimelineSummary;
                }>(
                  `/api/codex/exec/real-read-only-adapter/attempt-timeline/${encodeURIComponent(
                    dryRunId,
                  )}?includeEvidence=true&includeAudit=true&limit=5`,
                );
                return response.timeline;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (
            timeline,
          ): timeline is CodexExecRealReadOnlyAdapterAttemptTimelineSummary =>
            timeline !== undefined,
        );
        const [
          browserObservationDryRunsResponse,
          browserObservationApprovalsResponse,
          browserObservationRunsResponse,
          electronCdpObservationDryRunsResponse,
          electronCdpObservationApprovalsResponse,
          electronCdpObservationRunsResponse,
        ] = await Promise.all([
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/runs',
            { records: [] },
          ),
        ]);

        if (!cancelled) {
          setOverview({
            status: 'ready',
            health,
            runs: runsResponse.runs,
            sourceHealth: observationsResponse.sourceHealth,
            developmentRuns: developmentRunsResponse.runs,
            codexReplayRuns: codexReplayRunsResponse.runs,
            codexExecDryRuns: codexExecDryRunsResponse.runs,
            codexExecLiveConfig:
              codexExecConfigResponse.liveConfig ?? codexExecDryRunsResponse.liveConfig,
            codexExecConfigLoadResult: codexExecConfigResponse.configLoadResult,
            codexExecApprovals: codexExecApprovalsResponse.approvals,
            codexExecTimelines,
            codexExecTimelineDetails,
            codexExecDrilldowns,
            codexExecReports,
            codexExecGovernancePackages,
            codexExecAdrDecisions,
            codexExecAdrDrafts,
            codexExecReadOnlyAdapterPreflightSimulations:
              readOnlyAdapterPreflightSimulationsResponse.simulations,
            codexExecReadOnlyAdapterSimulatorReviews:
              readOnlyAdapterSimulatorReviewsResponse.reviews,
            codexExecReadOnlyAdapterImplementationPlanReviews:
              readOnlyAdapterImplementationPlanReviewsResponse.reviews,
            codexExecReadOnlyAdapterSkeletonPreview: readOnlyAdapterSkeletonPreviewResponse.preview,
            codexExecReadOnlyAdapterSkeletonReviews: readOnlyAdapterSkeletonReviewsResponse.reviews,
            codexExecReadOnlyAdapterFixtureBoundaries:
              readOnlyAdapterFixtureBoundariesResponse.summaries,
            codexExecReadOnlyAdapterFinalReadiness: readOnlyAdapterFinalReadinessResponse.reviews,
            codexExecRealReadOnlyAdapterReadiness: realReadOnlyAdapterReadinessResponse.summaries,
            codexExecRealReadOnlyAdapterReadinessReviews:
              realReadOnlyAdapterReadinessReviewsResponse.summaries,
            codexExecRealReadOnlyAdapterAttemptTimelines:
              codexExecRealReadOnlyAdapterAttemptTimelines,
            codexExecReportReviews: codexExecReportReviewsResponse.reviews,
            codexExecReportReviewHistories,
            codexExecReportReviewComparisons,
            codexExecReviewerHandoffs,
            codexExecEvidenceSearch: codexExecEvidenceResponse,
            browserObservationDryRuns: browserObservationDryRunsResponse.records,
            browserObservationApprovals: browserObservationApprovalsResponse.records,
            browserObservationRuns: browserObservationRunsResponse.records,
            electronCdpObservationDryRuns: electronCdpObservationDryRunsResponse.records,
            electronCdpObservationApprovals: electronCdpObservationApprovalsResponse.records,
            electronCdpObservationRuns: electronCdpObservationRunsResponse.records,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setOverview({
            status: 'degraded',
            runs: [],
            sourceHealth: [],
            developmentRuns: [],
            codexReplayRuns: [],
            codexExecDryRuns: [],
            codexExecApprovals: [],
            codexExecTimelines: [],
            codexExecTimelineDetails: [],
            codexExecDrilldowns: [],
            codexExecReports: [],
            codexExecGovernancePackages: [],
            codexExecAdrDecisions: [],
            codexExecAdrDrafts: [],
            codexExecReadOnlyAdapterPreflightSimulations: [],
            codexExecReadOnlyAdapterSimulatorReviews: [],
            codexExecReadOnlyAdapterImplementationPlanReviews: [],
            codexExecReadOnlyAdapterSkeletonReviews: [],
            codexExecReadOnlyAdapterFixtureBoundaries: [],
            codexExecReadOnlyAdapterFinalReadiness: [],
            codexExecRealReadOnlyAdapterReadiness: [],
            codexExecRealReadOnlyAdapterReadinessReviews: [],
            codexExecRealReadOnlyAdapterAttemptTimelines: [],
            codexExecReportReviews: [],
            codexExecReportReviewHistories: [],
            codexExecReportReviewComparisons: [],
            codexExecReviewerHandoffs: [],
            browserObservationDryRuns: [],
            browserObservationApprovals: [],
            browserObservationRuns: [],
            electronCdpObservationDryRuns: [],
            electronCdpObservationApprovals: [],
            electronCdpObservationRuns: [],
            message: error instanceof Error ? error.message : 'Supervisor is unavailable.',
          });
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">CodexHub</p>
          <h1>Overview</h1>
        </div>
        <span className={`status status-${overview.status}`}>{overview.status}</span>
      </header>

      <nav className="view-nav" aria-label="Dashboard views">
        {DASHBOARD_VIEWS.map((view) => (
          <a
            key={view}
            className={view === activeView ? 'active' : undefined}
            href={getDashboardHash(view)}
          >
            {view}
          </a>
        ))}
      </nav>

      {activeView === 'overview' ? (
        <section className="grid">
        <Panel title="Supervisor Health">
          {overview.health ? (
            <pre>{JSON.stringify(overview.health, null, 2)}</pre>
          ) : (
            <p>{overview.message ?? 'Waiting for supervisor health.'}</p>
          )}
        </Panel>

        <Panel title="Workflow Runs">
          {overview.runs.length > 0 ? (
            <ul>
              {overview.runs.map((run) => (
                <li key={run.id}>
                  <strong>{run.workflowName}</strong>
                  <span>{run.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No workflow runs are available in this placeholder view.</p>
          )}
        </Panel>

        <Panel title="Source Health">
          {overview.sourceHealth.length > 0 ? (
            <ul>
              {overview.sourceHealth.map((source) => (
                <li key={source.id}>
                  <strong>{source.source}</strong>
                  <span>{source.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Observation sources are not connected yet.</p>
          )}
        </Panel>

        <Panel title="Development Mock Runs">
          {overview.developmentRuns.length > 0 ? (
            <ul>
              {overview.developmentRuns.map((run) => (
                <li key={run.request.id} className="stacked">
                  <strong>{run.summary.requestTitle}</strong>
                  <span>
                    {run.summary.taskCount} tasks, {run.summary.selectedSkillIds.length} skills,{' '}
                    {run.summary.agentRunCount} agents, verification{' '}
                    {run.summary.verificationStatus}, {run.summary.evidenceCount} evidence,{' '}
                    {run.summary.auditEventCount} audits
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No mock development runs are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Fixture Replays">
          {overview.codexReplayRuns.length > 0 ? (
            <ul>
              {overview.codexReplayRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.threadId ?? run.id}</strong>
                  <span>
                    {run.eventCount} events, {run.itemCount} items, {run.commandExecutionCount}{' '}
                    commands, {run.fileChangeCount} file changes, {run.errorCount} errors,{' '}
                    {run.status}, mock {String(run.mockOnly)}, live {String(run.liveExecution)},
                    external process {String(run.externalProcessStarted)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex fixture replays are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Dry-Run Control Plane">
          {overview.codexExecConfigLoadResult ? (
            <p>
              config {overview.codexExecConfigLoadResult.status},{' '}
              {overview.codexExecConfigLoadResult.source}, disabled{' '}
              {String(overview.codexExecConfigLoadResult.executionDisabled)}
            </p>
          ) : null}
          {overview.codexExecLiveConfig ? (
            <p>
              liveEnabled {String(overview.codexExecLiveConfig.liveEnabled)}, allowed{' '}
              {overview.codexExecLiveConfig.allowedSandboxModes.join(', ')}
            </p>
          ) : null}
          {overview.codexExecDryRuns.length > 0 ? (
            <ul>
              {overview.codexExecDryRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.title}</strong>
                  <span>
                    {run.sandboxMode}, {run.approvalMode}, {run.riskLevel} risk, policy{' '}
                    {run.policyDecision.outcome}, live {String(run.liveExecution)}, external process{' '}
                    {String(run.externalProcessStarted)}, disabled {String(run.executionDisabled)}
                  </span>
                  <span>
                    preflight {run.preflightResult?.status ?? 'not run'}, approval{' '}
                    {run.approvalArtifact?.status ?? 'not created'}, gate{' '}
                    {run.executionGateResult?.status ?? 'not evaluated'}{' '}
                    {run.executionGateResult?.reasons[0] ?? ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex dry-run control-plane records are available yet.</p>
          )}
        </Panel>

        <Panel title="Manual Approvals">
          {overview.codexExecApprovals.length > 0 ? (
            <ul>
              {overview.codexExecApprovals.map((record) => (
                <li key={record.id} className="stacked">
                  <strong>{record.request.dryRunPlanId}</strong>
                  <span>
                    state {record.approvalState?.status ?? record.status},{' '}
                    {record.request.riskLevel} risk, scope {record.request.scope}
                  </span>
                  <span>
                    decision {record.decision?.outcome ?? 'pending'}, artifact{' '}
                    {record.approvalArtifact?.status ?? 'not created'}, live{' '}
                    {String(record.liveExecution)}, disabled {String(record.executionDisabled)}
                  </span>
                  <span>
                    can decide {String(record.approvalState?.canDecide ?? false)}, terminal{' '}
                    {String(record.approvalState?.terminal ?? false)}, next{' '}
                    {record.approvalState?.nextAllowedActions.join(', ') || 'none'}
                  </span>
                  <span>{record.approvalState?.reasons[0] ?? 'state not evaluated'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No manual approval records are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Control Timeline">
          {overview.codexExecTimelineDetails.length > 0 ? (
            <ul>
              {overview.codexExecTimelineDetails.map((detail) => (
                <li key={detail.id} className="stacked timeline-detail">
                  <strong>{detail.dryRunId}</strong>
                  <span>
                    status {detail.timeline.status}, {detail.timeline.eventCount} events, gate{' '}
                    {detail.latestGateStatus ?? 'none'}, approval {detail.approvalStatus ?? 'none'}
                  </span>
                  <span>
                    evidence {detail.evidenceSummary.count}, audit {detail.auditSummary.count},
                    liveExecution {String(detail.liveExecution)}, externalProcessStarted{' '}
                    {String(detail.externalProcessStarted)}, executionDisabled{' '}
                    {String(detail.executionDisabled)}
                  </span>
                  <span>sources {formatSourceBreakdown(detail.sourceBreakdown)}</span>
                  <div className="timeline-list" aria-label="Read-only timeline events">
                    {detail.timeline.events.length > 0 ? (
                      detail.timeline.events.slice(0, 8).map((event) => (
                        <div key={event.id} className="timeline-event">
                          <span>
                            {event.sourceKind} / {event.status}
                          </span>
                          <span>{event.eventType}</span>
                          <span>{new Date(event.occurredAt).toLocaleString()}</span>
                          <p>{event.summary}</p>
                        </div>
                      ))
                    ) : (
                      <p>No timeline events match the current read-only view.</p>
                    )}
                  </div>
                  <span>
                    evidence refs{' '}
                    {detail.evidenceSummary.items
                      .slice(0, 3)
                      .map((item) => `${item.kind}:${item.hash}`)
                      .join(' | ') || 'none'}
                  </span>
                  <span>
                    audit refs{' '}
                    {detail.auditSummary.items
                      .slice(0, 3)
                      .map((item) => `${item.action}:${item.outcome}`)
                      .join(' | ') || 'none'}
                  </span>
                </li>
              ))}
            </ul>
          ) : overview.codexExecTimelines.length > 0 ? (
            <ul>
              {overview.codexExecTimelines.map((timeline) => (
                <li key={timeline.id} className="stacked">
                  <strong>{timeline.dryRunId}</strong>
                  <span>
                    {timeline.status}, {timeline.eventCount} events, {timeline.evidenceCount}{' '}
                    evidence, {timeline.auditEventCount} audits
                  </span>
                  <span>
                    liveExecution {String(timeline.liveExecution)}, externalProcessStarted{' '}
                    {String(timeline.externalProcessStarted)}, executionDisabled{' '}
                    {String(timeline.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only control-plane timeline is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Evidence And Audit Drilldown">
          {overview.codexExecDrilldowns.length > 0 ? (
            <ul>
              {overview.codexExecDrilldowns.map((drilldown) => (
                <li key={drilldown.id} className="stacked drilldown-detail">
                  <strong>{drilldown.dryRunId}</strong>
                  <span>
                    status {drilldown.status}, evidence {drilldown.evidenceCount}, audit{' '}
                    {drilldown.auditEventCount}
                  </span>
                  <span>
                    liveExecution {String(drilldown.liveExecution)}, externalProcessStarted{' '}
                    {String(drilldown.externalProcessStarted)}, executionDisabled{' '}
                    {String(drilldown.executionDisabled)}
                  </span>
                  <div className="drilldown-grid" aria-label="Read-only evidence and audit refs">
                    <div>
                      <strong>Evidence refs</strong>
                      {drilldown.evidenceSearch.items.length > 0 ? (
                        drilldown.evidenceSearch.items.slice(0, 5).map((item) => (
                          <div key={item.id} className="drilldown-item">
                            <span>{item.kind ?? 'unknown'}</span>
                            <span>{item.evidenceRefId}</span>
                            <span>{item.hash ?? 'hash unavailable'}</span>
                            <p>{item.summary ?? 'No evidence summary available.'}</p>
                          </div>
                        ))
                      ) : (
                        <p>No evidence refs match this read-only view.</p>
                      )}
                    </div>
                    <div>
                      <strong>Audit events</strong>
                      {drilldown.auditSearch.items.length > 0 ? (
                        drilldown.auditSearch.items.slice(0, 5).map((item) => (
                          <div key={item.id} className="drilldown-item">
                            <span>{item.action ?? 'unknown'}</span>
                            <span>{item.auditEventId}</span>
                            <span>{item.outcome ?? 'outcome unavailable'}</span>
                            <p>
                              evidence refs {item.evidenceRefIds.length}, policy{' '}
                              {item.policyDecisionId ?? 'none'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No audit events match this read-only view.</p>
                      )}
                    </div>
                  </div>
                  <div className="drilldown-grid">
                    <div className="drilldown-item">
                      <strong>Selected evidence</strong>
                      {drilldown.selectedEvidence ? (
                        <>
                          <span>{drilldown.selectedEvidence.evidenceRefId}</span>
                          <span>{drilldown.selectedEvidence.kind ?? 'unknown'}</span>
                          <span>{drilldown.selectedEvidence.hash ?? 'hash unavailable'}</span>
                          <p>{drilldown.selectedEvidence.summary ?? 'No summary available.'}</p>
                        </>
                      ) : (
                        <p>No selected evidence detail.</p>
                      )}
                    </div>
                    <div className="drilldown-item">
                      <strong>Selected audit</strong>
                      {drilldown.selectedAudit ? (
                        <>
                          <span>{drilldown.selectedAudit.auditEventId}</span>
                          <span>{drilldown.selectedAudit.action ?? 'unknown'}</span>
                          <span>{drilldown.selectedAudit.outcome ?? 'outcome unavailable'}</span>
                          <p>
                            evidence refs {drilldown.selectedAudit.evidenceRefIds.length}, metadata
                            keys{' '}
                            {drilldown.selectedAudit.metadataSummary?.keys.join(', ') || 'none'}
                          </p>
                        </>
                      ) : (
                        <p>No selected audit detail.</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only evidence or audit drilldown is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Control Report Preview">
          {overview.codexExecReports.length > 0 ? (
            <ul>
              {overview.codexExecReports.map((report) => (
                <li key={report.id} className="stacked report-detail">
                  <strong>{report.dryRunId}</strong>
                  <span>
                    status {report.status}, sections {report.summary.sectionCount}, evidence{' '}
                    {report.summary.evidenceCount}, audit {report.summary.auditEventCount}
                  </span>
                  <span>
                    liveExecution {String(report.liveExecution)}, externalProcessStarted{' '}
                    {String(report.externalProcessStarted)}, executionDisabled{' '}
                    {String(report.executionDisabled)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only report sections">
                    {report.sections.map((section) => (
                      <div key={section.id} className="report-section">
                        <strong>{section.title}</strong>
                        <span>
                          {section.kind} / {section.status}
                        </span>
                        <p>{section.summary}</p>
                        <span>
                          refs {section.refIds.length}, hashes {section.hashes.length}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span>
                    risks{' '}
                    {report.sections.find((section) => section.kind === 'risks')?.summary ??
                      'not available'}
                  </span>
                  <span>
                    recommendations{' '}
                    {report.sections.find((section) => section.kind === 'recommendations')
                      ?.summary ?? 'not available'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only control-plane report preview is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Report Review Workflow">
          {overview.codexExecReportReviews.length > 0 ? (
            <ul>
              {overview.codexExecReportReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.dryRunId}</strong>
                  <span>
                    status {review.status}, risk {review.riskClassification}, recommendation{' '}
                    {review.recommendation}
                  </span>
                  <span>
                    recommendation grants execution {String(review.recommendationGrantsExecution)},
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    reviewer {review.reviewerLabel}, reviewed{' '}
                    {new Date(review.reviewedAt).toLocaleString()}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only report review checks">
                    <div className="report-section">
                      <strong>Checklist</strong>
                      {review.checklistItems.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.status}
                        </p>
                      ))}
                      {review.checklistItems.length === 0 ? <p>No checklist items.</p> : null}
                    </div>
                    <div className="report-section">
                      <strong>Findings</strong>
                      {review.findings.slice(0, 6).map((finding) => (
                        <p key={finding.id}>
                          {finding.severity} {finding.code}: {finding.summary}
                        </p>
                      ))}
                      {review.findings.length === 0 ? <p>No review findings.</p> : null}
                    </div>
                  </div>
                  <p>
                    {review.notesSummary ??
                      'Review history is metadata-only and does not grant execution.'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only report review records are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Report Review History">
          {overview.codexExecReportReviewHistories.length > 0 ? (
            <ul>
              {overview.codexExecReportReviewHistories.map((history) => (
                <li key={history.id} className="stacked report-detail">
                  <strong>{history.dryRunId ?? 'all dry-run records'}</strong>
                  <span>
                    reviews {history.historyCount}, latest{' '}
                    {history.latestReview?.reviewId ?? 'none'}, status{' '}
                    {history.latestReview?.status ?? 'none'}, recommendation{' '}
                    {history.latestReview?.recommendation ?? 'none'}
                  </span>
                  <span>
                    recommendation grants execution {String(history.recommendationGrantsExecution)},
                    liveExecution {String(history.liveExecution)}, externalProcessStarted{' '}
                    {String(history.externalProcessStarted)}, executionDisabled{' '}
                    {String(history.executionDisabled)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only review history">
                    <div className="report-section">
                      <strong>History</strong>
                      {history.summaries.slice(0, 6).map((summary) => (
                        <p key={summary.id}>
                          {summary.reviewId}: {summary.status} / {summary.recommendation}
                        </p>
                      ))}
                      {history.summaries.length === 0 ? <p>No review history.</p> : null}
                    </div>
                    <div className="report-section">
                      <strong>Latest Comparison</strong>
                      {history.comparison ? (
                        <>
                          <p>{history.comparison.summary}</p>
                          <p>changed fields {history.comparison.changedItemCount}</p>
                          {history.comparison.items
                            .filter((item) => item.changed)
                            .slice(0, 5)
                            .map((item) => (
                              <p key={item.id}>
                                {item.field}: {item.leftValueSummary} to {item.rightValueSummary}
                              </p>
                            ))}
                        </>
                      ) : (
                        <p>At least two reviews are needed for comparison.</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only report review history is available yet.</p>
          )}
        </Panel>

        <Panel title="Governance Review Package">
          {overview.codexExecGovernancePackages.length > 0 ? (
            <ul>
              {overview.codexExecGovernancePackages.map((governancePackage) => (
                <li key={governancePackage.id} className="stacked report-detail">
                  <strong>{governancePackage.dryRunId}</strong>
                  <span>
                    status {governancePackage.status}, risk {governancePackage.riskClassification},
                    recommendation {governancePackage.recommendation}
                  </span>
                  <span>
                    recommendation grants execution{' '}
                    {String(governancePackage.recommendationGrantsExecution)}, liveExecution{' '}
                    {String(governancePackage.liveExecution)}, externalProcessStarted{' '}
                    {String(governancePackage.externalProcessStarted)}, executionDisabled{' '}
                    {String(governancePackage.executionDisabled)}
                  </span>
                  <span>
                    checklist {governancePackage.summary.checklistPassedCount} passed,{' '}
                    {governancePackage.summary.checklistWarningCount} warnings,{' '}
                    {governancePackage.summary.checklistFailedCount} failed; blockers{' '}
                    {governancePackage.summary.unresolvedBlockerCount}
                  </span>
                  <span>
                    no-live evidence: codex{' '}
                    {String(governancePackage.noLiveEvidence.noRealCodexExec)}, process{' '}
                    {String(governancePackage.noLiveEvidence.noExternalProcessStarted)}, browser/CDP{' '}
                    {String(governancePackage.noLiveEvidence.noBrowserOrCdpAction)}, workspace write{' '}
                    {String(governancePackage.noLiveEvidence.noWorkspaceWrite)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only ADR readiness">
                    <div className="report-section">
                      <strong>ADR Readiness</strong>
                      {governancePackage.adrReadinessChecklist.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.status}
                        </p>
                      ))}
                      {governancePackage.adrReadinessChecklist.length === 0 ? (
                        <p>No ADR readiness checks.</p>
                      ) : null}
                    </div>
                    <div className="report-section">
                      <strong>Unresolved Blockers</strong>
                      {governancePackage.blockers.slice(0, 6).map((blocker) => (
                        <p key={blocker.id}>
                          {blocker.severity} {blocker.code}: {blocker.summary}
                        </p>
                      ))}
                      {governancePackage.blockers.length === 0 ? (
                        <p>No unresolved blockers in the read-only package.</p>
                      ) : null}
                    </div>
                  </div>
                  <p>Recommendation is ADR readiness guidance only and does not grant execution.</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only governance review package is available yet.</p>
          )}
        </Panel>

        <Panel title="Live Adapter ADR Draft Preview">
          {overview.codexExecAdrDrafts.length > 0 ? (
            <ul>
              {overview.codexExecAdrDrafts.map((draft) => (
                <li key={draft.id} className="stacked report-detail">
                  <strong>{draft.title}</strong>
                  <span>
                    dryRunId {draft.dryRunId}, status {draft.status}, risk{' '}
                    {draft.summary.riskClassification}
                  </span>
                  <span>
                    recommendation {draft.recommendation}; grants execution{' '}
                    {String(draft.recommendationGrantsExecution)}, draftOnly{' '}
                    {String(draft.draftOnly)}
                  </span>
                  <span>
                    liveExecution {String(draft.liveExecution)}, externalProcessStarted{' '}
                    {String(draft.externalProcessStarted)}, executionDisabled{' '}
                    {String(draft.executionDisabled)}
                  </span>
                  <span>
                    sections {draft.summary.sectionCount}, blockers {draft.summary.blockerCount},
                    readiness {draft.summary.readinessPassedCount} passed /{' '}
                    {draft.summary.readinessFailedCount} failed
                  </span>
                  <div className="report-section-grid" aria-label="Read-only ADR draft sections">
                    {draft.sections.slice(0, 6).map((section) => (
                      <div key={section.id} className="report-section">
                        <strong>{section.title}</strong>
                        <span>
                          {section.kind} / {section.status}
                        </span>
                        <p>{section.summary}</p>
                      </div>
                    ))}
                  </div>
                  <div className="report-section" aria-label="Safe ADR draft markdown preview">
                    <strong>Markdown preview</strong>
                    <p>{draft.sections.find((section) => section.kind === 'context')?.summary}</p>
                    <p>
                      Recommended decision:{' '}
                      {draft.sections.find((section) => section.kind === 'recommended_decision')
                        ?.summary ?? 'No recommendation section available.'}
                    </p>
                    <p>
                      This preview is ADR preparation guidance only and does not grant execution.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only Live Adapter ADR draft preview is available yet.</p>
          )}
        </Panel>

        <Panel title="Live Adapter ADR Decision">
          {overview.codexExecAdrDecisions.length > 0 ? (
            <ul>
              {overview.codexExecAdrDecisions.map((decision) => (
                <li key={decision.id} className="stacked report-detail">
                  <strong>{decision.dryRunId}</strong>
                  <span>
                    decision {decision.decision}, status {decision.status}, reviewer{' '}
                    {decision.reviewerLabel}
                  </span>
                  <span>
                    allowed sandbox modes {decision.allowedSandboxModes.join(', ') || 'none'};
                    forbidden sandbox modes {decision.forbiddenSandboxModes.join(', ') || 'none'}
                  </span>
                  <span>
                    future trigger {decision.futureTriggerPolicy}, dashboard trigger allowed{' '}
                    {String(decision.dashboardTriggerAllowed)}
                  </span>
                  <span>
                    approval artifact required {String(decision.approvalArtifactRequired)}, dry-run
                    hash match {String(decision.dryRunPlanHashMatchRequired)}, policy hash match{' '}
                    {String(decision.policyDecisionHashMatchRequired)}
                  </span>
                  <span>
                    isolated worktree {String(decision.isolatedWorktreeRequired)}, post-run verify{' '}
                    {decision.postRunVerificationCommand}
                  </span>
                  <span>
                    implementationApproved {String(decision.implementationApproved)},
                    processAdapterApproved {String(decision.processAdapterApproved)},
                    recommendationGrantsExecution {String(decision.recommendationGrantsExecution)}
                  </span>
                  <span>
                    evidence {decision.evidenceCount}, audit {decision.auditEventCount},
                    liveExecution {String(decision.liveExecution)}, externalProcessStarted{' '}
                    {String(decision.externalProcessStarted)}, executionDisabled{' '}
                    {String(decision.executionDisabled)}
                  </span>
                  <p>
                    This ADR decision is governance guidance only. It does not approve
                    implementation, process adapter work, or Dashboard-triggered execution.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only Live Adapter ADR decision is available yet.</p>
          )}
        </Panel>

        <Panel title="Read-only Adapter Preflight Simulator">
          {overview.codexExecReadOnlyAdapterPreflightSimulations.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterPreflightSimulations.map((simulation) => (
                <li key={simulation.id} className="stacked report-detail">
                  <strong>{simulation.dryRunId}</strong>
                  <span>
                    status {simulation.status}, sandbox {simulation.requestedSandboxMode}, blockers{' '}
                    {simulation.blockerCount}
                  </span>
                  <span>
                    checks {simulation.passedCheckCount} passed, {simulation.failedCheckCount}{' '}
                    failed, {simulation.warningCheckCount} require review
                  </span>
                  <span>
                    isolated worktree {String(simulation.isolatedWorktreePresent)}, evidence ready{' '}
                    {String(simulation.evidenceStoreReady)}, audit ready{' '}
                    {String(simulation.auditStoreReady)}
                  </span>
                  <span>
                    liveExecution {String(simulation.liveExecution)}, externalProcessStarted{' '}
                    {String(simulation.externalProcessStarted)}, executionDisabled{' '}
                    {String(simulation.executionDisabled)}
                  </span>
                  <span>
                    processAdapterStarted {String(simulation.processAdapterStarted)},
                    implementationApproved {String(simulation.implementationApproved)}, dashboard
                    trigger allowed {String(simulation.dashboardTriggerAllowed)}
                  </span>
                  <div
                    className="report-section-grid"
                    aria-label="Read-only adapter preflight simulator summary"
                  >
                    <div className="report-section">
                      <strong>Operator checklist</strong>
                      {simulation.operatorChecklist.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.checked ? 'checked' : 'not checked'}
                        </p>
                      ))}
                      {simulation.operatorChecklist.length === 0 ? (
                        <p>No checklist items are available.</p>
                      ) : null}
                    </div>
                    <div className="report-section">
                      <strong>Blockers</strong>
                      {simulation.blockers.slice(0, 6).map((blocker) => (
                        <p key={blocker.id}>
                          {blocker.severity} {blocker.code}: {blocker.summary}
                        </p>
                      ))}
                      {simulation.blockers.length === 0 ? (
                        <p>No simulator blockers are present.</p>
                      ) : null}
                    </div>
                  </div>
                  <p>
                    Simulation result is readiness evidence only and does not grant execution
                    permission.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only adapter preflight simulation has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Simulator Review / Go-No-Go">
          {overview.codexExecReadOnlyAdapterSimulatorReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterSimulatorReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.dryRunId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, simulator{' '}
                    {review.simulationStatus}
                  </span>
                  <span>
                    hard gates {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}, unresolved{' '}
                    {review.unresolvedBlockerCount}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <p>
                    Review outcome is planning guidance only. It does not approve an adapter,
                    process launch, or Dashboard-triggered action.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only simulator review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Implementation Plan Review / Go-No-Go">
          {overview.codexExecReadOnlyAdapterImplementationPlanReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterImplementationPlanReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, disabled skeleton approved{' '}
                    {String(review.disabledSkeletonApproved)}
                  </span>
                  <span>
                    hard gates {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}, unresolved findings{' '}
                    {review.unresolvedFindingCount}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <span>
                    workspaceWriteAllowed {String(review.workspaceWriteAllowed)},
                    dangerFullAccessAllowed {String(review.dangerFullAccessAllowed)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <p>
                    Conditional skeleton approval only allows a future disabled-by-default skeleton.
                    It does not approve process adapter work, Codex process launch, or
                    Dashboard-triggered actions.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only implementation plan review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Disabled Read-only Adapter Skeleton">
          {overview.codexExecReadOnlyAdapterSkeletonPreview ? (
            <div className="stacked report-detail">
              <strong>{overview.codexExecReadOnlyAdapterSkeletonPreview.status}</strong>
              <span>
                configured enabled{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.config.configuredEnabled)},
                liveExecution{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.liveExecution)},
                externalProcessStarted{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.externalProcessStarted)},
                executionDisabled{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.executionDisabled)}
              </span>
              <span>
                processAdapterStarted{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.processAdapterStarted)},
                processAdapterApproved{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.processAdapterApproved)},
                dashboardTriggerAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.dashboardTriggerAllowed)}
              </span>
              <span>
                workspaceWriteAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.workspaceWriteAllowed)},
                dangerFullAccessAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.dangerFullAccessAllowed)}
              </span>
              <div className="report-section-grid" aria-label="Disabled skeleton reasons">
                {overview.codexExecReadOnlyAdapterSkeletonPreview.disabledReasons.map((reason) => (
                  <div key={reason.id} className="report-section">
                    <strong>{reason.code}</strong>
                    <span>{reason.severity}</span>
                    <p>{reason.summary}</p>
                  </div>
                ))}
              </div>
              <p>
                Skeleton preview is disabled by default and contains no runnable command, argument
                list, executable path, shell snippet, or environment plan.
              </p>
            </div>
          ) : (
            <p>No disabled read-only adapter skeleton preview is available.</p>
          )}
        </Panel>

        <Panel title="Disabled Skeleton Review">
          {overview.codexExecReadOnlyAdapterSkeletonReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterSkeletonReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, skeleton preview{' '}
                    {review.skeletonPreviewId}
                  </span>
                  <span>
                    fixture boundary allowed {String(review.fixtureBoundaryAllowed)}, hard gates{' '}
                    {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}
                  </span>
                  <span>
                    unresolved findings {review.unresolvedFindingCount}, liveExecution{' '}
                    {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <p>
                    This review can only allow a fixture-backed replay boundary follow-up. It does
                    not approve any process adapter or execution path.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No disabled skeleton review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Fixture-backed Replay Boundary">
          {overview.codexExecReadOnlyAdapterFixtureBoundaries.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterFixtureBoundaries.map((boundary) => (
                <li key={boundary.id} className="stacked report-detail">
                  <strong>{boundary.boundaryResultId}</strong>
                  <span>
                    status {boundary.status}, final {boundary.finalStatus}, fixtureOnly{' '}
                    {String(boundary.fixtureOnly)}
                  </span>
                  <span>
                    events {boundary.eventCount}, items {boundary.itemCount}, errors{' '}
                    {boundary.errorCount}, fixture path hash {boundary.fixturePathHash}
                  </span>
                  <span>
                    liveExecution {String(boundary.liveExecution)}, externalProcessStarted{' '}
                    {String(boundary.externalProcessStarted)}, executionDisabled{' '}
                    {String(boundary.executionDisabled)}
                  </span>
                  <span>
                    processAdapterStarted {String(boundary.processAdapterStarted)},
                    processAdapterApproved {String(boundary.processAdapterApproved)},
                    workspaceWriteAllowed {String(boundary.workspaceWriteAllowed)}
                  </span>
                  <p>
                    Fixture-backed replay boundary uses synthetic local JSONL fixtures only and does
                    not start a process.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No fixture-backed replay boundary summary is available yet.</p>
          )}
        </Panel>

        <Panel title="Final Readiness Review">
          {overview.codexExecReadOnlyAdapterFinalReadiness.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterFinalReadiness.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.decisionId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, reviewer{' '}
                    {review.reviewerLabel}
                  </span>
                  <span>
                    phase A {review.phaseAStatus}, phase B {review.phaseBOutcome}, phase C{' '}
                    {review.phaseCStatus}
                  </span>
                  <span>
                    separate ADR required {String(review.realAdapterRequiresSeparateAdr)},
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <p>
                    Final readiness is a governance record only. Any real read-only adapter still
                    requires a separate ADR and go/no-go review.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No final readiness review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Real Read-only Adapter Readiness">
          {overview.codexExecRealReadOnlyAdapterReadiness.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterReadiness.map((readiness) => (
                <li key={readiness.id} className="stacked report-detail">
                  <strong>{readiness.packageId}</strong>
                  <span>
                    dryRunId {readiness.dryRunId}, status {readiness.status}
                  </span>
                  <span>
                    hard gates {readiness.passedGateCount}/{readiness.hardGateCount}, requires
                    review {readiness.requiresReviewCount}, blockers {readiness.blockerCount},
                    findings {readiness.findingCount}
                  </span>
                  <span>
                    documented-only 3T-W evidence {String(readiness.documentedOnly3twEvidence)},
                    symlink pending {String(readiness.symlinkEscapeVerificationPending)}
                  </span>
                  <span>
                    liveExecution {String(readiness.liveExecution)}, externalProcessStarted{' '}
                    {String(readiness.externalProcessStarted)}, executionDisabled{' '}
                    {String(readiness.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(readiness.implementationApproved)},
                    processAdapterApproved {String(readiness.processAdapterApproved)},
                    recommendationGrantsExecution {String(readiness.recommendationGrantsExecution)}
                  </span>
                  <p>{readiness.recommendation}</p>
                  <p>
                    Ready for separate ADR review only. Does not grant implementation, process
                    launch, or execution permission.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No real read-only adapter readiness package is available. Readiness remains
              non-approving until a separate ADR review exists.
            </p>
          )}
        </Panel>

        <Panel title="Readiness Review / Separate ADR Draft Go-No-Go">
          {overview.codexExecRealReadOnlyAdapterReadinessReviews.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterReadinessReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    dryRunId {review.dryRunId}, package {review.packageId}, package status{' '}
                    {review.packageStatus}
                  </span>
                  <span>
                    outcome {review.outcome}, review status {review.status}, reviewer{' '}
                    {review.reviewerLabel}
                  </span>
                  <span>
                    unresolved findings {review.unresolvedFindingCount}, acknowledged{' '}
                    {review.acknowledgedFindingCodes.length}
                  </span>
                  <span>
                    ADR draft conditionally allowed {String(review.separateAdrDraftAllowed)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <p>{readinessReviewWording(review)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No readiness review has been recorded. Separate ADR drafting remains unavailable until
              a persisted readiness package is reviewed.
            </p>
          )}
        </Panel>

        <Panel title="Read-only Adapter Attempt Timeline">
          <p>
            Operator state guide: blocked means gate checks refused the attempt before authority
            was claimed; completed, failed, and aborted records require operator review before any
            next step. Degraded or not-persisted data is display-only. This panel cannot create,
            approve, or trigger adapter attempts.
          </p>
          {overview.codexExecRealReadOnlyAdapterAttemptTimelines.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterAttemptTimelines.map((timeline) => (
                <li key={timeline.id} className="stacked report-detail">
                  <strong>{timeline.dryRunId}</strong>
                  <span>
                    status {timeline.status}, events {timeline.eventCount}, evidence refs{' '}
                    {timeline.evidenceRefCount}, audit events {timeline.auditEventCount}
                  </span>
                  <span>
                    output hashes {timeline.outputHashCount}, process boundary entries{' '}
                    {timeline.processBoundaryInvokedCount}
                  </span>
                  <span>
                    liveExecution {String(timeline.liveExecution)}, externalProcessStarted{' '}
                    {String(timeline.externalProcessStarted)}, executionDisabled{' '}
                    {String(timeline.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(timeline.implementationApproved)},
                    processAdapterApproved {String(timeline.processAdapterApproved)},
                    recommendationGrantsExecution {String(timeline.recommendationGrantsExecution)}
                  </span>
                  <span>
                    workspaceWriteAllowed {String(timeline.workspaceWriteAllowed)},
                    dangerFullAccessAllowed {String(timeline.dangerFullAccessAllowed)},
                    dashboardTriggerAllowed {String(timeline.dashboardTriggerAllowed)}
                  </span>
                  <p>{timeline.verificationSummary}</p>
                  <p>{timeline.workspaceMutationSummary}</p>
                  <p>{timeline.recommendation}</p>
                  {timeline.entries.length > 0 ? (
                    <ul className="timeline-list">
                      {timeline.entries.slice(0, 5).map((entry) => (
                        <li key={entry.id} className="timeline-event">
                          <strong>{entry.status}</strong>
                          <span>{entry.attemptId}</span>
                          <span>
                            evidence {entry.evidenceRefCount}, audit {entry.auditEventCount},
                            process boundary {String(entry.processBoundaryInvoked)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No read-only adapter attempt entries are available for this dry-run.</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No read-only adapter attempt timeline is available. This panel is read-only and cannot
              trigger adapter attempts.
            </p>
          )}
        </Panel>

        <Panel title="Codex Reviewer Handoff">
          {overview.codexExecReviewerHandoffs.length > 0 ? (
            <ul>
              {overview.codexExecReviewerHandoffs.map((handoff) => (
                <li key={handoff.id} className="stacked report-detail">
                  <strong>{handoff.dryRunId}</strong>
                  <span>
                    latest {handoff.latestReviewId ?? 'none'}, status{' '}
                    {handoff.latestStatus ?? 'none'}, recommendation{' '}
                    {handoff.latestRecommendation ?? 'none'}, risk{' '}
                    {handoff.latestRiskClassification ?? 'none'}
                  </span>
                  <span>
                    reviews {handoff.reviewCount}, findings {handoff.findingCount}, failed checks{' '}
                    {handoff.failedChecklistCount}
                  </span>
                  <span>
                    recommendation grants execution {String(handoff.recommendationGrantsExecution)},
                    liveExecution {String(handoff.liveExecution)}, externalProcessStarted{' '}
                    {String(handoff.externalProcessStarted)}, executionDisabled{' '}
                    {String(handoff.executionDisabled)}
                  </span>
                  <p>{handoff.handoffSummary}</p>
                  <p>{handoff.recommendedNextStep}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only reviewer handoff summary is available yet.</p>
          )}
        </Panel>
        </section>
      ) : (
        renderReadOnlyDashboardView(
          activeView,
          overview,
          mcpSummary,
          verificationPreview,
          browserProfilesSummary,
          electronCdpSummary,
        )
      )}
    </main>
  );
}

function renderReadOnlyDashboardView(
  activeView: DashboardView,
  overview: OverviewState,
  mcpSummary: ReturnType<typeof summarizeMcpTools>,
  verificationPreview: ReturnType<typeof createVerificationReadinessPreview>,
  browserProfilesSummary: ReturnType<typeof createBrowserProfilesReadOnlySummary>,
  electronCdpSummary: ReturnType<typeof createElectronCdpReadOnlySummary>,
) {
  if (activeView === 'development') {
    return (
      <section className="grid">
        <Panel title="Development Runs">
          {overview.developmentRuns.length > 0 ? (
            <ul>
              {overview.developmentRuns.map((run) => (
                <li key={run.request.id} className="stacked">
                  <strong>{run.summary.requestTitle}</strong>
                  <span>
                    {run.summary.taskCount} tasks, {run.summary.agentRunCount} agent runs,
                    verification {run.summary.verificationStatus}
                  </span>
                  <span>
                    evidence {run.summary.evidenceCount}, audit {run.summary.auditEventCount},
                    mock {String(run.summary.mockOnly)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No development run summaries are available from the read-only source.</p>
          )}
        </Panel>
        <Panel title="Workflow Runs">
          {overview.runs.length > 0 ? (
            <ul>
              {overview.runs.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.workflowName}</strong>
                  <span>{run.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No workflow run metadata is available.</p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'codex') {
    return (
      <section className="grid">
        <Panel title="Codex Dry-Runs">
          {overview.codexExecDryRuns.length > 0 ? (
            <ul>
              {overview.codexExecDryRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.title}</strong>
                  <span>
                    {run.sandboxMode}, {run.approvalMode}, policy {run.policyDecision.outcome}
                  </span>
                  <span>
                    live {String(run.liveExecution)}, external process{' '}
                    {String(run.externalProcessStarted)}, disabled {String(run.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex dry-run metadata is available.</p>
          )}
        </Panel>
        <Panel title="Codex Timelines">
          {overview.codexExecTimelineDetails.length > 0 ? (
            <ul>
              {overview.codexExecTimelineDetails.map((detail) => (
                <li key={detail.id} className="stacked">
                  <strong>{detail.dryRunId}</strong>
                  <span>
                    {detail.timeline.status}, {detail.timeline.eventCount} events, evidence{' '}
                    {detail.evidenceSummary.count}, audit {detail.auditSummary.count}
                  </span>
                  <span>
                    live {String(detail.liveExecution)}, external process{' '}
                    {String(detail.externalProcessStarted)}, disabled{' '}
                    {String(detail.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex timeline metadata is available.</p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'verification') {
    return (
      <section className="grid">
        <Panel title="Nx Verification Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>{verificationPreview.adapterName}</span>
            </li>
            <li>
              <strong>targets</strong>
              <span>{verificationPreview.targets.join(', ')}</span>
            </li>
            <li>
              <strong>affected projects command</strong>
              <span>{verificationPreview.affectedProjectsCommandPreviewHash}</span>
            </li>
            <li>
              <strong>verification command</strong>
              <span>{verificationPreview.verificationCommandPreviewHash}</span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                planned {String(verificationPreview.processBoundaryPlanned)}, invoked{' '}
                {String(verificationPreview.processBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>noRealWrite {String(verificationPreview.noRealWrite)}</span>
            </li>
          </ul>
          <p>{verificationPreview.summary}</p>
        </Panel>
        <Panel title="Verification Boundaries">
          <p>
            Dashboard M3b is preview-only. It does not run Nx, start a process, accept shell
            commands, or expose execution controls.
          </p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'evidence') {
    const evidenceItems = getEvidenceItems(overview.codexExecEvidenceSearch);

    return (
      <section className="grid">
        <Panel title="Evidence Summary">
          {evidenceItems.length > 0 ? (
            <ul>
              {evidenceItems.map((item) => (
                <li key={item.id} className="stacked">
                  <strong>{item.id}</strong>
                  <span>
                    {item.kind}, {item.hash}
                  </span>
                  {item.summary ? <span>{item.summary}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No evidence refs are available from the read-only evidence endpoint.</p>
          )}
        </Panel>
        <Panel title="Evidence Safety">
          <p>
            This view shows ids, kinds, hashes, and summaries only. Evidence bodies, stdout, stderr,
            JSONL, prompts, local paths, and local control keys are not rendered.
          </p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'policies') {
    return (
      <section className="grid">
        <Panel title="Read-Only Policy State">
          <ul>
            <li>
              <strong>Dashboard mode</strong>
              <span>read-only</span>
            </li>
            <li>
              <strong>MCP tools</strong>
              <span>{mcpSummary.actionModes.join(', ')}</span>
            </li>
            <li>
              <strong>approval policies</strong>
              <span>{mcpSummary.approvalPolicies.join(', ')}</span>
            </li>
            <li>
              <strong>Codex live enabled</strong>
              <span>{String(overview.codexExecLiveConfig?.liveEnabled ?? false)}</span>
            </li>
            <li>
              <strong>config status</strong>
              <span>{overview.codexExecConfigLoadResult?.status ?? 'unavailable'}</span>
            </li>
          </ul>
        </Panel>
        <Panel title="Degraded State">
          <p>{summarizeDegradedState(overview.status, overview.message)}</p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'browser-profiles') {
    return (
      <section className="grid">
        <Panel title="Browser Profile Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {browserProfilesSummary.manifestName} {browserProfilesSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>profiles</strong>
              <span>{browserProfilesSummary.profileCount}</span>
            </li>
            <li>
              <strong>control-plane records</strong>
              <span>
                dry-runs {browserProfilesSummary.dryRunCount}, approvals{' '}
                {browserProfilesSummary.approvalCount}, runs {browserProfilesSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{browserProfilesSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>profile hashes</strong>
              <span>{browserProfilesSummary.profilePathHashes.join(', ')}</span>
            </li>
            <li>
              <strong>readiness</strong>
              <span>{browserProfilesSummary.readinessStatus}</span>
            </li>
            <li>
              <strong>block reasons</strong>
              <span>
                {browserProfilesSummary.readinessBlockReasons.length > 0
                  ? browserProfilesSummary.readinessBlockReasons.join(', ')
                  : 'none'}
              </span>
            </li>
          </ul>
          <p>{browserProfilesSummary.summary}</p>
        </Panel>
        <Panel title="Read-Only Observation Plan">
          <ul>
            <li>
              <strong>plan status</strong>
              <span>{browserProfilesSummary.planStatus}</span>
            </li>
            <li>
              <strong>capabilities</strong>
              <span>{browserProfilesSummary.allowedCapabilities.join(', ')}</span>
            </li>
            <li>
              <strong>blocked actions</strong>
              <span>{browserProfilesSummary.forbiddenActions.length}</span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                planned {String(browserProfilesSummary.processBoundaryPlanned)}, invoked{' '}
                {String(browserProfilesSummary.processBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>
                noRealWrite {String(browserProfilesSummary.noRealWrite)}, bodyStored{' '}
                {String(browserProfilesSummary.bodyStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Browser Observation Runs">
          {overview.browserObservationRuns.length > 0 ? (
            <ul>
              {overview.browserObservationRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'browser_observation_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, evidence{' '}
                    {run.evidenceRefIds?.length ?? 0}, audit {run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    process boundary {String(run.processBoundaryInvoked ?? false)}, external
                    process {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    noRealWrite {String(run.noRealWrite ?? true)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}, rawPathStored{' '}
                    {String(run.rawPathStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No browser observation run metadata is available. This view is read-only and never
              sends local-control credentials.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'electron') {
    return (
      <section className="grid">
        <Panel title="Electron/CDP Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {electronCdpSummary.manifestName} {electronCdpSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>control-plane records</strong>
              <span>
                dry-runs {electronCdpSummary.dryRunCount}, approvals{' '}
                {electronCdpSummary.approvalCount}, runs {electronCdpSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{electronCdpSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>runner modes</strong>
              <span>{electronCdpSummary.runnerModes.join(', ')}</span>
            </li>
            <li>
              <strong>approval</strong>
              <span>required {String(electronCdpSummary.approvalRequired)}</span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>
                default {String(electronCdpSummary.productDefaultEnabled)}, http flag{' '}
                {String(electronCdpSummary.httpFlagRequired)}, event flag{' '}
                {String(electronCdpSummary.eventFlagRequired)}
              </span>
            </li>
          </ul>
          <p>{electronCdpSummary.summary}</p>
        </Panel>
        <Panel title="Electron/CDP Boundaries">
          <ul>
            <li>
              <strong>allowed commands</strong>
              <span>{electronCdpSummary.allowedCommands.join(', ')}</span>
            </li>
            <li>
              <strong>blocked actions</strong>
              <span>{electronCdpSummary.blockedActions.join(', ')}</span>
            </li>
            <li>
              <strong>CDP boundary truth</strong>
              <span>
                http {String(electronCdpSummary.cdpHttpBoundaryInvoked)}, events{' '}
                {String(electronCdpSummary.cdpWebSocketBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                invoked {String(electronCdpSummary.processBoundaryInvoked)}, external process{' '}
                {String(electronCdpSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>
                noRealWrite {String(electronCdpSummary.noRealWrite)}, bodyStored{' '}
                {String(electronCdpSummary.bodyStored)}, rawPathStored{' '}
                {String(electronCdpSummary.rawPathStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Electron/CDP Runs">
          {overview.electronCdpObservationRuns.length > 0 ? (
            <ul>
              {overview.electronCdpObservationRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'electron_cdp_observation_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    endpoint {run.endpointIdHash ?? 'unavailable'}, target{' '}
                    {run.targetIdHash ?? 'unavailable'}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    http {String(run.cdpHttpBoundaryInvoked ?? false)}, events{' '}
                    {String(run.cdpWebSocketBoundaryInvoked ?? false)}
                  </span>
                  <span>
                    events {run.eventSummary?.eventCount ?? 0}, console{' '}
                    {run.eventSummary?.consoleEventCount ?? 0}, network{' '}
                    {run.eventSummary?.networkEventCount ?? 0}
                  </span>
                  <span>
                    noRealWrite {String(run.noRealWrite ?? true)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}, rawPathStored{' '}
                    {String(run.rawPathStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No Electron/CDP observation run metadata is available. This view is read-only and
              never sends local-control credentials.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  return (
    <section className="grid">
      <Panel title="MCP Tool Registry">
        <ul>
          <li>
            <strong>manifest</strong>
            <span>
              {mcpSummary.manifestName} {mcpSummary.manifestVersion}
            </span>
          </li>
          <li>
            <strong>tools</strong>
            <span>
              {mcpSummary.enabledToolCount}/{mcpSummary.toolCount} enabled
            </span>
          </li>
          <li>
            <strong>action modes</strong>
            <span>{mcpSummary.actionModes.join(', ')}</span>
          </li>
          <li>
            <strong>process boundary</strong>
            <span>
              invoked {String(mcpSummary.processBoundaryInvoked)}, external process{' '}
              {String(mcpSummary.externalProcessStarted)}
            </span>
          </li>
        </ul>
      </Panel>
      <Panel title="Read-Only MCP Tools">
        <ul>
          {mcpSummary.tools.map((tool) => (
            <li key={tool.name} className="stacked">
              <strong>{tool.name}</strong>
              <span>
                {tool.riskLevel}/{tool.actionMode}, approval {tool.approvalPolicy}, body{' '}
                {tool.bodyStorage}
              </span>
              <span>
                enabled {String(tool.enabled)}, noRealWrite {String(tool.noRealWrite)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}

function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <article className="panel">
      <h2>{props.title}</h2>
      {props.children}
    </article>
  );
}

function getEvidenceItems(searchResult: Record<string, unknown> | undefined): Array<{
  id: string;
  kind: string;
  hash: string;
  summary?: string;
}> {
  const result = searchResult?.result as
    | {
        items?: Array<{
          evidenceRefId?: string;
          kind?: string;
          hash?: string;
          summary?: string;
        }>;
      }
    | undefined;

  return (result?.items ?? []).slice(0, 12).map((item) => ({
    id: item.evidenceRefId ?? 'unknown',
    kind: item.kind ?? 'unknown',
    hash: item.hash ?? 'hash-unavailable',
    summary: item.summary,
  }));
}

function formatSourceBreakdown(sourceBreakdown: Record<string, number>): string {
  const entries = Object.entries(sourceBreakdown);
  return entries.length > 0
    ? entries.map(([source, count]) => `${source}:${count}`).join(', ')
    : 'none';
}

function readinessReviewWording(
  review: CodexExecRealReadOnlyAdapterReadinessReviewSummary,
): string {
  if (review.packageStatus === 'blocked' || review.packageStatus === 'not_ready') {
    return 'Not ready for separate ADR draft.';
  }

  if (review.packageStatus === 'requires_review') {
    return review.outcome === 'conditional_go_to_separate_adr_draft'
      ? 'ADR drafting only. Does not grant implementation, process launch, or execution permission.'
      : 'Separate ADR draft may be considered only if reviewer explicitly acknowledges unresolved findings.';
  }

  if (review.outcome === 'conditional_go_to_separate_adr_draft') {
    return 'ADR drafting only. Does not grant implementation, process launch, or execution permission.';
  }

  return 'Not ready for separate ADR draft.';
}

function uniqueReviewDryRunIds(reviews: CodexExecReportReviewRecord[]): string[] {
  return Array.from(new Set(reviews.map((review) => review.dryRunId))).filter(
    (dryRunId) => dryRunId.length > 0,
  );
}

function uniqueGovernanceDryRunIds(
  runs: CodexExecLiveRunRecord[],
  reviews: CodexExecReportReviewRecord[],
): string[] {
  return Array.from(
    new Set([...runs.map((run) => run.dryRunPlanId), ...reviews.map((review) => review.dryRunId)]),
  ).filter((dryRunId) => dryRunId.length > 0);
}

function uniqueRealAdapterTimelineDryRunIds(
  runs: CodexExecLiveRunRecord[],
  readiness: CodexExecRealReadOnlyAdapterReadinessSummary[],
): string[] {
  return Array.from(
    new Set([
      ...readiness.map((summary) => summary.dryRunId),
      ...runs.map((run) => run.dryRunPlanId),
    ]),
  ).filter((dryRunId) => dryRunId.length > 0);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${supervisorUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Supervisor returned ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}

async function getOptionalJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return await getJson<T>(path);
  } catch {
    return fallback;
  }
}
