# K8s Validator

Validate Kubernetes YAML manifests locally.

## How to use

1. Paste one or more Kubernetes YAML documents (separated by `---`).
2. Review validation results per resource.

## What is checked

- **YAML syntax** — valid YAML structure
- **Required fields** — `apiVersion`, `kind`, `metadata.name`
- **Kind-specific rules** — common required fields per resource type
- **Best-practice warnings** — missing labels, probes, resource limits, etc.

## Supported kinds (partial list)

- Pod, Deployment, Service, ConfigMap, Secret
- Ingress, Namespace, PersistentVolumeClaim
- StatefulSet, DaemonSet, Job, CronJob

## Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx:latest
```

## Smart paste

Paste YAML containing `apiVersion:` and `kind:` anywhere to auto-open this tool.

## Limitations

- Schema validation only — does not apply manifests to a cluster
- Does not validate against a specific Kubernetes version's OpenAPI schema
- Warnings are advisory, not exhaustive

## Tips

- Fix **errors** (red) before deploying; review **warnings** (amber) as recommendations.
