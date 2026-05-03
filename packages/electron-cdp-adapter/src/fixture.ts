import type {
  ElectronCdpFixtureRunner,
  ElectronCdpFixtureRunnerResult,
} from './execute';

export function createElectronCdpFixtureRunner(
  result: ElectronCdpFixtureRunnerResult,
): ElectronCdpFixtureRunner {
  return {
    async observe() {
      return result;
    },
  };
}
