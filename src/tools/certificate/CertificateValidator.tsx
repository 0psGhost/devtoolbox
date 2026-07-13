import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { TextArea, Button } from '../../components/ui'
import {
  validatePem,
  validateKeyRelationships,
  type ValidationResult,
  type ValidationCheck,
} from './certificateOps'

function CheckRow({ check }: { check: ValidationCheck }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {check.passed ? (
        <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
      ) : (
        <XCircle size={16} className="text-error shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm font-medium text-text-primary">{check.label}</p>
        <p className="text-xs text-text-secondary">{check.detail}</p>
      </div>
    </div>
  )
}

function ValidationCard({ result, index }: { result: ValidationResult; index: number }) {
  const typeLabel = {
    certificate: 'Certificate',
    csr: 'CSR',
    'private-key': 'Private Key',
    unknown: 'Unknown',
  }[result.type]

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">
          {typeLabel} {index > 0 ? `#${index + 1}` : ''}
        </h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          result.valid ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
        }`}>
          {result.valid ? 'Valid' : 'Invalid'}
        </span>
      </div>
      <div className="divide-y divide-border">
        {result.checks.map((check) => (
          <CheckRow key={check.label} check={check} />
        ))}
      </div>
    </div>
  )
}

export default function CertificateValidator() {
  const [input, setInput] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [results, setResults] = useState<ValidationResult[]>([])
  const [matchChecks, setMatchChecks] = useState<ValidationCheck[]>([])
  const [loading, setLoading] = useState(false)

  const validate = async () => {
    setLoading(true)
    try {
      const pemResults = await validatePem(input)
      setResults(pemResults)
      setMatchChecks(await validateKeyRelationships(input, privateKey.trim() || undefined))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Certificate / CSR / Key PEM"
        value={input}
        onChange={setInput}
        placeholder="Paste certificate, CSR, and/or private key PEM blocks..."
        rows={8}
      />
      <TextArea
        label="Private Key (optional if already included above)"
        value={privateKey}
        onChange={setPrivateKey}
        placeholder="-----BEGIN PRIVATE KEY-----..."
        rows={4}
      />
      <Button onClick={validate} variant="primary" disabled={loading || !input.trim()}>
        {loading ? 'Validating...' : 'Validate'}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, i) => (
            <ValidationCard key={i} result={result} index={i} />
          ))}
        </div>
      )}

      {matchChecks.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <h3 className="text-sm font-medium text-text-primary mb-1">Public Key Matching</h3>
          <p className="text-xs text-text-muted mb-3">
            Compares SHA-256 fingerprints of each public key (SPKI) to verify cert, CSR, and private key belong together.
          </p>
          <div className="divide-y divide-border">
            {matchChecks.map((check) => (
              <CheckRow key={check.label} check={check} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
