import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ActionMode, RiskLevel } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import type { PolicyActionInput } from '@codexhub/security-kernel';
import type { PolicyBackendFixtureEvaluation } from './execute';

export const POLICY_BACKEND_FIXTURE_CONFIG_RELATIVE_PATH =
  '.codexhub/policy-backend.fixture.json';

export interface PolicyBackendFixtureRule {
  id: string;
  match: {
    actionType?: string;
    actionMode?: ActionMode;
    riskLevel?: RiskLevel;
  };
  rawOutcome: PolicyBackendFixtureEvaluation['rawOutcome'];
  reasons?: readonly string[];
  matchedRuleCount?: number;
  summary?: string;
}

export interface PolicyBackendFixtureConfig {
  schemaVersion: '2026-04-28.foundation';
  description?: string;
  rules: readonly PolicyBackendFixtureRule[];
}

export interface PolicyBackendFixtureConfigLoadResult {
  config: PolicyBackendFixtureConfig;
  configHash: string;
  ruleCount: number;
  rawConfigStored: false;
  rawPathStored: false;
  bodyStored: false;
}

export async function loadPolicyBackendFixtureConfig(input: {
  workspaceRoot: string;
  readFileText?: (absoluteConfigPath: string) => Promise<string>;
}): Promise<PolicyBackendFixtureConfigLoadResult> {
  const absoluteConfigPath = resolve(
    input.workspaceRoot,
    ...POLICY_BACKEND_FIXTURE_CONFIG_RELATIVE_PATH.split('/'),
  );
  const read = input.readFileText ?? ((filePath: string) => readFile(filePath, 'utf8'));
  const configText = await read(absoluteConfigPath);

  return parsePolicyBackendFixtureConfig(configText);
}

export function parsePolicyBackendFixtureConfig(
  configText: string,
): PolicyBackendFixtureConfigLoadResult {
  const parsed = parseJsonObject(configText);
  const config = parseFixtureConfigObject(parsed);

  return {
    config,
    configHash: `sha256:${hashText(configText)}`,
    ruleCount: config.rules.length,
    rawConfigStored: false,
    rawPathStored: false,
    bodyStored: false,
  };
}

export function createPolicyBackendFixtureConfigEvaluator(input: {
  config: PolicyBackendFixtureConfig;
  policyInput: PolicyActionInput;
}): () => PolicyBackendFixtureEvaluation {
  return () => evaluateFixtureConfig(input.config, input.policyInput);
}

export function evaluateFixtureConfig(
  config: PolicyBackendFixtureConfig,
  policyInput: PolicyActionInput,
): PolicyBackendFixtureEvaluation {
  const matchingRule = config.rules.find((rule) => ruleMatchesPolicyInput(rule, policyInput));

  if (!matchingRule) {
    return {
      rawOutcome: 'unknown',
      reasons: ['no fixture rule matched'],
      matchedRuleCount: 0,
      summary: 'No fixture policy backend rule matched the action.',
    };
  }

  return {
    rawOutcome: matchingRule.rawOutcome,
    reasons: matchingRule.reasons,
    matchedRuleCount: matchingRule.matchedRuleCount ?? 1,
    summary: matchingRule.summary ?? `Fixture rule ${matchingRule.id} matched.`,
  };
}

function parseJsonObject(configText: string): Record<string, unknown> {
  const parsed = JSON.parse(configText) as unknown;

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('policy backend fixture config must be a JSON object');
  }

  return parsed as Record<string, unknown>;
}

function parseFixtureConfigObject(
  parsed: Record<string, unknown>,
): PolicyBackendFixtureConfig {
  if (parsed.schemaVersion !== '2026-04-28.foundation') {
    throw new Error('policy backend fixture config schemaVersion is invalid');
  }

  if (!Array.isArray(parsed.rules)) {
    throw new Error('policy backend fixture config rules must be an array');
  }

  return {
    schemaVersion: parsed.schemaVersion,
    description: typeof parsed.description === 'string' ? parsed.description : undefined,
    rules: parsed.rules.map(parseFixtureRule),
  };
}

function parseFixtureRule(rule: unknown): PolicyBackendFixtureRule {
  if (typeof rule !== 'object' || rule === null || Array.isArray(rule)) {
    throw new Error('policy backend fixture rule must be an object');
  }

  const record = rule as Record<string, unknown>;
  const match = record.match;

  if (typeof record.id !== 'string' || record.id.trim().length === 0) {
    throw new Error('policy backend fixture rule id is required');
  }

  if (typeof match !== 'object' || match === null || Array.isArray(match)) {
    throw new Error('policy backend fixture rule match is required');
  }

  if (!isRawOutcome(record.rawOutcome)) {
    throw new Error('policy backend fixture rule rawOutcome is invalid');
  }

  const matchRecord = match as Record<string, unknown>;

  return {
    id: record.id,
    match: {
      actionType: readOptionalString(matchRecord.actionType),
      actionMode: readOptionalActionMode(matchRecord.actionMode),
      riskLevel: readOptionalRiskLevel(matchRecord.riskLevel),
    },
    rawOutcome: record.rawOutcome,
    reasons: readOptionalStringArray(record.reasons),
    matchedRuleCount: readOptionalNonnegativeInteger(record.matchedRuleCount),
    summary: readOptionalString(record.summary),
  };
}

function ruleMatchesPolicyInput(
  rule: PolicyBackendFixtureRule,
  policyInput: PolicyActionInput,
): boolean {
  const riskLevel = policyInput.riskLevel;

  return (
    (rule.match.actionType === undefined || rule.match.actionType === policyInput.actionType) &&
    (rule.match.actionMode === undefined || rule.match.actionMode === policyInput.actionMode) &&
    (rule.match.riskLevel === undefined || rule.match.riskLevel === riskLevel)
  );
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error('policy backend fixture rule reasons must be string array');
  }

  return value;
}

function readOptionalActionMode(value: unknown): ActionMode | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'read' || value === 'dry-run' || value === 'write' || value === 'admin') {
    return value;
  }

  throw new Error('policy backend fixture rule actionMode is invalid');
}

function readOptionalRiskLevel(value: unknown): RiskLevel | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value;
  }

  throw new Error('policy backend fixture rule riskLevel is invalid');
}

function readOptionalNonnegativeInteger(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Number.isInteger(value) && typeof value === 'number' && value >= 0) {
    return value;
  }

  throw new Error('policy backend fixture rule matchedRuleCount is invalid');
}

function isRawOutcome(
  value: unknown,
): value is PolicyBackendFixtureEvaluation['rawOutcome'] {
  return value === 'allow' || value === 'deny' || value === 'unknown' || value === 'error';
}
