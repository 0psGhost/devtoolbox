import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton, Button } from '../../components/ui'

type Mode = 'encode' | 'decode'

const entityMap: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}

function encodeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => entityMap[c])
}

function decodeHtml(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export default function HtmlEntityTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('encode')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return mode === 'encode' ? encodeHtml(input) : decodeHtml(input)
  }, [input, mode])

  return (
    <ToolLayout
      title="HTML Entity Encode / Decode"
      description="Encode and decode HTML entities"
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
          <TextArea label="Input" value={input} onChange={setInput} actions={<CopyButton text={input} />} />
        }
        right={
          <TextArea label="Output" value={output} readOnly actions={<CopyButton text={output} />} />
        }
      />
    </ToolLayout>
  )
}
