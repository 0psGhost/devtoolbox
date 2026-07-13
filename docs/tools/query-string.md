# Query String ↔ JSON

Convert URL query strings to JSON objects and back.

## How to use

1. Paste a query string (e.g. `?foo=bar&baz=1`) or a JSON object.
2. Select conversion direction.
3. Copy the output.

## Example

Query string:
```
name=alice&role=admin&tags=go&tags=rust
```

JSON:
```json
{
  "name": "alice",
  "role": "admin",
  "tags": ["go", "rust"]
}
```

## Tips

- Leading `?` is optional.
- Duplicate keys become JSON arrays.
