import { runGovernedDevelopmentOrchestration } from '@codexhub/orchestrator-kernel';

const result = await runGovernedDevelopmentOrchestration({
  title: 'Prepare governed Codex control-plane handoff',
  description: 'Create a metadata-only Orchestrator handoff summary.',
  constraints: ['governed-input-required', 'dry-run-first', 'supervisor-owned-boundary'],
  metadata: { source: 'apps/orchestrator demo', noLiveAutomation: true },
});

console.log(JSON.stringify(result.summary, null, 2));
