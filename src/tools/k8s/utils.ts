import { loadAll } from 'js-yaml'

export interface K8sIssue {
  level: 'error' | 'warning'
  path: string
  message: string
}

export interface K8sDocumentResult {
  index: number
  kind?: string
  name?: string
  apiVersion?: string
  namespace?: string
  valid: boolean
  issues: K8sIssue[]
}

export interface K8sValidationResult {
  documents: K8sDocumentResult[]
  valid: boolean
  error?: string
}

const NAMESPACED_KINDS = new Set([
  'Pod', 'Service', 'Deployment', 'ReplicaSet', 'StatefulSet', 'DaemonSet',
  'Job', 'CronJob', 'ConfigMap', 'Secret', 'Ingress', 'PersistentVolumeClaim',
  'ServiceAccount', 'Role', 'RoleBinding', 'NetworkPolicy', 'HorizontalPodAutoscaler',
])

const WORKLOAD_KINDS = new Set(['Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob', 'Pod'])

function issue(level: K8sIssue['level'], path: string, message: string): K8sIssue {
  return { level, path, message }
}

function validateContainer(container: Record<string, unknown>, path: string, issues: K8sIssue[]) {
  if (!container.name) issues.push(issue('error', `${path}.name`, 'Container name is required'))
  if (!container.image) issues.push(issue('error', `${path}.image`, 'Container image is required'))

  const resources = container.resources as Record<string, unknown> | undefined
  if (!resources) {
    issues.push(issue('warning', `${path}.resources`, 'No resource limits/requests defined'))
  } else if (!resources.limits && !resources.requests) {
    issues.push(issue('warning', `${path}.resources`, 'No limits or requests set'))
  }

  for (const probe of ['livenessProbe', 'readinessProbe'] as const) {
    if (!container[probe]) issues.push(issue('warning', `${path}.${probe}`, `Missing ${probe}`))
  }
}

function validatePodSpec(spec: Record<string, unknown>, path: string, issues: K8sIssue[]) {
  const containers = spec.containers as Record<string, unknown>[] | undefined
  if (!containers?.length) {
    issues.push(issue('error', `${path}.containers`, 'At least one container is required'))
    return
  }
  containers.forEach((c, i) => validateContainer(c, `${path}.containers[${i}]`, issues))
}

function validateWorkloadSpec(spec: Record<string, unknown>, path: string, issues: K8sIssue[]) {
  if (spec.replicas === undefined) {
    issues.push(issue('warning', `${path}.replicas`, 'replicas not specified (defaults to 1)'))
  } else if (typeof spec.replicas === 'number' && spec.replicas < 0) {
    issues.push(issue('error', `${path}.replicas`, 'replicas cannot be negative'))
  }

  const template = spec.template as Record<string, unknown> | undefined
  if (!template) {
    issues.push(issue('error', `${path}.template`, 'Pod template is required'))
    return
  }
  validatePodSpec((template.spec ?? {}) as Record<string, unknown>, `${path}.template.spec`, issues)
}

function validateDocument(doc: unknown, index: number): K8sDocumentResult {
  const issues: K8sIssue[] = []

  if (!doc || typeof doc !== 'object') {
    return { index, valid: false, issues: [issue('error', '', 'Document is empty or not an object')] }
  }

  const manifest = doc as Record<string, unknown>
  const kind = manifest.kind as string | undefined
  const apiVersion = manifest.apiVersion as string | undefined
  const metadata = (manifest.metadata ?? {}) as Record<string, unknown>
  const name = metadata.name as string | undefined
  const namespace = metadata.namespace as string | undefined

  if (!apiVersion) issues.push(issue('error', 'apiVersion', 'apiVersion is required'))
  if (!kind) issues.push(issue('error', 'kind', 'kind is required'))
  if (!name) issues.push(issue('error', 'metadata.name', 'metadata.name is required'))

  if (apiVersion && !/^(v\d+|apps\/v\d+|batch\/v\d+|rbac\.authorization\.k8s\.io\/v\d+|networking\.k8s\.io\/v\d+|autoscaling\/v\d+|policy\/v\d+)/.test(apiVersion)) {
    issues.push(issue('warning', 'apiVersion', `Unusual apiVersion: ${apiVersion}`))
  }

  if (kind && NAMESPACED_KINDS.has(kind) && !namespace) {
    issues.push(issue('warning', 'metadata.namespace', 'No namespace set (will use "default")'))
  }

  const labels = metadata.labels as Record<string, unknown> | undefined
  if (!labels?.['app'] && !labels?.['app.kubernetes.io/name']) {
    issues.push(issue('warning', 'metadata.labels', 'Consider adding app or app.kubernetes.io/name label'))
  }

  const spec = (manifest.spec ?? {}) as Record<string, unknown>

  if (kind === 'Pod') {
    validatePodSpec(spec, 'spec', issues)
  } else if (kind && WORKLOAD_KINDS.has(kind) && kind !== 'Pod') {
    validateWorkloadSpec(spec, 'spec', issues)
  }

  if (kind === 'Service') {
    const ports = spec.ports as unknown[] | undefined
    if (!ports?.length) issues.push(issue('error', 'spec.ports', 'Service must define at least one port'))
    if (!spec.selector) issues.push(issue('warning', 'spec.selector', 'No selector defined'))
  }

  if (kind === 'Ingress') {
    const rules = spec.rules as unknown[] | undefined
    if (!rules?.length) issues.push(issue('warning', 'spec.rules', 'Ingress has no rules defined'))
  }

  if (kind === 'ConfigMap' || kind === 'Secret') {
    if (!manifest.data && !manifest.binaryData && !manifest.stringData) {
      issues.push(issue('warning', 'data', 'No data entries defined'))
    }
  }

  return {
    index,
    kind,
    name,
    apiVersion,
    namespace,
    valid: !issues.some((i) => i.level === 'error'),
    issues,
  }
}

export function validateK8sManifests(input: string): K8sValidationResult {
  const trimmed = input.trim()
  if (!trimmed) return { documents: [], valid: true }

  try {
    const docs = loadAll(trimmed) as unknown[]
    if (!docs.length) return { documents: [], valid: false, error: 'No YAML documents found' }

    const documents = docs.map((doc, i) => validateDocument(doc, i + 1))
    return { documents, valid: documents.every((d) => d.valid) }
  } catch (e) {
    return { documents: [], valid: false, error: `YAML parse error: ${(e as Error).message}` }
  }
}
