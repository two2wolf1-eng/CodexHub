import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';
import { createNxVerificationAdapterPlan } from '@codexhub/nx-verification-adapter';
import { aggregateSourceHealth, MockObservationSource } from '@codexhub/observer-kernel';
import type { CodexHubStore } from '@codexhub/store-core';

export interface ToolOutputContext {
  workspaceRoot: string;
  store: CodexHubStore;
}

export interface AffectedProjectsDryRunArgs {
  targets?: unknown;
  baseRef?: unknown;
  headRef?: unknown;
}

export async function getArchitectureMap(context: ToolOutputContext): Promise<Record<string, unknown>> {
  const apps = readProjectSummaries(resolve(context.workspaceRoot, 'apps'), 'app');
  const packages = readProjectSummaries(resolve(context.workspaceRoot, 'packages'), 'package');

  return {
    apps,
    packages,
    counts: {
      apps: apps.length,
      packages: packages.length,
      total: apps.length + packages.length,
    },
    dependencies: summarizeDependencies([...apps, ...packages]),
    bodyStored: false,
  };
}

export async function getPolicySummary(context: ToolOutputContext): Promise<Record<string, unknown>> {
  const policies = readYamlConfig(context.workspaceRoot, '.codexhub/policies.yaml');
  const riskMatrix = readYamlConfig(context.workspaceRoot, '.codexhub/risk-matrix.yaml');

  return {
    policyHash: policies.hash,
    riskMatrixHash: riskMatrix.hash,
    actionModes: readRecordKeys(policies.parsed.actionModes),
    specialRules: readRecord(policies.parsed.specialRules),
    riskLevels: readRecordKeys(riskMatrix.parsed.riskLevels ?? riskMatrix.parsed.risks),
    bodyStored: false,
  };
}

export async function getRiskMatrix(context: ToolOutputContext): Promise<Record<string, unknown>> {
  const policies = readYamlConfig(context.workspaceRoot, '.codexhub/policies.yaml');
  const riskMatrix = readYamlConfig(context.workspaceRoot, '.codexhub/risk-matrix.yaml');

  return {
    policyHash: policies.hash,
    riskMatrixHash: riskMatrix.hash,
    actionModes: readRecord(policies.parsed.actionModes),
    specialRules: readRecord(policies.parsed.specialRules),
    riskSummary: readRiskSummary(riskMatrix.parsed),
    bodyStored: false,
  };
}

export async function getEvidenceSummary(context: ToolOutputContext): Promise<Record<string, unknown>> {
  const refs = await context.store.evidenceRefs.listEvidenceRefs({ limit: 10 });
  const counts = new Map<string, number>();

  for (const ref of await context.store.evidenceRefs.listEvidenceRefs({ limit: 200 })) {
    counts.set(ref.kind, (counts.get(ref.kind) ?? 0) + 1);
  }

  return {
    count: [...counts.values()].reduce((sum, value) => sum + value, 0),
    countsByKind: Object.fromEntries([...counts.entries()].sort()),
    recentRefs: refs.map((ref) => ({
      id: ref.id,
      kind: ref.kind,
      summary: ref.summary,
      hash: ref.hash,
      redacted: ref.redacted,
      labels: ref.labels ?? [],
    })),
    bodyStored: false,
  };
}

export async function getOpenDevelopmentRequests(
  context: ToolOutputContext,
): Promise<Record<string, unknown>> {
  const recentRuns = await context.store.developmentRuns.listMockDevelopmentRuns(10);

  return {
    openRequests: [],
    openRequestCount: 0,
    recentRunSummaries: recentRuns.map((run) => ({
      idHash: hashPublicValue(run.id),
      titleHash: hashPublicValue(run.summary.requestTitle),
      status: run.summary.verificationStatus,
      summaryHash: hashPublicValue(run.summary),
      taskCount: run.summary.taskCount,
      agentRunCount: run.summary.agentRunCount,
      evidenceRefCount: run.evidenceRefs?.length ?? 0,
    })),
    bodyStored: false,
  };
}

export async function getAffectedProjectsDryRun(
  context: ToolOutputContext,
  args: AffectedProjectsDryRunArgs,
): Promise<Record<string, unknown>> {
  const targets = normalizeTargets(args.targets);
  const plan = createNxVerificationAdapterPlan({
    dryRunId: `mcp_${hashText(JSON.stringify(redactMetadata({ targets, args })))}`,
    cwd: context.workspaceRoot,
    allowedCwdRoots: [context.workspaceRoot],
    targets,
    baseRef: readString(args.baseRef),
    headRef: readString(args.headRef),
  });

  return {
    status: plan.status,
    targets: plan.targets,
    baseRef: plan.baseRef,
    headRef: plan.headRef,
    processBoundaryPlanned: plan.processBoundaryPlanned,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    affectedProjectsCommandHash: plan.affectedProjectsCommandHash,
    verificationCommandHash: plan.verificationCommandHash,
    blockReasons: plan.blockReasons,
    warnings: plan.warnings,
    bodyStored: false,
  };
}

export async function readObservationSnapshot(): Promise<Record<string, unknown>> {
  const source = new MockObservationSource('codexhub.mcp.read_only');
  const health = await aggregateSourceHealth([source]);
  const observations = await source.collect();

  return {
    sources: health.map((entry) => ({
      source: entry.source,
      status: entry.status,
      observationsCount: entry.observationsCount,
      lastObservationAt: entry.lastObservationAt,
    })),
    observations: observations.map((observation) => ({
      id: observation.id,
      source: observation.source,
      kind: observation.kind,
      severity: observation.severity,
      summary: observation.summary,
    })),
    browserConnected: false,
    electronConnected: false,
    bodyStored: false,
  };
}

interface ProjectSummary {
  name: string;
  kind: 'app' | 'package';
  implicitDependencies: string[];
  targetNames: string[];
  projectHash: string;
}

function readProjectSummaries(root: string, kind: 'app' | 'package'): ProjectSummary[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readProjectSummary(join(root, entry.name), kind))
    .filter((entry): entry is ProjectSummary => entry !== undefined)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function readProjectSummary(projectRoot: string, kind: 'app' | 'package'): ProjectSummary | undefined {
  const projectJsonPath = join(projectRoot, 'project.json');

  if (!existsSync(projectJsonPath)) {
    return undefined;
  }

  const body = readFileSync(projectJsonPath, 'utf8');
  const parsed = JSON.parse(body) as {
    name?: unknown;
    implicitDependencies?: unknown;
    targets?: unknown;
  };

  if (typeof parsed.name !== 'string') {
    return undefined;
  }

  return {
    name: parsed.name,
    kind,
    implicitDependencies: readStringArray(parsed.implicitDependencies),
    targetNames: Object.keys(readRecord(parsed.targets)).sort(),
    projectHash: `sha256:${hashText(body)}`,
  };
}

function summarizeDependencies(projects: ProjectSummary[]): Record<string, number> {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const dependency of project.implicitDependencies) {
      counts.set(dependency, (counts.get(dependency) ?? 0) + 1);
    }
  }

  return Object.fromEntries([...counts.entries()].sort());
}

function readYamlConfig(workspaceRoot: string, relativePath: string): {
  hash: string;
  parsed: Record<string, unknown>;
} {
  const absolutePath = resolve(workspaceRoot, relativePath);

  if (!existsSync(absolutePath)) {
    return { hash: 'sha256:missing', parsed: {} };
  }

  const body = readFileSync(absolutePath, 'utf8');
  const parsed = parseYaml(body);

  return {
    hash: `sha256:${hashText(body)}`,
    parsed: isRecord(parsed) ? parsed : {},
  };
}

function readRiskSummary(value: Record<string, unknown>): Record<string, unknown> {
  return {
    riskLevels: readRecordKeys(value.riskLevels ?? value.risks),
    actionModes: readRecordKeys(value.actionModes),
    specialRules: readRecord(value.specialRules),
  };
}

function normalizeTargets(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return ['lint', 'test', 'build'];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function readRecordKeys(value: unknown): string[] {
  return Object.keys(readRecord(value)).sort();
}

function readRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function hashPublicValue(value: unknown): string {
  return `sha256:${hashText(JSON.stringify(value))}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
