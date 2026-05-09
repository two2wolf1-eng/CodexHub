import { describe, expect, it } from 'vitest';

import {
  containsForbiddenCalibrationRequestBody,
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
} from './index';

describe('real-client-calibration-kernel', () => {
  it('classifies M75 real rehearsal acceptance from live boundary evidence', () => {
    const plan = createM75RealRehearsalAcceptancePlan({
      rehearsalRunId: 'm75-rehearsal-1',
      expectedOperationKinds: ['codexDesktopDispatchTask'],
      expectedSurfaceRegistrationIds: ['surface-1'],
      expectedManifestIds: ['manifest-1'],
      conditionalLiveAllowed: true,
      codexDesktopExpected: true,
    });
    const evidence = createM75RealRehearsalEvidenceSummary({
      acceptancePlanId: plan.id,
      rehearsalRunId: plan.rehearsalRunId,
      boundaryEventCount: 1,
      liveClientTouched: true,
      codexDesktopTouched: true,
    });
    const run = createM75RealRehearsalAcceptanceRun({ acceptancePlan: plan, evidenceSummary: evidence });

    expect(run.status).toBe('real_live_accepted');
    expect(run.realBoundaryReached).toBe(true);
    expect(JSON.stringify(run)).not.toContain('private prompt');
  });

  it('requires calibration-safe restore targets for admin write sessions', () => {
    expect(() =>
      createRealClientCalibrationSession({
        sessionKind: 'chatgpt_workspace_member_remove_add',
        surfaceRegistrationIds: ['surface-chatgpt-admin'],
        manifestIds: ['manifest-remove-add'],
        liveWritesAllowed: true,
        adminWriteAllowed: true,
        calibrationSafe: false,
        restoreAllowed: true,
      }),
    ).toThrow(/calibration-safe/);

    const session = createRealClientCalibrationSession({
      sessionKind: 'chatgpt_workspace_member_remove_add',
      surfaceRegistrationIds: ['surface-chatgpt-admin'],
      manifestIds: ['manifest-remove-add'],
      calibrationTargetSeed: 'private calibration member',
      liveWritesAllowed: true,
      adminWriteAllowed: true,
      calibrationSafe: true,
      restoreAllowed: true,
      delegatedAdminAuthorityRequired: true,
    });

    const grant = createCalibrationAuthorityGrant({
      session,
      authorityRefSeed: 'private authority',
      approvalBindingIds: ['approval-1'],
      approverSeeds: ['operator-1'],
      delegatedAdminAuthorityVerified: true,
    });
    const run = createCalibrationRun({
      session,
      authorityGrant: grant,
      operationKind: 'chatgptWorkspaceMemberRemoveAddCalibration',
      targetMemberSeed: 'private calibration member',
      adminWriteTouched: true,
      liveClientTouched: true,
      realBoundaryReached: true,
      delegatedAdminAuthorityVerified: true,
      postWriteVerified: true,
      removeStatus: 'completed',
      restoreStatus: 'pending_invite',
    });

    expect(run.status).toBe('restored_with_pending_invite');
    expect(run.credentialMaterialStored).toBe(false);
    expect(JSON.stringify(run)).not.toContain('private calibration member');
  });

  it('blocks drifted calibration signatures and proposes bounded corrections', () => {
    const session = createRealClientCalibrationSession({
      sessionKind: 'chrome_chatgpt_ui',
      surfaceRegistrationIds: ['surface-chatgpt'],
      manifestIds: ['manifest-submit'],
      liveWritesAllowed: true,
    });
    const sample = createCalibrationSelectorSample({
      session,
      selectorSeed: 'private selector',
      axRoleSeed: 'button',
      compatible: false,
    });
    const drift = createCalibrationDriftSignature({
      session,
      selectorDriftCount: 1,
    });
    const proposal = createCalibrationManifestCorrectionProposal({
      session,
      driftSignatureId: drift.id,
      proposedManifestSeed: sample.selectorHash,
      evidenceComplete: true,
      confidence: 'high',
    });

    expect(drift.status).toBe('selector_drift');
    expect(drift.highRiskExecutionBlocked).toBe(true);
    expect(proposal.status).toBe('proposed');
  });

  it('rejects forbidden request body material recursively', () => {
    expect(
      containsForbiddenCalibrationRequestBody({
        sessionRefId: 'session-1',
        nested: { rawSelector: 'button.secret' },
      }),
    ).toBe(true);
    expect(
      containsForbiddenCalibrationRequestBody({
        sessionRefId: 'session-1',
        surfaceRegistrationId: 'surface-1',
        manifestId: 'manifest-1',
      }),
    ).toBe(false);
  });

  it('creates observations without persisting raw material', () => {
    const session = createRealClientCalibrationSession({
      sessionKind: 'codex_desktop_state',
      surfaceRegistrationIds: ['surface-desktop'],
      manifestIds: ['manifest-state'],
      liveWritesAllowed: true,
    });
    const observation = createCalibrationObservation({
      session,
      operationKind: 'codexDesktopLiveStateCalibration',
      observationKind: 'codex_desktop_state',
      beforeStateSeed: 'private before state',
      afterStateSeed: 'private after state',
      cdpWebSocketBoundaryInvoked: true,
      electronActionInvoked: true,
    });

    expect(observation.cdpWebSocketBoundaryInvoked).toBe(true);
    expect(observation.rawDomStored).toBe(false);
    expect(JSON.stringify(observation)).not.toContain('private before state');
  });
});
