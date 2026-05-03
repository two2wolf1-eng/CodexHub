import {
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  type CapabilityManifest,
  type EvidenceRef,
  type ExecutionAuthority,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { describe, expect, it } from 'vitest';
import {
  assertCapabilityAdapterValidation,
  validateCapabilityExecutionEnvelope,
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from './index';

const createdAt = '2026-05-03T00:00:00.000Z';

function createManifest(overrides: Partial<CapabilityManifest> = {}): CapabilityManifest {
  return {
    id: 'capability_manifest_test',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    name: 'test-adapter',
    kind: 'verification',
    version: '0.1.0-test',
    provider: 'builtin',
    capabilities: ['metadata-only-test'],
    defaultRisk: 'low',
    defaultActionMode: 'read',
    requiresApprovalByDefault: false,
    evidencePolicy: {
      collect: true,
      redactMetadata: true,
      bodyStorage: 'hash-only',
    },
    processBoundary: {
      mayStartExternalProcess: false,
      requiresProcessAudit: false,
    },
    metadata: {
      authorityProvider: 'codexhub',
    },
    ...overrides,
  };
}

function createEvidenceRef(id = 'evidence_1'): EvidenceRef {
  return {
    id,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    kind: 'hash',
    summary: 'metadata-only evidence',
    hash: 'sha256:test',
    redacted: true,
    labels: ['capability-adapter-kernel'],
    metadata: {
      bodyStored: false,
    },
  };
}

function createAuthority(overrides: Partial<ExecutionAuthority> = {}): ExecutionAuthority {
  return {
    id: 'execution_authority_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    policyDecisionId: 'policy_1',
    allowed: true,
    constraints: ['metadata-only'],
    ...overrides,
  };
}

function createAuditEvent(evidenceRefs: EvidenceRef[]): CapabilityAuditEvent {
  return {
    id: 'audit_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    actor: 'codexhub.test',
    action: 'test.execute',
    target: 'test-target',
    reason: 'test execution envelope',
    outcome: 'completed',
    policyDecisionId: 'policy_1',
    evidenceRefs,
    metadata: {
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    },
  };
}

function createCapabilityResult(
  evidenceRefs: EvidenceRef[],
  auditEvents: CapabilityAuditEvent[],
  overrides: Partial<CapabilityExecutionResult> = {},
): CapabilityExecutionResult {
  return {
    id: 'capability_execution_result_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status: 'completed',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: evidenceRefs.map((ref) => ref.id),
    auditEventIds: auditEvents.map((event) => event.id),
    summary: 'Capability execution completed.',
    ...overrides,
  };
}

describe('capability-adapter-kernel', () => {
  it('accepts a manifest that preserves CodexHub authority and evidence policy', () => {
    const result = validateCapabilityManifest(createManifest());

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects manifests that can start a process without process audit', () => {
    const result = validateCapabilityManifest(
      createManifest({
        processBoundary: {
          mayStartExternalProcess: true,
          requiresProcessAudit: false,
        },
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('process_boundary_audit_required');
  });

  it('rejects dry-run plans that already crossed a process boundary or stored bodies', () => {
    const manifest = createManifest();
    const result = validateCapabilityPlanEnvelope({
      adapterName: manifest.name,
      status: 'ready',
      manifest,
      capabilityDryRun: {
        id: 'capability_dry_run_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        adapterName: manifest.name,
        inputSummary: { bodyStored: false },
        plannedActions: [
          {
            action: 'test.plan',
            actionMode: 'read',
            risk: 'low',
            target: 'test-target',
            requiresApproval: false,
          },
        ],
        requiredEvidence: ['test-evidence'],
        warnings: [],
      },
      processBoundaryPlanned: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      noRealWrite: false,
      bodyStored: true,
      rawPathStored: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'dry_run_must_not_invoke_process_boundary',
        'dry_run_must_not_start_external_process',
        'dry_run_must_be_no_real_write',
        'dry_run_body_storage_forbidden',
        'dry_run_raw_path_storage_forbidden',
      ]),
    );
  });

  it('accepts a metadata-only execution envelope with evidence and audit', () => {
    const manifest = createManifest();
    const evidenceRefs = [createEvidenceRef()];
    const auditEvents = [createAuditEvent(evidenceRefs)];
    const result = validateCapabilityExecutionEnvelope({
      manifest,
      authority: createAuthority(),
      capabilityResult: createCapabilityResult(evidenceRefs, auditEvents),
      evidenceRefs,
      auditEvents,
    });

    expect(result.ok).toBe(true);
    assertCapabilityAdapterValidation(result);
  });

  it('requires approval artifacts when the manifest or call declares approval required', () => {
    const manifest = createManifest({ requiresApprovalByDefault: true });
    const evidenceRefs = [createEvidenceRef()];
    const auditEvents = [createAuditEvent(evidenceRefs)];
    const result = validateCapabilityExecutionEnvelope({
      manifest,
      authority: createAuthority(),
      capabilityResult: createCapabilityResult(evidenceRefs, auditEvents),
      evidenceRefs,
      auditEvents,
      approvalRequired: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('approval_required_execution_requires_persisted_artifact');
  });

  it('rejects impossible process-boundary truth', () => {
    const manifest = createManifest();
    const evidenceRefs = [createEvidenceRef()];
    const auditEvents = [createAuditEvent(evidenceRefs)];
    const result = validateCapabilityExecutionEnvelope({
      manifest,
      authority: createAuthority(),
      capabilityResult: createCapabilityResult(evidenceRefs, auditEvents, {
        processBoundaryInvoked: false,
        externalProcessStarted: true,
      }),
      evidenceRefs,
      auditEvents,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('external_process_started_requires_process_boundary_invoked');
  });
});
