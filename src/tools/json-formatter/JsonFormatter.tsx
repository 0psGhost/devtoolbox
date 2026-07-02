import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton, Button } from '../../components/ui'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      const parsed = JSON.parse(input)
      return { output: JSON.stringify(parsed, null, indent), error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, indent])

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
    } catch { /* keep input */ }
  }

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and minify JSON"
      actions={
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary flex items-center gap-1.5">
            Indent
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded border border-border bg-surface-raised px-1.5 py-0.5 text-xs"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={0}>0</option>
            </select>
          </label>
          <Button onClick={minify}>Minify</Button>
        </div>
      }
    >
      <SplitPanel
        left={
          <TextArea
            label="Input"
            value={input}
            onChange={setInput}
            placeholder='{"key": "value"}'
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
