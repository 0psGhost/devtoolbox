import { X509Certificate } from '@peculiar/x509'

export interface SignatureVerification {
  valid: boolean | null
  detail: string
}

export function findIssuerCert(cert: X509Certificate, chain: X509Certificate[]): X509Certificate | null {
  for (const candidate of chain) {
    if (candidate.rawData === cert.rawData) continue
    if (candidate.subject === cert.issuer) return candidate
  }
  return null
}

export async function verifyCertificateSignature(
  cert: X509Certificate,
  chain: X509Certificate[]
): Promise<SignatureVerification> {
  const selfSigned = await cert.isSelfSigned().catch(() => false)

  if (selfSigned) {
    const valid = await cert.verify({ signatureOnly: true }).catch(() => false)
    return {
      valid,
      detail: valid
        ? 'Self-signed certificate signature is valid'
        : 'Self-signed signature verification failed',
    }
  }

  const issuer = findIssuerCert(cert, chain)
  if (issuer) {
    const valid = await cert.verify({ publicKey: issuer.publicKey, signatureOnly: true }).catch(() => false)
    return {
      valid,
      detail: valid
        ? 'Signature verified against issuer certificate'
        : 'Signature does not match issuer certificate',
    }
  }

  return {
    valid: null,
    detail: 'CA-signed certificate — include issuer certificate in the chain to verify signature',
  }
}
