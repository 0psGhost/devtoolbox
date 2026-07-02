import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { TextArea, CopyButton, Button } from '../../components/ui'
import { signMessage, verifyMessage } from './pgpOps'

type Mode = 'sign' | 'verify'

export default function PgpSign() {
  const [mode, setMode] = useState<Mode>('sign')
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [output, setOutput] = useState('')
  const [verifyResult, setVerifyResult] = useState<{ text: string; signatures: { valid: boolean; keyId: string; error?: string }[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setVerifyResult(null)
    try {
      if (mode === 'sign') {
        if (!key.trim()) throw new Error('Private key is required')
        setOutput(await signMessage(message, key, passphrase || undefined))
      } else {
        if (!key.trim()) throw new Error('Public key is required for verification')
        const result = await verifyMessage(message, key)
        setVerifyResult(result)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        <Button onClick={() => setMode('sign')} variant={mode === 'sign' ? 'primary' : 'secondary'}>Sign</Button>
        <Button onClick={() => setMode('verify')} variant={mode === 'verify' ? 'primary' : 'secondary'}>Verify</Button>
      </div>

      <TextArea
        label={mode === 'sign' ? 'Message to Sign' : 'Signed Message'}
        value={message}
        onChange={setMessage}
        placeholder={mode === 'sign' ? 'Enter message...' : '-----BEGIN PGP SIGNED MESSAGE-----...'}
        rows={6}
      />
      <TextArea
        label={mode === 'sign' ? 'Private Key' : 'Public Key *'}
        value={key}
        onChange={setKey}
        placeholder={`-----BEGIN PGP ${mode === 'sign' ? 'PRIVATE' : 'PUBLIC'} KEY BLOCK-----...`}
        rows={mode === 'verify' ? 3 : 5}
      />
      {mode === 'sign' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Passphrase (if key is encrypted)</label>
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      )}

      <Button onClick={run} variant="primary" disabled={loading || !message.trim()}>
        {loading ? 'Processing...' : mode === 'sign' ? 'Sign Message' : 'Verify Signature'}
      </Button>

      {error && <p className="text-sm text-error">{error}</p>}

      {output && (
        <TextArea label="Signed Message" value={output} readOnly rows={10} actions={<CopyButton text={output} />} />
      )}

      {verifyResult && (
        <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
          <div>
            <p className="text-xs text-text-muted mb-1">Verified message</p>
            <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">{verifyResult.text}</pre>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-2">Signatures</p>
            {verifyResult.signatures.map((sig) => (
              <div key={sig.keyId} className="flex items-start gap-2 py-1">
                {sig.valid ? (
                  <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-error shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-mono text-text-primary">Key ID: {sig.keyId}</p>
                  <p className="text-xs text-text-secondary">
                    {sig.valid ? 'Signature is valid' : sig.error ?? 'Signature is invalid'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
