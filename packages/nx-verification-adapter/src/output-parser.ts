import {
  type AffectedProject,
  type VerificationTarget,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface NxVerificationOutputSummary {
  status: 'passed' | 'failed' | 'unknown';
  targetCount: number;
  mentionedTargets: VerificationTarget[];
  failedTaskCount: number;
  rawOutputStored: false;
  summary: string;
}

const allowedTargetSet = new Set<VerificationTarget>(['lint', 'test', 'build']);

export function parseAffectedProjects(output: string): AffectedProject[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith('>') && !line.startsWith('NX '))
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .map((name) => ({
      id: foundationId('affected_project'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      name,
      nameHash: `sha256:${hashText(name)}`,
    }));
}

export function parseVerificationOutput(output: string): NxVerificationOutputSummary {
  const lowerOutput = output.toLowerCase();
  const mentionedTargets = [...allowedTargetSet].filter((target) =>
    lowerOutput.includes(target),
  );
  const failedTaskCount = countMatches(lowerOutput, /failed/g);
  const status =
    lowerOutput.includes('successfully ran') || lowerOutput.includes('successfully run')
      ? 'passed'
      : failedTaskCount > 0
        ? 'failed'
        : 'unknown';

  return {
    status,
    targetCount: mentionedTargets.length,
    mentionedTargets,
    failedTaskCount,
    rawOutputStored: false,
    summary: createVerificationSummary(status, mentionedTargets, failedTaskCount),
  };
}

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function createVerificationSummary(
  status: NxVerificationOutputSummary['status'],
  targets: readonly VerificationTarget[],
  failedTaskCount: number,
): string {
  if (status === 'passed') {
    return `Verification passed for ${targets.length} target(s).`;
  }

  if (status === 'failed') {
    return `Verification failed with ${failedTaskCount} failure marker(s).`;
  }

  return 'Verification output status is unknown.';
}
