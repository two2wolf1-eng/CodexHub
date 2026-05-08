import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  createBusinessQuotaPermissionProbe,
  createBusinessQuotaSourceProbe,
  createDefaultBusinessQuotaDebugBundle,
  createForbiddenPathProbe,
  createLocalCapabilityProbe,
  createQuotaEvidenceMatrix,
  createQuotaReadinessDebugReport,
} from './index';

const now = () => '2026-05-08T00:00:00.000Z';

describe('business quota debug kernel', () => {
  it('creates a default M61 debug bundle without raw output leaks', () => {
    const bundle = createDefaultBusinessQuotaDebugBundle({ now });
    const records = [
      ...bundle.sourceProbes,
      ...bundle.permissionProbes,
      ...bundle.localCapabilityProbes,
      ...bundle.forbiddenPathProbes,
      bundle.evidenceMatrix,
      bundle.report,
    ];
    const serialized = JSON.stringify(records);

    expect(bundle.sourceProbes[0].sourceKind).toBe('app-server-rate-limits');
    expect(bundle.report.status).toBe('manual_checkpoint');
    expect(bundle.report.recommendedSourceKind).toBe('app-server-rate-limits');
    expect(bundle.report.sourceProbeCount).toBe(bundle.sourceProbes.length);
    expect(bundle.report.permissionProbeCount).toBe(bundle.permissionProbes.length);
    expect(bundle.report.localCapabilityProbeCount).toBe(bundle.localCapabilityProbes.length);
    expect(bundle.report.forbiddenPathProbeCount).toBe(bundle.forbiddenPathProbes.length);
    expect(bundle.forbiddenPathProbes.every((probe) => probe.attempted === false)).toBe(true);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);
  });

  it('reaches needs_adapter when source and role are known but live read is still gated', () => {
    const sourceProbe = createBusinessQuotaSourceProbe({
      sourceKind: 'app-server-rate-limits',
      status: 'ready',
      candidateOnly: false,
      now,
    });
    const permissionProbe = createBusinessQuotaPermissionProbe({
      role: 'admin',
      roleDeclaredByHuman: true,
      now,
    });
    const capabilityProbe = createLocalCapabilityProbe({
      capabilityKind: 'codex-app-server',
      status: 'ready',
      appServerMethodCount: 2,
      liveReadAvailable: false,
      now,
    });
    const forbiddenProbe = createForbiddenPathProbe({
      pathKind: 'browser_storage',
      status: 'blocked',
      now,
    });
    const matrix = createQuotaEvidenceMatrix({ now });
    const report = createQuotaReadinessDebugReport({
      sourceProbes: [sourceProbe],
      permissionProbes: [permissionProbe],
      localCapabilityProbes: [capabilityProbe],
      forbiddenPathProbes: [forbiddenProbe],
      matrix,
      now,
    });

    expect(report.status).toBe('needs_adapter');
    expect(report.adapterActivationRecommended).toBe(true);
    expect(report.liveReadReady).toBe(false);
  });

  it('allows go only when source, permission, capability, forbidden-path, and live gates are ready', () => {
    const sourceProbe = createBusinessQuotaSourceProbe({
      sourceKind: 'app-server-rate-limits',
      status: 'ready',
      candidateOnly: false,
      now,
    });
    const permissionProbe = createBusinessQuotaPermissionProbe({
      role: 'owner',
      roleDeclaredByHuman: true,
      now,
    });
    const capabilityProbe = createLocalCapabilityProbe({
      capabilityKind: 'codex-app-server',
      status: 'ready',
      appServerMethodCount: 2,
      liveReadAvailable: true,
      now,
    });
    const forbiddenProbe = createForbiddenPathProbe({
      pathKind: 'browser_storage',
      status: 'verified_absent',
      now,
    });
    const report = createQuotaReadinessDebugReport({
      sourceProbes: [sourceProbe],
      permissionProbes: [permissionProbe],
      localCapabilityProbes: [capabilityProbe],
      forbiddenPathProbes: [forbiddenProbe],
      liveReadReady: true,
      now,
    });

    expect(report.status).toBe('go');
    expect(report.liveReadReady).toBe(true);
    expect(report.adapterActivationRecommended).toBe(false);
  });

  it('keeps the kernel pure and away from adapter or transport authority', () => {
    const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), 'index.ts');
    const sourceText = readFileSync(sourcePath, 'utf8');

    expect(sourceText).not.toContain('@codexhub/chatgpt-business-adapter');
    expect(sourceText).not.toContain('@codexhub/codex-app-server-adapter');
    expect(sourceText).not.toContain('@codexhub/electron-cdp-adapter');
    expect(sourceText).not.toContain('fetch(');
    expect(sourceText).not.toContain('spawn(');
  });
});
