# Security Policy

## Overview

DevToolbox is an **offline-first** developer utility. All tool logic runs in your browser or desktop WebView. **No data is sent to external servers** during normal use.

## Reporting vulnerabilities

If you discover a security issue, please report it responsibly:

1. Open a [GitHub Security Advisory](https://github.com/0psGhost/devtoolbox/security/advisories/new) or email the maintainer via GitHub.
2. Do **not** open a public issue for undisclosed vulnerabilities.
3. Include steps to reproduce and potential impact.

## Data handling

| Data type | Storage | Network |
|-----------|---------|---------|
| Tool input (JSON, certs, keys, etc.) | Browser memory only | Never transmitted |
| Theme preference | `localStorage` | Never transmitted |
| Active tool selection | `localStorage` | Never transmitted |
| Private keys / passphrases | Memory only during session | Never transmitted |

Clear the app or close the window to discard in-memory secrets.

## Cryptography

| Component | Library | Notes |
|-----------|---------|-------|
| X.509 certificates | `@peculiar/x509` + Web Crypto | Local generation and validation |
| PGP/GPG | OpenPGP.js | Local encrypt/sign/decrypt |
| Hashing | Web Crypto API + js-md5 | MD5/SHA hashes computed locally |
| UUID | `uuid` v4 | Cryptographically random |

**JWT Debugger** decodes tokens only — it does **not** verify signatures. Do not use it to make trust decisions.

**Hash Generator** includes MD5 and SHA-1 for compatibility; do not use these for password storage.

## Desktop app

- Tauri shell with minimal permissions (`core:default` only)
- No custom Rust commands or network listeners
- macOS builds use ad-hoc signing by default; production distribution should use Apple Developer ID signing and notarization
- macOS entitlements allow WebView JIT (required for the embedded browser engine)

## Dependencies

- Run `npm audit` before releases (automated in CI)
- Keep `@peculiar/x509`, `openpgp`, and Tauri updated for security patches

## Secure usage recommendations

1. Do not paste production private keys on shared or untrusted machines.
2. Prefer the desktop app or local web instance over hosted deployments you do not control.
3. Bump `package.json` version before merging to `main` when you want a distinct GitHub Release.
4. For certificate and PGP operations requiring production-grade assurance, validate output with OpenSSL or GnuPG CLI as a second check.
