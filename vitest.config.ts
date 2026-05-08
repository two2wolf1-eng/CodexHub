import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@codexhub/contracts': resolve(workspaceRoot, 'packages/contracts/src/index.ts'),
      '@codexhub/evidence-kernel': resolve(
        workspaceRoot,
        'packages/evidence-kernel/src/index.ts',
      ),
      '@codexhub/runtime-operations-kernel': resolve(
        workspaceRoot,
        'packages/runtime-operations-kernel/src/index.ts',
      ),
      '@codexhub/external-agent-adapter': resolve(
        workspaceRoot,
        'packages/external-agent-adapter/src/index.ts',
      ),
      '@codexhub/platform-operations-kernel': resolve(
        workspaceRoot,
        'packages/platform-operations-kernel/src/index.ts',
      ),
      '@codexhub/production-ga-kernel': resolve(
        workspaceRoot,
        'packages/production-ga-kernel/src/index.ts',
      ),
      '@codexhub/business-quota-debug-kernel': resolve(
        workspaceRoot,
        'packages/business-quota-debug-kernel/src/index.ts',
      ),
      '@codexhub/task-closure-kernel': resolve(
        workspaceRoot,
        'packages/task-closure-kernel/src/index.ts',
      ),
    },
  },
  test: {
    passWithNoTests: true,
    globals: false,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
