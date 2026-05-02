---
name: codexhub-contract-designer
description: Use when modifying contracts, Zod schemas, DTOs, inferred TypeScript types, or public exports.
---

# CodexHub Contract Designer

Use this skill before changing `packages/contracts`.

Inputs:

- Contract names and consumers.
- Compatibility requirements.
- Test expectations.

Process:

- Every shared model needs an id, schemaVersion, createdAt or observedAt, optional metadata, Zod schema, inferred type, and public export.
- Avoid leaking implementation-specific storage or runtime details into contracts.
- Extend compatibly unless a breaking change is explicitly approved.
- Capability adapter contracts must include manifest, dry-run, execution authority, execution result, evidence, and audit semantics.
- Separate risk level from action mode; `dry-run` and real `write` must be distinguishable in shared schemas.
- Update dependent package tests when shared contracts change.

Output:

- Contract change summary.
- Compatibility notes.
- Consumer impact.
- Required tests.
