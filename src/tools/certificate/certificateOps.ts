import {
  Pkcs10CertificateRequestGenerator,
  X509CertificateGenerator,
  SubjectAlternativeNameExtension,
  KeyUsagesExtension,
  KeyUsageFlags,
  BasicConstraintsExtension,
  ExtendedKeyUsageExtension,
  ExtendedKeyUsage,
  Pkcs10CertificateRequest,
  X509Certificate,
  DNS,
  EMAIL,
  type Extension,
} from '@peculiar/x509'
import {
  buildSubjectDn,
  generateKeyPair,
  getAlgorithmParams,
  importPrivateKey,
  parseSans,
  exportPublicKeyPem,
  derivePublicKeyFromPrivate,
  comparePublicKeys,
  type KeyAlgorithm,
} from './cryptoPem'
import { extractPemBlocks } from './parseCertificate'
import { verifyCertificateSignature } from './certSignature'

export interface GenerateSubjectFields {
  cn: string
  o?: string
  c?: string
  sans?: string
}

export interface GenerateOptions {
  algorithm: KeyAlgorithm
  validityDays: number
  isCA: boolean
}

function buildSanExtension(sans: string[]): SubjectAlternativeNameExtension | null {
  if (!sans.length) return null
  const names = sans.map((s) =>
    s.includes('@') ? { type: EMAIL as 'email', value: s } : { type: DNS as 'dns', value: s }
  )
  return new SubjectAlternativeNameExtension(names)
}

function getSigningAlgorithm(alg: KeyAlgorithm): Algorithm | EcdsaParams {
  const params = getAlgorithmParams(alg)
  if (params.name === 'ECDSA') {
    const ec = params as EcKeyGenParams
    return { name: 'ECDSA', hash: alg === 'ECDSA-P384' ? 'SHA-384' : 'SHA-256', namedCurve: ec.namedCurve } as EcdsaParams
  }
  return params as RsaHashedKeyGenParams
}

export async function generateCsr(
  subject: GenerateSubjectFields,
  options: GenerateOptions,
  existingPrivateKeyPem?: string
) {
  const { keys, privateKeyPem, publicKeyPem } = existingPrivateKeyPem
    ? await importKeyPair(existingPrivateKeyPem, options.algorithm)
    : await generateKeyPair(options.algorithm)

  const sans = parseSans(subject.sans ?? '')
  const extensions: Extension[] = [
    new KeyUsagesExtension(
      options.isCA
        ? KeyUsageFlags.keyCertSign | KeyUsageFlags.cRLSign
        : KeyUsageFlags.digitalSignature | KeyUsageFlags.keyEncipherment
    ),
  ]
  const sanExt = buildSanExtension(sans)
  if (sanExt) extensions.push(sanExt)

  const csr = await Pkcs10CertificateRequestGenerator.create({
    name: buildSubjectDn(subject),
    keys,
    signingAlgorithm: getSigningAlgorithm(options.algorithm),
    extensions,
  })

  return {
    csrPem: csr.toString('pem'),
    privateKeyPem,
    publicKeyPem,
  }
}

export async function generateSelfSignedCertificate(
  subject: GenerateSubjectFields,
  options: GenerateOptions,
  existingPrivateKeyPem?: string
) {
  const { keys, privateKeyPem, publicKeyPem } = existingPrivateKeyPem
    ? await importKeyPair(existingPrivateKeyPem, options.algorithm)
    : await generateKeyPair(options.algorithm)

  const sans = parseSans(subject.sans ?? '')
  const notBefore = new Date()
  const notAfter = new Date()
  notAfter.setDate(notAfter.getDate() + options.validityDays)

  const extensions: Extension[] = [
    new BasicConstraintsExtension(options.isCA, options.isCA ? 0 : undefined, true),
    new KeyUsagesExtension(
      options.isCA
        ? KeyUsageFlags.keyCertSign | KeyUsageFlags.cRLSign
        : KeyUsageFlags.digitalSignature | KeyUsageFlags.keyEncipherment,
      true
    ),
  ]
  if (!options.isCA) {
    extensions.push(new ExtendedKeyUsageExtension([ExtendedKeyUsage.serverAuth, ExtendedKeyUsage.clientAuth]))
  }
  const sanExt = buildSanExtension(sans)
  if (sanExt) extensions.push(sanExt)

  const cert = await X509CertificateGenerator.createSelfSigned({
    name: buildSubjectDn(subject),
    keys,
    notBefore,
    notAfter,
    signingAlgorithm: getSigningAlgorithm(options.algorithm),
    extensions,
  })

  return {
    certificatePem: cert.toString('pem'),
    privateKeyPem,
    publicKeyPem,
  }
}

async function importKeyPair(privateKeyPem: string, _alg: KeyAlgorithm) {
  const privateKey = await importPrivateKey(privateKeyPem)
  const pubKeyFromPrivate = await derivePublicKeyFromPrivate(privateKey)
  return {
    keys: { privateKey, publicKey: pubKeyFromPrivate } as CryptoKeyPair,
    privateKeyPem,
    publicKeyPem: await exportPublicKeyPem(pubKeyFromPrivate),
  }
}

export interface ValidationCheck {
  label: string
  passed: boolean
  detail: string
}

export interface ValidationResult {
  type: 'certificate' | 'csr' | 'private-key' | 'unknown'
  valid: boolean
  checks: ValidationCheck[]
}

export async function validatePem(input: string): Promise<ValidationResult[]> {
  const blocks = extractPemBlocks(input)
  if (!blocks.length) {
    return [{
      type: 'unknown',
      valid: false,
      checks: [{ label: 'PEM format', passed: false, detail: 'No valid PEM blocks found' }],
    }]
  }

  const chain = blocks
    .filter((block) => block.type === 'certificate')
    .flatMap((block) => {
      try {
        return [new X509Certificate(block.raw)]
      } catch {
        return []
      }
    })

  return Promise.all(blocks.map((block) => validateBlock(block.type, block.raw, block.label, chain)))
}

async function validateBlock(
  type: string,
  raw: string,
  label: string,
  chain: X509Certificate[]
): Promise<ValidationResult> {
  if (type === 'certificate') return validateCertificatePem(raw, chain)
  if (type === 'csr') return validateCsrPem(raw)
  if (type === 'private-key') return validatePrivateKeyPem(raw, label)
  return { type: 'unknown', valid: false, checks: [{ label: 'Type', passed: false, detail: `Unsupported PEM type: ${label}` }] }
}

async function validateCertificatePem(raw: string, chain: X509Certificate[]): Promise<ValidationResult> {
  const checks: ValidationCheck[] = []
  try {
    const cert = new X509Certificate(raw)
    checks.push({ label: 'PEM structure', passed: true, detail: 'Valid X.509 certificate PEM' })

    const now = Date.now()
    const notExpired = now <= cert.notAfter.getTime()
    const notBefore = now >= cert.notBefore.getTime()
    checks.push({
      label: 'Not expired',
      passed: notExpired,
      detail: notExpired ? `Valid until ${cert.notAfter.toLocaleDateString()}` : `Expired on ${cert.notAfter.toLocaleDateString()}`,
    })
    checks.push({
      label: 'Currently valid',
      passed: notBefore,
      detail: notBefore ? 'Certificate is active' : `Not valid until ${cert.notBefore.toLocaleDateString()}`,
    })

    const signature = await verifyCertificateSignature(cert, chain)
    if (signature.valid === null) {
      checks.push({
        label: 'Signature',
        passed: true,
        detail: signature.detail,
      })
    } else {
      checks.push({
        label: 'Signature',
        passed: signature.valid,
        detail: signature.detail,
      })
    }

    const selfSigned = await cert.isSelfSigned().catch(() => false)
    checks.push({
      label: 'Self-signed',
      passed: true,
      detail: selfSigned ? 'Certificate is self-signed' : 'Certificate is not self-signed',
    })

    return {
      type: 'certificate',
      valid: checks
        .filter((c) => c.label !== 'Self-signed' && !(c.label === 'Signature' && signature.valid === null))
        .every((c) => c.passed),
      checks,
    }
  } catch (e) {
    return {
      type: 'certificate',
      valid: false,
      checks: [{ label: 'Parse', passed: false, detail: (e as Error).message }],
    }
  }
}

async function validateCsrPem(raw: string): Promise<ValidationResult> {
  const checks: ValidationCheck[] = []
  try {
    const csr = new Pkcs10CertificateRequest(raw)
    checks.push({ label: 'PEM structure', passed: true, detail: 'Valid CSR PEM' })
    checks.push({ label: 'Subject', passed: !!csr.subject, detail: csr.subject || 'No subject' })

    const sigValid = await csr.verify().catch(() => false)
    checks.push({
      label: 'Signature',
      passed: sigValid,
      detail: sigValid ? 'CSR signature is valid' : 'CSR signature verification failed',
    })

    return { type: 'csr', valid: checks.filter((c) => c.label !== 'Subject').every((c) => c.passed), checks }
  } catch (e) {
    return { type: 'csr', valid: false, checks: [{ label: 'Parse', passed: false, detail: (e as Error).message }] }
  }
}

async function validatePrivateKeyPem(raw: string, label: string): Promise<ValidationResult> {
  const checks: ValidationCheck[] = []
  try {
    const key = await importPrivateKey(raw)
    checks.push({ label: 'PEM structure', passed: true, detail: `Valid ${label} PEM` })
    checks.push({
      label: 'Import',
      passed: true,
      detail: `Key algorithm: ${key.algorithm.name}`,
    })
    checks.push({
      label: 'Extractable',
      passed: key.extractable,
      detail: key.extractable ? 'Key is extractable' : 'Key is not extractable',
    })
    return { type: 'private-key', valid: checks.every((c) => c.passed), checks }
  } catch (e) {
    return { type: 'private-key', valid: false, checks: [{ label: 'Parse', passed: false, detail: (e as Error).message }] }
  }
}

export async function validateKeyPairMatch(certificatePem: string, privateKeyPem: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  try {
    const cert = new X509Certificate(certificatePem)
    const privateKey = await importPrivateKey(privateKeyPem)
    const certPubKey = await cert.publicKey.export()
    const pubKeyFromPrivate = await derivePublicKeyFromPrivate(privateKey)
    const { match, fingerprintA, fingerprintB } = await comparePublicKeys(certPubKey, pubKeyFromPrivate)
    checks.push({
      label: 'Certificate ↔ Private Key',
      passed: match,
      detail: match
        ? `Public key fingerprints match (SHA-256 SPKI: ${fingerprintA})`
        : `Fingerprints differ — cert: ${fingerprintA}, key: ${fingerprintB}`,
    })
  } catch (e) {
    checks.push({ label: 'Certificate ↔ Private Key', passed: false, detail: (e as Error).message })
  }
  return checks
}

export async function validateCsrKeyMatch(csrPem: string, privateKeyPem: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  try {
    const csr = new Pkcs10CertificateRequest(csrPem)
    const privateKey = await importPrivateKey(privateKeyPem)
    const csrPubKey = await csr.publicKey.export()
    const pubKeyFromPrivate = await derivePublicKeyFromPrivate(privateKey)
    const { match, fingerprintA, fingerprintB } = await comparePublicKeys(csrPubKey, pubKeyFromPrivate)
    checks.push({
      label: 'CSR ↔ Private Key',
      passed: match,
      detail: match
        ? `Public key fingerprints match (SHA-256 SPKI: ${fingerprintA})`
        : `Fingerprints differ — CSR: ${fingerprintA}, key: ${fingerprintB}`,
    })
  } catch (e) {
    checks.push({ label: 'CSR ↔ Private Key', passed: false, detail: (e as Error).message })
  }
  return checks
}

export async function validateCertCsrMatch(certificatePem: string, csrPem: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  try {
    const cert = new X509Certificate(certificatePem)
    const csr = new Pkcs10CertificateRequest(csrPem)
    const certPubKey = await cert.publicKey.export()
    const csrPubKey = await csr.publicKey.export()
    const { match, fingerprintA, fingerprintB } = await comparePublicKeys(certPubKey, csrPubKey)
    checks.push({
      label: 'Certificate ↔ CSR',
      passed: match,
      detail: match
        ? `Public key fingerprints match (SHA-256 SPKI: ${fingerprintA})`
        : `Fingerprints differ — cert: ${fingerprintA}, CSR: ${fingerprintB}`,
    })
  } catch (e) {
    checks.push({ label: 'Certificate ↔ CSR', passed: false, detail: (e as Error).message })
  }
  return checks
}

/** Validate public-key relationships between cert, CSR, and private key found in input. */
export async function validateKeyRelationships(
  input: string,
  additionalPrivateKey?: string
): Promise<ValidationCheck[]> {
  const blocks = extractPemBlocks(input)
  const certBlocks = blocks.filter((b) => b.type === 'certificate')
  const csrBlocks = blocks.filter((b) => b.type === 'csr')
  const keyBlock = blocks.find((b) => b.type === 'private-key')
  const privateKeyPem = additionalPrivateKey?.trim() || keyBlock?.raw

  const checks: ValidationCheck[] = []
  const hasCertOrCsr = certBlocks.length > 0 || csrBlocks.length > 0

  if (!privateKeyPem && hasCertOrCsr) {
    checks.push({
      label: 'Private key',
      passed: false,
      detail: 'No private key found — paste it with the certificate/CSR or in the key field',
    })
    return checks
  }

  if (!privateKeyPem) return checks

  for (let i = 0; i < certBlocks.length; i++) {
    const pairChecks = await validateKeyPairMatch(certBlocks[i].raw, privateKeyPem)
    checks.push(
      ...pairChecks.map((c) => ({
        ...c,
        label: certBlocks.length > 1 ? `Certificate #${i + 1} ↔ Private Key` : c.label,
      }))
    )
  }

  for (let i = 0; i < csrBlocks.length; i++) {
    const pairChecks = await validateCsrKeyMatch(csrBlocks[i].raw, privateKeyPem)
    checks.push(
      ...pairChecks.map((c) => ({
        ...c,
        label: csrBlocks.length > 1 ? `CSR #${i + 1} ↔ Private Key` : c.label,
      }))
    )
  }

  if (certBlocks.length > 0 && csrBlocks.length > 0) {
    checks.push(...await validateCertCsrMatch(certBlocks[0].raw, csrBlocks[0].raw))
  }

  if (checks.length === 0 && privateKeyPem && !hasCertOrCsr) {
    checks.push({
      label: 'Key pair match',
      passed: false,
      detail: 'Private key provided but no certificate or CSR to compare against',
    })
  }

  return checks
}
