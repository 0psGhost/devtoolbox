import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { TextArea, CopyButton, Button, Select } from '../../components/ui'
import { generateKeyPair } from './pgpOps'
import type { EllipticCurveName } from 'openpgp'

const KEY_TYPES = [
  { value: 'rsa', label: 'RSA' },
  { value: 'ecc', label: 'ECC (Curve)' },
]

const RSA_BITS = [
  { value: '2048', label: '2048 bit' },
  { value: '4096', label: '4096 bit' },
]

const CURVES: { value: EllipticCurveName; label: string }[] = [
  { value: 'nistP256', label: 'NIST P-256' },
  { value: 'nistP384', label: 'NIST P-384' },
  { value: 'nistP521', label: 'NIST P-521' },
  { value: 'curve25519Legacy', label: 'Curve25519' },
  { value: 'ed25519Legacy', label: 'Ed25519' },
]

export default function PgpGenerator() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [keyType, setKeyType] = useState<'rsa' | 'ecc'>('rsa')
  const [rsaBits, setRsaBits] = useState('4096')
  const [curve, setCurve] = useState<EllipticCurveName>('nistP256')
  const [expirationDays, setExpirationDays] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await generateKeyPair({
        name: name.trim(),
        email: email.trim(),
        passphrase: passphrase || undefined,
        type: keyType,
        rsaBits: parseInt(rsaBits),
        curve,
        keyExpirationDays: expirationDays ? parseInt(expirationDays) : undefined,
      })
      setOutput(`${result.privateKey}\n${result.publicKey}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Smith"
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Email *</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alice@example.com"
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-text-secondary">Passphrase (optional)</label>
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Protect private key with passphrase"
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Key Type" value={keyType} onChange={(v) => setKeyType(v as 'rsa' | 'ecc')} options={KEY_TYPES} />
        {keyType === 'rsa' ? (
          <Select label="RSA Bits" value={rsaBits} onChange={setRsaBits} options={RSA_BITS} />
        ) : (
          <Select label="Curve" value={curve} onChange={(v) => setCurve(v as EllipticCurveName)} options={CURVES} />
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Expiration (days)</label>
          <input type="number" value={expirationDays} onChange={(e) => setExpirationDays(e.target.value)}
            placeholder="Never" min={1}
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
        <Button onClick={generate} variant="primary" disabled={loading}>
          <Wand2 size={14} />
          {loading ? 'Generating...' : 'Generate Key Pair'}
        </Button>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {output && (
        <TextArea label="Generated Keys (private + public)" value={output} readOnly rows={16}
          actions={<CopyButton text={output} />} />
      )}
    </div>
  )
}
