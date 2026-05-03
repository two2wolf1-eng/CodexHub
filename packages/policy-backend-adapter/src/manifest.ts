import {
  CapabilityManifestSchema,
  SchemaVersionSchema,
  type CapabilityManifest,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const POLICY_BACKEND_ADAPTER_NAME = 'policy-backend-adapter';
export const POLICY_BACKEND_ADAPTER_VERSION = '0.2.0-m7b';

export function createPolicyBackendAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: POLICY_BACKEND_ADAPTER_NAME,
    kind: 'policy',
    version: POLICY_BACKEND_ADAPTER_VERSION,
    provider: 'builtin',
    capabilities: [
      'policy_backend.fixture_raw_evaluation',
      'policy_backend.fixture_config_evaluation',
      'policy_backend.opa_plan_only',
      'policy_backend.cedar_plan_only',
      'policy_backend.normalized_decision_trace',
      'policy_backend.advisory_only',
    ],
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
      integrationStage: 'm7b',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: POLICY_BACKEND_ADAPTER_NAME,
      backendAdvisoryOnly: true,
      fixtureConfigEvaluatorEnabled: true,
      realOpaRuntimeEnabled: false,
      realCedarRuntimeEnabled: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}
