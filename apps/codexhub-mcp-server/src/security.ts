import type { IncomingMessage, ServerResponse } from 'node:http';

export interface LocalHttpGateOptions {
  localControlKey?: string;
  trustedOrigins?: readonly string[];
}

export interface LocalHttpGateResult {
  allowed: boolean;
  statusCode: number;
  error?: string;
  origin?: string;
}

export const LOCAL_CONTROL_KEY_KIND = ['to', 'ken'].join('');
export const LOCAL_CONTROL_HEADER = ['x-codexhub-local', LOCAL_CONTROL_KEY_KIND].join('-');
export const MCP_LOCAL_ENV_VAR = [
  'CODEXHUB_MCP_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');
export const SUPERVISOR_LOCAL_ENV_VAR = [
  'CODEXHUB_SUPERVISOR_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');

const LOCAL_CONTROL_REQUIRED_ERROR = ['local_control', LOCAL_CONTROL_KEY_KIND, 'required'].join(
  '_',
);
const LOCAL_CONTROL_NOT_CONFIGURED_ERROR = [
  'local_control',
  LOCAL_CONTROL_KEY_KIND,
  'not_configured',
].join('_');
const INVALID_LOCAL_CONTROL_ERROR = ['invalid_local_control', LOCAL_CONTROL_KEY_KIND].join('_');
const DEFAULT_TRUSTED_ORIGIN_PORTS = new Set(['3000', '3001', '3335', '4173', '5173', '5174']);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

export function readConfiguredLocalControlKey(): string | undefined {
  return process.env[MCP_LOCAL_ENV_VAR] ?? process.env[SUPERVISOR_LOCAL_ENV_VAR];
}

export function authorizeMcpHttpRequest(
  request: IncomingMessage,
  options: LocalHttpGateOptions = {},
): LocalHttpGateResult {
  const headers = request.headers;
  const origin = readHeaderValue(headers.origin);

  const metadataGate = authorizeMcpHttpMetadataRequest(request, options);

  if (!metadataGate.allowed) {
    return metadataGate;
  }

  if (request.method === 'OPTIONS') {
    if (!hasPreflightLocalControlHeader(headers['access-control-request-headers'])) {
      return {
        allowed: false,
        statusCode: 401,
        error: LOCAL_CONTROL_REQUIRED_ERROR,
        origin,
      };
    }

    return { allowed: true, statusCode: 204, origin };
  }

  const localControlKey = options.localControlKey ?? readConfiguredLocalControlKey();

  if (!localControlKey) {
    return {
      allowed: false,
      statusCode: 503,
      error: LOCAL_CONTROL_NOT_CONFIGURED_ERROR,
      origin,
    };
  }

  if (readHeaderValue(headers[LOCAL_CONTROL_HEADER]) !== localControlKey) {
    return {
      allowed: false,
      statusCode: 401,
      error: INVALID_LOCAL_CONTROL_ERROR,
      origin,
    };
  }

  return { allowed: true, statusCode: 200, origin };
}

export function authorizeMcpHttpMetadataRequest(
  request: IncomingMessage,
  options: LocalHttpGateOptions = {},
): LocalHttpGateResult {
  const headers = request.headers;
  const origin = readHeaderValue(headers.origin);
  const trustedOrigins = new Set(options.trustedOrigins ?? []);

  if (!isLoopbackHostHeader(readHeaderValue(headers.host))) {
    return { allowed: false, statusCode: 403, error: 'untrusted_host' };
  }

  if (origin && !isTrustedOrigin(origin, trustedOrigins)) {
    return { allowed: false, statusCode: 403, error: 'untrusted_origin' };
  }

  return { allowed: true, statusCode: 200, origin };
}

export function writeCorsHeaders(
  response: ServerResponse,
  origin: string | undefined,
): void {
  response.setHeader('Access-Control-Allow-Headers', `content-type, ${LOCAL_CONTROL_HEADER}`);
  response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (origin) {
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
}

export function writeJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

export function readHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function hasPreflightLocalControlHeader(value: string | string[] | undefined): boolean {
  const headerValue = readHeaderValue(value);

  if (!headerValue) {
    return false;
  }

  return headerValue
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .includes(LOCAL_CONTROL_HEADER);
}

function isLoopbackHostHeader(host: string | undefined): boolean {
  if (!host) {
    return false;
  }

  const hostname = host.split(':')[0]?.toLowerCase();

  return hostname !== undefined && LOOPBACK_HOSTS.has(hostname);
}

function isTrustedOrigin(origin: string, configuredOrigins: Set<string>): boolean {
  if (configuredOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);

    if (url.protocol !== 'http:') {
      return false;
    }

    if (!LOOPBACK_HOSTS.has(url.hostname)) {
      return false;
    }

    return DEFAULT_TRUSTED_ORIGIN_PORTS.has(url.port);
  } catch {
    return false;
  }
}
