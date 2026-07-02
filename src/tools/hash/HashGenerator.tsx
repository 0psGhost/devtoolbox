import { useState, useEffect } from 'react'
import { md5 } from 'js-md5'
import { ToolLayout, TextArea, CopyButton, Select } from '../../components/ui'

const ALGORITHMS = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha384', label: 'SHA-384' },
  { value: 'sha512', label: 'SHA-512' },
]

async function hashText(algorithm: string, text: string): Promise<string> {
  if (algorithm === 'md5') return md5(text)

  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest(
    algorithm.toUpperCase().replace('SHA', 'SHA-') as AlgorithmIdentifier,
    data
  )
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }
    hashText(algorithm, input).then(setOutput)
  }, [input, algorithm])

  return (
    <ToolLayout title="Hash Generator" description="Generate MD5, SHA-1, SHA-2 hashes">
      <div className="flex flex-col gap-4 max-w-2xl">
        <Select
          label="Algorithm"
          value={algorithm}
          onChange={setAlgorithm}
          options={ALGORITHMS}
        />
        <TextArea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Enter text to hash..."
          rows={6}
          actions={<CopyButton text={input} />}
        />
        <TextArea
          label="Hash"
          value={output}
          readOnly
          rows={3}
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  )
}
