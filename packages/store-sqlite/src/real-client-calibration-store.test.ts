import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createCalibrationAuthorityGrant,
  createCalibrationDriftSignature,
  createCalibrationManifestCorrectionProposal,
  createCalibrationObservation,
  createCalibrationRun,
  createCalibrationSelectorSample,
  createM75RealRehearsalAcceptancePlan,
  createM75RealRehearsalAcceptanceRun,
  createM75RealRehearsalEvidenceSummary,
  createRealClientCalibrationSession,
} from '@codexhub/real-client-calibration-kernel';

import { createSqliteStore } from './index';

describe('real client calibration sqlite repositories', () => {
  let workspace: string | undefined;

  afterEach(() => {
    if (workspace) {
      rmSync(workspace, { recursive: true, force: true });
      workspace = undefined;
    }
  });

  it('round-trips M75 acceptance and M76 calibration records without raw material', async () => {
    workspace = mkdtempSync(join(tmpdir(), 'codexhub-calibration-store-'));
    const store = await createSqliteStore({ workspaceRoot: workspace });

    const acceptancePlan = createM75RealRehearsalAcceptancePlan({
      rehearsalRunId: 'm75-rehearsal',
      expectedOperationKinds: ['chatgptWorkspaceMemberRemoveAddCalibration'],
      expectedSurfaceRegistrationIds: ['surface-1'],
      expectedManifestIds: ['manifest-1'],
      conditionalLiveAllowed: true,
      adminWriteExpected: true,
      postWriteVerificationRequired: true,
    });
    const acceptanceEvidence = createM75RealRehearsalEvidenceSummary({
      acceptancePlanId: acceptancePlan.id,
      rehearsalRunId: acceptancePlan.rehearsalRunId,
      boundaryEventCount: 1,
      liveClientTouched: true,
      adminWriteTouched: true,
      postWriteVerified: true,
    });
    const acceptanceRun = createM75RealRehearsalAcceptanceRun({
      acceptancePlan,
      evidenceSummary: acceptanceEvidence,
    });
    const session = createRealClientCalibrationSession({
      sessionKind: 'chatgpt_workspace_member_remove_add',
      surfaceRegistrationIds: ['surface-1'],
      manifestIds: ['manifest-1'],
      calibrationTargetSeed: 'private member',
      calibrationSafe: true,
      restoreAllowed: true,
      delegatedAdminAuthorityRequired: true,
      liveWritesAllowed: true,
      adminWriteAllowed: true,
    });
    const grant = createCalibrationAuthorityGrant({
      session,
      authorityRefSeed: 'private authority',
      approvalBindingIds: ['approval-1'],
      approverSeeds: ['operator-1'],
      delegatedAdminAuthorityVerified: true,
    });
    const observation = createCalibrationObservation({
      session,
      operationKind: 'chatgptWorkspaceMemberRemoveAddCalibration',
      observationKind: 'after_restore',
      beforeStateSeed: 'private before',
      afterStateSeed: 'private after',
      browserActionInvoked: true,
    });
    const drift = createCalibrationDriftSignature({ session, selectorDriftCount: 1 });
    const sample = createCalibrationSelectorSample({ session, selectorSeed: 'private selector' });
    const proposal = createCalibrationManifestCorrectionProposal({
      session,
      driftSignatureId: drift.id,
      proposedManifestSeed: sample.selectorHash,
      evidenceComplete: true,
    });
    const run = createCalibrationRun({
      session,
      authorityGrant: grant,
      operationKind: 'chatgptWorkspaceMemberRemoveAddCalibration',
      targetMemberSeed: 'private member',
      adminWriteTouched: true,
      liveClientTouched: true,
      realBoundaryReached: true,
      delegatedAdminAuthorityVerified: true,
      postWriteVerified: true,
      removeStatus: 'completed',
      restoreStatus: 'pending_invite',
      driftSignatureIds: [drift.id],
      correctionProposalIds: [proposal.id],
    });

    await store.m75RealRehearsalAcceptancePlans.saveRecord(acceptancePlan);
    await store.m75RealRehearsalEvidenceSummaries.saveRecord(acceptanceEvidence);
    await store.m75RealRehearsalAcceptanceRuns.saveRecord(acceptanceRun);
    await store.realClientCalibrationSessions.saveRecord(session);
    await store.calibrationAuthorityGrants.saveRecord(grant);
    await store.calibrationObservations.saveRecord(observation);
    await store.calibrationDriftSignatures.saveRecord(drift);
    await store.calibrationSelectorSamples.saveRecord(sample);
    await store.calibrationManifestCorrectionProposals.saveRecord(proposal);
    await store.calibrationRuns.saveRecord(run);

    expect(await store.calibrationRuns.getRecord(run.id)).toMatchObject({
      status: 'restored_with_pending_invite',
      adminWriteTouched: true,
      postWriteVerified: true,
    });
    const serialized = JSON.stringify({
      acceptanceRun: await store.m75RealRehearsalAcceptanceRuns.getRecord(acceptanceRun.id),
      session: await store.realClientCalibrationSessions.getRecord(session.id),
      observation: await store.calibrationObservations.getRecord(observation.id),
      run: await store.calibrationRuns.getRecord(run.id),
    });
    expect(serialized).not.toContain('private member');
    expect(serialized).not.toContain('private selector');
    expect(serialized).not.toContain('private before');
    expect(serialized).not.toContain('private authority');

    await store.close();
  });
});
