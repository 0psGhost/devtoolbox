# Cron Parser

Parse cron expressions and preview upcoming run times.

## How to use

1. Enter a cron expression (5 or 6 fields).
2. View a human-readable description.
3. See the next scheduled execution times.

## Supported formats

**5-field (standard):**
```
minute hour day-of-month month day-of-week
```

**6-field (with seconds):**
```
second minute hour day-of-month month day-of-week
```

## Examples

| Expression | Meaning |
|------------|---------|
| `0 */6 * * *` | Every 6 hours |
| `30 9 * * 1-5` | 9:30 AM weekdays |
| `0 0 1 * *` | Midnight on the 1st of each month |

## Smart paste

Paste a cron expression anywhere in the app to auto-open this tool.

## Tips

- Uses standard cron field ranges and step values (`*/5`, `1-5`, `MON-FRI`).
- Invalid expressions show a descriptive error.
