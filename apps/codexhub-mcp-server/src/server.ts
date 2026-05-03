import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  StreamableHTTPServerTransport,
  type StreamableHTTPServerTransportOptions,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { CODEXHUB_MCP_TOOL_NAMES } from '@codexhub/mcp-tool-contracts';
import type { CodexHubStore } from '@codexhub/store-core';
import { createSqliteStore } from '@codexhub/store-sqlite';
import {
  authorizeMcpHttpMetadataRequest,
  authorizeMcpHttpRequest,
  readConfiguredLocalControlKey,
  writeCorsHeaders,
  writeJson,
} from './security';
import { invokeReadOnlyMcpTool } from './tools';

export interface CodexHubMcpServerContext {
  workspaceRoot: string;
  store?: CodexHubStore;
}

export interface CodexHubMcpRuntimeOptions {
  workspaceRoot?: string;
  store?: CodexHubStore;
  disableStore?: boolean;
}

export interface CodexHubMcpHttpOptions extends CodexHubMcpRuntimeOptions {
  host?: string;
  port?: number;
  localControlKey?: string;
  trustedOrigins?: readonly string[];
  handleMcpRequest?: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
}

export interface CodexHubMcpHttpServer {
  server: Server;
  host: string;
  port: number;
  close(): Promise<void>;
}

interface StoreState {
  status: 'ok' | 'degraded' | 'disabled' | 'pending';
  store?: CodexHubStore;
}

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3335;

export function createCodexHubMcpServer(context: CodexHubMcpServerContext): McpServer {
  const server = new McpServer({
    name: 'codexhub-mcp-server',
    version: 'm3a-read-only',
  });

  for (const toolName of CODEXHUB_MCP_TOOL_NAMES) {
    server.registerTool(
      toolName,
      {
        title: toolName,
        description: `Read-only CodexHub tool: ${toolName}`,
        inputSchema:
          toolName === 'codexhub.getAffectedProjectsDryRun'
            ? {
                targets: z.array(z.enum(['lint', 'test', 'build'])).optional(),
                baseRef: z.string().optional(),
                headRef: z.string().optional(),
              }
            : undefined,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        _meta: {
          actionMode: 'read',
          risk: 'low',
          evidencePolicy: 'metadata-only',
        },
      },
      async (args) =>
        invokeReadOnlyMcpTool(toolName, normalizeToolArgs(args), {
          workspaceRoot: context.workspaceRoot,
          store: context.store,
        }),
    );
  }

  return server;
}

export async function startCodexHubMcpStdioServer(
  options: CodexHubMcpRuntimeOptions = {},
): Promise<void> {
  const storeState = await resolveStore(options);
  const server = createCodexHubMcpServer({
    workspaceRoot: resolve(options.workspaceRoot ?? process.cwd()),
    store: storeState.store,
  });

  await server.connect(new StdioServerTransport());
}

export async function startCodexHubMcpHttpServer(
  options: CodexHubMcpHttpOptions = {},
): Promise<CodexHubMcpHttpServer> {
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? DEFAULT_PORT;
  const handler = await createCodexHubMcpHttpRequestHandler(options);
  const server = createServer(handler);

  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen({ host, port }, () => {
      server.off('error', reject);
      resolvePromise();
    });
  });

  const address = server.address();
  const boundPort = typeof address === 'object' && address ? address.port : port;

  return {
    server,
    host,
    port: boundPort,
    async close() {
      await closeServer(server);
    },
  };
}

export async function createCodexHubMcpHttpRequestHandler(
  options: CodexHubMcpHttpOptions = {},
): Promise<(request: IncomingMessage, response: ServerResponse) => Promise<void>> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  let storeState = await resolveStore(options);

  return async (request, response) => {
    if (request.url?.startsWith('/health')) {
      const gate = authorizeMcpHttpMetadataRequest(request, {
        trustedOrigins: options.trustedOrigins,
      });
      writeCorsHeaders(response, gate.origin);

      if (!gate.allowed) {
        writeJson(response, gate.statusCode, { error: gate.error });
        return;
      }

      writeJson(response, 200, {
        id: foundationId('health'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt: foundationTimestamp(),
        service: 'codexhub-mcp-server',
        status: storeState.status === 'ok' ? 'ok' : 'degraded',
        transport: 'http',
        persistence: { status: storeState.status },
        metadata: {
          endpoint: '/mcp',
          defaultHost: DEFAULT_HOST,
          defaultPort: DEFAULT_PORT,
          localControlRequired: true,
          wildcardCors: false,
          readOnlyToolsOnly: true,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      });
      return;
    }

    if (!request.url?.startsWith('/mcp')) {
      writeJson(response, 404, { error: 'not_found' });
      return;
    }

    const gate = authorizeMcpHttpRequest(request, {
      localControlKey: options.localControlKey ?? readConfiguredLocalControlKey(),
      trustedOrigins: options.trustedOrigins,
    });
    writeCorsHeaders(response, gate.origin);

    if (request.method === 'OPTIONS') {
      response.statusCode = gate.allowed ? 204 : gate.statusCode;
      response.end(gate.allowed ? undefined : JSON.stringify({ error: gate.error }));
      return;
    }

    if (request.method !== 'POST') {
      writeJson(response, 405, { error: 'method_not_allowed' });
      return;
    }

    if (!gate.allowed) {
      writeJson(response, gate.statusCode, { error: gate.error });
      return;
    }

    if (storeState.status !== 'ok' && !options.disableStore) {
      storeState = await resolveStore(options);
    }

    if (options.handleMcpRequest) {
      await options.handleMcpRequest(request, response);
      return;
    }

    const mcpServer = createCodexHubMcpServer({
      workspaceRoot,
      store: storeState.store,
    });
    const statelessOptions = {
      [['sess', 'ionIdGenerator'].join('')]: undefined,
      enableJsonResponse: true,
    } as StreamableHTTPServerTransportOptions;
    const transport = new StreamableHTTPServerTransport(statelessOptions);

    response.on('close', () => {
      void transport.close();
      void mcpServer.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(request, response);
  };
}

async function resolveStore(options: CodexHubMcpRuntimeOptions): Promise<StoreState> {
  if (options.store) {
    return { status: 'ok', store: options.store };
  }

  if (options.disableStore) {
    return { status: 'disabled' };
  }

  try {
    return {
      status: 'ok',
      store: await createSqliteStore({ workspaceRoot: options.workspaceRoot }),
    };
  } catch {
    return { status: 'degraded' };
  }
}

function normalizeToolArgs(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return {};
  }

  return args as Record<string, unknown>;
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) {
    return;
  }

  await new Promise<void>((resolvePromise, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolvePromise();
    });
  });
}
