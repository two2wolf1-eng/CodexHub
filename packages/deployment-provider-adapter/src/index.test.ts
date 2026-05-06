import { describe, expect, it } from 'vitest';
import {
  createDeploymentObservationPlan,
  createDeploymentObservationRun,
  createDeploymentProviderManifest,
  createDeploymentReadiness,
  runDeploymentAcceptanceRehearsal,
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
});
