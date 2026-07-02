import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { TextArea, Button } from '../../components/ui'
import { validateKey, extractPgpBlocks } from './pgpOps'

export default function PgpValidator() {
  const [input, setInput] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [results, setResults] = useState<{ valid: boolean; checks: { label: string; passed: boolean; detail: string }[] }[]>([])
  const [loading, setLoading] = useState(false)

  const validate = async () => {
    setLoading(true)
    try {
      const blocks = extractPgpBlocks(input)
      if (!blocks.length) {
        setResults([{ valid: false, checks: [{ label: 'Format', passed: false, detail: 'No PGP armored blocks found' }] }])
        return
      }
      const res = await Promise.all(blocks.map((b) => validateKey(b, passphrase || undefined)))
      setResults(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="PGP / GPG Key"
        value={input}
        onChange={setInput}
        placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..."
        rows={8}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Passphrase (for private keys)</label>
        <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
          className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
      </div>
      <Button onClick={validate} variant="primary" disabled={loading || !input.trim()}>
        {loading ? 'Validating...' : 'Validate Key'}
      </Button>

      {results.map((result, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface-raised p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-primary">Key {results.length > 1 ? `#${i + 1}` : ''}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              result.valid ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
            }`}>
              {result.valid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          <div className="divide-y divide-border">
            {result.checks.map((check) => (
              <div key={check.label} className="flex items-start gap-2 py-1.5">
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
