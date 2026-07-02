import { useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { tools } from './tools/registry'
import { useLocalStorage } from './hooks/useLocalStorage'

function detectTool(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) return 'unix-time'
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json-formatter'
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0) return 'base64'
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) return 'jwt'
  if (/-----BEGIN CERTIFICATE-----/.test(trimmed)) return 'certificate'
  if (/-----BEGIN PGP/.test(trimmed)) return 'pgp'
  if (/^apiVersion:\s/m.test(trimmed) && /^kind:\s/m.test(trimmed)) return 'k8s'
  if (/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(trimmed)) return 'cidr'
  if (/^[\d*,\-/]+(\s+[\d*,\-/]+){4,5}$/.test(trimmed)) return 'cron'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return 'uuid'

  return null
}

export default function App() {
  const [activeToolId, setActiveToolId] = useLocalStorage('activeTool', 'json-formatter')

  const activeTool = tools.find((t) => t.id === activeToolId) ?? tools[0]
  const ToolComponent = activeTool.component

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const text = e.clipboardData?.getData('text')
      if (text) {
        const detected = detectTool(text)
        if (detected) setActiveToolId(detected)
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [setActiveToolId])

  return (
    <div className="flex h-screen bg-surface text-text-primary">
      <Sidebar activeToolId={activeToolId} onSelectTool={setActiveToolId} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <ToolComponent key={activeToolId} />
        </div>
      </main>
    </div>
  )
}
