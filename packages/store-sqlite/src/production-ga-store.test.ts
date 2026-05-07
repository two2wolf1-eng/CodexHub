import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createProductionGaApprovalArtifact,
  createProductionGaCapabilityMatrix,
  createProductionGaE2ERehearsalPlan,
  createProductionGaE2ERehearsalRun,
  createProductionGaOperatorTrainingCompletion,
  createProductionGaOperatorTrainingPlan,
  createProductionGaReadinessPlan,
  createProductionGaReleaseCandidateSignoffPlan,
  createProductionGaResidualRiskRegister,
  createProductionGaSignoffRun,
  createProductionGaThreatModel,
  summarizeProductionGaReadiness,
} from '@codexhub/production-ga-kernel';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

describe('production GA SQLite stores', () => {
  it('round-trips GA release records as metadata-only JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-production-ga-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
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
    const rehearsalPlan = createProductionGaE2ERehearsalPlan({
      scenario: 'all-pass',
      chainSeeds: [adversarialPublicOutputFixture],
      childControlPlaneRecordSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const rehearsalRun = createProductionGaE2ERehearsalRun({
      plan: rehearsalPlan,
      status: 'ready',
      timelineSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const trainingPlan = createProductionGaOperatorTrainingPlan({
      moduleIds: [adversarialPublicOutputFixture, 'release-governance'],
      now,
    });
    const training = createProductionGaOperatorTrainingCompletion({
      trainingPlan,
      operatorIdentity: adversarialPublicOutputFixture,
      now,
    });
    const riskRegister = createProductionGaResidualRiskRegister({
      risks: [{ severity: 'medium' }],
      mitigationSeed: adversarialPublicOutputFixture,
      now,
    });
    const readinessSummary = summarizeProductionGaReadiness({ plan: readinessPlan, now });
    const signoffPlan = createProductionGaReleaseCandidateSignoffPlan({
      matrix,
      threatModel,
      readinessSummary,
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
      approver: 'operator-two',
      reason: adversarialPublicOutputFixture,
      now,
    });
    const signoffRun = createProductionGaSignoffRun({
      signoffPlan,
      approvals: [approvalOne, approvalTwo],
      now,
    });

    await store.productionGaDryRuns.saveDryRun(readinessPlan);
    await store.productionGaApprovals.saveApproval(approvalOne);
    await store.productionGaApprovals.saveApproval(approvalTwo);
    await store.productionGaSignoffPlans.saveSignoffPlan(signoffPlan);
    await store.productionGaSignoffRuns.saveRun(signoffRun);
    await store.productionGaE2ERehearsalRuns.saveRehearsalRun(rehearsalRun);
    await store.productionGaTrainingCompletions.saveTrainingCompletion(training);
    await store.productionGaThreatModels.saveThreatModel(threatModel);
    await store.productionGaResidualRiskRegisters.saveResidualRiskRegister(riskRegister);

    const records = [
      await store.productionGaDryRuns.getDryRun(readinessPlan.id),
      await store.productionGaApprovals.getApprovalByArtifactId(approvalOne.id),
      await store.productionGaSignoffPlans.getSignoffPlan(signoffPlan.id),
      await store.productionGaSignoffRuns.getRun(signoffRun.id),
      ...(await store.productionGaE2ERehearsalRuns.listRehearsalRuns({ limit: 10 })),
      ...(await store.productionGaTrainingCompletions.listTrainingCompletions({ limit: 10 })),
      ...(await store.productionGaThreatModels.listThreatModels({ limit: 10 })),
      ...(await store.productionGaResidualRiskRegisters.listResidualRiskRegisters({ limit: 10 })),
    ].filter((record) => record !== undefined);

    expect(records).toHaveLength(8);
    expect(signoffRun.childAdapterInvokedDirectly).toBe(false);
    expect(signoffRun.approvalConsumedCount).toBe(2);
    expect(JSON.stringify(records)).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);

    await store.close();
  });
});
