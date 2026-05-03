import { type EvidenceRef } from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';
import { type NxVerificationAdapterExecuteResult } from './execute';
import { type NxVerificationAdapterPlan } from './plan';
import { type NxVerificationProcessBoundaryResult } from './process-boundary';

export function createNxVerificationPlanEvidence(
  plan: NxVerificationAdapterPlan,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'verification.dry_run_plan',
    label: 'nx-verification-adapter-plan',
    summary: `Nx verification plan ${plan.status}`,
    metadata: {
      adapterName: plan.adapterName,
      planId: plan.id,
      dryRunId: plan.dryRunId,
      status: plan.status,
      cwdHash: plan.cwdHash,
      targets: plan.targets,
      baseRef: plan.baseRef,
      headRef: plan.headRef,
      affectedProjectsCommandHash: plan.affectedProjectsCommandHash,
      verificationCommandHash: plan.verificationCommandHash,
      processBoundaryPlanned: plan.processBoundaryPlanned,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      blockReasons: plan.blockReasons,
    },
  });
}

export function createNxVerificationCommandEvidence(
  boundaryResult: NxVerificationProcessBoundaryResult,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'verification.command_summary',
    label: `nx-verification-adapter-${boundaryResult.step}`,
    summary: boundaryResult.outputSummary,
    metadata: {
      dryRunId: boundaryResult.dryRunId,
      step: boundaryResult.step,
      status: boundaryResult.status,
      commandHash: boundaryResult.commandHash,
      cwdHash: boundaryResult.cwdHash,
      targets: boundaryResult.targets,
      exitCode: boundaryResult.exitCode,
      startFailureKind: boundaryResult.startFailureKind,
      stdoutHash: boundaryResult.stdoutHash,
      stderrHash: boundaryResult.stderrHash,
      stdoutLineCount: boundaryResult.stdoutLineCount,
      stderrLineCount: boundaryResult.stderrLineCount,
      affectedProjectNames: boundaryResult.affectedProjects.map((project) => project.name),
      outputBodyStored: false,
      processBoundaryInvoked: true,
      externalProcessStarted: boundaryResult.externalProcessStarted,
      noRealWrite: true,
    },
  });
}

export function createNxVerificationRunEvidence(
  result: Pick<
    NxVerificationAdapterExecuteResult,
    'status' | 'affectedProjects' | 'commandResults'
  >,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'verification.run_summary',
    label: 'nx-verification-adapter-run',
    summary: `Nx verification run ${result.status}`,
    metadata: {
      status: result.status,
      affectedProjectNames: result.affectedProjects.map((project) => project.name),
      commandResultCount: result.commandResults.length,
      outputBodyStored: false,
      noRealWrite: true,
    },
  });
}
