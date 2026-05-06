import { describe, expect, it } from 'vitest';
import {
  createConfiguredSecretReferenceSummary,
  createSecretEnvironmentReadiness,
  createSecretLeakAuditSummary,
  createSecretProviderManifest,
  createSecretProviderReadiness,
  createSecretReadinessApprovalRecord,
  createSecretReadinessPlan,
  createSecretReadinessRun,
  runSecretGovernanceAcceptanceRehearsal,
} from './index';

describe('secret-governance-kernel', () => {
  it('creates configured/hash-only secret readiness without reading secret values', () => {
    const manifest = createSecretProviderManifest({ provider: 'vault' });
    const reference = createConfiguredSecretReferenceSummary({
      provider: 'vault',
      environment: 'prod',
      reference: 'secret/data/prod/payment-api',
      purpose: 'payment api runtime value',
      configured: true,
    });
    const providerReadiness = createSecretProviderReadiness({
      provider: 'vault',
      governanceEnabled: true,
      providerEnabled: true,
      configured: true,
      config: 'VAULT_ADDR=https://vault.internal',
      referenceSummaries: [reference],
    });
    const environmentReadiness = createSecretEnvironmentReadiness({
      environment: 'prod',
      governanceEnabled: true,
      providerReadiness: [providerReadiness],
    });
    const leakAudit = createSecretLeakAuditSummary({ scannedSurfaceCount: 7 });
    const plan = createSecretReadinessPlan({
      provider: 'vault',
      environment: 'prod',
      config: 'VAULT_ADDR=https://vault.internal',
      expectedReferenceCount: 1,
    });
    const approval = createSecretReadinessApprovalRecord({
      dryRunRecord: plan,
      status: 'approved',
      decidedBy: 'operator',
      reason: 'raw approval reason is hashed',
    });
    const run = createSecretReadinessRun({
      plan,
      providerReadiness,
      environmentReadiness,
      referenceSummaries: [reference],
      leakAuditSummary: leakAudit,
    });
    const rehearsal = runSecretGovernanceAcceptanceRehearsal({
      provider: 'vault',
      environment: 'prod',
      scenario: 'secret-value-rejected',
    });
    const serialized = JSON.stringify([
      manifest,
      reference,
      providerReadiness,
      environmentReadiness,
      leakAudit,
      plan,
      approval,
      run,
      rehearsal,
    ]);

    expect(manifest.secretValueReadAllowed).toBe(false);
    expect(providerReadiness.blockerCount).toBe(0);
    expect(run.secretValueStored).toBe(false);
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(rehearsal.status).toBe('blocked');
    expect(serialized).not.toContain('secret/data/prod/payment-api');
    expect(serialized).not.toContain('payment api runtime value');
    expect(serialized).not.toContain('VAULT_ADDR');
    expect(serialized).not.toContain('raw approval reason');
  });
});
