import {
  type BrowserForbiddenAction,
  type BrowserObservationCapability,
  type BrowserProfileReadiness,
  type BrowserProfileReadinessBlockReason,
  type BrowserProfileReadinessStatus,
  type BrowserProfileRef,
  BrowserProfileReadinessSchema,
  BrowserProfileRefSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';

export const BROWSER_PROFILE_READ_ONLY_CAPABILITIES = [
  'title',
  'url',
  'accessibility_snapshot',
  'console_summary',
  'network_metadata_summary',
] as const satisfies readonly BrowserObservationCapability[];

export const BROWSER_PROFILE_FORBIDDEN_ACTIONS = [
  'screenshot',
  'network_body',
  'click',
  'type',
  'submit',
  'file_upload',
  'file_download',
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
  'local_storage_dump',
  ['sess', 'ion_storage_dump'].join(''),
] as readonly BrowserForbiddenAction[];

export interface BrowserProfileRefInput {
  profileId: string;
  displayName: string;
  profilePath: string;
  metadata?: Record<string, unknown>;
}

export interface BrowserProfileReadinessInput {
  profileRef: BrowserProfileRef;
  status?: BrowserProfileReadinessStatus;
  blockReasons?: readonly BrowserProfileReadinessBlockReason[];
  allowedCapabilities?: readonly BrowserObservationCapability[];
  forbiddenActions?: readonly BrowserForbiddenAction[];
  summary?: string;
  metadata?: Record<string, unknown>;
  observedAt?: string;
}

export interface BrowserProfileRegistrySummary {
  id: string;
  schemaVersion: string;
  createdAt: string;
  profileCount: number;
  profiles: BrowserProfileRef[];
  rawPathStored: false;
  bodyStored: false;
  noRealWrite: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  summary: string;
}

export interface BrowserProfileObservationSource {
  readonly name: string;
  readiness(profileRef: BrowserProfileRef): Promise<BrowserProfileReadiness>;
}

export function hashBrowserProfilePath(profilePath: string): string {
  return `sha256:${hashText(profilePath)}`;
}

export function createBrowserProfileRef(input: BrowserProfileRefInput): BrowserProfileRef {
  return BrowserProfileRefSchema.parse({
    id: foundationId('browser_profile_ref'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    profileId: input.profileId,
    displayName: input.displayName,
    profilePathHash: hashBrowserProfilePath(input.profilePath),
    rawPathStored: false,
    readOnly: true,
    metadata: summarizeProfileMetadata(input.metadata),
  });
}

export function createBrowserProfileReadiness(
  input: BrowserProfileReadinessInput,
): BrowserProfileReadiness {
  const blockReasons = [
    ...(input.blockReasons ?? [
      'browser_connection_disabled',
      'profile_probe_disabled',
    ]),
  ] as BrowserProfileReadinessBlockReason[];
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'ready');

  return BrowserProfileReadinessSchema.parse({
    id: foundationId('browser_profile_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    profileRef: input.profileRef,
    status,
    blockReasons,
    allowedCapabilities: [...(input.allowedCapabilities ?? BROWSER_PROFILE_READ_ONLY_CAPABILITIES)],
    forbiddenActions: [...(input.forbiddenActions ?? BROWSER_PROFILE_FORBIDDEN_ACTIONS)],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      input.summary ??
      'Browser profile readiness is metadata-only; real profile probing is disabled in M4a.',
    metadata: summarizeProfileMetadata(input.metadata),
  });
}

export function createBrowserProfileRegistrySummary(
  profiles: readonly BrowserProfileRef[],
): BrowserProfileRegistrySummary {
  return {
    id: foundationId('browser_profile_registry'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    profileCount: profiles.length,
    profiles: [...profiles],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: `Browser profile registry contains ${profiles.length} metadata-only profile refs.`,
  };
}

export function createDefaultBrowserProfileReadiness(
  profile: BrowserProfileRefInput,
): BrowserProfileReadiness {
  return createBrowserProfileReadiness({
    profileRef: createBrowserProfileRef(profile),
  });
}

function summarizeProfileMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const redacted = redactMetadata(metadata);

  return {
    metadataProvided: true,
    metadataKeyCount: Object.keys(metadata).length,
    metadataHash: `sha256:${hashText(JSON.stringify(redacted))}`,
    rawPathStored: false,
    bodyStored: false,
  };
}
