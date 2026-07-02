import { useState, useMemo } from 'react'
import { ToolLayout, TextArea, CopyButton } from '../../components/ui'

export default function RegExpTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')

  const { matches, error } = useMemo(() => {
    if (!pattern || !text) return { matches: '', error: '' }
    try {
      const regex = new RegExp(pattern, flags)
      const results: string[] = []
      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(text)) !== null) {
          results.push(`Match ${results.length + 1}: "${match[0]}" at index ${match.index}`)
          if (match[0].length === 0) regex.lastIndex++
        }
      } else {
        const match = regex.exec(text)
        if (match) results.push(`Match: "${match[0]}" at index ${match.index}`)
      }
      return {
        matches: results.length ? results.join('\n') : 'No matches found',
        error: '',
      }
    } catch (e) {
      return { matches: '', error: (e as Error).message }
    }
  }, [pattern, flags, text])

  return (
    <ToolLayout title="RegExp Tester" description="Test regular expressions against text">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <TextArea label="Pattern" value={pattern} onChange={setPattern} placeholder="[a-z]+" rows={2} />
          </div>
          <TextArea label="Flags" value={flags} onChange={setFlags} placeholder="gim" rows={2} />
        </div>
        <TextArea
          label="Test string"
          value={text}
          onChange={setText}
          placeholder="Enter text to test against..."
          rows={6}
          actions={<CopyButton text={text} />}
        />
        <TextArea
          label="Matches"
          value={matches}
          readOnly
          error={error}
          rows={6}
          actions={<CopyButton text={matches} />}
        />
      </div>
    </ToolLayout>
  )
}
