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
  'raw policy input fixture',
  'raw policy source fixture',
  'raw policy output fixture',
  'raw span payload fixture',
  'raw log payload fixture',
  'Runtime.evaluate source fixture',
  'raw javascript source fixture',
  'raw selector fixture',
  'raw typed text fixture',
  'raw controlled patch fixture',
  'raw command fixture',
  'raw argv fixture',
  'raw SQL fixture',
  'raw database row fixture',
  'raw backup body fixture',
  'raw audit body fixture',
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
