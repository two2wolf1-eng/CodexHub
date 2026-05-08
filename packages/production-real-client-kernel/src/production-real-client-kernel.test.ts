import { describe, expect, it } from 'vitest';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  classifyProductionOperation,
  containsForbiddenProductionRealClientRequestBody,
  createProductionAuditLedgerEntry,
  createProductionEvidenceVaultRecord,
  createProductionRealClientApprovalBinding,
  createProductionRealClientDryRun,
  createProductionRealClientOperationManifest,
  createProductionRealClientRun,
  createProductionRealClientSurfaceRegistration,
  resolveProductionRealClientAuthority,
} from './index';

describe('production-real-client-kernel', () => {
  const now = () => '2026-05-09T00:00:00.000Z';

  it('creates metadata-only governed records for high-risk real client execution', () => {
    const surface = createProductionRealClientSurfaceRegistration({
      surfaceId: 'chatgpt-primary',
      surfaceKind: 'chatgpt-web',
      endpointSeed: adversarialPublicOutputFixture,
      profileSeed: adversarialPublicOutputFixture,
      workspaceSeed: adversarialPublicOutputFixture,
      originSeed: adversarialPublicOutputFixture,
      registeredBySeed: adversarialPublicOutputFixture,
      allowedOperationIds: ['chatgpt.submit_prompt'],
      allowlistedOriginSeeds: [adversarialPublicOutputFixture],
      now,
    });
    const manifest = createProductionRealClientOperationManifest({
      operationId: 'chatgpt.submit_prompt',
      operationKind: 'submitPrompt',
      surfaceKind: 'chatgpt-web',
      capabilityClass: 'high-risk-production',
      selectorSeed: adversarialPublicOutputFixture,
      inputSchemaSeed: adversarialPublicOutputFixture,
      now,
    });
    const dryRun = createProductionRealClientDryRun({
      surface,
      manifest,
      inputRefSeed: adversarialPublicOutputFixture,
      targetSeed: adversarialPublicOutputFixture,
      plannedStepCount: 2,
      now,
    });
    const approval = createProductionRealClientApprovalBinding({
      dryRunId: dryRun.id,
      approvalArtifactSeed: adversarialPublicOutputFixture,
      approverSeed: adversarialPublicOutputFixture,
      reasonSeed: adversarialPublicOutputFixture,
      now,
    });
    const authority = resolveProductionRealClientAuthority({
      dryRun,
      manifest,
      surface,
      approvalBindings: [approval],
      now,
    });
    const run = createProductionRealClientRun({
      dryRun,
      manifest,
      surface,
      authority,
      boundaryReached: true,
      now,
    });
    const evidence = createProductionEvidenceVaultRecord({
      actionId: run.id,
      evidenceLevel: manifest.evidenceLevel,
      artifactSeed: adversarialPublicOutputFixture,
      byteCount: 100,
      itemCount: 1,
      now,
    });
    const audit = createProductionAuditLedgerEntry({
      actionId: run.id,
      actorSeed: adversarialPublicOutputFixture,
      operationKind: manifest.operationKind,
      capabilityClass: manifest.capabilityClass,
      outcome: run.status,
      evidenceVaultRecordIds: [evidence.id],
      authorityRefId: authority.id,
      liveExecution: run.liveActionAllowed,
      boundaryReached: true,
      now,
    });
    const records = [surface, manifest, dryRun, approval, authority, run, evidence, audit];
    const serialized = JSON.stringify(records);

    expect(classifyProductionOperation('codexCliFullAuto')).toBe('break-glass-production');
    expect(dryRun.status).toBe('ready');
    expect(authority.allowed).toBe(true);
    expect(run.liveActionAllowed).toBe(true);
    expect(run.genericCdpPassthroughUsed).toBe(false);
    expect(evidence.secretMaterialStored).toBe(false);
    expect(audit.appendOnly).toBe(true);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);
  });

  it('blocks high-risk execution without approval and rejects forbidden request bodies', () => {
    const surface = createProductionRealClientSurfaceRegistration({
      surfaceId: 'chatgpt-primary',
      surfaceKind: 'chatgpt-web',
      registeredBySeed: 'operator',
      allowedOperationIds: ['chatgpt.submit_prompt'],
      now,
    });
    const manifest = createProductionRealClientOperationManifest({
      operationId: 'chatgpt.submit_prompt',
      operationKind: 'submitPrompt',
      surfaceKind: 'chatgpt-web',
      capabilityClass: 'high-risk-production',
      now,
    });
    const dryRun = createProductionRealClientDryRun({ surface, manifest, now });
    const authority = resolveProductionRealClientAuthority({ dryRun, manifest, surface, now });
    const run = createProductionRealClientRun({ dryRun, manifest, surface, authority, now });

    expect(authority.allowed).toBe(false);
    expect(authority.constraints).toContain('approval-binding-required');
    expect(run.liveActionAllowed).toBe(false);
    expect(run.status).toBe('blocked');
    expect(
      containsForbiddenProductionRealClientRequestBody({
        operationId: 'chatgpt.submit_prompt',
        rawSelector: '#prompt-textarea',
      }),
    ).toBe(true);
    expect(
      containsForbiddenProductionRealClientRequestBody({
        operationId: 'chatgpt.submit_prompt',
        inputRefId: 'input_ref_1',
      }),
    ).toBe(false);
  });

  it('requires two approvals, incident id, and TTL for break-glass authority', () => {
    const surface = createProductionRealClientSurfaceRegistration({
      surfaceId: 'codex-cli-break-glass',
      surfaceKind: 'codex-cli',
      registeredBySeed: 'operator',
      allowedOperationIds: ['codex.full_auto'],
      now,
    });
    const manifest = createProductionRealClientOperationManifest({
      operationId: 'codex.full_auto',
      operationKind: 'codexCliFullAuto',
      surfaceKind: 'codex-cli',
      now,
    });
    const dryRun = createProductionRealClientDryRun({ surface, manifest, now });
    const approvalOne = createProductionRealClientApprovalBinding({
      dryRunId: dryRun.id,
      approvalArtifactSeed: 'approval-one',
      approverSeed: 'operator-a',
      now,
    });
    const approvalTwo = createProductionRealClientApprovalBinding({
      dryRunId: dryRun.id,
      approvalArtifactSeed: 'approval-two',
      approverSeed: 'operator-b',
      now,
    });
    const blockedAuthority = resolveProductionRealClientAuthority({
      dryRun,
      manifest,
      surface,
      approvalBindings: [approvalOne],
      now,
    });
    const allowedAuthority = resolveProductionRealClientAuthority({
      dryRun,
      manifest,
      surface,
      approvalBindings: [approvalOne, approvalTwo],
      incidentIdSeed: 'incident-1',
      ttlSeconds: 900,
      now,
    });
    const e4 = createProductionEvidenceVaultRecord({
      actionId: allowedAuthority.id,
      evidenceLevel: 'E4',
      artifactSeed: 'break-glass-artifact',
      ttlSeconds: 900,
      breakGlassSessionId: 'break_glass_1',
      now,
    });

    expect(blockedAuthority.allowed).toBe(false);
    expect(blockedAuthority.constraints).toContain('two-distinct-approvers-required');
    expect(allowedAuthority.allowed).toBe(true);
    expect(allowedAuthority.expiresAt).toBe('2026-05-09T00:15:00.000Z');
    expect(e4.encrypted).toBe(true);
    expect(e4.rawArtifactStored).toBe(true);
  });
});
