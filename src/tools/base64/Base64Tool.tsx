import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton, Button } from '../../components/ui'

type Mode = 'encode' | 'decode'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('encode')

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      if (mode === 'encode') {
        return { output: btoa(unescape(encodeURIComponent(input))), error: '' }
      }
      return { output: decodeURIComponent(escape(atob(input))), error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="Base64 Encode / Decode"
      description="Encode and decode Base64 strings"
      actions={
        <div className="flex gap-1">
          <Button onClick={() => setMode('encode')} variant={mode === 'encode' ? 'primary' : 'secondary'}>
            Encode
          </Button>
          <Button onClick={() => setMode('decode')} variant={mode === 'decode' ? 'primary' : 'secondary'}>
            Decode
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
            placeholder={mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='}
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
