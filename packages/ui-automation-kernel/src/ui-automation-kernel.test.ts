import { describe, expect, it } from 'vitest';
import {
  applyUiActionAuthority,
  classifyUiActionRisk,
  createUiActionDryRun,
  planUiAutomationIntent,
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
});
