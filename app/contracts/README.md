# Versioned contracts

`contracts/v1/` is the platform-neutral compatibility boundary for Phase 0. Windows, future web/mobile clients, fixtures, and adapters must consume the same semantics.

- Major version `1` accepts additive unknown fields.
- Wire enums are strings. Clients must preserve unknown values, show `unknown`, and block high-risk automatic actions.
- `revision` is an optimistic-concurrency token; stale writes return `409`.
- Only `approved` objects can become immutable published versions.
- Review and publish history is append-only.
- `fixture: true` and `generation_mode: fixture` must remain visible; fixture results never impersonate a live model or school record.
- Contract changes require a migration note, old-reader test, rollback note, and golden-fixture impact review.

The OpenAPI document is descriptive evidence for this experimental slice, not a production-SLA claim.
