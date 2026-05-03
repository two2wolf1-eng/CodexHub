import { buildOrchestratorServer } from './server';

const host = process.env.CODEXHUB_ORCHESTRATOR_HOST ?? '127.0.0.1';
const port = Number.parseInt(process.env.CODEXHUB_ORCHESTRATOR_PORT ?? '3334', 10);
const server = buildOrchestratorServer();

await server.listen({ host, port });
