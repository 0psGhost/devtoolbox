import { useState } from 'react'
import { v4 as uuidv4, v1 as uuidv1, validate as uuidValidate } from 'uuid'
import { ToolLayout, TextArea, CopyButton, Button } from '../../components/ui'

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [decodeResult, setDecodeResult] = useState('')

  const generate = (version: 'v4' | 'v1', count: number) => {
    const gen = version === 'v4' ? uuidv4 : uuidv1
    setUuids(Array.from({ length: count }, () => gen()))
  }

  const validate = () => {
    const trimmed = input.trim()
    if (!trimmed) {
      setDecodeResult('')
      return
    }
    const valid = uuidValidate(trimmed)
    setDecodeResult(valid ? 'Valid UUID' : 'Invalid UUID')
  }

  return (
    <ToolLayout title="UUID Generator" description="Generate and validate UUIDs (v1, v4)">
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => generate('v4', 1)} variant="primary">Generate UUID v4</Button>
          <Button onClick={() => generate('v1', 1)}>Generate UUID v1</Button>
          <Button onClick={() => generate('v4', 5)}>Generate 5</Button>
        </div>

        {uuids.length > 0 && (
          <TextArea
            label="Generated"
            value={uuids.join('\n')}
            readOnly
            rows={Math.min(uuids.length + 1, 8)}
            actions={<CopyButton text={uuids.join('\n')} />}
          />
        )}

        <div className="border-t border-border pt-4">
          <TextArea
            label="Validate UUID"
            value={input}
            onChange={setInput}
            placeholder="550e8400-e29b-41d4-a716-446655440000"
            rows={2}
            actions={
              <div className="flex gap-2">
                <Button onClick={validate}>Validate</Button>
                <CopyButton text={input} />
              </div>
            }
          />
          {decodeResult && (
            <p className={`text-sm mt-1 ${decodeResult.startsWith('Valid') ? 'text-success' : 'text-error'}`}>
              {decodeResult}
            </p>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
