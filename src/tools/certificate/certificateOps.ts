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
  publicKeysMatch,
  type KeyAlgorithm,
} from './cryptoPem'
import { extractPemBlocks } from './parseCertificate'

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
  return Promise.all(blocks.map((block) => validateBlock(block.type, block.raw, block.label)))
}

async function validateBlock(type: string, raw: string, label: string): Promise<ValidationResult> {
  if (type === 'certificate') return validateCertificatePem(raw)
  if (type === 'csr') return validateCsrPem(raw)
  if (type === 'private-key') return validatePrivateKeyPem(raw, label)
  return { type: 'unknown', valid: false, checks: [{ label: 'Type', passed: false, detail: `Unsupported PEM type: ${label}` }] }
}

async function validateCertificatePem(raw: string): Promise<ValidationResult> {
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

    const sigValid = await cert.verify({ signatureOnly: true }).catch(() => false)
    checks.push({
      label: 'Signature',
      passed: sigValid,
      detail: sigValid ? 'Cryptographic signature is valid' : 'Signature verification failed',
    })

    const selfSigned = await cert.isSelfSigned().catch(() => false)
    checks.push({
      label: 'Self-signed',
      passed: true,
      detail: selfSigned ? 'Certificate is self-signed' : 'Certificate is not self-signed',
    })

    return { type: 'certificate', valid: checks.filter((c) => c.label !== 'Self-signed').every((c) => c.passed), checks }
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
    const match = await publicKeysMatch(certPubKey, pubKeyFromPrivate)
    checks.push({
      label: 'Key pair match',
      passed: match,
      detail: match ? 'Private key matches certificate public key' : 'Private key does NOT match certificate',
    })
  } catch (e) {
    checks.push({ label: 'Key pair match', passed: false, detail: (e as Error).message })
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
    const match = await publicKeysMatch(csrPubKey, pubKeyFromPrivate)
    checks.push({
      label: 'CSR key match',
      passed: match,
      detail: match ? 'Private key matches CSR public key' : 'Private key does NOT match CSR',
    })
  } catch (e) {
    checks.push({ label: 'CSR key match', passed: false, detail: (e as Error).message })
  }
  return checks
}

async function derivePublicKeyFromPrivate(privateKey: CryptoKey): Promise<CryptoKey> {
  const jwk = await crypto.subtle.exportKey('jwk', privateKey) as JsonWebKey
  if (jwk.kty === 'RSA') {
    return crypto.subtle.importKey(
      'jwk', { kty: 'RSA', n: jwk.n, e: jwk.e },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['verify']
    )
  }
  return crypto.subtle.importKey(
    'jwk', { kty: 'EC', crv: jwk.crv, x: jwk.x, y: jwk.y },
    { name: 'ECDSA', namedCurve: jwk.crv! }, true, ['verify']
  )
}
