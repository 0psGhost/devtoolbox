import { useState, useMemo } from 'react'
import { load, dump } from 'js-yaml'
import { ToolLayout, SplitPanel, TextArea, CopyButton, Button } from '../../components/ui'

type Mode = 'yaml-to-json' | 'json-to-yaml'

export default function YamlJsonConverter() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('yaml-to-json')

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      if (mode === 'yaml-to-json') {
        const parsed = load(input)
        return { output: JSON.stringify(parsed, null, 2), error: '' }
      }
      const parsed = JSON.parse(input)
      return { output: dump(parsed, { indent: 2 }), error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="YAML ↔ JSON"
      description="Convert between YAML and JSON formats"
      actions={
        <div className="flex gap-1">
          <Button onClick={() => setMode('yaml-to-json')} variant={mode === 'yaml-to-json' ? 'primary' : 'secondary'}>
            YAML → JSON
          </Button>
          <Button onClick={() => setMode('json-to-yaml')} variant={mode === 'json-to-yaml' ? 'primary' : 'secondary'}>
            JSON → YAML
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
            placeholder={mode === 'yaml-to-json' ? 'key: value' : '{"key": "value"}'}
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
