import {
  X509Certificate,
  Pkcs10CertificateRequest,
  SubjectAlternativeNameExtension,
  KeyUsagesExtension,
  ExtendedKeyUsageExtension,
  BasicConstraintsExtension,
  TextConverter,
} from '@peculiar/x509'
import { importPrivateKey } from './cryptoPem'

export type PemBlockType = 'certificate' | 'csr' | 'private-key' | 'unknown'

export interface PemBlock {
  label: string
  type: PemBlockType
  raw: string
}

export interface CertificateInfo {
  index: number
  type: 'certificate'
  subject: string
  issuer: string
  serialNumber: string
  notBefore: Date
  notAfter: Date
  status: 'valid' | 'expired' | 'not-yet-valid' | 'expiring-soon'
  daysRemaining: number
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeySize?: number
  isCA: boolean
  subjectAltNames: string[]
  keyUsages: string[]
  extendedKeyUsages: string[]
  sha1Fingerprint: string
  sha256Fingerprint: string
  isSelfSigned: boolean
  signatureValid: boolean | null
  extensions: { name: string; critical: boolean }[]
  details: string
}

export interface CsrInfo {
  index: number
  type: 'csr'
  subject: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeySize?: number
  subjectAltNames: string[]
  signatureValid: boolean | null
  details: string
}

export interface PrivateKeyInfo {
  index: number
  type: 'private-key'
  keyType: string
  valid: boolean
  detail: string
  algorithm?: string
}

export type ParsedItem = CertificateInfo | CsrInfo | PrivateKeyInfo

const PEM_REGEX = /-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/g

export function extractPemBlocks(input: string): PemBlock[] {
  const blocks: PemBlock[] = []
  let match: RegExpExecArray | null
  const regex = new RegExp(PEM_REGEX.source, 'g')

  while ((match = regex.exec(input)) !== null) {
    const label = match[1].trim()
    const raw = match[0]
    blocks.push({ label, type: classifyPemBlock(label), raw })
  }

  return blocks
}

function classifyPemBlock(label: string): PemBlockType {
  const upper = label.toUpperCase()
  if (upper.includes('CERTIFICATE REQUEST')) return 'csr'
  if (upper.includes('PRIVATE KEY')) return 'private-key'
  if (upper.includes('CERTIFICATE')) return 'certificate'
  return 'unknown'
}

function bufferToHex(buf: ArrayBuffer, separator = ':'): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(separator)
}

function getValidityStatus(notBefore: Date, notAfter: Date): CertificateInfo['status'] {
  const now = Date.now()
  if (now < notBefore.getTime()) return 'not-yet-valid'
  if (now > notAfter.getTime()) return 'expired'
  const daysRemaining = (notAfter.getTime() - now) / (1000 * 60 * 60 * 24)
  if (daysRemaining <= 30) return 'expiring-soon'
  return 'valid'
}

function getKeyUsages(cert: X509Certificate): string[] {
  const ext = cert.getExtension(KeyUsagesExtension)
  if (!ext) return []
  const flags: Record<string, number> = {
    digitalSignature: 1, nonRepudiation: 2, keyEncipherment: 4,
    dataEncipherment: 8, keyAgreement: 16, keyCertSign: 32,
    cRLSign: 64, encipherOnly: 128, decipherOnly: 256,
  }
  return Object.entries(flags)
    .filter(([, bit]) => (ext.usages & bit) !== 0)
    .map(([name]) => name)
}

function getSubjectAltNames(cert: X509Certificate): string[] {
  const ext = cert.getExtension(SubjectAlternativeNameExtension)
  if (!ext?.names?.items) return []
  return ext.names.items.map((n) => String(n))
}

async function parseCertificate(raw: string, index: number): Promise<CertificateInfo> {
  const cert = new X509Certificate(raw)
  const basicConstraints = cert.getExtension(BasicConstraintsExtension)
  const eku = cert.getExtension(ExtendedKeyUsageExtension)

  const [sha1, sha256, selfSigned, valid] = await Promise.all([
    cert.getThumbprint({ name: 'SHA-1' }).then(bufferToHex),
    cert.getThumbprint({ name: 'SHA-256' }).then(bufferToHex),
    cert.isSelfSigned().catch(() => false),
    cert.verify().catch(() => null),
  ])

  const daysRemaining = Math.ceil(
    (cert.notAfter.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const pubKey = cert.publicKey
  let publicKeySize: number | undefined
  try {
    const algo = pubKey.algorithm as RsaHashedKeyGenParams | EcKeyGenParams
    if ('modulusLength' in algo) publicKeySize = algo.modulusLength
    if ('namedCurve' in algo) publicKeySize = parseInt(algo.namedCurve.replace(/\D/g, ''), 10) || undefined
  } catch { /* optional */ }

  return {
    index,
    type: 'certificate',
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    notBefore: cert.notBefore,
    notAfter: cert.notAfter,
    status: getValidityStatus(cert.notBefore, cert.notAfter),
    daysRemaining,
    signatureAlgorithm: cert.signatureAlgorithm.name,
    publicKeyAlgorithm: pubKey.algorithm.name,
    publicKeySize,
    isCA: basicConstraints?.ca ?? false,
    subjectAltNames: getSubjectAltNames(cert),
    keyUsages: getKeyUsages(cert),
    extendedKeyUsages: eku?.usages.map(String) ?? [],
    sha1Fingerprint: sha1,
    sha256Fingerprint: sha256,
    isSelfSigned: selfSigned,
    signatureValid: valid,
    extensions: cert.extensions.map((e) => ({
      name: e.type,
      critical: e.critical,
    })),
    details: TextConverter.serialize(cert.toTextObject()),
  }
}

function getCsrSubjectAltNames(csr: Pkcs10CertificateRequest): string[] {
  const ext = csr.getExtension(SubjectAlternativeNameExtension.NAME)
  if (!ext) return []
  try {
    const san = new SubjectAlternativeNameExtension(ext.value)
    return san.names.items.map((n) => String(n))
  } catch {
    return []
  }
}

async function parseCsr(raw: string, index: number): Promise<CsrInfo> {
  const csr = new Pkcs10CertificateRequest(raw)
  const valid = await csr.verify().catch(() => null)
  const pubKey = csr.publicKey

  let publicKeySize: number | undefined
  try {
    const algo = pubKey.algorithm as RsaHashedKeyGenParams | EcKeyGenParams
    if ('modulusLength' in algo) publicKeySize = algo.modulusLength
  } catch { /* optional */ }

  return {
    index,
    type: 'csr',
    subject: csr.subject,
    signatureAlgorithm: csr.signatureAlgorithm.name,
    publicKeyAlgorithm: pubKey.algorithm.name,
    publicKeySize,
    subjectAltNames: getCsrSubjectAltNames(csr),
    signatureValid: valid,
    details: TextConverter.serialize(csr.toTextObject()),
  }
}

async function parsePrivateKey(raw: string, label: string, index: number): Promise<PrivateKeyInfo> {
  try {
    const key = await importPrivateKey(raw)
    return {
      index,
      type: 'private-key',
      keyType: label,
      valid: true,
      detail: 'Private key is valid and importable',
      algorithm: key.algorithm.name,
    }
  } catch (e) {
    return {
      index,
      type: 'private-key',
      keyType: label,
      valid: false,
      detail: (e as Error).message,
    }
  }
}

export async function parsePemInput(input: string): Promise<{ items: ParsedItem[]; error: string | null }> {
  const trimmed = input.trim()
  if (!trimmed) return { items: [], error: null }

  try {
    const blocks = extractPemBlocks(trimmed)
    if (blocks.length === 0) {
      // Try parsing as a single DER/base64 cert without PEM headers
      try {
        const cert = await parseCertificate(trimmed, 0)
        return { items: [cert], error: null }
      } catch {
        return { items: [], error: 'No valid PEM blocks found. Paste a certificate, CSR, or chain.' }
      }
    }

    const items: ParsedItem[] = []
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      switch (block.type) {
        case 'certificate':
          items.push(await parseCertificate(block.raw, i))
          break
        case 'csr':
          items.push(await parseCsr(block.raw, i))
          break
        case 'private-key':
          items.push(await parsePrivateKey(block.raw, block.label, i))
          break
        default:
          break
      }
    }

    if (items.length === 0) {
      return { items: [], error: 'Recognized PEM blocks but could not parse any supported types.' }
    }

    return { items, error: null }
  } catch (e) {
    return { items: [], error: (e as Error).message }
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}
