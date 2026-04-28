import {
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type DevelopmentRequest,
} from '@codexhub/contracts';
import { MockDevelopmentPlanner } from '@codexhub/orchestrator-kernel';

const request: DevelopmentRequest = {
  id: foundationId('development_request'),
  schemaVersion: SchemaVersionSchema.value,
  createdAt: foundationTimestamp(),
  title: 'Bootstrap CodexHub foundation',
  description: 'Mock-only scaffold planning demo.',
  constraints: ['foundation-only', 'dry-run-first'],
  metadata: { mock: true },
};

const planner = new MockDevelopmentPlanner();
const result = await planner.plan(request);

console.log(JSON.stringify(result, null, 2));

