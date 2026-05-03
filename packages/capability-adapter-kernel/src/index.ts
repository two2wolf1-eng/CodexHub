import {
  type CapabilityAuditEvent,
  CapabilityAuditEventSchema,
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type CapabilityExecutionResult,
  CapabilityExecutionResultSchema,
  type CapabilityManifest,
  CapabilityManifestSchema,
  type EvidenceRef,
  EvidenceRefSchema,
  type ExecutionAuthority,
  ExecutionAuthoritySchema,
} from '@codexhub/contracts';

export type CapabilityAdapterValidationScope = 'manifest' | 'plan' | 'execution';

export interface CapabilityAdapterValidationResult {
  ok: boolean;
  scope: CapabilityAdapterValidationScope;
  errors: string[];
  warnings: string[];
}

export interface CapabilityAdapterPlanEnvelope {
  adapterName: string;
  status: string;
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
  processBoundaryPlanned: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted: boolean;
  noRealWrite: boolean;
  bodyStored: boolean;
  rawPathStored?: boolean;
  blockReasons?: readonly string[];
  warnings?: readonly string[];
}

export interface CapabilityAdapterExecutionEnvelope {
  manifest: CapabilityManifest;
  authority?: ExecutionAuthority;
  capabilityResult: CapabilityExecutionResult;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  approvalRequired?: boolean;
}

export interface CapabilityAdapterDefinition<PlanInput, Plan, ExecuteInput, ExecuteResult> {
  manifest: CapabilityManifest;
  plan(input: PlanInput): Plan;
  execute(input: ExecuteInput): Promise<ExecuteResult>;
}

export function validateCapabilityManifest(
  manifest: CapabilityManifest,
): CapabilityAdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed = CapabilityManifestSchema.safeParse(manifest);

  if (!parsed.success) {
    errors.push('capability_manifest_schema_invalid');
    return createValidationResult('manifest', errors, warnings);
  }

  if (!manifest.evidencePolicy.collect) {
    errors.push('evidence_collection_required');
  }

  if (!manifest.evidencePolicy.redactMetadata) {
    errors.push('evidence_metadata_redaction_required');
  }

  if (
    manifest.processBoundary.mayStartExternalProcess &&
    !manifest.processBoundary.requiresProcessAudit
  ) {
    errors.push('process_boundary_audit_required');
  }

  if (
    (manifest.defaultActionMode === 'write' || manifest.defaultActionMode === 'admin') &&
    !manifest.requiresApprovalByDefault
  ) {
    errors.push('write_or_admin_requires_default_approval');
  }

  if (
    manifest.evidencePolicy.bodyStorage === 'allowed-with-approval' &&
    !manifest.requiresApprovalByDefault
  ) {
    errors.push('body_storage_with_approval_requires_default_approval');
  }

  if (!manifest.metadata || manifest.metadata.authorityProvider !== 'codexhub') {
    warnings.push('authority_provider_metadata_missing_or_nonstandard');
  }

  return createValidationResult('manifest', errors, warnings);
}

export function validateCapabilityPlanEnvelope(
  envelope: CapabilityAdapterPlanEnvelope,
): CapabilityAdapterValidationResult {
  const errors: string[] = [];
  const warnings = [...(envelope.warnings ?? [])];
  const manifestResult = validateCapabilityManifest(envelope.manifest);
  const dryRunResult = CapabilityDryRunSchema.safeParse(envelope.capabilityDryRun);

  errors.push(...manifestResult.errors);
  warnings.push(...manifestResult.warnings);

  if (!dryRunResult.success) {
    errors.push('capability_dry_run_schema_invalid');
  }

  if (envelope.adapterName !== envelope.manifest.name) {
    errors.push('adapter_name_manifest_mismatch');
  }

  if (envelope.capabilityDryRun.adapterName !== envelope.adapterName) {
    errors.push('dry_run_adapter_name_mismatch');
  }

  if (envelope.processBoundaryInvoked === true) {
    errors.push('dry_run_must_not_invoke_process_boundary');
  }

  if (envelope.externalProcessStarted) {
    errors.push('dry_run_must_not_start_external_process');
  }

  if (!envelope.noRealWrite) {
    errors.push('dry_run_must_be_no_real_write');
  }

  if (envelope.bodyStored) {
    errors.push('dry_run_body_storage_forbidden');
  }

  if (envelope.rawPathStored === true) {
    errors.push('dry_run_raw_path_storage_forbidden');
  }

  for (const action of envelope.capabilityDryRun.plannedActions) {
    if ((action.actionMode === 'write' || action.actionMode === 'admin') && !action.requiresApproval) {
      errors.push('planned_write_or_admin_action_requires_approval');
    }
  }

  if (envelope.status === 'blocked' && envelope.processBoundaryPlanned) {
    errors.push('blocked_plan_must_not_plan_process_boundary');
  }

  return createValidationResult('plan', unique(errors), unique(warnings));
}

export function validateCapabilityExecutionEnvelope(
  envelope: CapabilityAdapterExecutionEnvelope,
): CapabilityAdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const manifestResult = validateCapabilityManifest(envelope.manifest);
  const authorityResult = envelope.authority
    ? ExecutionAuthoritySchema.safeParse(envelope.authority)
    : undefined;
  const result = CapabilityExecutionResultSchema.safeParse(envelope.capabilityResult);
  const evidenceResults = envelope.evidenceRefs.map((ref) => EvidenceRefSchema.safeParse(ref));
  const auditResults = envelope.auditEvents.map((event) =>
    CapabilityAuditEventSchema.safeParse(event),
  );

  errors.push(...manifestResult.errors);
  warnings.push(...manifestResult.warnings);

  if (!result.success) {
    errors.push('capability_execution_result_schema_invalid');
  }

  if (authorityResult?.success === false) {
    errors.push('execution_authority_schema_invalid');
  }

  if (envelope.capabilityResult.externalProcessStarted && !envelope.capabilityResult.processBoundaryInvoked) {
    errors.push('external_process_started_requires_process_boundary_invoked');
  }

  if (
    envelope.capabilityResult.status === 'blocked' &&
    (envelope.capabilityResult.processBoundaryInvoked ||
      envelope.capabilityResult.externalProcessStarted)
  ) {
    errors.push('blocked_execution_must_not_cross_process_boundary');
  }

  const executionNeedsAuthority = envelope.capabilityResult.status !== 'blocked';
  if (executionNeedsAuthority && !envelope.authority) {
    errors.push('non_blocked_execution_requires_authority');
  }

  if (executionNeedsAuthority && envelope.authority && !envelope.authority.allowed) {
    errors.push('non_blocked_execution_requires_allowed_authority');
  }

  const manifestImpliesApproval =
    envelope.manifest.requiresApprovalByDefault ||
    envelope.manifest.defaultActionMode === 'write' ||
    envelope.manifest.defaultActionMode === 'admin';
  const approvalRequired = envelope.approvalRequired ?? manifestImpliesApproval;

  if (
    executionNeedsAuthority &&
    approvalRequired &&
    (!envelope.authority?.approvalArtifactId ||
      envelope.authority.approvalArtifactId.trim().length === 0)
  ) {
    errors.push('approval_required_execution_requires_persisted_artifact');
  }

  if (!envelope.capabilityResult.noRealWrite) {
    errors.push('capability_result_must_be_no_real_write_in_foundation');
  }

  if (envelope.evidenceRefs.length === 0) {
    errors.push('execution_evidence_required');
  }

  if (envelope.auditEvents.length === 0) {
    errors.push('execution_audit_required');
  }

  if (evidenceResults.some((item) => !item.success)) {
    errors.push('execution_evidence_schema_invalid');
  }

  if (auditResults.some((item) => !item.success)) {
    errors.push('execution_audit_schema_invalid');
  }

  const evidenceIds = new Set(envelope.evidenceRefs.map((ref) => ref.id));
  for (const evidenceId of envelope.capabilityResult.evidenceRefs) {
    if (!evidenceIds.has(evidenceId)) {
      errors.push('capability_result_references_missing_evidence');
    }
  }

  const auditIds = new Set(envelope.auditEvents.map((event) => event.id));
  for (const auditEventId of envelope.capabilityResult.auditEventIds) {
    if (!auditIds.has(auditEventId)) {
      errors.push('capability_result_references_missing_audit_event');
    }
  }

  for (const auditEvent of envelope.auditEvents) {
    if (auditEvent.policyDecisionId === 'blocked-before-policy') {
      warnings.push('audit_event_recorded_before_policy_decision');
    }

    if (!auditEvent.metadata || auditEvent.metadata.liveExecution === undefined) {
      errors.push('audit_event_live_execution_metadata_required');
    }

    if (!auditEvent.metadata || auditEvent.metadata.externalProcessStarted === undefined) {
      errors.push('audit_event_external_process_started_metadata_required');
    }

    for (const ref of auditEvent.evidenceRefs) {
      if (!evidenceIds.has(ref.id)) {
        errors.push('audit_event_references_missing_evidence');
      }
    }
  }

  return createValidationResult('execution', unique(errors), unique(warnings));
}

export function assertCapabilityAdapterValidation(
  result: CapabilityAdapterValidationResult,
): void {
  if (!result.ok) {
    throw new Error(
      `Capability adapter ${result.scope} validation failed: ${result.errors.join(', ')}`,
    );
  }
}

function createValidationResult(
  scope: CapabilityAdapterValidationScope,
  errors: string[],
  warnings: string[],
): CapabilityAdapterValidationResult {
  return {
    ok: errors.length === 0,
    scope,
    errors,
    warnings,
  };
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
