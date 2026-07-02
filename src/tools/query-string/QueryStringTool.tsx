import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton, Button } from '../../components/ui'

type Mode = 'to-json' | 'from-json'

export default function QueryStringTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('to-json')

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      if (mode === 'to-json') {
        const params = new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
        const obj: Record<string, string | string[]> = {}
        params.forEach((value, key) => {
          if (key in obj) {
            const existing = obj[key]
            obj[key] = Array.isArray(existing) ? [...existing, value] : [existing as string, value]
          } else {
            obj[key] = value
          }
        })
        return { output: JSON.stringify(obj, null, 2), error: '' }
      }
      const parsed = JSON.parse(input) as Record<string, unknown>
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(parsed)) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)))
        } else {
          params.set(key, String(value))
        }
      }
      return { output: params.toString(), error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="Query String ↔ JSON"
      description="Convert between URL query strings and JSON"
      actions={
        <div className="flex gap-1">
          <Button onClick={() => setMode('to-json')} variant={mode === 'to-json' ? 'primary' : 'secondary'}>
            Query → JSON
          </Button>
          <Button onClick={() => setMode('from-json')} variant={mode === 'from-json' ? 'primary' : 'secondary'}>
            JSON → Query
          </Button>
        </div>
      }
    >
      <SplitPanel
        left={
          <TextArea
            label="Input"
            value={input}
            onChange={setInput}
            placeholder={mode === 'to-json' ? 'foo=bar&baz=qux' : '{"foo": "bar"}'}
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
