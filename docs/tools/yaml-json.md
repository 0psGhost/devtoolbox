# YAML ↔ JSON

Convert between YAML and JSON in both directions.

## How to use

1. Paste YAML or JSON in the input field.
2. Select the conversion direction (YAML → JSON or JSON → YAML).
3. Copy the converted output.

## Example

YAML input:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
```

JSON output:
```json
{
  "apiVersion": "v1",
  "kind": "ConfigMap",
  "metadata": {
    "name": "app-config"
  }
}
```

## Tips

- Invalid YAML or JSON shows a parse error with details.
- Useful for editing Kubernetes manifests or CI configs.
