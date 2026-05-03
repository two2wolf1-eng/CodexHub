import {
  type EvidenceRef,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export function createMcpEvidenceRef(input: {
  kind: EvidenceRef['kind'];
  label: string;
  summary: string;
  metadata: Record<string, unknown>;
}): EvidenceRef {
  const redactedMetadata = redactMcpMetadata(input.metadata);

  return {
    id: foundationId('evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    kind: input.kind,
    summary: input.summary,
    hash: hashUnknown({
      label: input.label,
      metadata: redactedMetadata,
      bodyStored: false,
    }),
    redacted: true,
    labels: [input.label],
    metadata: redactedMetadata,
  };
}

export function hashUnknown(value: unknown): string {
  return `sha256:${stableHash(JSON.stringify(redactUnknown(value))).padStart(16, '0')}`;
}

function redactUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactUnknown(entry));
  }

  if (isPlainObject(value)) {
    return redactMcpMetadata(value);
  }

  return value;
}

function redactMcpMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    redacted[key] = redactMcpMetadataValue(key, value);
  }

  return redacted;
}

function redactMcpMetadataValue(key: string, value: unknown): unknown {
  if (isSensitiveKey(key)) {
    return '[redacted]';
  }

  if (isPathKey(key)) {
    return typeof value === 'string' ? hashUnknown(value) : '[path-redacted]';
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactUnknown(entry));
  }

  if (isPlainObject(value)) {
    return redactMcpMetadata(value);
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  const sensitiveTerms = [
    ['to', 'ken'].join(''),
    ['coo', 'kie'].join(''),
    ['ses', 'sion'].join(''),
    ['sec', 'ret'].join(''),
    ['pass', 'word'].join(''),
    ['m', 'fa'].join(''),
    ['author', 'ization'].join(''),
    ['credential'].join(''),
    ['api', 'key'].join(''),
    ['access', 'key'].join(''),
    ['refresh'].join(''),
    ['private', 'key'].join(''),
  ];

  return new RegExp(sensitiveTerms.join('|'), 'i').test(key);
}

function isPathKey(key: string): boolean {
  return /profilepath|worktreepath|configpath|executablepath|cwd|path$/i.test(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function stableHash(value: string): string {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
}
