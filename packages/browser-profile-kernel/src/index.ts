import type { Observation, SourceHealth } from '@codexhub/contracts';

export interface BrowserProfile {
  id: string;
  displayName: string;
  profilePath: string;
  readOnly: true;
  metadata?: Record<string, unknown>;
}

export interface BrowserProfileHealth {
  profile: BrowserProfile;
  health: SourceHealth;
}

export interface BrowserObservation {
  profile: BrowserProfile;
  observation: Observation;
}

export interface BrowserProfileObserver {
  health(profile: BrowserProfile): Promise<BrowserProfileHealth>;
  observe(profile: BrowserProfile): Promise<BrowserObservation[]>;
}
