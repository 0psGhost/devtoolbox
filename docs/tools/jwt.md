# JWT Debugger

Decode and inspect JSON Web Tokens (JWT).

## How to use

1. Paste a JWT (format: `header.payload.signature`).
2. View decoded **header** and **payload** as formatted JSON.
3. Inspect claims such as `exp`, `iat`, `sub`, `iss`.

## Example

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Decoded payload:
```json
{
  "sub": "1234567890"
}
```

## Smart paste

Paste a JWT anywhere in the app to auto-open this tool.

## Security note

This tool **decodes only** — it does **not** verify signatures. Never trust decoded claims for authentication decisions without proper signature verification using the issuer's public key.

## Use cases

- Debug OAuth/OIDC tokens
- Inspect `exp` and `iat` timestamps
- Understand API gateway or service mesh tokens
