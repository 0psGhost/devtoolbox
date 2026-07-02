import { useState, useMemo } from 'react'
import { ToolLayout, SplitPanel, TextArea, CopyButton } from '../../components/ui'

function decodePart(part: string): unknown {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export default function JwtDebugger() {
  const [token, setToken] = useState('')

  const { header, payload, error } = useMemo(() => {
    if (!token.trim()) return { header: '', payload: '', error: '' }
    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 parts')

      return {
        header: JSON.stringify(decodePart(parts[0]), null, 2),
        payload: JSON.stringify(decodePart(parts[1]), null, 2),
        error: '',
      }
    } catch (e) {
      return { header: '', payload: '', error: (e as Error).message }
    }
  }, [token])

  return (
    <ToolLayout title="JWT Debugger" description="Decode and inspect JSON Web Tokens">
      <div className="flex flex-col gap-4 h-full">
        <TextArea
          label="JWT Token"
          value={token}
          onChange={setToken}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows={3}
          error={error}
          actions={<CopyButton text={token} />}
        />
        <SplitPanel
          left={
            <TextArea
              label="Header"
              value={header}
              readOnly
              rows={8}
              actions={<CopyButton text={header} />}
            />
          }
          right={
            <TextArea
              label="Payload"
              value={payload}
              readOnly
              rows={8}
              actions={<CopyButton text={payload} />}
            />
          }
        />
      </div>
    </ToolLayout>
  )
}
