import { describe, expect, it } from 'vitest';
import {
  type CodexAccountBinding,
  type CodexClientInstance,
  type CodexDesktopHealthSnapshot,
  type QuotaSnapshot,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import {
  createAccountPoolScoringProjection,
  createClientPoolScoringProjection,
  scoreCodexAccount,
  scoreCodexClient,
} from './index';

const schemaVersion = SchemaVersionSchema.value;
const observedAt = '2026-05-08T00:00:00.000Z';

function account(overrides: Partial<CodexAccountBinding> = {}): CodexAccountBinding {
  return {
    id: 'account_binding_1',
    schemaVersion,
    observedAt,
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    tokenStored: false,
    cookieStored: false,
    sessionStored: false,
    mfaStored: false,
    storageRead: false,
    bodyStored: false,
    noRealWrite: true,
    liveExecution: false,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    evidenceRefIds: [],
    auditEventIds: [],
    codexAccountHash: 'sha256:account',
    workspaceIdHash: 'sha256:workspace',
    status: 'matched',
    disabled: false,
    summary: 'Account binding fixture.',
    ...overrides,
  };
}

function quota(overrides: Partial<QuotaSnapshot> = {}): QuotaSnapshot {
  return {
    id: 'quota_snapshot_1',
    schemaVersion,
    observedAt,
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    tokenStored: false,
    cookieStored: false,
    sessionStored: false,
    mfaStored: false,
    storageRead: false,
    bodyStored: false,
    noRealWrite: true,
    liveExecution: false,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    evidenceRefIds: [],
    auditEventIds: [],
    subjectKind: 'codex-account',
    subjectHash: 'sha256:account',
    status: 'available',
    limitCount: 100,
    usedCount: 1,
    remainingCount: 99,
    sourceRefIds: [],
    ambiguous: false,
    summary: 'Quota fixture.',
    ...overrides,
  };
}

function client(overrides: Partial<CodexClientInstance> = {}): CodexClientInstance {
  return {
    id: 'client_instance_1',
    schemaVersion,
    observedAt,
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    tokenStored: false,
    cookieStored: false,
    sessionStored: false,
    mfaStored: false,
    storageRead: false,
    bodyStored: false,
    noRealWrite: true,
    liveExecution: false,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    evidenceRefIds: [],
    auditEventIds: [],
    clientKind: 'codex-desktop',
    clientInstanceHash: 'sha256:client',
    status: 'available',
    activeTaskCount: 0,
    summary: 'Client fixture.',
    ...overrides,
  };
}

function desktopHealth(
  overrides: Partial<CodexDesktopHealthSnapshot> = {},
): CodexDesktopHealthSnapshot {
  return {
    id: 'desktop_health_1',
    schemaVersion,
    observedAt,
    status: 'ready',
    targetCount: 1,
    consoleErrorCount: 0,
    networkFailedRequestCount: 0,
    appServerResponsive: true,
    desktopUiResponsive: true,
    quotaAvailable: true,
    loggedIn: true,
    accountMatched: true,
    workspaceMatched: true,
    diagnosticHints: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Desktop health fixture.',
    ...overrides,
  };
}

describe('codex scheduler kernel scoring', () => {
  it('scores ready account and client projections', () => {
    const accountProjection = scoreCodexAccount({
      accountBinding: account(),
      quotaSnapshot: quota(),
      observedAt,
    });
    const clientProjection = scoreCodexClient({
      clientInstance: client(),
      desktopHealth: desktopHealth(),
      observedAt,
    });

    expect(accountProjection.schedulingStatus).toBe('account_ready');
    expect(accountProjection.score).toBe(100);
    expect(clientProjection.schedulingStatus).toBe('client_ready');
    expect(clientProjection.score).toBe(100);
    expect(JSON.stringify([accountProjection, clientProjection])).not.toContain(
      'Default',
    );
  });

  it('maps account block and pending states into required M56 statuses', () => {
    expect(
      scoreCodexAccount({
        accountBinding: account(),
        quotaSnapshot: quota({ status: 'exhausted', remainingCount: 0 }),
      }).schedulingStatus,
    ).toBe('quota_depleted');
    expect(
      scoreCodexAccount({
        accountBinding: account({ status: 'mismatch' }),
        quotaSnapshot: quota(),
      }).schedulingStatus,
    ).toBe('wrong_account');
    expect(
      scoreCodexAccount({
        accountBinding: account({ workspaceIdHash: 'sha256:other-workspace' }),
        quotaSnapshot: quota(),
        expectedWorkspaceIdHash: 'sha256:workspace',
      }).schedulingStatus,
    ).toBe('workspace_mismatch');
    expect(
      scoreCodexAccount({
        accountBinding: account({ disabled: true, status: 'disabled' }),
        quotaSnapshot: quota(),
      }).schedulingStatus,
    ).toBe('removed');
    expect(
      scoreCodexAccount({
        accountBinding: account({ status: 'unverified' }),
        quotaSnapshot: quota(),
      }).schedulingStatus,
    ).toBe('pending');
  });

  it('maps client health states into scheduler statuses', () => {
    expect(
      scoreCodexClient({
        clientInstance: client(),
        desktopHealth: desktopHealth({ desktopUiResponsive: false }),
      }).schedulingStatus,
    ).toBe('desktop_ui_frozen');
    expect(
      scoreCodexClient({
        clientInstance: client(),
        desktopHealth: desktopHealth({ appServerResponsive: false }),
      }).schedulingStatus,
    ).toBe('app_server_unresponsive');
    expect(
      scoreCodexClient({
        clientInstance: client(),
        desktopHealth: desktopHealth({ loggedIn: false }),
      }).schedulingStatus,
    ).toBe('codex_logged_out');
    expect(
      scoreCodexClient({
        clientInstance: client({ status: 'blocked' }),
        desktopHealth: desktopHealth(),
      }).schedulingStatus,
    ).toBe('removed');
    expect(
      scoreCodexClient({
        clientInstance: client({ status: 'degraded' }),
        desktopHealth: desktopHealth(),
      }).schedulingStatus,
    ).toBe('pending');
  });

  it('builds pool scoring projections without raw account or client data', () => {
    const readyAccount = scoreCodexAccount({
      accountBinding: account(),
      quotaSnapshot: quota(),
      observedAt,
    });
    const blockedAccount = scoreCodexAccount({
      accountBinding: account({ id: 'account_binding_2', status: 'mismatch' }),
      quotaSnapshot: quota(),
      observedAt,
    });
    const readyClient = scoreCodexClient({
      clientInstance: client(),
      desktopHealth: desktopHealth(),
      observedAt,
    });
    const blockedClient = scoreCodexClient({
      clientInstance: client({ id: 'client_instance_2', status: 'offline' }),
      desktopHealth: desktopHealth(),
      observedAt,
    });

    const accountPool = createAccountPoolScoringProjection({
      projections: [readyAccount, blockedAccount],
      observedAt,
      poolKey: 'business-workspace-a',
    });
    const clientPool = createClientPoolScoringProjection({
      projections: [readyClient, blockedClient],
      observedAt,
      poolKey: 'local-clients',
    });

    expect(accountPool.readyCount).toBe(1);
    expect(accountPool.blockedCount).toBe(1);
    expect(clientPool.readyCount).toBe(1);
    expect(clientPool.blockedCount).toBe(1);
    expect(JSON.stringify([accountPool, clientPool])).not.toContain(
      'business-workspace-a',
    );
    expect(accountPool.entries[1]?.blockReasons).toEqual(['account:wrong_account']);
    expect(clientPool.entries[1]?.blockReasons).toEqual(['client:removed']);
  });
});
