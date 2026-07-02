import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { TextArea, CopyButton, Button, Select } from '../../components/ui'
import { generateKeyPair, type KeyAlgorithm } from './cryptoPem'
import { generateCsr, generateSelfSignedCertificate } from './certificateOps'

type GenerateMode = 'key' | 'csr' | 'certificate'

const ALGORITHMS: { value: KeyAlgorithm; label: string }[] = [
  { value: 'RSA-2048', label: 'RSA 2048' },
  { value: 'RSA-4096', label: 'RSA 4096' },
  { value: 'ECDSA-P256', label: 'ECDSA P-256' },
  { value: 'ECDSA-P384', label: 'ECDSA P-384' },
]

export default function CertificateGenerator() {
  const [mode, setMode] = useState<GenerateMode>('key')
  const [cn, setCn] = useState('localhost')
  const [org, setOrg] = useState('')
  const [country, setCountry] = useState('')
  const [sans, setSans] = useState('localhost')
  const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('RSA-2048')
  const [validityDays, setValidityDays] = useState('365')
  const [isCA, setIsCA] = useState(false)
  const [existingKey, setExistingKey] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const subject = { cn, o: org, c: country, sans }
      const options = {
        algorithm,
        validityDays: parseInt(validityDays) || 365,
        isCA,
      }
      const keyPem = existingKey.trim() || undefined

      if (mode === 'key') {
        const { privateKeyPem, publicKeyPem } = await generateKeyPair(algorithm)
        setOutput(`${privateKeyPem}\n${publicKeyPem}`)
      } else if (mode === 'csr') {
        if (!cn.trim()) throw new Error('Common Name (CN) is required')
        const result = await generateCsr(subject, options, keyPem)
        setOutput(keyPem ? result.csrPem : `${result.privateKeyPem}\n${result.csrPem}`)
      } else {
        if (!cn.trim()) throw new Error('Common Name (CN) is required')
        const result = await generateSelfSignedCertificate(subject, options, keyPem)
        setOutput(
          keyPem
            ? result.certificatePem
            : `${result.privateKeyPem}\n${result.certificatePem}`
        )
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1">
        {(['key', 'csr', 'certificate'] as GenerateMode[]).map((m) => (
          <Button
            key={m}
            onClick={() => setMode(m)}
            variant={mode === m ? 'primary' : 'secondary'}
          >
            {m === 'key' ? 'Key Pair' : m === 'csr' ? 'CSR' : 'Certificate'}
          </Button>
        ))}
      </div>

      {mode !== 'key' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Common Name (CN) *</label>
            <input
              value={cn}
              onChange={(e) => setCn(e.target.value)}
              placeholder="example.com"
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Organization (O)</label>
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="My Company"
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Country (C)</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="US"
              maxLength={2}
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Subject Alt Names</label>
            <input
              value={sans}
              onChange={(e) => setSans(e.target.value)}
              placeholder="example.com, www.example.com"
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Key Algorithm" value={algorithm} onChange={(v) => setAlgorithm(v as KeyAlgorithm)} options={ALGORITHMS} />
        {mode === 'certificate' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Validity (days)</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                min={1}
                max={3650}
                className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer pb-1.5">
              <input type="checkbox" checked={isCA} onChange={(e) => setIsCA(e.target.checked)} className="rounded" />
              Certificate Authority (CA)
            </label>
          </>
        )}
        <Button onClick={generate} variant="primary" disabled={loading}>
          <Wand2 size={14} />
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {(mode === 'csr' || mode === 'certificate') && (
        <TextArea
          label="Existing Private Key (optional)"
          value={existingKey}
          onChange={setExistingKey}
          placeholder="Paste an existing private key to reuse it, or leave empty to generate a new one"
          rows={4}
        />
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {output && (
        <TextArea
          label="Generated Output"
          value={output}
          readOnly
          rows={14}
          actions={<CopyButton text={output} />}
        />
      )}
    </div>
  )
}
