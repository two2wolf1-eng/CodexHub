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
      'kubectl delete',
      'kubectl scale',
      'kubectl rollout restart',
      'helm upgrade',
      'helm uninstall',
      'helm rollback',
      'argocd app sync',
      'argocd app delete',
      'argocd app rollback',
      'terraform apply',
      'terraform destroy',
      'tofu apply',
      'tofu destroy',
      'docker compose up',
      'docker push',
      'docker rm',
      'docker kill',
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

  it('keeps adversarial deployment operation content out of public projections', () => {
    const rawInputs = {
      target: 'https://cluster.example.internal/raw/namespace/path',
      manifest: 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: raw-manifest-body',
      plan: 'terraform plan raw output with + aws_instance.example',
      diff: '--- raw diff body\n+++ mutated deployment payload',
      log: 'kubectl apply raw log output with pod name',
      rollback: 'raw rollback plan body with previous manifest',
      reason: 'operator raw approval reason text',
    };
    const readiness = createDeploymentOperationReadiness({
      provider: 'terraform',
      action: 'apply',
      environment: 'prod',
      operatorEnabled: true,
      providerWriteEnabled: true,
      prodWriteEnabled: true,
      toolConfigured: true,
      target: rawInputs.target,
      artifact: `${rawInputs.manifest}\n${rawInputs.plan}\n${rawInputs.diff}\n${rawInputs.log}`,
    });
    const plan = createDeploymentOperationPlan({
      provider: 'terraform',
      action: 'apply',
      environment: 'prod',
      target: rawInputs.target,
      artifact: `${rawInputs.manifest}\n${rawInputs.plan}\n${rawInputs.diff}\n${rawInputs.log}`,
      runnerMode: 'controlled-deployment-operation',
    });
    const approval = createDeploymentOperationApprovalRecord({
      dryRunRecord: plan,
      status: 'approved',
      approvalSlot: 'primary',
      decidedBy: 'operator-a',
      reason: rawInputs.reason,
    });
    const run = createDeploymentOperationRun({
      plan,
      approvalArtifactIds: [approval.approvalArtifactId],
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      blockReasons: ['fixture_boundary_failure'],
    });
    const rollbackPlan = createDeploymentRollbackPlan({
      provider: 'terraform',
      environment: 'prod',
      target: rawInputs.target,
      sourceRun: run.id,
      rollbackArtifact: rawInputs.rollback,
      approvedRollbackArtifact: rawInputs.rollback,
    });
    const observationPlan = createDeploymentObservationPlan({
      provider: 'terraform',
      target: rawInputs.target,
      requestedObservationKinds: ['status', 'plan', 'diff', 'drift'],
      runnerMode: 'controlled-deployment-readonly',
    });
    const observationRun = createDeploymentObservationRun({
      plan: observationPlan,
      status: 'completed',
      driftDetected: true,
      changedResourceCount: 3,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
    });
    const serialized = JSON.stringify([
      readiness,
      plan,
      approval,
      run,
      rollbackPlan,
      observationPlan,
      observationRun,
    ]);

    for (const rawValue of Object.values(rawInputs)) {
      expect(serialized).not.toContain(rawValue);
    }
    expect(serialized).not.toContain('cluster.example.internal');
    expect(serialized).not.toContain('raw-manifest-body');
    expect(serialized).not.toContain('raw diff body');
    expect(serialized).not.toContain('raw log output');
    expect(run.rawManifestStored).toBe(false);
    expect(run.rawPlanStored).toBe(false);
    expect(run.rawDiffStored).toBe(false);
    expect(run.rawLogStored).toBe(false);
    expect(rollbackPlan.destroyAllowed).toBe(false);
  });
});
