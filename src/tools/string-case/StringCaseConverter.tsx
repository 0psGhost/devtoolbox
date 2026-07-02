import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton } from '../../components/ui'

const cases: Record<string, (s: string) => string> = {
  'camelCase': (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toLowerCase()),
  'PascalCase': (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toUpperCase()),
  'snake_case': (s) => s.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').toLowerCase().replace(/^_/, ''),
  'kebab-case': (s) => s.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').toLowerCase().replace(/^-/, ''),
  'UPPER CASE': (s) => s.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
  'lower case': (s) => s.toLowerCase(),
  'Title Case': (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  'CONSTANT_CASE': (s) => s.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').toUpperCase().replace(/^_/, ''),
}

export default function StringCaseConverter() {
  const [input, setInput] = useState('')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return Object.entries(cases)
      .map(([name, fn]) => `${name}: ${fn(input.trim())}`)
      .join('\n')
  }, [input])

  return (
    <ToolLayout title="String Case Converter" description="Convert strings between camelCase, snake_case, kebab-case, and more">
      <SplitPanel
        left={
          <TextArea label="Input" value={input} onChange={setInput} placeholder="hello_world" actions={<CopyButton text={input} />} />
        }
        right={
          <TextArea label="All cases" value={output} readOnly actions={<CopyButton text={output} />} />
        }
      />
    </ToolLayout>
  )
}
