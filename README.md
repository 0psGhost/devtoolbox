# DevToolbox

Free, open-source developer utilities that run entirely in your browser. No servers, no tracking — your data never leaves your machine.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Tools (22)

| Category | Tools |
|----------|-------|
| **Format & Validate** | JSON Formatter, YAML ↔ JSON, Text Diff |
| **Encode & Decode** | Base64, URL Encode, HTML Entities, Hex ↔ ASCII |
| **Converters** | Query String ↔ JSON, Number Base, String Case, Unix Time |
| **Generators** | Hash (MD5/SHA), UUID, Lorem Ipsum, Random String |
| **Inspectors** | Certificate Manager, PGP / GPG, JWT Debugger, RegExp Tester |
| **DevOps & Infra** | Cron Parser, CIDR Calculator, K8s Validator |

### Highlights

- **Certificate Manager** — generate, validate, and inspect X.509 certs, CSRs, and keys
- **PGP / GPG** — key generation, encrypt/decrypt, sign/verify
- **K8s Validator** — lint Kubernetes YAML for required fields and best practices
- **Cron Parser** — human-readable schedules with next run times
- **CIDR Calculator** — subnet masks, host ranges, IP-in-range checks

## Features

- Smart paste detection (JWT, PEM certs, PGP keys, K8s YAML, CIDR, cron, etc.)
- Dark / light / system theme
- Instant search across all tools
- Modular tool registry — add a component + one registry entry

## Adding a tool

1. Create `src/tools/<id>/<Component>.tsx`
2. Register in `src/tools/registry.ts`

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Lucide Icons

## License

[MIT](LICENSE)
