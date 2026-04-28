import type { Observation, SourceHealth } from '@codexhub/contracts';

export interface ElectronTarget {
  id: string;
  title: string;
  type: 'main' | 'renderer' | 'worker' | 'unknown';
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface ElectronDebugEndpoint {
  id: string;
  host: string;
  port: number;
  protocol: 'cdp';
  readOnly: true;
  metadata?: Record<string, unknown>;
}

export interface ElectronObservation {
  target: ElectronTarget;
  observation: Observation;
  health: SourceHealth;
}

export const ELECTRON_CDP_COMMAND_ALLOWLIST_PLACEHOLDER = [
  'Browser.getVersion',
  'Target.getTargets',
  'Log.enable',
] as const;

export interface ElectronCdpObserver {
  listTargets(endpoint: ElectronDebugEndpoint): Promise<ElectronTarget[]>;
  observe(target: ElectronTarget): Promise<ElectronObservation>;
}

