import {
  normalizeCodexExecEvent,
  type CodexExecParsedJsonlLine,
} from '@codexhub/codex-kernel';
import {
  type CodexExecFinalStatus,
  type CodexExecNormalizedEvent,
} from '@codexhub/contracts';

export interface CodexExecAdapterEventSummary {
  events: CodexExecNormalizedEvent[];
  eventCount: number;
  commandExecutionCount: number;
  fileChangeCount: number;
  messageCount: number;
  errorCount: number;
  unknownCount: number;
  finalStatus: CodexExecFinalStatus;
  eventPayloadHashes: string[];
  rawPayloadStored: false;
}

export function normalizeCodexExecAdapterEvents(
  lines: readonly CodexExecParsedJsonlLine[],
): CodexExecAdapterEventSummary {
  const events = lines.map((line) =>
    line.parseErrorEvent
      ? line.parseErrorEvent
      : normalizeCodexExecEvent(line.rawEvent ?? {}, { lineNumber: line.lineNumber }),
  );

  const commandExecutionCount = events.filter(
    (event) => event.item?.itemType === 'command_execution',
  ).length;
  const fileChangeCount = events.filter((event) => event.item?.itemType === 'file_change').length;
  const messageCount = events.filter((event) => event.item?.itemType === 'agent_message').length;
  const errorCount = events.filter(
    (event) => event.normalizedType === 'error' || event.normalizedType === 'parse_error',
  ).length;
  const unknownCount = events.filter((event) => event.normalizedType === 'unknown').length;

  return {
    events,
    eventCount: events.length,
    commandExecutionCount,
    fileChangeCount,
    messageCount,
    errorCount,
    unknownCount,
    finalStatus: classifyFinalStatus(events),
    eventPayloadHashes: events.map((event) => event.payloadHash),
    rawPayloadStored: false,
  };
}

function classifyFinalStatus(events: readonly CodexExecNormalizedEvent[]): CodexExecFinalStatus {
  if (
    events.some(
      (event) => event.normalizedType === 'turn.failed' || event.normalizedType === 'error',
    )
  ) {
    return 'failed';
  }

  if (events.some((event) => event.normalizedType === 'turn.completed')) {
    return 'completed';
  }

  return 'unknown';
}
