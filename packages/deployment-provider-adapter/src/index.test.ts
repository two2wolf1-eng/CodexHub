import { describe, expect, it } from 'vitest';
import {
  createDeploymentObservationPlan,
  createDeploymentObservationRun,
  createDeploymentOperationApprovalRecord,
  createDeploymentOperationPlan,
  createDeploymentOperationReadiness,
  createDeploymentOperationRun,
  createDeploymentRollbackPlan,
  createDeploymentProviderManifest,
  createDeploymentReadiness,
  runDeploymentAcceptanceRehearsal,
  runDeploymentOperationAcceptanceRehearsal,
} from './index';

describe('deployment-provider-adapter', () => {
  it('creates read-only deployment metadata without raw provider output', () => {
    const manifest = createDeploymentProviderManifest({ provider: 'terraform' });
    const readiness = createDeploymentReadiness({
      provider: 'terraform',
      observerEnabled: true,
      providerEnabled: true,
      toolConfigured: true,
      target: 'production workspace path is hashed',
    });
    const plan = createDeploymentObservationPlan({
      provider: 'terraform',
      target: 'production workspace path is hashed',
      requestedObservationKinds: ['status', 'plan', 'diff', 'drift'],
      runnerMode: 'fixture',
    });
    const run = createDeploymentObservationRun({
      plan,
      driftDetected: true,
      changedResourceCount: 2,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const rehearsal = runDeploymentAcceptanceRehearsal({
      provider: 'terraform',
      scenario: 'drift-detected',
    });
    const serialized = JSON.stringify([manifest, readiness, plan, run, rehearsal]);

    expect(manifest.applyAllowed).toBe(false);
    expect(readiness.blockerCount).toBe(0);
    expect(run.noRealWrite).toBe(true);
    expect(run.driftSummary?.driftDetected).toBe(true);
    expect(rehearsal.status).toBe('blocked');
    expect(serialized).not.toContain('production workspace path');
    expect(serialized).not.toContain('terraform plan raw output');
  });

  it('creates governed deployment operation metadata without raw manifests or plans', () => {
    const readiness = createDeploymentOperationReadiness({
      provider: 'kubernetes',
      action: 'apply',
      environment: 'prod',
      operatorEnabled: true,
      providerWriteEnabled: true,
      prodWriteEnabled: true,
      toolConfigured: true,
      target: 'prod cluster namespace path is hashed',
      artifact: 'raw manifest body is never stored',
    });
    const plan = createDeploymentOperationPlan({
      provider: 'kubernetes',
      action: 'apply',
      environment: 'prod',
      target: 'prod cluster namespace path is hashed',
      artifact: 'raw manifest body is never stored',
      runnerMode: 'fixture',
    });
    const primaryApproval = createDeploymentOperationApprovalRecord({
      dryRunRecord: plan,
      status: 'approved',
      approvalSlot: 'primary',
      decidedBy: 'primary-operator',
      reason: 'raw reason text is hashed',
    });
    const secondaryApproval = createDeploymentOperationApprovalRecord({
      dryRunRecord: plan,
      status: 'approved',
      approvalSlot: 'secondary',
      decidedBy: 'secondary-operator',
      reason: 'raw reason text is hashed',
    });
    const run = createDeploymentOperationRun({
      plan,
      approvalArtifactIds: [
        primaryApproval.approvalArtifactId,
        secondaryApproval.approvalArtifactId,
      ],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const rollbackPlan = createDeploymentRollbackPlan({
      provider: 'helm',
      environment: 'staging',
      target: 'helm release target is hashed',
      sourceRun: run.id,
      rollbackArtifact: 'approved previous revision metadata',
    });
    const rehearsal = runDeploymentOperationAcceptanceRehearsal({
      provider: 'helm',
      action: 'rollback',
      environment: 'staging',
      scenario: 'rollback-plan-missing',
    });
    const serialized = JSON.stringify([
      readiness,
      plan,
      primaryApproval,
      secondaryApproval,
      run,
      rollbackPlan,
      rehearsal,
    ]);

    expect(readiness.approvalPolicy.requiredApprovalCount).toBe(2);
    expect(primaryApproval.approverHash).not.toBe(secondaryApproval.approverHash);
    expect(run.status).toBe('completed');
    expect(run.rawManifestStored).toBe(false);
    expect(rollbackPlan.destroyAllowed).toBe(false);
    expect(rehearsal.status).toBe('blocked');
    expect(serialized).not.toContain('prod cluster namespace path');
    expect(serialized).not.toContain('raw manifest body');
    expect(serialized).not.toContain('raw reason text');
  });
});
