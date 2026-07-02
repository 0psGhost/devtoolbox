import { useState, useMemo } from 'react'
import { ToolLayout, TextArea, CopyButton, Select } from '../../components/ui'

const BASES = [
  { value: '2', label: 'Binary (base 2)' },
  { value: '8', label: 'Octal (base 8)' },
  { value: '10', label: 'Decimal (base 10)' },
  { value: '16', label: 'Hexadecimal (base 16)' },
]

function convert(value: string, fromBase: number, toBase: number): string {
  const num = parseInt(value, fromBase)
  if (isNaN(num)) throw new Error(`Invalid number for base ${fromBase}`)
  return num.toString(toBase).toUpperCase()
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState('10')

  const results = useMemo(() => {
    if (!input.trim()) return ''
    try {
      const from = parseInt(fromBase)
      return BASES.map((b) => {
        const to = parseInt(b.value)
        if (to === from) return `${b.label}: ${input}`
        return `${b.label}: ${convert(input.trim(), from, to)}`
      }).join('\n')
    } catch (e) {
      return (e as Error).message
    }
  }, [input, fromBase])

  return (
    <ToolLayout title="Number Base Converter" description="Convert numbers between binary, octal, decimal, and hex">
      <div className="flex flex-col gap-4 max-w-2xl">
        <Select label="From base" value={fromBase} onChange={setFromBase} options={BASES} />
        <TextArea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="255"
          rows={2}
          actions={<CopyButton text={input} />}
        />
        <TextArea
          label="All bases"
          value={results}
          readOnly
          rows={6}
          actions={<CopyButton text={results} />}
        />
      </div>
    </ToolLayout>
  )
}
