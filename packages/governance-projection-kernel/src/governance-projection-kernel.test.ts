import { describe, expect, it } from 'vitest';
import {
  GovernanceProjectionSummarySchema,
  UnifiedRunProjectionSchema,
} from '@codexhub/contracts';
import {
  createGovernanceProjection,
  createUnifiedRunProjection,
  normalizeSource,
  normalizeStatus,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

function expectNoForbiddenPublicOutput(serialized: string): void {
  expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
}

describe('governance-projection-kernel', () => {
  it('projects read-only run summaries into unified metadata-only runs', () => {
    const result = createGovernanceProjection([
      {
        id: 'codex_dry_run_1',
        source: 'codex_exec_dry_run',
        title: 'Codex dry-run',
        status: 'blocked',
        evidenceRefIds: ['evidence_codex_1'],
        auditEventIds: ['audit_codex_1'],
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      },
      {
        id: 'worktree_run_1',
        source: 'worktree_run',
        title: 'Worktree run',
        status: 'completed',
        evidenceRefIds: ['evidence_worktree_1'],
        auditEventIds: ['audit_worktree_1'],
        processBoundaryInvoked: true,
        externalProcessStarted: true,
        noRealWrite: false,
      },
    ]);
    const serialized = JSON.stringify(result);

    expect(result.projections).toHaveLength(2);
    expect(result.projections[0]?.source).toBe('codex');
    expect(result.projections[1]?.source).toBe('worktree');
    expect(result.summary.runCount).toBe(2);
    expect(result.summary.sourceBreakdown.codex).toBe(1);
    expect(result.summary.sourceBreakdown.worktree).toBe(1);
    expect(result.summary.evidenceCount).toBe(2);
    expect(result.summary.auditEventCount).toBe(2);
    expect(result.summary.processBoundaryCount).toBe(1);
    expect(result.summary.externalProcessStartedCount).toBe(1);
    expect(UnifiedRunProjectionSchema.parse(result.projections[0]).source).toBe('codex');
    expect(GovernanceProjectionSummarySchema.parse(result.summary).status).toBe('ready');
    expect(serialized).not.toContain('Codex dry-run');
    expect(serialized).not.toContain('Worktree run');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
  });

  it('normalizes known source aliases and statuses', () => {
    expect(normalizeSource('electron_cdp_observation')).toBe('electron');
    expect(normalizeSource('policy_backend_projection')).toBe('policy');
    expect(normalizeStatus('success')).toBe('passed');
    expect(normalizeStatus('approved')).toBe('unknown');
  });

  it('rejects unknown projection sources before creating a projection', () => {
    expect(() =>
      createUnifiedRunProjection({
        id: 'unknown_1',
        source: 'unknown_runtime',
        status: 'completed',
      }),
    ).toThrow();
  });

  it('keeps evidence and audit bundles linked by projection id', () => {
    const projection = createUnifiedRunProjection({
      id: 'browser_run_1',
      source: 'browser_observation',
      status: 'completed',
      evidenceRefIds: ['evidence_browser_1'],
      evidenceKinds: ['browser.observation_summary'],
      auditEventIds: ['audit_browser_1'],
    });

    expect(projection.evidenceBundle.runProjectionId).toBe(projection.id);
    expect(projection.auditChain.runProjectionId).toBe(projection.id);
    expect(projection.timeline[0]?.runProjectionId).toBe(projection.id);
    expect(projection.evidenceBundle.evidenceKinds).toEqual(['browser.observation_summary']);
    expect(projection.rawPathStored).toBe(false);
    expect(projection.bodyStored).toBe(false);
  });

  it('hashes representative raw source metadata out of public projection output', () => {
    const result = createGovernanceProjection([
      {
        id: adversarialPublicOutputFixture,
        source: 'github_branch_publish_run',
        title: adversarialPublicOutputFixture,
        status: 'completed',
        evidenceRefIds: ['evidence_redacted_fixture'],
        evidenceKinds: ['github.branch_publish_summary'],
        auditEventIds: ['audit_redacted_fixture'],
        policyDecisionIds: ['policy_redacted_fixture'],
        networkBoundaryInvoked: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      },
    ]);

    expectNoForbiddenPublicOutput(JSON.stringify(result));
    expect(result.projections[0]?.sourceRunIdHash).toMatch(/^projection:/);
    expect(result.projections[0]?.titleHash).toMatch(/^projection:/);
  });
});
