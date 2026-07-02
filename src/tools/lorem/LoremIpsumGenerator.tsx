import { useState } from 'react'
import { ToolLayout, TextArea, CopyButton, Button, Select } from '../../components/ui'

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

function generate(paragraphs: number, words: number): string {
  const words_list = LOREM.replace(/[.,]/g, '').split(/\s+/)
  const result: string[] = []

  for (let p = 0; p < paragraphs; p++) {
    const para: string[] = []
    for (let w = 0; w < words; w++) {
      para.push(words_list[w % words_list.length])
    }
    para[0] = para[0].charAt(0).toUpperCase() + para[0].slice(1)
    result.push(para.join(' ') + '.')
  }
  return result.join('\n\n')
}

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState('3')
  const [words, setWords] = useState('50')
  const [output, setOutput] = useState('')

  const generateText = () => {
    setOutput(generate(parseInt(paragraphs) || 1, parseInt(words) || 10))
  }

  return (
    <ToolLayout title="Lorem Ipsum Generator" description="Generate placeholder text for designs and prototypes">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <Select
            label="Paragraphs"
            value={paragraphs}
            onChange={setParagraphs}
            options={Array.from({ length: 10 }, (_, i) => ({
              value: String(i + 1),
              label: String(i + 1),
            }))}
          />
          <Select
            label="Words per paragraph"
            value={words}
            onChange={setWords}
            options={[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ]}
          />
          <Button onClick={generateText} variant="primary">Generate</Button>
        </div>
        <TextArea
          label="Output"
          value={output}
          readOnly
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  )
}
