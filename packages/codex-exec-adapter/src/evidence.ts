import { type EvidenceRef } from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';
import { type CodexExecAdapterEventSummary } from './event-normalizer';
import { type CodexExecAdapterPlan } from './plan';

export function createCodexExecAdapterPlanEvidence(plan: CodexExecAdapterPlan): EvidenceRef {
  return createEvidenceRef({
    kind: 'codex.exec.dry_run_plan',
    label: 'codex-exec-adapter-plan',
    summary: `Codex CLI adapter plan ${plan.status}`,
    metadata: {
      adapterName: plan.adapterName,
      planId: plan.id,
      dryRunId: plan.dryRunId,
      status: plan.status,
      cwdHash: plan.cwdHash,
      fixedArgvHash: plan.fixedArgvHash,
      invocationContractVersion: plan.invocationContractVersion,
      processBoundaryPlanned: plan.processBoundaryPlanned,
      externalProcessStarted: plan.externalProcessStarted,
      noRealWrite: plan.noRealWrite,
      bodyStored: false,
      governedInputStatus: plan.governedInput.status,
      governedInputRelativePathHash: plan.governedInput.relativePathHash,
      governedInputContentHash:
        plan.governedInput.contentHash ?? plan.governedInput.expectedContentHash,
      blockReasons: plan.blockReasons,
    },
  });
}

export function createCodexExecAdapterEventEvidence(
  summary: CodexExecAdapterEventSummary,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'codex.exec.event.summary',
    label: 'codex-exec-adapter-event-summary',
    summary: `Codex CLI adapter events: ${summary.finalStatus}`,
    metadata: {
      eventCount: summary.eventCount,
      commandExecutionCount: summary.commandExecutionCount,
      fileChangeCount: summary.fileChangeCount,
      messageCount: summary.messageCount,
      errorCount: summary.errorCount,
      unknownCount: summary.unknownCount,
      finalStatus: summary.finalStatus,
      eventPayloadHashes: summary.eventPayloadHashes,
      rawPayloadStored: false,
    },
  });
}

export function createCodexExecAdapterBoundaryEvidence(input: {
  status: 'completed' | 'failed' | 'blocked' | 'aborted';
  dryRunId: string;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  noRealWrite: boolean;
  stdoutHash?: string;
  stderrHash?: string;
  stdoutLineCount?: number;
  stderrLineCount?: number;
  exitCode?: number;
  blockReasons?: readonly string[];
}): EvidenceRef {
  return createEvidenceRef({
    kind: 'hash',
    label: 'codex-exec-adapter-boundary-summary',
    summary: `Codex CLI adapter boundary ${input.status}`,
    metadata: {
      dryRunId: input.dryRunId,
      status: input.status,
      processBoundaryInvoked: input.processBoundaryInvoked,
      externalProcessStarted: input.externalProcessStarted,
      noRealWrite: input.noRealWrite,
      stdoutHash: input.stdoutHash,
      stderrHash: input.stderrHash,
      stdoutLineCount: input.stdoutLineCount,
      stderrLineCount: input.stderrLineCount,
      exitCode: input.exitCode,
      blockReasons: input.blockReasons,
      stdoutBodyStored: false,
      stderrBodyStored: false,
    },
  });
}
