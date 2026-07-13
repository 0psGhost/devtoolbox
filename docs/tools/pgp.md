# PGP / GPG

OpenPGP key management, encryption, signing, and validation. Powered by OpenPGP.js — all operations are local.

## Tabs

### Inspect

Paste armoured PGP keys or messages to view:

- Key type (public/private)
- User IDs and creation date
- Fingerprint
- Subkey information

### Generate

Create a new OpenPGP key pair:

- Name and email (user ID)
- Optional passphrase
- RSA or ECC key type

Outputs armoured public and private keys.

### Encrypt

Encrypt a message for one or more recipients:

1. Paste recipient **public key(s)**.
2. Enter plaintext message.
3. Copy armoured ciphertext.

Optional: sign while encrypting with your private key.

### Sign

Create a detached or inline signature:

1. Paste your **private key** (and passphrase if required).
2. Enter message to sign.
3. Copy armoured signature.

### Validate

Verify signatures and inspect encrypted/signed messages:

- Decrypt with private key + passphrase
- Verify signature against sender's public key
- Check key structure and expiry

## Security note

Private keys and passphrases stay in browser memory only — they are **not** saved to disk or sent over the network. Clear the page when finished on shared machines.

## Limitations

- Not a full GnuPG replacement (no keyserver, WoT, or smart card support)
- Some legacy cipher suites may not be supported

## Example

1. **Generate** a key pair for `dev@example.com`.
2. **Encrypt** a message using the public key.
3. **Validate** by decrypting with the private key.
