import { useEffect, useState } from 'react';
import type {
  CodexExecControlPlaneTimeline,
  CodexExecControlPlaneDrilldownView,
  CodexExecControlPlaneReport,
  CodexExecGovernanceReviewPackage,
  CodexExecLiveAdapterAdrDecisionSummary,
  CodexExecLiveAdapterAdrDraft,
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
  codexExecReportReviews: CodexExecReportReviewRecord[];
  codexExecReportReviewHistories: CodexExecReportReviewHistoryView[];
  codexExecReportReviewComparisons: CodexExecReportReviewComparison[];
  codexExecReviewerHandoffs: CodexExecReviewerHandoffSummary[];
  message?: string;
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
    codexExecReportReviews: [],
    codexExecReportReviewHistories: [],
    codexExecReportReviewComparisons: [],
    codexExecReviewerHandoffs: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const [
          health,
          runsResponse,
          observationsResponse,
          developmentRunsResponse,
          codexReplayRunsResponse,
          codexExecDryRunsResponse,
          codexExecConfigResponse,
          codexExecApprovalsResponse,
          codexExecReportReviewsResponse,
        ] = await Promise.all([
          getJson<Record<string, unknown>>('/health'),
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
          getJson<{ reviews: CodexExecReportReviewRecord[] }>(
            '/api/codex/exec/report-reviews?limit=10',
          ),
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
            codexExecReportReviews: codexExecReportReviewsResponse.reviews,
            codexExecReportReviewHistories,
            codexExecReportReviewComparisons,
            codexExecReviewerHandoffs,
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
            codexExecReportReviews: [],
            codexExecReportReviewHistories: [],
            codexExecReportReviewComparisons: [],
            codexExecReviewerHandoffs: [],
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
                    recommendationGrantsExecution{' '}
                    {String(decision.recommendationGrantsExecution)}
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
    </main>
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

function formatSourceBreakdown(sourceBreakdown: Record<string, number>): string {
  const entries = Object.entries(sourceBreakdown);
  return entries.length > 0
    ? entries.map(([source, count]) => `${source}:${count}`).join(', ')
    : 'none';
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

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${supervisorUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Supervisor returned ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}
