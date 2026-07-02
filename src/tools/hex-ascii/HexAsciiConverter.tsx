import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton } from '../../components/ui'

function toHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}

function fromHex(hex: string): string {
  const bytes = hex.replace(/\s+/g, '').match(/.{1,2}/g)
  if (!bytes) throw new Error('Invalid hex string')
  return new TextDecoder().decode(new Uint8Array(bytes.map((b) => parseInt(b, 16))))
}

export default function HexAsciiConverter() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'to-hex' | 'from-hex'>('to-hex')

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      if (mode === 'to-hex') return { output: toHex(input), error: '' }
      return { output: fromHex(input), error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="Hex ↔ ASCII"
      description="Convert between hexadecimal and ASCII text"
      actions={
        <div className="flex gap-1">
          <button
            onClick={() => setMode('to-hex')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'to-hex' ? 'bg-accent text-white' : 'bg-surface-raised border border-border text-text-secondary'
            }`}
          >
            Text → Hex
          </button>
          <button
            onClick={() => setMode('from-hex')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'from-hex' ? 'bg-accent text-white' : 'bg-surface-raised border border-border text-text-secondary'
            }`}
          >
            Hex → Text
          </button>
        </div>
      }
    >
      <SplitPanel
        left={
          <TextArea
            label="Input"
            value={input}
            onChange={setInput}
            placeholder={mode === 'to-hex' ? 'Hello' : '48 65 6c 6c 6f'}
            actions={<CopyButton text={input} />}
          />
        }
        right={
          <TextArea
            label="Output"
            value={output}
            readOnly
            error={error}
            actions={<CopyButton text={output} />}
          />
        }
      />
    </ToolLayout>
  )
}
