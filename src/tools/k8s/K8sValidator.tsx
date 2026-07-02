import { useState, useMemo } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { ToolLayout, TextArea, CopyButton } from '../../components/ui'
import { validateK8sManifests, type K8sDocumentResult } from './utils'

const SAMPLE = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 200m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /
              port: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
`

function DocumentCard({ doc }: { doc: K8sDocumentResult }) {
  const errors = doc.issues.filter((i) => i.level === 'error')
  const warnings = doc.issues.filter((i) => i.level === 'warning')

  return (
    <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
      <div className="p-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-text-primary">
              {doc.kind ?? 'Unknown'} / {doc.name ?? 'unnamed'}
            </h3>
            {doc.valid ? (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle size={12} /> Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-error">
                <AlertCircle size={12} /> {errors.length} error{errors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-mono">
            {doc.apiVersion}{doc.namespace ? ` · ns: ${doc.namespace}` : ''}
          </p>
        </div>
        <span className="text-xs text-text-muted">Doc #{doc.index}</span>
      </div>

      {doc.issues.length > 0 ? (
        <ul className="divide-y divide-border">
          {doc.issues.map((item, i) => (
            <li key={i} className="px-4 py-2.5 flex items-start gap-2">
              {item.level === 'error' ? (
                <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-mono text-text-muted">{item.path}</p>
                <p className="text-sm text-text-primary">{item.message}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-success">No issues found</p>
      )}

      {warnings.length > 0 && doc.valid && (
        <p className="px-4 py-2 text-xs text-text-muted border-t border-border">
          {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

export default function K8sValidator() {
  const [input, setInput] = useState('')

  const result = useMemo(() => validateK8sManifests(input), [input])

  const report = result.documents.length
    ? result.documents.map((d) => {
        const header = `[Doc ${d.index}] ${d.kind}/${d.name} — ${d.valid ? 'VALID' : 'INVALID'}`
        const issues = d.issues.map((i) => `  [${i.level.toUpperCase()}] ${i.path}: ${i.message}`)
        return [header, ...issues].join('\n')
      }).join('\n\n')
    : ''

  return (
    <ToolLayout
      title="Kubernetes Manifest Validator"
      description="Validate YAML manifests for required fields, best practices, and common mistakes"
      actions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="rounded-md border border-border bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Load sample
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextArea
          label="Kubernetes YAML"
          value={input}
          onChange={setInput}
          placeholder={'apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\n...'}
          rows={14}
          error={result.error}
          actions={<CopyButton text={input} />}
        />

        {result.documents.length > 0 && (
          <>
            <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
              result.valid ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {result.valid
                ? `All ${result.documents.length} document(s) passed validation`
                : `${result.documents.filter((d) => !d.valid).length} of ${result.documents.length} document(s) have errors`}
            </div>

            <div className="space-y-3">
              {result.documents.map((doc) => (
                <DocumentCard key={doc.index} doc={doc} />
              ))}
            </div>

            <TextArea label="Validation Report" value={report} readOnly rows={10} actions={<CopyButton text={report} />} />
          </>
        )}

        {!input.trim() && (
          <p className="text-sm text-text-muted text-center py-4">
            Paste one or more Kubernetes YAML manifests. Multi-document files (---) are supported.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}
