import { existsSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';
import {
  createCodexHubMcpServerManifest,
  createCodexHubMcpToolDefinitions,
  getCodexHubMcpToolDefinition,
} from '@codexhub/mcp-tool-contracts';
import { createNxVerificationAdapterPlan } from '@codexhub/nx-verification-adapter';
import {
  createBrowserProfileReadiness,
  createBrowserProfileRef,
  createBrowserProfileRegistrySummary,
} from '@codexhub/browser-profile-kernel';
import { createPlaywrightObserverAdapterPlan } from '@codexhub/playwright-observer-adapter';

export interface JsonCliOptions {
  json?: boolean;
}

export interface VerifyAffectedDryRunCliOptions extends JsonCliOptions {
  dryRun?: boolean;
  targets?: string;
  base?: string;
  head?: string;
  cwd?: string;
  requestedCommand?: string;
  requestedArgs?: readonly string[];
  shell?: boolean;
}

export interface BrowserObserveDryRunCliOptions extends JsonCliOptions {
  dryRun?: boolean;
  profileId?: string;
  displayName?: string;
  profilePath?: string;
  capabilities?: string;
  requestedActions?: string;
  screenshot?: boolean;
  networkBody?: boolean;
  bodyStorage?: boolean;
}

export function listMcpToolsForCli() {
  const manifest = createCodexHubMcpServerManifest();
  const tools = createCodexHubMcpToolDefinitions();

  return {
    manifest: {
      name: manifest.name,
      kind: manifest.kind,
      provider: manifest.provider,
      version: manifest.version,
      processBoundary: manifest.processBoundary,
      evidencePolicy: manifest.evidencePolicy,
    },
    count: tools.length,
    enabledCount: tools.filter((tool) => tool.enabled).length,
    tools: tools.map((tool) => ({
      name: tool.name,
      title: tool.title,
      riskLevel: tool.riskLevel,
      actionMode: tool.actionMode,
      approvalPolicy: tool.approvalPolicy,
      bodyStorage: tool.evidencePolicy.bodyStorage,
      enabled: tool.enabled,
      noRealWrite: tool.noRealWrite,
      processBoundaryInvoked: tool.processBoundaryInvoked,
      externalProcessStarted: tool.externalProcessStarted,
    })),
    note: 'Registry display only; this is not an MCP invocation and creates no MCP audit event.',
  };
}

export function getMcpToolForCli(toolName: string) {
  const tool = getCodexHubMcpToolDefinition(toolName as never);

  return {
    tool: {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      riskLevel: tool.riskLevel,
      actionMode: tool.actionMode,
      approvalPolicy: tool.approvalPolicy,
      evidencePolicy: tool.evidencePolicy,
      enabled: tool.enabled,
      outputBodyStored: tool.outputBodyStored,
      processBoundaryInvoked: tool.processBoundaryInvoked,
      externalProcessStarted: tool.externalProcessStarted,
      noRealWrite: tool.noRealWrite,
    },
    note: 'Registry display only; this is not an MCP invocation and creates no MCP audit event.',
  };
}

export function createVerifyAffectedDryRunForCli(options: VerifyAffectedDryRunCliOptions = {}) {
  if (options.dryRun !== true) {
    throw new Error('verify affected is dry-run only in M3b; pass --dry-run');
  }

  const workspaceRoot = findCliWorkspaceRoot(process.cwd());
  const plan = createNxVerificationAdapterPlan({
    dryRunId: 'cli_m3b_verify_affected_dry_run',
    cwd: resolve(workspaceRoot, options.cwd ?? '.'),
    allowedCwdRoots: [workspaceRoot],
    targets: parseTargets(options.targets),
    baseRef: options.base,
    headRef: options.head,
    requestedCommand: options.requestedCommand,
    requestedArgs: options.requestedArgs,
    shell: options.shell,
    metadata: {
      requestedBy: 'cli',
      m3bReadOnlyUx: true,
    },
  });

  return {
    id: plan.id,
    status: plan.status,
    dryRunId: plan.dryRunId,
    adapterName: plan.adapterName,
    cwdHash: plan.cwdHash,
    targets: plan.targets,
    baseRef: plan.baseRef,
    headRef: plan.headRef,
    affectedProjectsCommandHash: plan.affectedProjectsCommandHash,
    verificationCommandHash: plan.verificationCommandHash,
    processBoundaryPlanned: plan.processBoundaryPlanned,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: plan.noRealWrite,
    bodyStored: plan.bodyStored,
    blockReasons: plan.blockReasons,
    warnings: plan.warnings,
    summary: plan.verificationPlan.summary,
  };
}

export function listBrowserProfilesForCli() {
  const profileRef = createBrowserProfileRef({
    profileId: 'cli-fixture-profile',
    displayName: 'CLI fixture profile',
    profilePath: 'codexhub-cli-browser-profile',
  });
  const readiness = createBrowserProfileReadiness({ profileRef });
  const registry = createBrowserProfileRegistrySummary([profileRef]);

  return {
    profileCount: registry.profileCount,
    profiles: registry.profiles.map((profile) => ({
      profileId: profile.profileId,
      displayName: profile.displayName,
      profilePathHash: profile.profilePathHash,
      rawPathStored: profile.rawPathStored,
      readOnly: profile.readOnly,
    })),
    readiness: {
      status: readiness.status,
      blockReasons: readiness.blockReasons,
      allowedCapabilities: readiness.allowedCapabilities,
      forbiddenActionCount: readiness.forbiddenActions.length,
      processBoundaryInvoked: readiness.processBoundaryInvoked,
      externalProcessStarted: readiness.externalProcessStarted,
      noRealWrite: readiness.noRealWrite,
      bodyStored: readiness.bodyStored,
      rawPathStored: readiness.rawPathStored,
    },
    note: 'Browser profile list is metadata-only; no profile is opened or probed in M4a.',
  };
}

export function createBrowserObserveDryRunForCli(
  options: BrowserObserveDryRunCliOptions = {},
) {
  if (options.dryRun !== true) {
    throw new Error('browser observe is dry-run only in M4a; pass --dry-run');
  }

  const profileRef = createBrowserProfileRef({
    profileId: options.profileId ?? 'cli-observe-profile',
    displayName: options.displayName ?? 'CLI observe profile',
    profilePath: options.profilePath ?? 'codexhub-cli-browser-profile',
  });
  const plan = createPlaywrightObserverAdapterPlan({
    dryRunId: 'cli_m4a_browser_observe_dry_run',
    profileRef,
    requestedCapabilities: parseCommaSeparated(options.capabilities, [
      'title',
      'url',
      'accessibility_snapshot',
      'console_summary',
      'network_metadata_summary',
    ]),
    requestedActions: parseCommaSeparated(options.requestedActions),
    screenshotRequested: options.screenshot,
    networkBodyRequested: options.networkBody,
    bodyStorageRequested: options.bodyStorage,
  });

  return {
    id: plan.id,
    status: plan.status,
    dryRunId: plan.dryRunId,
    adapterName: plan.adapterName,
    profilePathHash: plan.profileRef.profilePathHash,
    requestedCapabilities: plan.requestedCapabilities,
    forbiddenActionCount: plan.forbiddenActions.length,
    blockReasons: plan.blockReasons,
    screenshotPlanned: plan.screenshotPlanned,
    networkBodyStorage: plan.networkBodyStorage,
    processBoundaryPlanned: plan.processBoundaryPlanned,
    processBoundaryInvoked: plan.processBoundaryInvoked,
    externalProcessStarted: plan.externalProcessStarted,
    noRealWrite: plan.noRealWrite,
    bodyStored: plan.bodyStored,
    rawPathStored: plan.rawPathStored,
    summary: plan.browserPlan.summary,
  };
}

export function formatMcpToolsListOutput(
  result: ReturnType<typeof listMcpToolsForCli>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'CodexHub MCP tools',
    `manifest: ${result.manifest.name} ${result.manifest.version}`,
    `tools: ${result.count}`,
    `enabled: ${result.enabledCount}`,
    `processBoundaryMayStart=${String(result.manifest.processBoundary.mayStartExternalProcess)}`,
    `note: ${result.note}`,
    result.tools.length > 0 ? 'items:' : 'items: none',
    ...result.tools.map(
      (tool) =>
        `- ${tool.name} ${tool.actionMode}/${tool.riskLevel} approval=${tool.approvalPolicy} body=${tool.bodyStorage}`,
    ),
  ].join('\n');
}

export function formatMcpToolDetailOutput(
  result: ReturnType<typeof getMcpToolForCli>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'CodexHub MCP tool',
    `name: ${result.tool.name}`,
    `title: ${result.tool.title}`,
    `risk/action: ${result.tool.riskLevel}/${result.tool.actionMode}`,
    `approval: ${result.tool.approvalPolicy}`,
    `bodyStorage: ${result.tool.evidencePolicy.bodyStorage}`,
    `enabled: ${String(result.tool.enabled)}`,
    `processBoundaryInvoked=${String(result.tool.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.tool.externalProcessStarted)}`,
    `noRealWrite=${String(result.tool.noRealWrite)}`,
    `note: ${result.note}`,
  ].join('\n');
}

export function formatVerifyAffectedDryRunOutput(
  result: ReturnType<typeof createVerifyAffectedDryRunForCli>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'Nx affected verification dry-run',
    `status: ${result.status}`,
    `targets: ${result.targets.join(', ') || 'none'}`,
    result.baseRef ? `base: ${result.baseRef}` : undefined,
    result.headRef ? `head: ${result.headRef}` : undefined,
    `cwdHash: ${result.cwdHash}`,
    `affectedProjectsCommandHash: ${result.affectedProjectsCommandHash}`,
    `verificationCommandHash: ${result.verificationCommandHash}`,
    `processBoundaryPlanned=${String(result.processBoundaryPlanned)}`,
    `processBoundaryInvoked=${String(result.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.externalProcessStarted)}`,
    `noRealWrite=${String(result.noRealWrite)}`,
    result.blockReasons.length > 0
      ? `blockReasons: ${result.blockReasons.join(', ')}`
      : 'blockReasons: none',
    `summary: ${result.summary}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatBrowserProfilesListOutput(
  result: ReturnType<typeof listBrowserProfilesForCli>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'Browser profiles',
    `profiles: ${result.profileCount}`,
    `readiness: ${result.readiness.status}`,
    `processBoundaryInvoked=${String(result.readiness.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.readiness.externalProcessStarted)}`,
    `noRealWrite=${String(result.readiness.noRealWrite)}`,
    `bodyStored=${String(result.readiness.bodyStored)}`,
    `rawPathStored=${String(result.readiness.rawPathStored)}`,
    `note: ${result.note}`,
    result.profiles.length > 0 ? 'items:' : 'items: none',
    ...result.profiles.map(
      (profile) =>
        `- ${profile.profileId} ${profile.displayName} profilePathHash=${profile.profilePathHash}`,
    ),
  ].join('\n');
}

export function formatBrowserObserveDryRunOutput(
  result: ReturnType<typeof createBrowserObserveDryRunForCli>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'Browser observation dry-run',
    `status: ${result.status}`,
    `adapter: ${result.adapterName}`,
    `profilePathHash: ${result.profilePathHash}`,
    `capabilities: ${result.requestedCapabilities.join(', ') || 'none'}`,
    `forbiddenActionCount: ${result.forbiddenActionCount}`,
    `screenshotPlanned=${String(result.screenshotPlanned)}`,
    `networkBodyStorage=${result.networkBodyStorage}`,
    `processBoundaryPlanned=${String(result.processBoundaryPlanned)}`,
    `processBoundaryInvoked=${String(result.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.externalProcessStarted)}`,
    `noRealWrite=${String(result.noRealWrite)}`,
    `bodyStored=${String(result.bodyStored)}`,
    `rawPathStored=${String(result.rawPathStored)}`,
    result.blockReasons.length > 0
      ? `blockReasons: ${result.blockReasons.join(', ')}`
      : 'blockReasons: none',
    `summary: ${result.summary}`,
  ].join('\n');
}

function parseTargets(targets: string | undefined): string[] {
  return (targets ?? 'lint,test,build')
    .split(',')
    .map((target) => target.trim())
    .filter((target) => target.length > 0);
}

function parseCommaSeparated(value: string | undefined, fallback: readonly string[] = []): string[] {
  return (value ?? fallback.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function findCliWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current || current === root) {
      return resolve(startDirectory);
    }

    current = parent;
  }
}
