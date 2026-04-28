import type { AgentRun, EvidenceRef } from '@codexhub/contracts';

export interface CodexExecEvent {
  id: string;
  observedAt: string;
  kind: 'codex.exec.event';
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface CodexAppServerEvent {
  id: string;
  observedAt: string;
  kind: 'codex.app_server.event';
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface AgentRunEvent {
  id: string;
  observedAt: string;
  agentRunId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface CodexRunRequest {
  prompt: string;
  dryRun: true;
  metadata?: Record<string, unknown>;
}

export interface CodexRunResult {
  agentRun: AgentRun;
  events: AgentRunEvent[];
  evidenceRefs: EvidenceRef[];
}

export interface CodexRunner {
  dryRun(request: CodexRunRequest): Promise<CodexRunResult>;
}

