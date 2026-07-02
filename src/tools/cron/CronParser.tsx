import { useState, useMemo } from 'react'
import { ToolLayout, TextArea, CopyButton } from '../../components/ui'
import { parseCron } from './utils'

const EXAMPLES = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
]

export default function CronParser() {
  const [input, setInput] = useState('0 */6 * * *')

  const result = useMemo(() => parseCron(input), [input])

  const output = result.valid
    ? [
        result.description,
        '',
        '── Fields ──',
        ...result.fields.map((f) => `${f.name.padEnd(14)} ${f.raw.padEnd(12)} → ${f.values.join(', ')}`),
        '',
        '── Next 10 runs ──',
        ...result.nextRuns,
      ].join('\n')
    : ''

  return (
    <ToolLayout title="Cron Expression Parser" description="Parse cron schedules and preview upcoming run times">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => setInput(ex.expr)}
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <TextArea
          label="Cron Expression"
          value={input}
          onChange={setInput}
          placeholder="0 */6 * * *  or  @daily"
          rows={2}
          error={result.error}
        />

        {result.valid && (
          <div className="rounded-lg border border-border bg-surface-raised p-4">
            <p className="text-xs text-text-muted mb-1">Human-readable</p>
            <p className="text-sm text-text-primary">{result.description}</p>
            {result.preset && (
              <p className="text-xs text-text-secondary mt-1 font-mono">Equivalent: {PRESET_EQUIVALENT(result.preset)}</p>
            )}
          </div>
        )}

        <TextArea
          label="Parsed Output"
          value={output}
          readOnly
          rows={14}
          actions={<CopyButton text={output} />}
        />

        <p className="text-xs text-text-muted">
          Supports standard 5-field cron, 6-field (with seconds), and @ presets (@hourly, @daily, @weekly, @monthly, @yearly).
        </p>
      </div>
    </ToolLayout>
  )
}

function PRESET_EQUIVALENT(preset: string): string {
  const map: Record<string, string> = {
    '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *',
  }
  return map[preset] ?? preset
}
