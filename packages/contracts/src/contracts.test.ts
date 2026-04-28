import { describe, expect, it } from 'vitest';
import {
  DevelopmentRequestSchema,
  EvidenceRefSchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  WorkflowRunSchema,
} from './index';

const createdAt = '2026-04-28T00:00:00.000Z';
const schemaVersion = SchemaVersionSchema.value;

describe('contracts schemas', () => {
  it('parses core created models', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_1',
      schemaVersion,
      createdAt,
      kind: 'dry-run',
      hash: 'sha256:abc',
      metadata: { source: 'test' },
    });

    const decision = PolicyDecisionSchema.parse({
      id: 'policy_1',
      schemaVersion,
      createdAt,
      actionId: 'action_1',
      actionType: 'filesystem.read',
      actionMode: 'read',
      riskLevel: 'low',
      outcome: 'allow',
      requiresDryRun: false,
      requiresApproval: false,
    });

    const run = WorkflowRunSchema.parse({
      id: 'run_1',
      schemaVersion,
      createdAt,
      workflowName: 'development.bootstrap',
      status: 'created',
      dryRun: true,
      evidenceRefs: [evidence],
    });

    const request = DevelopmentRequestSchema.parse({
      id: 'devreq_1',
      schemaVersion,
      createdAt,
      title: 'Bootstrap',
      description: 'Create a foundation-only scaffold.',
    });

    expect(decision.outcome).toBe('allow');
    expect(run.workflowName).toBe('development.bootstrap');
    expect(request.constraints).toEqual([]);
  });
});
