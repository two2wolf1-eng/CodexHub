import {
  ElectronRendererObservationSummarySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CodexDesktopDiagnosticHint,
  type ElectronRendererObservationSummary,
  type UiAutomationActionKind,
  type UiAutomationAuthority,
  type UiAutomationDryRunPlan,
  type UiAutomationIntent,
  type UiAutomationRun,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  applyUiActionAuthority,
  createUiActionDryRun,
  planUiAutomationIntent,
  summarizeUiAutomationResult,
} from '@codexhub/ui-automation-kernel';

export interface CodexDesktopRendererObservationInput {
  sourceSeed: string;
  endpointSeed: string;
  targetSeed: string;
  domObservationSummaryId?: string;
  consoleErrorCount?: number;
  networkFailedRequestCount?: number;
  uiResponsive?: boolean;
  appServerResponsive?: boolean;
  quotaAvailable?: boolean;
  loggedIn?: boolean;
  workspaceMatched?: boolean;
  diagnosticHints?: readonly CodexDesktopDiagnosticHint[];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexDesktopRendererUiAutomationBoundaryInput {
  actionKind: UiAutomationActionKind;
  targetSeed: string;
  selectorManifestSeed?: string;
  approvalArtifactSeed?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexDesktopRendererUiAutomationBoundary {
  intent: UiAutomationIntent;
  dryRunPlan: UiAutomationDryRunPlan;
  authority: UiAutomationAuthority;
  run: UiAutomationRun;
  rendererOnly: true;
  mainInspectorUsed: false;
  executionBoundaryInvoked: false;
}

export function summarizeCodexDesktopRendererObservation(
  input: CodexDesktopRendererObservationInput,
): ElectronRendererObservationSummary {
  const diagnosticHints = new Set<CodexDesktopDiagnosticHint>(input.diagnosticHints ?? []);

  if (input.uiResponsive === false) diagnosticHints.add('desktop_ui_frozen');
  if (input.appServerResponsive === false) diagnosticHints.add('app_server_unresponsive');
  if (input.quotaAvailable === false) diagnosticHints.add('quota_depleted');
  if (input.loggedIn === false) diagnosticHints.add('codex_logged_out');
  if (input.workspaceMatched === false) diagnosticHints.add('workspace_mismatch');

  return ElectronRendererObservationSummarySchema.parse({
    id: foundationId('electron_renderer_observation_summary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    sourceId: foundationId('ui_observation_source'),
    endpointHash: hashRef(input.endpointSeed),
    targetIdHash: hashRef(input.targetSeed),
    rendererTarget: true,
    mainInspectorUsed: false,
    domObservationSummaryId: input.domObservationSummaryId,
    consoleErrorCount: Math.max(0, Math.trunc(input.consoleErrorCount ?? 0)),
    networkFailedRequestCount: Math.max(
      0,
      Math.trunc(input.networkFailedRequestCount ?? 0),
    ),
    uiResponsive: input.uiResponsive ?? diagnosticHints.size === 0,
    diagnosticHints: diagnosticHints.size > 0 ? [...diagnosticHints] : ['unknown'],
    rawDomStored: false,
    rawTextStored: false,
    networkBodyStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Codex Desktop renderer observation stores only target hashes, counts, and health hints.',
  });
}

export function createCodexDesktopRendererUiAutomationBoundary(
  input: CodexDesktopRendererUiAutomationBoundaryInput,
): CodexDesktopRendererUiAutomationBoundary {
  const intent = planUiAutomationIntent({
    actionKind: input.actionKind,
    targetSeed: input.targetSeed,
    selectorManifestSeed: input.selectorManifestSeed,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
  });
  const dryRunPlan = createUiActionDryRun(intent);
  const authority = applyUiActionAuthority({
    dryRunPlan,
    approvalArtifactSeed: input.approvalArtifactSeed,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
  });
  const run = summarizeUiAutomationResult({
    intent,
    dryRunPlan,
    authority,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
  });

  return {
    intent,
    dryRunPlan,
    authority,
    run,
    rendererOnly: true,
    mainInspectorUsed: false,
    executionBoundaryInvoked: false,
  };
}

function hashRef(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}
