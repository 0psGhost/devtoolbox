import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton } from '../../components/ui'

interface DiffLine {
  type: 'same' | 'added' | 'removed'
  text: string
}

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const result: DiffLine[] = []

  const maxLen = Math.max(linesA.length, linesB.length)
  for (let i = 0; i < maxLen; i++) {
    const lineA = linesA[i]
    const lineB = linesB[i]
    if (lineA === lineB) {
      if (lineA !== undefined) result.push({ type: 'same', text: `  ${lineA}` })
    } else {
      if (lineA !== undefined) result.push({ type: 'removed', text: `- ${lineA}` })
      if (lineB !== undefined) result.push({ type: 'added', text: `+ ${lineB}` })
    }
  }
  return result
}

export default function TextDiff() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')

  const diff = useMemo(() => {
    if (!textA && !textB) return ''
    return computeDiff(textA, textB).map((l) => l.text).join('\n')
  }, [textA, textB])

  return (
    <ToolLayout title="Text Diff Checker" description="Compare two texts and highlight differences">
      <SplitPanel
        left={
          <TextArea label="Original" value={textA} onChange={setTextA} actions={<CopyButton text={textA} />} />
        }
        right={
          <TextArea label="Modified" value={textB} onChange={setTextB} actions={<CopyButton text={textB} />} />
        }
      />
      <TextArea
        label="Diff"
        value={diff}
        readOnly
        rows={8}
        actions={<CopyButton text={diff} />}
      />
    </ToolLayout>
  )
}
