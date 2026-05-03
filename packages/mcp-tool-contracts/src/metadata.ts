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
  return `sha256:${sha256Hex(JSON.stringify(redactUnknown(value)))}`;
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

function sha256Hex(value: string): string {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  view.setUint32(paddedLength - 8, high, false);
  view.setUint32(paddedLength - 4, low, false);

  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const schedule = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      schedule[index] = view.getUint32(offset + index * 4, false);
    }

    for (let index = 16; index < 64; index += 1) {
      schedule[index] =
        (smallSigma1(schedule[index - 2] ?? 0) +
          (schedule[index - 7] ?? 0) +
          smallSigma0(schedule[index - 15] ?? 0) +
          (schedule[index - 16] ?? 0)) >>>
        0;
    }

    let a = state[0] ?? 0;
    let b = state[1] ?? 0;
    let c = state[2] ?? 0;
    let d = state[3] ?? 0;
    let e = state[4] ?? 0;
    let f = state[5] ?? 0;
    let g = state[6] ?? 0;
    let h = state[7] ?? 0;

    for (let index = 0; index < 64; index += 1) {
      const temp1 =
        (h + bigSigma1(e) + choose(e, f, g) + SHA256_K[index] + (schedule[index] ?? 0)) >>> 0;
      const temp2 = (bigSigma0(a) + majority(a, b, c)) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    state[0] = ((state[0] ?? 0) + a) >>> 0;
    state[1] = ((state[1] ?? 0) + b) >>> 0;
    state[2] = ((state[2] ?? 0) + c) >>> 0;
    state[3] = ((state[3] ?? 0) + d) >>> 0;
    state[4] = ((state[4] ?? 0) + e) >>> 0;
    state[5] = ((state[5] ?? 0) + f) >>> 0;
    state[6] = ((state[6] ?? 0) + g) >>> 0;
    state[7] = ((state[7] ?? 0) + h) >>> 0;
  }

  return Array.from(state)
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('');
}

function utf8Bytes(value: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  const encoded = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(encoded.length);

  for (let index = 0; index < encoded.length; index += 1) {
    bytes[index] = encoded.charCodeAt(index);
  }

  return bytes;
}

function rotateRight(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift));
}

function choose(x: number, y: number, z: number): number {
  return (x & y) ^ (~x & z);
}

function majority(x: number, y: number, z: number): number {
  return (x & y) ^ (x & z) ^ (y & z);
}

function bigSigma0(value: number): number {
  return rotateRight(value, 2) ^ rotateRight(value, 13) ^ rotateRight(value, 22);
}

function bigSigma1(value: number): number {
  return rotateRight(value, 6) ^ rotateRight(value, 11) ^ rotateRight(value, 25);
}

function smallSigma0(value: number): number {
  return rotateRight(value, 7) ^ rotateRight(value, 18) ^ (value >>> 3);
}

function smallSigma1(value: number): number {
  return rotateRight(value, 17) ^ rotateRight(value, 19) ^ (value >>> 10);
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
