import { describe, expect, it } from 'vitest';
import {
  applyUiActionAuthority,
  classifyAdminUiActionRisk,
  classifyUiActionRisk,
  createAdminWriteDryRun,
  createUiTargetFingerprint,
  createUiActionDryRun,
  planUiAutomationIntent,
  planAdminWriteIntent,
  resolveAdminWriteAuthority,
  summarizeAdminWriteRun,
  summarizeUiAutomationResult,
} from './index';

describe('ui automation kernel', () => {
  it('plans allowlisted guided UI actions through dry-run and approval authority', () => {
    const intent = planUiAutomationIntent({
      actionKind: 'click-allowlisted-control',
      targetSeed: 'business-quota-visible-page',
      selectorManifestSeed: 'quota-controls-v1',
    });
    const dryRun = createUiActionDryRun(intent);
    const deniedAuthority = applyUiActionAuthority({ dryRunPlan: dryRun });
    const approvedAuthority = applyUiActionAuthority({
      dryRunPlan: dryRun,
      approvalArtifactSeed: 'approval-record-1',
    });
    const authorizedRun = summarizeUiAutomationResult({
      intent,
      dryRunPlan: dryRun,
      authority: approvedAuthority,
    });

    expect(intent.actionClass).toBe('approved_guided_action');
    expect(intent.approvalRequired).toBe(true);
    expect(dryRun.authorityRequired).toBe(true);
    expect(deniedAuthority.allowed).toBe(false);
    expect(approvedAuthority.allowed).toBe(true);
    expect(approvedAuthority.requestBodyAuthorityAccepted).toBe(false);
    expect(authorizedRun.status).toBe('authorized');
    expect(authorizedRun.liveActionAllowed).toBe(true);
    expect(authorizedRun.processBoundaryInvoked).toBe(false);
    expect(JSON.stringify(authorizedRun)).not.toContain('business-quota-visible-page');
  });

  it('classifies desktop and turn controls as critical approved actions', () => {
    const classification = classifyUiActionRisk('restart-desktop');
    const intent = planUiAutomationIntent({
      actionKind: 'restart-desktop',
      targetSeed: 'codex-desktop-renderer',
    });
    const dryRun = createUiActionDryRun(intent);
    const waitingRun = summarizeUiAutomationResult({ intent, dryRunPlan: dryRun });

    expect(classification.actionClass).toBe('critical_approved_action');
    expect(classification.riskLevel).toBe('critical');
    expect(intent.approvalRequired).toBe(true);
    expect(dryRun.approvalRequired).toBe(true);
    expect(waitingRun.status).toBe('approval_waiting');
    expect(waitingRun.liveActionAllowed).toBe(false);
  });

  it('permanently blocks credential and storage actions', () => {
    const intent = planUiAutomationIntent({
      actionKind: 'session-storage-read',
      targetSeed: 'business-quota-page',
    });
    const dryRun = createUiActionDryRun(intent);
    const authority = applyUiActionAuthority({
      dryRunPlan: dryRun,
      approvalArtifactSeed: 'approval-record-credential',
    });
    const run = summarizeUiAutomationResult({ intent, dryRunPlan: dryRun, authority });

    expect(intent.actionClass).toBe('forbidden_credential_action');
    expect(intent.credentialInputRequested).toBe(false);
    expect(dryRun.credentialActionBlocked).toBe(true);
    expect(dryRun.blockedReasonHashes[0]).toMatch(/^sha256:/);
    expect(authority.allowed).toBe(false);
    expect(authority.credentialMaterialAllowed).toBe(false);
    expect(authority.storageAccessAllowed).toBe(false);
    expect(run.status).toBe('blocked');
    expect(run.liveActionAllowed).toBe(false);
  });

  it('plans high-privilege admin writes with fingerprint-bound authority only', () => {
    const fingerprint = createUiTargetFingerprint({
      targetSeed: 'private business admin member row',
      selectorSeed: 'private remove member button selector',
      axRoleSeed: 'button',
      axNameSeed: 'Remove member',
      pageSeed: 'members page hash input',
    });
    const intent = planAdminWriteIntent({
      actionKind: 'remove-member',
      targetSeed: 'private business admin member row',
      fingerprint,
    });
    const dryRun = createAdminWriteDryRun(intent, fingerprint);
    const deniedAuthority = resolveAdminWriteAuthority({ dryRunPlan: dryRun });
    const approvedAuthority = resolveAdminWriteAuthority({
      dryRunPlan: dryRun,
      approvalArtifactSeed: 'stored-admin-approval-1',
    });
    const run = summarizeAdminWriteRun({ intent, dryRunPlan: dryRun, authority: approvedAuthority });

    expect(classifyAdminUiActionRisk('remove-member')).toMatchObject({
      actionClass: 'approved_admin_write',
      riskLevel: 'critical',
      approvalRequired: true,
    });
    expect(fingerprint.fingerprintHash).toMatch(/^sha256:/);
    expect(intent.actionClass).toBe('approved_admin_write');
    expect(dryRun.targetFingerprintHash).toBe(fingerprint.fingerprintHash);
    expect(deniedAuthority.allowed).toBe(false);
    expect(approvedAuthority.allowed).toBe(true);
    expect(approvedAuthority.requestBodyAuthorityAccepted).toBe(false);
    expect(run.status).toBe('authorized');
    expect(run.liveActionAllowed).toBe(true);
    expect(run.executionDisabled).toBe(true);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(JSON.stringify(run)).not.toContain('private business admin member row');
  });

  it('blocks credential admin actions before authority can execute', () => {
    const fingerprint = createUiTargetFingerprint({
      targetSeed: 'private credential field',
      selectorSeed: 'credential input selector',
    });
    const intent = planAdminWriteIntent({
      actionKind: 'credential-input',
      targetSeed: 'private credential field',
      fingerprint,
    });
    const dryRun = createAdminWriteDryRun(intent, fingerprint);
    const authority = resolveAdminWriteAuthority({
      dryRunPlan: dryRun,
      approvalArtifactSeed: 'stored-admin-approval-credential',
    });
    const run = summarizeAdminWriteRun({ intent, dryRunPlan: dryRun, authority });

    expect(intent.actionClass).toBe('forbidden_credential_action');
    expect(dryRun.credentialActionBlocked).toBe(true);
    expect(authority.allowed).toBe(false);
    expect(authority.credentialMaterialAllowed).toBe(false);
    expect(run.status).toBe('blocked');
    expect(run.liveActionAllowed).toBe(false);
  });
});
