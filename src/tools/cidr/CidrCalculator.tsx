import { useState, useMemo } from 'react'
import { ToolLayout, TextArea, CopyButton } from '../../components/ui'
import { parseCidr, isIpInCidr } from './utils'

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined) return null
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="text-sm font-mono text-text-primary mt-0.5">{value}</dd>
    </div>
  )
}

export default function CidrCalculator() {
  const [input, setInput] = useState('192.168.1.0/24')
  const [checkIp, setCheckIp] = useState('')

  const result = useMemo(() => parseCidr(input), [input])
  const inRange = checkIp.trim() && result.valid ? isIpInCidr(checkIp.trim(), input) : null

  const summary = result.valid
    ? [
        `Network:     ${result.network}/${result.prefix}`,
        `Broadcast:   ${result.broadcast}`,
        `Subnet mask: ${result.subnetMask}`,
        `Wildcard:    ${result.wildcardMask}`,
        `Host range:  ${result.firstHost} – ${result.lastHost}`,
        `Total:       ${result.totalAddresses} addresses`,
        `Usable:      ${result.usableHosts} hosts`,
      ].join('\n')
    : ''

  return (
    <ToolLayout title="CIDR / Subnet Calculator" description="Calculate network, broadcast, and host ranges from CIDR notation">
      <div className="flex flex-col gap-4 max-w-2xl">
        <TextArea
          label="CIDR Notation"
          value={input}
          onChange={setInput}
          placeholder="10.0.0.0/8"
          rows={2}
          error={result.error}
        />

        {result.valid && (
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border border-border bg-surface-raised p-4">
            <Field label="Network" value={`${result.network}/${result.prefix}`} />
            <Field label="Broadcast" value={result.broadcast} />
            <Field label="Subnet Mask" value={result.subnetMask} />
            <Field label="Wildcard Mask" value={result.wildcardMask} />
            <Field label="First Host" value={result.firstHost} />
            <Field label="Last Host" value={result.lastHost} />
            <Field label="Total Addresses" value={result.totalAddresses?.toLocaleString()} />
            <Field label="Usable Hosts" value={result.usableHosts?.toLocaleString()} />
            <Field label="IP Class" value={result.ipClass} />
          </dl>
        )}

        {result.valid && result.binary && (
          <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-2">
            <div>
              <p className="text-xs text-text-muted">IP (binary)</p>
              <p className="text-xs font-mono text-text-secondary mt-0.5">{result.binary.ip}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Mask (binary)</p>
              <p className="text-xs font-mono text-text-secondary mt-0.5">{result.binary.mask}</p>
            </div>
          </div>
        )}

        <TextArea label="Summary" value={summary} readOnly rows={7} actions={<CopyButton text={summary} />} />

        {result.valid && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Check if IP is in range</label>
            <div className="flex gap-2 items-center">
              <input
                value={checkIp}
                onChange={(e) => setCheckIp(e.target.value)}
                placeholder="192.168.1.50"
                className="flex-1 rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {inRange !== null && (
                <span className={`text-sm font-medium ${inRange ? 'text-success' : 'text-error'}`}>
                  {inRange ? 'In range' : 'Not in range'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
