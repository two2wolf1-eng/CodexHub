import { useEffect, useState } from 'react';
import type { CodexExecReplaySummary } from '@codexhub/codex-kernel';
import type {
  CodexExecLiveConfig,
  CodexExecLiveRunRecord,
  CodexExecConfigLoadResult,
  CodexExecManualApprovalRecord,
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
  codexReplayRuns: CodexExecReplaySummary[];
  codexExecDryRuns: CodexExecLiveRunRecord[];
  codexExecLiveConfig?: CodexExecLiveConfig;
  codexExecConfigLoadResult?: CodexExecConfigLoadResult;
  codexExecApprovals: CodexExecManualApprovalRecord[];
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
        ] = await Promise.all([
          getJson<Record<string, unknown>>('/health'),
          getJson<{ runs: WorkflowRun[] }>('/api/workflows/runs'),
          getJson<{ sourceHealth: SourceHealth[] }>('/api/observations'),
          getJson<{ runs: MockDevelopmentOrchestrationResult[] }>('/api/development/mock-runs'),
          getJson<{ runs: CodexExecReplaySummary[] }>('/api/codex/replay-fixtures'),
          getJson<{ runs: CodexExecLiveRunRecord[]; liveConfig?: CodexExecLiveConfig }>(
            '/api/codex/exec/dry-runs',
          ),
          getJson<{
            configLoadResult?: CodexExecConfigLoadResult;
            liveConfig?: CodexExecLiveConfig;
          }>('/api/codex/exec/config'),
          getJson<{ approvals: CodexExecManualApprovalRecord[] }>('/api/codex/exec/approvals'),
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
                    {record.status}, {record.request.riskLevel} risk, scope {record.request.scope}
                  </span>
                  <span>
                    decision {record.decision?.outcome ?? 'pending'}, artifact{' '}
                    {record.approvalArtifact?.status ?? 'not created'}, live{' '}
                    {String(record.liveExecution)}, disabled {String(record.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No manual approval records are available yet.</p>
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

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${supervisorUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Supervisor returned ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}
