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
  summary?: string;
  metadata?: Record<string, unknown>;
  bodyForHashOnly?: string;
  expiresAt?: string;
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
    summary: input.summary ?? input.label,
    hash: `sha256:${hashText(hashInput)}`,
    expiresAt: input.expiresAt,
    redacted: true,
    labels: [input.label],
    metadata: redactedMetadata,
  };
}

export function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return redactMetadataRecord(metadata);
}

function redactMetadataRecord(metadata: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    redacted[key] = redactMetadataValue(key, value);
  }

  return redacted;
}

function redactMetadataValue(key: string, value: unknown): unknown {
  if (isSensitiveMetadataKey(key)) {
    return '[redacted]';
  }

  if (isPathMetadataKey(key)) {
    return redactPathMetadataValue(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactArrayItem(item));
  }

  if (isPlainObject(value)) {
    return redactMetadataRecord(value);
  }

  return value;
}

function redactArrayItem(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactArrayItem(item));
  }

  if (isPlainObject(value)) {
    return redactMetadataRecord(value);
  }

  return value;
}

function redactPathMetadataValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return `sha256:${hashText(value)}`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactPathMetadataValue(item));
  }

  if (isPlainObject(value)) {
    const redacted: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      redacted[key] = redactPathMetadataValue(nestedValue);
    }

    return redacted;
  }

  return value;
}

function isSensitiveMetadataKey(key: string): boolean {
  return /token|cookie|session|secret|password|mfa|authorization|credential|apikey|accesskey|refresh|privatekey/i.test(
    key,
  );
}

function isPathMetadataKey(key: string): boolean {
  if (/hash$/i.test(key)) {
    return false;
  }

  return /^(profilePath|worktreePath|configPath|executablePath|cwd|path)$/i.test(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
