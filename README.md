# DevToolbox

Free, open-source developer utilities. Runs locally on the web or as a native desktop app — your data never leaves your machine.

**Repository:** [github.com/0psGhost/devtoolbox](https://github.com/0psGhost/devtoolbox)

## Downloads

Desktop installers for **macOS**, **Windows**, and **Linux** are published automatically on every merge to `main`:

**[GitHub Releases](https://github.com/0psGhost/devtoolbox/releases)**

| Platform | Installers |
|----------|------------|
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Windows | `.msi`, `.exe` |
| Linux | `.deb`, `.AppImage`, `.rpm` |

Bump the `version` field in `package.json` before merging when you want a new release tag (e.g. `0.1.0` → `0.1.1`).

## Documentation

Full usage guides for every tool: **[docs/](docs/README.md)**

## Quick start

### Web app

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build → dist/
```

### Desktop app (local build)

**Prerequisites:** [Node.js](https://nodejs.org/) 20+, [Rust](https://rustup.rs/), and platform build tools (see below).

```bash
npm install
npm run desktop:dev     # native window with hot reload
npm run desktop:build   # installer for your OS/architecture
```

`desktop:build` auto-detects your platform:

| Machine | Build target |
|---------|--------------|
| Apple Silicon Mac | `aarch64-apple-darwin` |
| Intel Mac | `x86_64-apple-darwin` |
| Windows / Linux | native |

Optional: `npm run desktop:build:mac-universal` for a single macOS DMG (both architectures).

Installers are written to `src-tauri/target/release/bundle/`.

**Platform build dependencies**

| OS | Install |
|----|---------|
| **macOS** | `xcode-select --install` |
| **Windows** | [C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) + WebView2 |
| **Linux (Ubuntu)** | `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf` |

### macOS "damaged" / "corrupt" error

Unsigned builds may show a misleading error on other Macs. After installing:

```bash
xattr -cr /Applications/DevToolbox.app
```

Then right-click → **Open**, or use **System Settings → Privacy & Security → Open Anyway**.

Rebuilds use ad-hoc signing (`signingIdentity: "-"` in `tauri.conf.json`) to reduce this issue.

## Tools (22)

| Category | Tools |
|----------|-------|
| **Format & Validate** | JSON Formatter, YAML ↔ JSON, Text Diff |
| **Encode & Decode** | Base64, URL Encode, HTML Entities, Hex ↔ ASCII |
| **Converters** | Query String ↔ JSON, Number Base, String Case, Unix Time |
| **Generators** | Hash (MD5/SHA), UUID, Lorem Ipsum, Random String |
| **Inspectors** | Certificate Manager, PGP / GPG, JWT Debugger, RegExp Tester |
| **DevOps & Infra** | Cron Parser, CIDR Calculator, K8s Validator |

## CI / Release pipeline

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR or push to `main` | Lint, build, security audit |
| `release.yml` | Push to `main` | Build all desktop installers and publish GitHub Release |

Optional signing secrets for **notarized** macOS builds (only add when configured — do not create empty repo secrets):

`APPLE_CERTIFICATE`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

Without these, CI uses ad-hoc signing (`signingIdentity: "-"` in `tauri.conf.json`).

## Adding a tool

1. Create `src/tools/<id>/<Component>.tsx`
2. Register in `src/tools/registry.ts`
3. Add `docs/tools/<id>.md`

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Tauri 2

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
