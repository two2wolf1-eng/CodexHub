import { describe, expect, it } from 'vitest';
import type { SecretProvider } from '@codexhub/contracts';
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

  it('keeps all secret providers configured/hash-only with adversarial env values', () => {
    const providers: SecretProvider[] = ['vault', 'sops', 'onepassword', 'doppler'];
    const rawValues = {
      reference: 'secret/data/prod/db-password',
      purpose: 'database password runtime value',
      config:
        'VAULT_TOKEN=raw-token\nSOPS_AGE_KEY=AGE-SECRET-KEY\nOP_SERVICE_ACCOUNT_TOKEN=secret\nDOPPLER_TOKEN=secret',
      env: 'DATABASE_URL=postgres://user:password@localhost/db',
      privateKey: '-----BEGIN PRIVATE KEY-----raw secret key-----END PRIVATE KEY-----',
    };
    const records = providers.flatMap((provider) => {
      const reference = createConfiguredSecretReferenceSummary({
        provider,
        environment: 'prod',
        reference: `${provider}:${rawValues.reference}`,
        purpose: `${provider}:${rawValues.purpose}`,
        configured: true,
      });
      const providerReadiness = createSecretProviderReadiness({
        provider,
        governanceEnabled: true,
        providerEnabled: true,
        configured: true,
        config: `${provider}:${rawValues.config}\n${rawValues.env}\n${rawValues.privateKey}`,
        referenceSummaries: [reference],
      });
      const plan = createSecretReadinessPlan({
        provider,
        environment: 'prod',
        config: `${provider}:${rawValues.config}\n${rawValues.env}\n${rawValues.privateKey}`,
        expectedReferenceCount: 1,
      });
      const run = createSecretReadinessRun({
        plan,
        providerReadiness,
        referenceSummaries: [reference],
      });

      expect(reference.secretValueStored).toBe(false);
      expect(reference.rawReferenceStored).toBe(false);
      expect(providerReadiness.secretValueReadAllowed).toBe(false);
      expect(providerReadiness.secretValueStored).toBe(false);
      expect(providerReadiness.envValueStored).toBe(false);
      expect(run.secretValueStored).toBe(false);
      expect(run.envValueStored).toBe(false);
      expect(run.networkBoundaryInvoked).toBe(false);

      return [reference, providerReadiness, plan, run];
    });
    const serialized = JSON.stringify(records);

    for (const rawValue of Object.values(rawValues)) {
      expect(serialized).not.toContain(rawValue);
    }
    expect(serialized).not.toContain('DATABASE_URL');
    expect(serialized).not.toContain('BEGIN PRIVATE KEY');
    expect(serialized).not.toContain('raw-token');
  });
});
