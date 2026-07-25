# Dependency register · Phase 0

> **Scope:** direct dependencies used by the P0-00 branch, updated 2026-07-24. Versions come from lockfiles and registry package metadata. This is an engineering register, not legal advice.
>
> **Project license:** undecided. A public repository does not by itself grant reuse rights; all local Rust crates use `publish = false` until the rights holder selects and adds a project license.

## Rust application dependencies

| Package | Exact version | SPDX/license metadata | Upstream | Purpose |
|---|---:|---|---|---|
| async-trait | 0.1.91 | MIT OR Apache-2.0 | [dtolnay/async-trait](https://github.com/dtolnay/async-trait) | Object-safe async repository port |
| axum | 0.8.9 | MIT | [tokio-rs/axum](https://github.com/tokio-rs/axum) | `/api/v1` HTTP adapter |
| http-body-util | 0.1.4 | MIT | [hyperium/http-body](https://github.com/hyperium/http-body) | API test response collection only |
| reqwest | 0.13.4 | MIT OR Apache-2.0 | [seanmonstar/reqwest](https://github.com/seanmonstar/reqwest) | HTTPS/OpenAI-compatible AI provider adapter with bounded response streaming |
| serde | 1.0.229 | MIT OR Apache-2.0 | [serde-rs/serde](https://github.com/serde-rs/serde) | Versioned wire serialization |
| serde_json | 1.0.151 | MIT OR Apache-2.0 | [serde-rs/json](https://github.com/serde-rs/json) | Golden Fixture and persisted JSON snapshots |
| sqlx | 0.9.0 | MIT OR Apache-2.0 | [launchbadge/sqlx](https://github.com/launchbadge/sqlx) | SQLite adapter, transaction and migration |
| thiserror | 2.0.19 | MIT OR Apache-2.0 | [dtolnay/thiserror](https://github.com/dtolnay/thiserror) | Typed domain/application errors |
| tokio | 1.53.1 | MIT | [tokio-rs/tokio](https://github.com/tokio-rs/tokio) | Async runtime and TCP server |
| tower | 0.5.3 | MIT | [tower-rs/tower](https://github.com/tower-rs/tower) | Router service tests only |
| tower-http | 0.7.0 | MIT | [tower-rs/tower-http](https://github.com/tower-rs/tower-http) | HTTP trace middleware |
| tracing | 0.1.44 | MIT | [tokio-rs/tracing](https://github.com/tokio-rs/tracing) | Structured runtime diagnostics |
| tracing-subscriber | 0.3.23 | MIT | [tokio-rs/tracing](https://github.com/tokio-rs/tracing) | Local log filtering/formatting |
| uuid | 1.24.0 | Apache-2.0 OR MIT | [uuid-rs/uuid](https://github.com/uuid-rs/uuid) | Review/publication event IDs |

Source of truth: `app/Cargo.toml` pins direct versions and `app/Cargo.lock` freezes the full graph. `reqwest` uses the Rustls path; the resolved graph currently includes `aws-lc-rs/aws-lc-sys`, so ARM64 compilation and transitive notices must be verified on GX10. SQLite is compiled through SQLx's bundled feature on this slice; OceanBase is not present in the dependency graph.

## University2K26 Web/PWA dependencies

| Package | Exact version | License metadata | Upstream | Purpose |
|---|---:|---|---|---|
| react / react-dom | 19.2.0 | MIT | [facebook/react](https://github.com/facebook/react) | Formal Experience Shell runtime |
| @fluentui/react-icons | 2.0.333 | MIT | [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons) | Registered interface icons |
| @fontsource-variable/inter | 5.3.0 | OFL-1.1 | [fontsource/fontsource](https://github.com/fontsource/fontsource) | Latin UI typography |
| @fontsource-variable/noto-sans-sc | 5.3.0 | OFL-1.1 | [fontsource/fontsource](https://github.com/fontsource/fontsource) | Simplified Chinese UI typography |
| @fontsource/barlow-condensed | 5.3.0 | OFL-1.1 | [fontsource/fontsource](https://github.com/fontsource/fontsource) | Display/HUD typography |
| intl-messageformat | 11.2.12 | BSD-3-Clause | [formatjs/formatjs](https://github.com/formatjs/formatjs) | ICU plural/select message formatting and future inflection-safe locale contract |
| vite / @vitejs/plugin-react | 6.4.3 / 5.0.4 | MIT | [vitejs/vite](https://github.com/vitejs/vite) | Local server and production build |
| typescript | 5.9.3 | Apache-2.0 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) | Strict compile-time contract checks |
| vitest | 3.2.7 | MIT | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | API fallback and fixture boundary tests |
| @types/node / react / react-dom | 24.10.1 / 19.2.2 / 19.2.2 | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | Build and runtime type declarations |

Source of truth: `app/apps/web/package.json` and `app/apps/web/package-lock.json`. Both the formal Web/PWA and the retained P0-00-D0 prototype report 0 known npm vulnerabilities at `--audit-level=low` on 2026-07-24. Vite is pinned to 6.4.3 and Vitest to 3.2.7 to include the reviewed advisory fixes.

## Documentation dependencies

| Package | Exact version | License metadata | Upstream | Purpose |
|---|---:|---|---|---|
| @astrojs/starlight | 0.41.4 | MIT | [withastro/starlight](https://github.com/withastro/starlight) | Documentation information architecture/search shell |
| astro | 7.1.3 | MIT | [withastro/astro](https://github.com/withastro/astro) | Static documentation build |
| sharp | 0.35.3 | Apache-2.0 | [lovell/sharp](https://github.com/lovell/sharp) | Local image pipeline required by Astro |

Source of truth: `docs-site/package.json` and `docs-site/package-lock.json`. `npm audit --audit-level=low` reported 0 known vulnerabilities on 2026-07-23.

## GX10 deployment base images

| Image tag | Registry | Purpose | Current evidence |
|---|---|---|---|
| `rust:1.97.1-bookworm` | Docker Official Image | ARM64-capable release build stage for the Rust API | Tag existence reviewed 2026-07-24; digest and ARM64 build still require device receipt |
| `debian:bookworm-slim` | Docker Official Image | Minimal non-root API runtime | Runtime contract written; device image digest unverified |
| `node:24-bookworm-slim` | Docker Official Image | Locked Web production build stage | Tag existence reviewed 2026-07-24; device image digest unverified |
| `nginx:1.30.4-alpine3.24` | Docker Official Image | Localhost-only static/PWA server and `/api` reverse proxy | Tag existence reviewed 2026-07-24; device image digest unverified |

Source of truth: `deploy/gx10/Dockerfile.*` and `deploy/gx10/compose.app.yaml`. Tags are not immutable evidence: the GX10 operator must record pulled multi-arch manifest digests in the deployment receipt before the package can move from `device_unverified`.

## CI actions

Only official GitHub actions are used, pinned to commit SHA with a version comment:

- `actions/checkout` commit `fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09` (`v5`)
- `actions/setup-node` commit `a0853c24544627f65ddf259abe73b1d18a591444` (`v5`)

Rust is installed with the official `rustup` already present on GitHub-hosted runners; no third-party Rust setup action is required.

## Remaining gate work

- Generate and review a full transitive license/notice report before submission or distribution.
- Add a Rust advisory audit in CI after selecting a maintained tool and pinning it; do not install an unreviewed floating action.
- Re-run npm/Rust advisories whenever lockfiles change.
- Record any future model, OceanBase, asset, font, SDK, solver or deployment dependency before its PR can be approved.
- Choose the project's own license explicitly; dependency licenses do not make this repository automatically open source.
