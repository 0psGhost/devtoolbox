import { useState, useEffect, useRef } from 'react'
import { Upload, Shield, ShieldAlert, ShieldCheck, FileKey, AlertTriangle } from 'lucide-react'
import { TextArea, CopyButton, Button } from '../../components/ui'
import {
  parsePemInput,
  formatDate,
  type ParsedItem,
  type CertificateInfo,
  type CsrInfo,
  type PrivateKeyInfo,
} from './parseCertificate'

export function StatusBadge({ status }: { status: CertificateInfo['status'] }) {
  const config = {
    valid: { label: 'Valid', className: 'bg-success/15 text-success', icon: ShieldCheck },
    expired: { label: 'Expired', className: 'bg-error/15 text-error', icon: ShieldAlert },
    'not-yet-valid': { label: 'Not Yet Valid', className: 'bg-accent/15 text-accent', icon: Shield },
    'expiring-soon': { label: 'Expiring Soon', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: AlertTriangle },
  }[status]

  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs text-text-muted mb-0.5">{label}</dt>
      <dd className={`text-sm text-text-primary break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div>
      <dt className="text-xs text-text-muted mb-1">{label}</dt>
      <dd className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span key={item} className="rounded bg-surface-overlay px-2 py-0.5 text-xs font-mono text-text-secondary">
            {item}
          </span>
        ))}
      </dd>
    </div>
  )
}

function CertificateCard({ cert, chainPosition }: { cert: CertificateInfo; chainPosition?: number }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
      <div className="p-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg bg-accent/10 p-2 shrink-0">
            <Shield size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-text-primary text-sm">
                {chainPosition !== undefined ? `Certificate #${chainPosition + 1}` : 'X.509 Certificate'}
              </h3>
              <StatusBadge status={cert.status} />
              {cert.isCA && (
                <span className="rounded bg-surface-overlay px-2 py-0.5 text-xs text-text-secondary">CA</span>
              )}
              {cert.isSelfSigned && (
                <span className="rounded bg-surface-overlay px-2 py-0.5 text-xs text-text-secondary">Self-signed</span>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-1 truncate" title={cert.subject}>
              {cert.subject}
            </p>
          </div>
        </div>
        {cert.status === 'valid' && cert.daysRemaining > 0 && (
          <span className="text-xs text-text-muted shrink-0">{cert.daysRemaining}d left</span>
        )}
      </div>

      <dl className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Issuer" value={cert.issuer} />
        <Field label="Serial Number" value={cert.serialNumber} mono />
        <Field label="Valid From" value={formatDate(cert.notBefore)} />
        <Field label="Valid Until" value={formatDate(cert.notAfter)} />
        <Field label="Signature Algorithm" value={cert.signatureAlgorithm} />
        <Field
          label="Public Key"
          value={`${cert.publicKeyAlgorithm}${cert.publicKeySize ? ` (${cert.publicKeySize} bit)` : ''}`}
        />
        <Field label="SHA-1 Fingerprint" value={cert.sha1Fingerprint} mono />
        <Field label="SHA-256 Fingerprint" value={cert.sha256Fingerprint} mono />
        {cert.signatureValid !== null && (
          <Field label="Signature" value={cert.signatureValid ? 'Valid' : 'Invalid'} />
        )}
        <TagList label="Subject Alternative Names" items={cert.subjectAltNames} />
        <TagList label="Key Usage" items={cert.keyUsages} />
        <TagList label="Extended Key Usage" items={cert.extendedKeyUsages} />
      </dl>

      {cert.extensions.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-text-muted mb-1">Extensions ({cert.extensions.length})</p>
          <div className="flex flex-wrap gap-1">
            {cert.extensions.map((ext) => (
              <span
                key={ext.name}
                className={`rounded px-2 py-0.5 text-xs font-mono ${
                  ext.critical ? 'bg-error/10 text-error' : 'bg-surface-overlay text-text-secondary'
                }`}
              >
                {ext.name}{ext.critical ? ' *' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 flex gap-2">
        <Button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide' : 'Show'} full details
        </Button>
        <CopyButton text={cert.details} />
      </div>

      {showDetails && (
        <pre className="mx-4 mb-4 p-3 rounded-lg bg-surface text-xs font-mono text-text-secondary overflow-x-auto border border-border">
          {cert.details}
        </pre>
      )}
    </div>
  )
}

function CsrCard({ csr }: { csr: CsrInfo }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
      <div className="p-4 border-b border-border flex items-start gap-3">
        <div className="rounded-lg bg-accent/10 p-2 shrink-0">
          <FileKey size={18} className="text-accent" />
        </div>
        <div>
          <h3 className="font-medium text-text-primary text-sm">Certificate Signing Request (CSR)</h3>
          <p className="text-sm text-text-secondary mt-1 break-all">{csr.subject}</p>
        </div>
      </div>

      <dl className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Signature Algorithm" value={csr.signatureAlgorithm} />
        <Field
          label="Public Key"
          value={`${csr.publicKeyAlgorithm}${csr.publicKeySize ? ` (${csr.publicKeySize} bit)` : ''}`}
        />
        {csr.signatureValid !== null && (
          <Field label="Signature" value={csr.signatureValid ? 'Valid' : 'Invalid'} />
        )}
        <TagList label="Subject Alternative Names" items={csr.subjectAltNames} />
      </dl>

      <div className="px-4 pb-4 flex gap-2">
        <Button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide' : 'Show'} full details
        </Button>
        <CopyButton text={csr.details} />
      </div>

      {showDetails && (
        <pre className="mx-4 mb-4 p-3 rounded-lg bg-surface text-xs font-mono text-text-secondary overflow-x-auto border border-border">
          {csr.details}
        </pre>
      )}
    </div>
  )
}

function PrivateKeyCard({ keyInfo }: { keyInfo: PrivateKeyInfo }) {
  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${
      keyInfo.valid
        ? 'border-border bg-surface-raised'
        : 'border-amber-500/30 bg-amber-500/5'
    }`}>
      {keyInfo.valid ? (
        <ShieldCheck size={18} className="text-success shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
      )}
      <div>
        <h3 className="font-medium text-text-primary text-sm">{keyInfo.keyType}</h3>
        <p className="text-sm text-text-secondary mt-1">{keyInfo.detail}</p>
        {keyInfo.algorithm && (
          <p className="text-xs text-text-muted mt-1">Algorithm: {keyInfo.algorithm}</p>
        )}
      </div>
    </div>
  )
}

function ParsedResults({ items }: { items: ParsedItem[] }) {
  const certs = items.filter((i): i is CertificateInfo => i.type === 'certificate')

  return (
    <div className="space-y-4">
      {certs.length > 1 && (
        <p className="text-sm text-text-secondary">
          Certificate chain with {certs.length} certificates
        </p>
      )}
      {items.map((item) => {
        if (item.type === 'certificate') {
          const chainPos = certs.length > 1 ? certs.indexOf(item) : undefined
          return <CertificateCard key={item.index} cert={item} chainPosition={chainPos} />
        }
        if (item.type === 'csr') return <CsrCard key={item.index} csr={item} />
        return <PrivateKeyCard key={item.index} keyInfo={item} />
      })}
    </div>
  )
}

export default function CertificateInspector() {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState('')
  const [parsing, setParsing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!input.trim()) {
      setItems([])
      setError('')
      return
    }

    const timer = setTimeout(async () => {
      setParsing(true)
      const result = await parsePemInput(input)
      setItems(result.items)
      setError(result.error ?? '')
      setParsing(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [input])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 justify-end">
        <input
          ref={fileRef}
          type="file"
          accept=".pem,.crt,.cer,.csr,.key,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button onClick={() => fileRef.current?.click()}>
          <Upload size={14} />
          Upload file
        </Button>
        <Button onClick={() => setInput('')}>Clear</Button>
      </div>

      <TextArea
        label="PEM Input"
        value={input}
        onChange={setInput}
        placeholder={`-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----`}
        rows={8}
        error={error || undefined}
        actions={<CopyButton text={input} />}
      />

      {parsing && input.trim() && <p className="text-sm text-text-muted">Parsing...</p>}
      {!parsing && items.length > 0 && <ParsedResults items={items} />}

      {!input.trim() && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <Shield size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-secondary mb-1">
            Paste a PEM-encoded certificate, CSR, private key, or full chain
          </p>
        </div>
      )}
    </div>
  )
}
