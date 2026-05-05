export const adversarialPublicOutputTerms = [
  'raw prompt fixture',
  'stdout fixture',
  'stderr fixture',
  'diff --git',
  'C:\\Users\\Thomas',
  'C:\\Users\\Thomas\\CodexHub',
  '/Users/thomas',
  'https://api.github.com/repos/two2wolf1-eng/CodexHub',
  'raw file content fixture',
  '# Raw PR markdown',
  'raw reason text',
  'ghp_live_secret',
  'cookie=session',
  'session=secret',
  'token=secret',
  'ENV_VALUE_SECRET',
  'request body fixture',
  'response body fixture',
  'HTTP response body fixture',
] as const;

export const adversarialPublicOutputFixture = adversarialPublicOutputTerms.join(' ');

export function findAdversarialPublicOutputLeaks(serialized: string): string[] {
  return adversarialPublicOutputTerms.filter((term) => serialized.includes(term));
}

export function serializePublicOutputRoundTrip(value: unknown): string {
  return JSON.stringify(JSON.parse(JSON.stringify(value)));
}

export function findAdversarialPublicOutputRoundTripLeaks(value: unknown): string[] {
  return findAdversarialPublicOutputLeaks(serializePublicOutputRoundTrip(value));
}
