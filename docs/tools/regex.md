# RegExp Tester

Test JavaScript regular expressions against sample text.

## How to use

1. Enter a **regex pattern** (without surrounding slashes).
2. Set **flags** (e.g. `g`, `i`, `m`).
3. Enter **test text**.
4. View all matches with positions and capture groups.

## Example

| Pattern | Flags | Text | Matches |
|---------|-------|------|---------|
| `\d+` | `g` | `order 42 and 99` | `42`, `99` |

## Tips

- Invalid patterns show a syntax error immediately.
- Use capture groups `(...)` to see sub-matches.
- Uses JavaScript `RegExp` engine (may differ from PCRE/Python).
