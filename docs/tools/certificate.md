# Certificate Manager

Generate, inspect, and validate X.509 certificates, CSRs, and private keys. All cryptography runs locally in your browser.

## Tabs

### Inspect

Paste PEM blocks to view certificate, CSR, or private key details:

- Subject, issuer, validity dates
- Serial number and fingerprints (SHA-1, SHA-256)
- Key algorithm and size
- Subject Alternative Names, key usage, extensions
- Signature validity (with chain-aware verification)

Supports multiple PEM blocks in one paste (e.g. certificate chains).

### Generate

Create new key material:

| Mode | Output |
|------|--------|
| **Key Pair** | Private + public key (PKCS#8) |
| **CSR** | Certificate Signing Request + key pair |
| **Certificate** | Self-signed X.509 certificate + key pair |

**Options:**

- Common Name (CN), Organisation, Country
- Subject Alternative Names (DNS names or emails, comma-separated)
- Key algorithm: RSA 2048/4096, ECDSA P-256/P-384
- Validity period (days)
- CA mode (for intermediate/root CAs)

Optionally provide an existing private key PEM to reuse a key.

### Validate

Check PEM data and key-pair relationships:

**Per certificate:**

- PEM structure
- Expiry and active date range
- Signature (self-signed, or against issuer if chain is pasted)
- Self-signed indicator

**Per CSR:**

- PEM structure and subject
- CSR self-signature

**Per private key:**

- PEM import (RSA/ECDSA PKCS#8)
- Algorithm detection

**Public key matching** (when a private key is present):

- Certificate ↔ Private Key (SHA-256 SPKI fingerprint)
- CSR ↔ Private Key
- Certificate ↔ CSR (when all three are pasted)

Paste the private key in the main field or the optional key field.

## Supported formats

- `-----BEGIN CERTIFICATE-----`
- `-----BEGIN CERTIFICATE REQUEST-----`
- `-----BEGIN PRIVATE KEY-----` (PKCS#8)

## Limitations

- No PKCS#1 `RSA PRIVATE KEY` format
- No encrypted/passphrase-protected private keys
- No OCSP/CRL revocation checks
- No trust-store or hostname validation

## Example workflow

1. **Generate** a self-signed cert for `localhost`.
2. Switch to **Validate** and paste the cert + private key.
3. Confirm public key fingerprints match and signature is valid.
