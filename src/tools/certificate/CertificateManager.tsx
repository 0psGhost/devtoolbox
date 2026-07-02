import { useState } from 'react'
import { ToolLayout, Button } from '../../components/ui'
import CertificateInspector from './CertificateInspector'
import CertificateGenerator from './CertificateGenerator'
import CertificateValidator from './CertificateValidator'

type Tab = 'inspect' | 'generate' | 'validate'

const TABS: { id: Tab; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'generate', label: 'Generate' },
  { id: 'validate', label: 'Validate' },
]

export default function CertificateManager() {
  const [tab, setTab] = useState<Tab>('inspect')

  return (
    <ToolLayout
      title="Certificate Manager"
      description="Generate, validate, and inspect X.509 certificates, CSRs, and private keys"
      actions={
        <div className="flex gap-1">
          {TABS.map((t) => (
            <Button
              key={t.id}
              onClick={() => setTab(t.id)}
              variant={tab === t.id ? 'primary' : 'secondary'}
            >
              {t.label}
            </Button>
          ))}
        </div>
      }
    >
      {tab === 'inspect' && <CertificateInspector />}
      {tab === 'generate' && <CertificateGenerator />}
      {tab === 'validate' && <CertificateValidator />}
    </ToolLayout>
  )
}
