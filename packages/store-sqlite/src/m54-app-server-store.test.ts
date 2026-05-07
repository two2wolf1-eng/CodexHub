import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CodexAppServerApprovalBridgeRecordSchema,
  CodexAppServerEventSummarySchema,
  CodexAppServerProtocolDriftReportSchema,
  CodexAppServerThreadMirrorSchema,
  CodexAppServerTurnMirrorSchema,
  CodexAppServerWireMessageSummarySchema,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import type { MetadataEntityRepository } from '@codexhub/store-core';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

const schemaVersion = SchemaVersionSchema.value;
const createdAt = '2026-05-07T00:00:00.000Z';

async function expectRoundTrip<T extends { id: string }>(
  repository: MetadataEntityRepository<T>,
  record: T,
): Promise<T> {
  await repository.saveRecord(record);
  await expect(repository.getRecord(record.id)).resolves.toEqual(record);
  const records = await repository.listRecords({ limit: 20 });
  expect(records).toContainEqual(record);
  return record;
}

describe('M54 App Server metadata store', () => {
  it('round-trips M54 App Server metadata records without raw payload fields', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m54-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');

    const first = await createSqliteStore({ dbPath });
    const wire = CodexAppServerWireMessageSummarySchema.parse({
      id: 'codex_app_server_wire_1',
      schemaVersion,
      observedAt: createdAt,
      appServerSessionId: 'codex_app_server_session_1',
      transportKind: 'stdio-jsonl',
      direction: 'request',
      method: 'initialize',
      requestIdHash: 'sha256:request-id',
      messageHash: 'sha256:wire-message',
      payloadSummaryHash: 'sha256:payload-summary',
      payloadByteCount: 120,
      lineCount: 1,
      redactedFieldCount: 0,
      status: 'sent',
      initializedRequired: true,
      initializedObserved: false,
      processBoundaryInvoked: true,
      summary: 'Wire summary stores hashes and counts only.',
    });
    const threadMirror = CodexAppServerThreadMirrorSchema.parse({
      id: 'codex_app_server_thread_1',
      schemaVersion,
      observedAt: createdAt,
      appServerSessionId: wire.appServerSessionId,
      taskRunId: 'codex_task_run_1',
      threadIdHash: 'sha256:thread-id',
      status: 'loaded',
      ephemeral: true,
      turnCount: 1,
      activeTurnIdHash: 'sha256:turn-id',
      subscribed: true,
      processBoundaryInvoked: true,
      summary: 'Thread mirror stores a thread hash and no path.',
    });
    const turnMirror = CodexAppServerTurnMirrorSchema.parse({
      id: 'codex_app_server_turn_1',
      schemaVersion,
      observedAt: createdAt,
      appServerSessionId: wire.appServerSessionId,
      threadMirrorId: threadMirror.id,
      taskRunId: 'codex_task_run_1',
      threadIdHash: threadMirror.threadIdHash,
      turnIdHash: 'sha256:turn-id',
      status: 'running',
      itemCount: 2,
      eventCount: 3,
      inputSummaryHash: 'sha256:input-summary',
      outputSummaryHash: 'sha256:output-summary',
      approvalPendingCount: 1,
      processBoundaryInvoked: true,
      summary: 'Turn mirror stores summary hashes and counts.',
    });
    const eventSummary = CodexAppServerEventSummarySchema.parse({
      id: 'codex_app_server_event_1',
      schemaVersion,
      observedAt: createdAt,
      appServerSessionId: wire.appServerSessionId,
      threadMirrorId: threadMirror.id,
      turnMirrorId: turnMirror.id,
      method: 'item/fileChange/requestApproval',
      eventHash: 'sha256:event',
      threadIdHash: threadMirror.threadIdHash,
      turnIdHash: turnMirror.turnIdHash,
      itemIdHash: 'sha256:item',
      status: 'started',
      sequenceNumber: 1,
      payloadByteCount: 256,
      processBoundaryInvoked: true,
      summary: 'Event summary stores no diff or event body.',
    });
    const approvalBridge = CodexAppServerApprovalBridgeRecordSchema.parse({
      id: 'codex_app_server_approval_1',
      schemaVersion,
      createdAt,
      appServerSessionId: wire.appServerSessionId,
      taskRunId: 'codex_task_run_1',
      threadIdHash: threadMirror.threadIdHash,
      turnIdHash: turnMirror.turnIdHash,
      itemIdHash: eventSummary.itemIdHash,
      requestIdHash: 'sha256:server-request',
      approvalKind: 'file-change',
      status: 'pending',
      proposalHash: 'sha256:proposal',
      proposalSummaryHash: 'sha256:proposal-summary',
      availableDecisionCount: 2,
      availableDecisionHashes: ['sha256:decline', 'sha256:cancel'],
      processBoundaryInvoked: true,
      summary: 'Approval bridge stores no patch or approval secret.',
    });
    const driftReport = CodexAppServerProtocolDriftReportSchema.parse({
      id: 'codex_app_server_drift_1',
      schemaVersion,
      observedAt: createdAt,
      appServerSessionId: wire.appServerSessionId,
      baselineKind: 'generate-json-schema',
      baselineHash: 'sha256:baseline',
      observedSchemaHash: 'sha256:observed',
      status: 'compatible',
      driftCount: 0,
      liveDispatchBlocked: false,
      processBoundaryInvoked: true,
      summary: 'Drift report stores generated schema hashes only.',
    });

    const saved = [
      await expectRoundTrip(first.codexAppServerWireMessageSummaries, wire),
      await expectRoundTrip(first.codexAppServerThreadMirrors, threadMirror),
      await expectRoundTrip(first.codexAppServerTurnMirrors, turnMirror),
      await expectRoundTrip(first.codexAppServerEventSummaries, eventSummary),
      await expectRoundTrip(first.codexAppServerApprovalBridgeRecords, approvalBridge),
      await expectRoundTrip(first.codexAppServerProtocolDriftReports, driftReport),
    ];
    await expect(first.codexAppServerApprovalBridgeRecords.listRecords({ status: 'pending' }))
      .resolves.toEqual([approvalBridge]);
    await expect(first.codexAppServerProtocolDriftReports.listRecords({ status: 'unknown' }))
      .resolves.toEqual([]);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.codexAppServerWireMessageSummaries.getRecord(wire.id)).resolves.toEqual(
      wire,
    );
    await expect(reopened.codexAppServerApprovalBridgeRecords.getRecord(approvalBridge.id))
      .resolves.toEqual(approvalBridge);
    await expect(reopened.codexAppServerProtocolDriftReports.getRecord(driftReport.id))
      .resolves.toEqual(driftReport);
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(wire.rawBodyStored).toBe(false);
    expect(wire.jsonRpcHeaderStored).toBe(false);
    expect(threadMirror.workspaceTrustMutationObserved).toBe(false);
    expect(approvalBridge.silentApprovalAllowed).toBe(false);
    expect(approvalBridge.approvalSecretStored).toBe(false);
    expect(driftReport.rawSchemaStored).toBe(false);
  });

  it('rejects forbidden M54 App Server raw fields before records are persisted', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m54-store-negative-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });

    expect(() =>
      CodexAppServerWireMessageSummarySchema.parse({
        id: 'codex_app_server_wire_raw_1',
        schemaVersion,
        observedAt: createdAt,
        appServerSessionId: 'codex_app_server_session_1',
        transportKind: 'stdio-jsonl',
        direction: 'response',
        method: 'turn/start',
        messageHash: 'sha256:wire-message',
        status: 'received',
        summary: 'Unsafe raw wire summary.',
        metadata: {
          rawBody: adversarialPublicOutputFixture,
        },
      }),
    ).toThrow();
    expect(() =>
      CodexAppServerEventSummarySchema.parse({
        id: 'codex_app_server_event_raw_1',
        schemaVersion,
        observedAt: createdAt,
        appServerSessionId: 'codex_app_server_session_1',
        method: 'item/fileChange/requestApproval',
        eventHash: 'sha256:event',
        status: 'started',
        sequenceNumber: 0,
        summary: 'Unsafe raw event summary.',
        metadata: {
          rawDiff: adversarialPublicOutputFixture,
        },
      }),
    ).toThrow();
    expect(() =>
      CodexAppServerProtocolDriftReportSchema.parse({
        id: 'codex_app_server_drift_unblocked_1',
        schemaVersion,
        observedAt: createdAt,
        baselineKind: 'generate-ts',
        baselineHash: 'sha256:baseline',
        observedSchemaHash: 'sha256:observed',
        status: 'unknown',
        liveDispatchBlocked: false,
        summary: 'Unknown drift must not allow live dispatch.',
      }),
    ).toThrow();

    await expect(store.codexAppServerWireMessageSummaries.listRecords()).resolves.toEqual([]);
    await expect(store.codexAppServerEventSummaries.listRecords()).resolves.toEqual([]);
    await expect(store.codexAppServerProtocolDriftReports.listRecords()).resolves.toEqual([]);
    await store.close();
  });
});
