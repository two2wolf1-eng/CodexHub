import { createHash } from 'node:crypto';
import {
  type EvidenceRef,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export interface EvidenceInput {
  kind: EvidenceRef['kind'];
  label: string;
  metadata?: Record<string, unknown>;
  bodyForHashOnly?: string;
}

export interface EvidenceCollector {
  collect(input: EvidenceInput): Promise<EvidenceRef>;
}

export class MetadataOnlyEvidenceCollector implements EvidenceCollector {
  async collect(input: EvidenceInput): Promise<EvidenceRef> {
    return createEvidenceRef(input);
  }
}

export function createEvidenceRef(input: EvidenceInput): EvidenceRef {
  const redactedMetadata = redactMetadata(input.metadata ?? {});
  const hashInput = JSON.stringify({
    label: input.label,
    metadata: redactedMetadata,
    bodyHash: input.bodyForHashOnly ? hashText(input.bodyForHashOnly) : undefined,
  });

  return {
    id: foundationId('evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    kind: input.kind,
    hash: `sha256:${hashText(hashInput)}`,
    redacted: true,
    labels: [input.label],
    metadata: redactedMetadata,
  };
}

export function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (/token|cookie|session|secret|password|mfa/i.test(key)) {
      redacted[key] = '[redacted]';
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

