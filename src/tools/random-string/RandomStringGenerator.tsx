import { useState } from 'react'
import { ToolLayout, TextArea, CopyButton, Button } from '../../components/ui'

function randomString(length: number, charset: string): string {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => charset[b % charset.length]).join('')
}

const CHARSETS = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  hex: '0123456789abcdef',
  symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
}

export default function RandomStringGenerator() {
  const [length, setLength] = useState('32')
  const [charset, setCharset] = useState<keyof typeof CHARSETS>('alphanumeric')
  const [output, setOutput] = useState('')

  const generate = () => {
    setOutput(randomString(parseInt(length) || 16, CHARSETS[charset]))
  }

  return (
    <ToolLayout title="Random String Generator" description="Generate cryptographically random strings">
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Length</span>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              min={1}
              max={1024}
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm w-24
                focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Charset</span>
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value as keyof typeof CHARSETS)}
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {Object.keys(CHARSETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <Button onClick={generate} variant="primary">Generate</Button>
        </div>
        <TextArea
          label="Output"
          value={output}
          readOnly
          rows={3}
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  )
}
