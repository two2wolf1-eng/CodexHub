# M48d Threat Model Operator Runbook

## Purpose

Use the M48 threat model and capability matrix during GA review to decide whether a release candidate can proceed to signoff.

## Operator Checklist

1. Confirm the capability matrix marks every surface with state, risk, approval requirement, evidence, audit, and rollback status.
2. Confirm the threat model lists assets, trust boundaries, live boundaries, authority model, approval model, evidence/audit model, rollback model, and residual risks.
3. Confirm no unresolved critical residual risk is accepted into GA signoff.
4. Confirm conditional live smoke blockers are environment-only and not implementation or audit gaps.
5. Confirm child approvals remain separate from GA approval.

## Escalation

Block GA signoff if the matrix omits a live boundary, the threat model transfers authority to an adapter, evidence/audit is missing, or rollback/disaster recovery is not documented.
