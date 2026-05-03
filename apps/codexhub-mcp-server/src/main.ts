import { startCodexHubMcpHttpServer, startCodexHubMcpStdioServer } from './server';

const transport = readArgValue('--transport') ?? process.env.CODEXHUB_MCP_TRANSPORT ?? 'stdio';

if (transport === 'http') {
  const host = process.env.CODEXHUB_MCP_HOST ?? '127.0.0.1';
  const port = Number.parseInt(process.env.CODEXHUB_MCP_PORT ?? '3335', 10);

  await startCodexHubMcpHttpServer({ host, port });
} else {
  await startCodexHubMcpStdioServer();
}

function readArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);

  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}
