import * as openpgp from 'openpgp'

export interface PgpKeyInfo {
  fingerprint: string
  keyId: string
  userIds: string[]
  algorithm: string
  created: string
  expires: string
  isPrivate: boolean
  isDecrypted: boolean
  revoked: boolean
  subkeys: { keyId: string; algorithm: string }[]
}

async function readKey(armored: string) {
  return openpgp.readKey({ armoredKey: armored.trim() })
}

export async function inspectKey(armored: string): Promise<PgpKeyInfo> {
  const key = await readKey(armored)
  const algo = key.getAlgorithmInfo()
  const expiry = await key.getExpirationTime()
  const revoked = await key.isRevoked()

  return {
    fingerprint: key.getFingerprint(),
    keyId: key.getKeyID().toHex().toUpperCase(),
    userIds: key.getUserIDs(),
    algorithm: `${algo.algorithm}${algo.bits ? ` ${algo.bits}` : ''}${algo.curve ? ` (${algo.curve})` : ''}`,
    created: key.getCreationTime().toLocaleString(),
    expires: expiry === null ? 'Never' : expiry === Infinity ? 'Never' : (expiry as Date).toLocaleString(),
    isPrivate: key.isPrivate(),
    isDecrypted: key.isPrivate() ? key.isDecrypted() : false,
    revoked,
    subkeys: key.getSubkeys().map((sk) => ({
      keyId: sk.getKeyID().toHex().toUpperCase(),
      algorithm: sk.getAlgorithmInfo().algorithm,
    })),
  }
}

export async function generateKeyPair(options: {
  name: string
  email: string
  passphrase?: string
  type: 'rsa' | 'ecc'
  rsaBits?: number
  curve?: openpgp.EllipticCurveName
  keyExpirationDays?: number
}) {
  const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
    type: options.type,
    rsaBits: options.rsaBits ?? 4096,
    curve: options.curve ?? 'nistP256',
    userIDs: [{ name: options.name, email: options.email }],
    passphrase: options.passphrase || undefined,
    keyExpirationTime: options.keyExpirationDays
      ? options.keyExpirationDays * 24 * 60 * 60
      : undefined,
    format: 'armored',
  })

  return { privateKey, publicKey, revocationCertificate }
}

export async function validateKey(armored: string, passphrase?: string) {
  const checks: { label: string; passed: boolean; detail: string }[] = []
  try {
    const key = await readKey(armored)
    checks.push({ label: 'Key format', passed: true, detail: 'Valid OpenPGP armored key' })
    checks.push({
      label: 'Key type',
      passed: true,
      detail: key.isPrivate() ? 'Private key' : 'Public key',
    })

    try {
      await key.verifyPrimaryKey()
      checks.push({ label: 'Primary key', passed: true, detail: 'Primary key signature is valid' })
    } catch (e) {
      checks.push({ label: 'Primary key', passed: false, detail: (e as Error).message })
    }

    const revoked = await key.isRevoked()
    checks.push({
      label: 'Revocation status',
      passed: !revoked,
      detail: revoked ? 'Key is revoked' : 'Key is not revoked',
    })

    if (key.isPrivate()) {
      if (key.isDecrypted()) {
        checks.push({ label: 'Passphrase', passed: true, detail: 'Key is already decrypted (no passphrase)' })
      } else if (passphrase) {
        try {
          await openpgp.decryptKey({ privateKey: key, passphrase })
          checks.push({ label: 'Passphrase', passed: true, detail: 'Passphrase is correct' })
        } catch {
          checks.push({ label: 'Passphrase', passed: false, detail: 'Incorrect passphrase' })
        }
      } else {
        checks.push({ label: 'Passphrase', passed: true, detail: 'Key is encrypted — provide passphrase to verify' })
      }
    }

    return { valid: checks.filter((c) => c.label !== 'Passphrase' || passphrase).every((c) => c.passed), checks }
  } catch (e) {
    return {
      valid: false,
      checks: [{ label: 'Key format', passed: false, detail: (e as Error).message }],
    }
  }
}

async function getDecryptedPrivateKey(armored: string, passphrase?: string) {
  const key = await readKey(armored)
  if (!key.isPrivate()) throw new Error('A private key is required')
  if (key.isDecrypted()) return key
  if (!passphrase) throw new Error('Passphrase is required for encrypted private key')
  return openpgp.decryptKey({ privateKey: key, passphrase })
}

export async function encryptMessage(plaintext: string, publicKeyArmored: string) {
  const publicKey = await readKey(publicKeyArmored)
  const message = await openpgp.createMessage({ text: plaintext })
  return openpgp.encrypt({ message, encryptionKeys: publicKey, format: 'armored' })
}

export async function decryptMessage(ciphertext: string, privateKeyArmored: string, passphrase?: string) {
  const privateKey = await getDecryptedPrivateKey(privateKeyArmored, passphrase)
  const message = await openpgp.readMessage({ armoredMessage: ciphertext })
  const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey })
  if (typeof data === 'string') return data
  if (data instanceof Uint8Array) return new TextDecoder().decode(data)
  const reader = data.getReader()
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return new TextDecoder().decode(merged)
}

export async function signMessage(plaintext: string, privateKeyArmored: string, passphrase?: string) {
  const privateKey = await getDecryptedPrivateKey(privateKeyArmored, passphrase)
  const message = await openpgp.createCleartextMessage({ text: plaintext })
  return openpgp.sign({ message, signingKeys: privateKey, format: 'armored' })
}

export async function verifyMessage(signedMessage: string, publicKeyArmored: string) {
  const message = await openpgp.readCleartextMessage({ cleartextMessage: signedMessage })
  const key = await readKey(publicKeyArmored)
  const publicKey = key.isPrivate() ? key.toPublic() : key
  const signatures = await message.verify([publicKey])

  const signatureResults = await Promise.all(
    signatures.map(async (sig, i) => {
      try {
        await sig.verified
        return { index: i, valid: true, keyId: sig.keyID.toHex().toUpperCase() }
      } catch (e) {
        return { index: i, valid: false, keyId: sig.keyID.toHex().toUpperCase(), error: (e as Error).message }
      }
    })
  )

  return { text: message.getText(), signatures: signatureResults }
}

export function extractPgpBlocks(input: string): string[] {
  const regex = /-----BEGIN PGP [^-]+-----[\s\S]*?-----END PGP [^-]+-----/g
  return input.match(regex) ?? []
}
