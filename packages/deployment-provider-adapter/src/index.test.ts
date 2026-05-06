import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { DeploymentOperationAction, DeploymentProvider } from '@codexhub/contracts';
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

const sourceDir = dirname(fileURLToPath(import.meta.url));

describe('deployment-provider-adapter', () => {
  it('keeps deployment source free of arbitrary process, shell, and network passthrough', () => {
    const source = readFileSync(join(sourceDir, 'index.ts'), 'utf8');
    const forbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'exec(',
      'execa',
      'shell: true',
      'fetch(',
      'http://',
      'https://',
      'kubectl apply',
      'helm upgrade',
      'argocd app sync',
      'terraform apply',
      'tofu apply',
      'docker compose up',
      'rm -rf',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
  });

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

  it('keeps every governed deployment operation fixed-runner and non-destructive', () => {
    const providers: DeploymentProvider[] = [
      'docker',
      'kubernetes',
      'helm',
      'argo-cd',
      'terraform',
      'opentofu',
    ];
    const actions: DeploymentOperationAction[] = ['deploy', 'apply', 'sync', 'rollback'];
    const records = providers.flatMap((provider) =>
      actions.map((action) => {
        const rollbackPlan =
          action === 'rollback'
            ? createDeploymentRollbackPlan({
                provider,
                environment: 'prod',
                target: `${provider} production target stays transient`,
                sourceRun: `${provider} source run`,
                rollbackArtifact: `${provider} rollback artifact`,
              })
            : undefined;
        const plan = createDeploymentOperationPlan({
          provider,
          action,
          environment: 'prod',
          target: `${provider} production target stays transient`,
          artifact: `${provider} operation artifact stays transient`,
          rollbackPlan,
          runnerMode: 'controlled-deployment-operation',
        });
        const run = createDeploymentOperationRun({
          plan,
          rollbackPlan,
          approvalArtifactIds: ['approval_primary', 'approval_secondary'],
          processBoundaryInvoked: true,
          externalProcessStarted: true,
        });

        expect(plan.fixedRunner).toBe(true);
        expect(plan.arbitraryCommandAllowed).toBe(false);
        expect(plan.rawManifestStored).toBe(false);
        expect(plan.rawPlanStored).toBe(false);
        expect(plan.rawDiffStored).toBe(false);
        expect(plan.rawLogStored).toBe(false);
        expect(run.fixedRunner).toBe(true);
        expect(run.noDelete).toBe(true);
        expect(run.noDestroy).toBe(true);
        expect(run.arbitraryCommandAllowed).toBe(false);
        expect(run.rawManifestStored).toBe(false);
        expect(run.rawPlanStored).toBe(false);
        expect(run.rawDiffStored).toBe(false);
        expect(run.rawLogStored).toBe(false);
        expect(run.networkBoundaryInvoked).toBe(false);

        return { plan, run, rollbackPlan };
      }),
    );
    const serialized = JSON.stringify(records);

    expect(serialized).not.toContain('production target stays transient');
    expect(serialized).not.toContain('operation artifact stays transient');
    expect(serialized).not.toContain('rollback artifact');
  });
});
