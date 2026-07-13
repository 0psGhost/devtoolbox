# DevToolbox Documentation

Guides for every utility in the app. All tools run **locally** — your data never leaves your machine.

## Format & Validate

| Tool | Guide |
|------|-------|
| JSON Formatter | [json-formatter.md](tools/json-formatter.md) |
| YAML ↔ JSON | [yaml-json.md](tools/yaml-json.md) |
| Text Diff | [text-diff.md](tools/text-diff.md) |

## Encode & Decode

| Tool | Guide |
|------|-------|
| Base64 | [base64.md](tools/base64.md) |
| URL Encode | [url.md](tools/url.md) |
| HTML Entities | [html-entity.md](tools/html-entity.md) |
| Hex ↔ ASCII | [hex-ascii.md](tools/hex-ascii.md) |

## Converters

| Tool | Guide |
|------|-------|
| Query String ↔ JSON | [query-string.md](tools/query-string.md) |
| Number Base | [number-base.md](tools/number-base.md) |
| String Case | [string-case.md](tools/string-case.md) |
| Unix Time | [unix-time.md](tools/unix-time.md) |

## Generators

| Tool | Guide |
|------|-------|
| Hash Generator | [hash.md](tools/hash.md) |
| UUID Generator | [uuid.md](tools/uuid.md) |
| Lorem Ipsum | [lorem.md](tools/lorem.md) |
| Random String | [random-string.md](tools/random-string.md) |

## Inspectors

| Tool | Guide |
|------|-------|
| Certificate Manager | [certificate.md](tools/certificate.md) |
| PGP / GPG | [pgp.md](tools/pgp.md) |
| JWT Debugger | [jwt.md](tools/jwt.md) |
| RegExp Tester | [regex.md](tools/regex.md) |

## DevOps & Infra

| Tool | Guide |
|------|-------|
| Cron Parser | [cron.md](tools/cron.md) |
| CIDR Calculator | [cidr.md](tools/cidr.md) |
| K8s Validator | [k8s.md](tools/k8s.md) |

## Smart paste

Paste content anywhere in the app (outside an input field) to auto-switch tools:

| Content | Opens |
|---------|-------|
| JSON `{` or `[` | JSON Formatter |
| JWT `eyJ...` | JWT Debugger |
| PEM certificate | Certificate Manager |
| PGP key/block | PGP / GPG |
| Kubernetes YAML | K8s Validator |
| CIDR `10.0.0.0/24` | CIDR Calculator |
| Cron expression | Cron Parser |
| Unix timestamp | Unix Time |
| UUID | UUID Generator |
| Base64 string | Base64 |

## Desktop downloads

Installers are published on [GitHub Releases](https://github.com/0psGhost/devtoolbox/releases) when changes are merged to `main`.
