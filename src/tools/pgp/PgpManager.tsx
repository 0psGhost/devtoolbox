import { useState } from 'react'
import { ToolLayout, Button } from '../../components/ui'
import PgpInspector from './PgpInspector'
import PgpGenerator from './PgpGenerator'
import PgpEncrypt from './PgpEncrypt'
import PgpSign from './PgpSign'
import PgpValidator from './PgpValidator'

type Tab = 'inspect' | 'generate' | 'encrypt' | 'sign' | 'validate'

const TABS: { id: Tab; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'generate', label: 'Generate' },
  { id: 'encrypt', label: 'Encrypt' },
  { id: 'sign', label: 'Sign' },
  { id: 'validate', label: 'Validate' },
]

export default function PgpManager() {
  const [tab, setTab] = useState<Tab>('inspect')

  return (
    <ToolLayout
      title="PGP / GPG"
      description="Generate, encrypt, sign, validate, and inspect OpenPGP keys and messages"
      actions={
        <div className="flex flex-wrap gap-1">
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
      {tab === 'inspect' && <PgpInspector />}
      {tab === 'generate' && <PgpGenerator />}
      {tab === 'encrypt' && <PgpEncrypt />}
      {tab === 'sign' && <PgpSign />}
      {tab === 'validate' && <PgpValidator />}
    </ToolLayout>
  )
}
