import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  createProductionGaApprovalArtifact,
  createProductionGaCapabilityMatrix,
  createProductionGaE2ERehearsalPlan,
  createProductionGaE2ERehearsalRun,
  createProductionGaEvidenceBundleSummary,
  createProductionGaOperatorTrainingCompletion,
  createProductionGaOperatorTrainingPlan,
  createProductionGaReadinessPlan,
  createProductionGaReleaseCandidateSignoffPlan,
  createProductionGaResidualRiskRegister,
  createProductionGaSignoffRun,
  createProductionGaThreatModel,
  summarizeProductionGaReadiness,
} from './index';

const sourceDir = dirname(fileURLToPath(import.meta.url));

describe('production-ga-kernel', () => {
  it('keeps GA aggregation free of direct adapter and boundary execution', () => {
    const source = readFileSync(join(sourceDir, 'index.ts'), 'utf8');
    const forbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'shell: true',
      'fetch(',
      'executeGithub',
      'executeDeployment',
      'executeBrowser',
      'executeElectron',
      'executeMcp',
      'runExternalAgent',
      'new Worker(',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
  });

  it('builds GA release metadata without leaking adversarial source material', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const matrix = createProductionGaCapabilityMatrix({
      matrixSeed: adversarialPublicOutputFixture,
      now,
    });
    const threatModel = createProductionGaThreatModel({
      assetSeeds: [adversarialPublicOutputFixture],
      trustBoundarySeeds: [adversarialPublicOutputFixture],
      liveBoundarySeeds: [adversarialPublicOutputFixture],
      authorityModelSeed: adversarialPublicOutputFixture,
      approvalModelSeed: adversarialPublicOutputFixture,
      evidenceAuditModelSeed: adversarialPublicOutputFixture,
      rollbackModelSeed: adversarialPublicOutputFixture,
      now,
    });
    const readinessPlan = createProductionGaReadinessPlan({
      matrix,
      threatModel,
      now,
    });
    const readiness = summarizeProductionGaReadiness({
      plan: readinessPlan,
      now,
    });
    const rehearsalPlan = createProductionGaE2ERehearsalPlan({
      scenario: 'all-pass',
      chainSeeds: [adversarialPublicOutputFixture],
      childControlPlaneRecordSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const rehearsalRun = createProductionGaE2ERehearsalRun({
      plan: rehearsalPlan,
      status: 'ready',
      liveSmokeStatus: 'readiness_blocked',
      timelineSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const trainingPlan = createProductionGaOperatorTrainingPlan({
      moduleIds: [adversarialPublicOutputFixture, 'release-governance'],
      trainingSeed: adversarialPublicOutputFixture,
      now,
    });
    const training = createProductionGaOperatorTrainingCompletion({
      trainingPlan,
      operatorIdentity: adversarialPublicOutputFixture,
      now,
    });
    const signoffPlan = createProductionGaReleaseCandidateSignoffPlan({
      matrix,
      threatModel,
      readinessSummary: readiness,
      e2eRehearsalRun: rehearsalRun,
      now,
    });
    const approvalOne = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: adversarialPublicOutputFixture,
      reason: adversarialPublicOutputFixture,
      now,
    });
    const approvalTwo = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'second-operator',
      reason: adversarialPublicOutputFixture,
      now,
    });
    const signoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals: [approvalOne, approvalTwo],
      now,
    });
    const riskRegister = createProductionGaResidualRiskRegister({
      risks: [{ severity: 'medium' }],
      mitigationSeed: adversarialPublicOutputFixture,
      now,
    });
    const evidenceBundle = createProductionGaEvidenceBundleSummary({
      gateSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const records = [
      matrix,
      threatModel,
      readinessPlan,
      readiness,
      rehearsalPlan,
      rehearsalRun,
      trainingPlan,
      training,
      signoffPlan,
      approvalOne,
      approvalTwo,
      signoff,
      riskRegister,
      evidenceBundle,
    ];
    const serialized = JSON.stringify(records);

    expect(signoff.status).toBe('conditionally_ready');
    expect(signoff.approvalConsumedCount).toBe(2);
    expect(signoff.childAdapterInvokedDirectly).toBe(false);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);
  });

  it('derives complete E2E rehearsal metadata timelines for each GA scenario', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const cases = [
      ['all-pass', 'ready', 8, 0, 0, 'readiness_blocked', 1],
      ['patch-blocked', 'blocked', 0, 8, 0, 'readiness_blocked', 1],
      ['verification-failed', 'failed', 1, 6, 1, 'readiness_blocked', 1],
      ['pr-blocked', 'blocked', 2, 6, 0, 'readiness_blocked', 1],
      ['merge-blocked', 'blocked', 3, 5, 0, 'readiness_blocked', 1],
      ['release-blocked', 'blocked', 4, 4, 0, 'readiness_blocked', 1],
      ['deploy-blocked', 'blocked', 5, 3, 0, 'readiness_blocked', 1],
      ['observe-blocked', 'blocked', 6, 2, 0, 'readiness_blocked', 1],
      ['rollback-plan-missing', 'blocked', 7, 1, 0, 'readiness_blocked', 1],
      ['rollback-failed', 'failed', 7, 0, 1, 'readiness_blocked', 1],
      ['child-hash-mismatch', 'blocked', 0, 8, 0, 'readiness_blocked', 1],
      ['approval-blocked', 'blocked', 0, 8, 0, 'readiness_blocked', 1],
      ['live-env-not-configured', 'conditionally_ready', 8, 0, 0, 'readiness_blocked', 1],
      ['evidence-missing', 'blocked', 8, 1, 0, 'readiness_blocked', 1],
      ['audit-gap', 'blocked', 8, 1, 0, 'readiness_blocked', 1],
    ] as const;

    for (const [
      scenario,
      status,
      completedStepCount,
      blockedStepCount,
      failedStepCount,
      liveSmokeStatus,
      liveSmokeBlockerCount,
    ] of cases) {
      const plan = createProductionGaE2ERehearsalPlan({ scenario, now });
      const run = createProductionGaE2ERehearsalRun({ plan, now });

      expect(run).toMatchObject({
        scenario,
        status,
        completedStepCount,
        blockedStepCount,
        failedStepCount,
        liveSmokeStatus,
        liveSmokeBlockerCount,
        processBoundaryInvoked: false,
        networkBoundaryInvoked: false,
        remoteProviderBoundaryInvoked: false,
        childAdapterInvokedDirectly: false,
      });
      expect(run.timelineHash).not.toBe(plan.chainHash);
      expect(findAdversarialPublicOutputRoundTripLeaks([plan, run])).toEqual([]);
    }
  });

  it('blocks signoff when critical-risk resolution is missing', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const matrix = createProductionGaCapabilityMatrix({ now });
    const threatModel = createProductionGaThreatModel({
      authorityModelSeed: 'security-kernel-final-authority',
      approvalModelSeed: 'two-approval-ga',
      evidenceAuditModelSeed: 'evidence-audit-required',
      rollbackModelSeed: 'dr-runbook-required',
      unresolvedCriticalRiskCount: 1,
      now,
    });
    const readinessPlan = createProductionGaReadinessPlan({ matrix, threatModel, now });
    const readiness = summarizeProductionGaReadiness({
      plan: readinessPlan,
      unresolvedCriticalRiskCount: 1,
      now,
    });
    const rehearsalPlan = createProductionGaE2ERehearsalPlan({ scenario: 'all-pass', now });
    const rehearsalRun = createProductionGaE2ERehearsalRun({
      plan: rehearsalPlan,
      status: 'ready',
      now,
    });
    const signoffPlan = createProductionGaReleaseCandidateSignoffPlan({
      matrix,
      threatModel,
      readinessSummary: readiness,
      e2eRehearsalRun: rehearsalRun,
      now,
    });
    const approvalOne = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'operator-one',
      now,
    });
    const approvalTwo = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'operator-two',
      now,
    });

    const signoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals: [approvalOne, approvalTwo],
      now,
    });

    expect(signoff.status).toBe('blocked');
    expect(signoff.approvalConsumedCount).toBe(0);
    expect(signoff.unresolvedCriticalRiskCount).toBe(1);
  });

  it('allows conditional GA signoff only for live-smoke environment blockers', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const matrix = createProductionGaCapabilityMatrix({ now });
    const threatModel = createProductionGaThreatModel({
      authorityModelSeed: 'security-kernel-final-authority',
      approvalModelSeed: 'two-approval-ga',
      evidenceAuditModelSeed: 'evidence-audit-required',
      rollbackModelSeed: 'dr-runbook-required',
      now,
    });
    const readinessPlan = createProductionGaReadinessPlan({ matrix, threatModel, now });
    const readiness = summarizeProductionGaReadiness({ plan: readinessPlan, now });
    const rehearsalPlan = createProductionGaE2ERehearsalPlan({ scenario: 'all-pass', now });
    const rehearsalRun = createProductionGaE2ERehearsalRun({ plan: rehearsalPlan, now });
    const signoffPlan = createProductionGaReleaseCandidateSignoffPlan({
      matrix,
      threatModel,
      readinessSummary: readiness,
      e2eRehearsalRun: rehearsalRun,
      now,
    });
    const approvalOne = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'operator-one',
      now,
    });
    const approvalTwo = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'operator-two',
      now,
    });
    const approvals = [approvalOne, approvalTwo];

    const readySignoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals,
      conditionalLiveStatus: 'ready',
      now,
    });
    const conditionalLiveSignoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals,
      now,
    });
    const conditionalMatrixSignoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals,
      matrixStatus: 'conditionally_ready',
      now,
    });
    const blockedTrainingSignoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals,
      trainingStatus: 'blocked',
      now,
    });
    const failedE2eSignoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals,
      e2eFixtureStatus: 'failed',
      now,
    });

    expect(readySignoff.status).toBe('ready');
    expect(readySignoff.approvalConsumedCount).toBe(2);
    expect(conditionalLiveSignoff.status).toBe('conditionally_ready');
    expect(conditionalLiveSignoff.approvalConsumedCount).toBe(2);
    expect(conditionalMatrixSignoff.status).toBe('blocked');
    expect(conditionalMatrixSignoff.approvalConsumedCount).toBe(0);
    expect(blockedTrainingSignoff.status).toBe('blocked');
    expect(blockedTrainingSignoff.approvalConsumedCount).toBe(0);
    expect(failedE2eSignoff.status).toBe('failed');
    expect(failedE2eSignoff.approvalConsumedCount).toBe(0);
  });

  it('blocks GA signoff when approvals share the same approver hash', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const matrix = createProductionGaCapabilityMatrix({ now });
    const threatModel = createProductionGaThreatModel({
      authorityModelSeed: 'security-kernel-final-authority',
      approvalModelSeed: 'two-distinct-approver-ga',
      evidenceAuditModelSeed: 'evidence-audit-required',
      rollbackModelSeed: 'dr-runbook-required',
      now,
    });
    const readinessPlan = createProductionGaReadinessPlan({ matrix, threatModel, now });
    const readiness = summarizeProductionGaReadiness({ plan: readinessPlan, now });
    const rehearsalPlan = createProductionGaE2ERehearsalPlan({ scenario: 'all-pass', now });
    const rehearsalRun = createProductionGaE2ERehearsalRun({ plan: rehearsalPlan, now });
    const signoffPlan = createProductionGaReleaseCandidateSignoffPlan({
      matrix,
      threatModel,
      readinessSummary: readiness,
      e2eRehearsalRun: rehearsalRun,
      now,
    });
    const approvalOne = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'same-operator',
      now,
    });
    const approvalTwo = createProductionGaApprovalArtifact({
      dryRunId: signoffPlan.dryRunId,
      approver: 'same-operator',
      now,
    });

    const signoff = createProductionGaSignoffRun({
      signoffPlan,
      approvals: [approvalOne, approvalTwo],
      now,
    });

    expect(signoff.status).toBe('blocked');
    expect(signoff.approvalConsumedCount).toBe(0);
    expect(signoff.approverHashes).toHaveLength(2);
    expect(new Set(signoff.approverHashes).size).toBe(1);
    expect(signoff.childAdapterInvokedDirectly).toBe(false);
    expect(findAdversarialPublicOutputRoundTripLeaks([signoff])).toEqual([]);
  });
});
