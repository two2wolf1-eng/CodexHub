import { buildSupervisorServer } from './server';

const port = Number(process.env.CODEXHUB_SUPERVISOR_PORT ?? process.env.PORT ?? 3333);
const host = process.env.CODEXHUB_SUPERVISOR_HOST ?? '127.0.0.1';
const server = buildSupervisorServer();

try {
  await server.listen({ host, port });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}

