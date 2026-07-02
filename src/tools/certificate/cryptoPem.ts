export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function wrapPem(label: string, der: ArrayBuffer): string {
  const b64 = arrayBufferToBase64(der)
  const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`
}

export async function exportPrivateKeyPem(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', key)
  return wrapPem('PRIVATE KEY', exported)
}

export async function exportPublicKeyPem(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key)
  return wrapPem('PUBLIC KEY', exported)
}

export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const der = pemToDer(pem)
  const algorithms: (RsaHashedImportParams | EcKeyImportParams)[] = [
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-1' },
    { name: 'ECDSA', namedCurve: 'P-256' },
    { name: 'ECDSA', namedCurve: 'P-384' },
    { name: 'ECDSA', namedCurve: 'P-521' },
  ]
  let lastError: Error | undefined
  for (const algo of algorithms) {
    try {
      return await crypto.subtle.importKey('pkcs8', der, algo, true, ['sign'])
    } catch (e) {
      lastError = e as Error
    }
  }
  throw lastError ?? new Error('Unable to import private key')
}

export function pemToDer(pem: string): ArrayBuffer {
  const match = pem.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END/)
  if (!match) throw new Error('Invalid PEM format')
  const b64 = match[1].replace(/\s/g, '')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export type KeyAlgorithm = 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256' | 'ECDSA-P384'

export function getAlgorithmParams(alg: KeyAlgorithm): RsaHashedKeyGenParams | EcKeyGenParams {
  switch (alg) {
    case 'RSA-2048':
      return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }
    case 'RSA-4096':
      return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]) }
    case 'ECDSA-P256':
      return { name: 'ECDSA', namedCurve: 'P-256' }
    case 'ECDSA-P384':
      return { name: 'ECDSA', namedCurve: 'P-384' }
  }
}

export function buildSubjectDn(fields: { cn: string; o?: string; c?: string }): string {
  const parts = [`CN=${fields.cn}`]
  if (fields.o?.trim()) parts.push(`O=${fields.o.trim()}`)
  if (fields.c?.trim()) parts.push(`C=${fields.c.trim()}`)
  return parts.join(', ')
}

export function parseSans(input: string): string[] {
  return input.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
}

export async function generateKeyPair(alg: KeyAlgorithm): Promise<{ keys: CryptoKeyPair; privateKeyPem: string; publicKeyPem: string }> {
  const params = getAlgorithmParams(alg)
  const keys = await crypto.subtle.generateKey(params, true, ['sign', 'verify'])
  const [privateKeyPem, publicKeyPem] = await Promise.all([
    exportPrivateKeyPem(keys.privateKey),
    exportPublicKeyPem(keys.publicKey),
  ])
  return { keys, privateKeyPem, publicKeyPem }
}

export async function publicKeysMatch(a: CryptoKey, b: CryptoKey): Promise<boolean> {
  const [bufA, bufB] = await Promise.all([
    crypto.subtle.exportKey('spki', a),
    crypto.subtle.exportKey('spki', b),
  ])
  if (bufA.byteLength !== bufB.byteLength) return false
  const viewA = new Uint8Array(bufA)
  const viewB = new Uint8Array(bufB)
  return viewA.every((v, i) => v === viewB[i])
}
