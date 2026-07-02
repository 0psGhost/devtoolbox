import { useState, useEffect } from 'react'
import { ToolLayout, TextArea, CopyButton, Button } from '../../components/ui'

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toISOString() + '\n' + d.toLocaleString()
}

function parseInput(input: string): number | null {
  const cleaned = input.replace(/[,.\s]/g, '')
  const num = Number(cleaned)
  if (isNaN(num)) return null
  return cleaned.length <= 10 ? num * 1000 : num
}

export default function UnixTimeConverter() {
  const [input, setInput] = useState('')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const parsed = parseInput(input)
  const output = parsed !== null ? formatTimestamp(parsed) : input.trim() ? 'Invalid timestamp' : ''

  return (
    <ToolLayout title="Unix Time Converter" description="Convert between Unix timestamps and human-readable dates">
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <p className="text-xs text-text-secondary mb-1">Current time</p>
          <p className="font-mono text-sm">{Math.floor(now / 1000)} <span className="text-text-muted">(seconds)</span></p>
          <p className="font-mono text-sm text-text-secondary">{now} <span className="text-text-muted">(milliseconds)</span></p>
          <p className="text-sm text-text-secondary mt-1">{new Date(now).toLocaleString()}</p>
          <div className="mt-2">
            <Button onClick={() => setInput(String(Math.floor(now / 1000)))}>
              Use current
            </Button>
          </div>
        </div>

        <TextArea
          label="Timestamp (seconds or milliseconds)"
          value={input}
          onChange={setInput}
          placeholder="1611241901"
          rows={2}
          actions={<CopyButton text={input} />}
        />
        <TextArea
          label="Human-readable"
          value={output}
          readOnly
          rows={4}
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  )
}
