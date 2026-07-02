import { useState } from 'react'
import { TextArea, CopyButton, Button } from '../../components/ui'
import { encryptMessage, decryptMessage } from './pgpOps'

type Mode = 'encrypt' | 'decrypt'

export default function PgpEncrypt() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    try {
      if (mode === 'encrypt') {
        if (!key.trim()) throw new Error('Public key is required')
        setOutput(await encryptMessage(message, key))
      } else {
        if (!key.trim()) throw new Error('Private key is required')
        setOutput(await decryptMessage(message, key, passphrase || undefined))
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
        <Button onClick={() => setMode('encrypt')} variant={mode === 'encrypt' ? 'primary' : 'secondary'}>Encrypt</Button>
        <Button onClick={() => setMode('decrypt')} variant={mode === 'decrypt' ? 'primary' : 'secondary'}>Decrypt</Button>
      </div>

      <TextArea
        label={mode === 'encrypt' ? 'Plaintext Message' : 'Encrypted Message'}
        value={message}
        onChange={setMessage}
        placeholder={mode === 'encrypt' ? 'Enter message to encrypt...' : '-----BEGIN PGP MESSAGE-----...'}
        rows={6}
      />
      <TextArea
        label={mode === 'encrypt' ? 'Public Key' : 'Private Key'}
        value={key}
        onChange={setKey}
        placeholder={`-----BEGIN PGP ${mode === 'encrypt' ? 'PUBLIC' : 'PRIVATE'} KEY BLOCK-----...`}
        rows={5}
      />
      {mode === 'decrypt' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Passphrase (if key is encrypted)</label>
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
            className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      )}

      <Button onClick={run} variant="primary" disabled={loading || !message.trim()}>
        {loading ? 'Processing...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </Button>

      {error && <p className="text-sm text-error">{error}</p>}
      {output && (
        <TextArea label="Output" value={output} readOnly rows={10} actions={<CopyButton text={output} />} />
      )}
    </div>
  )
}
