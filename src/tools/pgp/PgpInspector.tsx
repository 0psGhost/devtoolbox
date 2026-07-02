import { useState, useEffect } from 'react'
import { KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react'
import { TextArea, CopyButton } from '../../components/ui'
import { inspectKey, extractPgpBlocks, type PgpKeyInfo } from './pgpOps'

function KeyInfoCard({ info, index }: { info: PgpKeyInfo; index: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
      <div className="p-4 border-b border-border flex items-start gap-3">
        <div className="rounded-lg bg-accent/10 p-2 shrink-0">
          <KeyRound size={18} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-text-primary text-sm">
              {info.isPrivate ? 'Private Key' : 'Public Key'} {index > 0 ? `#${index + 1}` : ''}
            </h3>
            {info.revoked ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-error/15 text-error">
                <ShieldAlert size={12} /> Revoked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-success/15 text-success">
                <ShieldCheck size={12} /> Active
              </span>
            )}
            {info.isPrivate && (
              <span className="rounded bg-surface-overlay px-2 py-0.5 text-xs text-text-secondary">
                {info.isDecrypted ? 'Unencrypted' : 'Passphrase protected'}
              </span>
            )}
          </div>
          {info.userIds.map((uid) => (
            <p key={uid} className="text-sm text-text-secondary mt-1">{uid}</p>
          ))}
        </div>
      </div>
      <dl className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div><dt className="text-xs text-text-muted">Key ID</dt><dd className="font-mono text-xs mt-0.5">{info.keyId}</dd></div>
        <div><dt className="text-xs text-text-muted">Algorithm</dt><dd className="mt-0.5">{info.algorithm}</dd></div>
        <div className="md:col-span-2"><dt className="text-xs text-text-muted">Fingerprint</dt><dd className="font-mono text-xs mt-0.5 break-all">{info.fingerprint}</dd></div>
        <div><dt className="text-xs text-text-muted">Created</dt><dd className="mt-0.5">{info.created}</dd></div>
        <div><dt className="text-xs text-text-muted">Expires</dt><dd className="mt-0.5">{info.expires}</dd></div>
        {info.subkeys.length > 0 && (
          <div className="md:col-span-2">
            <dt className="text-xs text-text-muted mb-1">Subkeys ({info.subkeys.length})</dt>
            <dd className="flex flex-wrap gap-1">
              {info.subkeys.map((sk) => (
                <span key={sk.keyId} className="rounded bg-surface-overlay px-2 py-0.5 text-xs font-mono text-text-secondary">
                  {sk.keyId} ({sk.algorithm})
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export default function PgpInspector() {
  const [input, setInput] = useState('')
  const [keys, setKeys] = useState<PgpKeyInfo[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setKeys([])
      setError('')
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const blocks = extractPgpBlocks(input)
        if (!blocks.length) {
          setKeys([])
          setError('No PGP armored blocks found')
          return
        }
        const results = await Promise.all(blocks.map((b) => inspectKey(b)))
        setKeys(results)
        setError('')
      } catch (e) {
        setKeys([])
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [input])

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="PGP / GPG Key"
        value={input}
        onChange={setInput}
        placeholder={`-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----`}
        rows={8}
        error={error || undefined}
        actions={<CopyButton text={input} />}
      />
      {loading && <p className="text-sm text-text-muted">Parsing...</p>}
      {keys.length > 0 && (
        <div className="space-y-4">
          {keys.map((k, i) => <KeyInfoCard key={i} info={k} index={i} />)}
        </div>
      )}
      {!input.trim() && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <KeyRound size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-secondary">Paste a PGP or GPG public or private key to inspect it</p>
        </div>
      )}
    </div>
  )
}
