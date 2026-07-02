export interface CronField {
  name: string
  raw: string
  values: number[]
  description: string
}

export interface CronParseResult {
  valid: boolean
  expression: string
  preset?: string
  fields: CronField[]
  description: string
  nextRuns: string[]
  error?: string
}

const PRESETS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

const FIELD_NAMES_5 = ['minute', 'hour', 'day of month', 'month', 'day of week']
const FIELD_NAMES_6 = ['second', 'minute', 'hour', 'day of month', 'month', 'day of week']
const FIELD_RANGES: [number, number][] = [
  [0, 59], [0, 23], [1, 31], [1, 12], [0, 7],
]
const FIELD_RANGES_6: [number, number][] = [
  [0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 7],
]

function expandPart(part: string, min: number, max: number): number[] {
  const values = new Set<number>()
  const segments = part.split(',')

  for (const segment of segments) {
    const stepMatch = segment.match(/^(.+)\/(\d+)$/)
    const base = stepMatch ? stepMatch[1] : segment
    const step = stepMatch ? parseInt(stepMatch[2], 10) : 1

    if (base === '*') {
      for (let i = min; i <= max; i += step) values.add(i)
      continue
    }

    const rangeMatch = base.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      for (let i = start; i <= end; i += step) {
        if (i >= min && i <= max) values.add(i)
      }
      continue
    }

    const num = parseInt(base, 10)
    if (!isNaN(num) && num >= min && num <= max) values.add(num)
  }

  return [...values].sort((a, b) => a - b)
}

function describeField(name: string, values: number[], min: number, max: number): string {
  if (values.length === max - min + 1) return `every ${name}`
  if (values.length <= 5) return `${name}: ${values.join(', ')}`
  return `${name}: ${values.length} values (${values[0]}–${values[values.length - 1]})`
}

function normalizeDow(values: number[]): number[] {
  return [...new Set(values.map((v) => (v === 7 ? 0 : v)))].sort((a, b) => a - b)
}

function matchesDate(d: Date, fields: CronField[], hasSeconds: boolean): boolean {
  const checks = hasSeconds
    ? [d.getSeconds(), d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()]
    : [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()]

  const fieldIndices = hasSeconds ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4]

  for (let i = 0; i < fieldIndices.length; i++) {
    const f = fields[fieldIndices[i]]
    let vals = f.values
    if (f.name === 'day of week') vals = normalizeDow(vals)
    if (!vals.includes(checks[i])) return false
  }
  return true
}

function getNextRuns(fields: CronField[], hasSeconds: boolean, count: number): string[] {
  const runs: string[] = []
  const cursor = new Date()
  cursor.setMilliseconds(0)
  if (!hasSeconds) cursor.setSeconds(0)

  let iterations = 0
  const maxIterations = 525600 * 2

  while (runs.length < count && iterations < maxIterations) {
    if (matchesDate(cursor, fields, hasSeconds)) {
      runs.push(cursor.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: hasSeconds ? '2-digit' : undefined,
      }))
    }
    if (hasSeconds) cursor.setSeconds(cursor.getSeconds() + 1)
    else cursor.setMinutes(cursor.getMinutes() + 1)
    iterations++
  }

  return runs
}

function buildDescription(fields: CronField[]): string {
  return `Runs ${fields.map((f) => f.description).join(', ')}`
}

export function parseCron(input: string): CronParseResult {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) {
    return { valid: false, expression: '', fields: [], description: '', nextRuns: [], error: 'Enter a cron expression' }
  }

  let expression = trimmed
  let preset: string | undefined

  if (trimmed.startsWith('@')) {
    const mapped = PRESETS[trimmed]
    if (!mapped) {
      return { valid: false, expression: trimmed, fields: [], description: '', nextRuns: [], error: `Unknown preset: ${trimmed}` }
    }
    preset = trimmed
    expression = mapped
  }

  const parts = expression.split(/\s+/)
  const hasSeconds = parts.length === 6
  if (parts.length !== 5 && parts.length !== 6) {
    return {
      valid: false, expression: trimmed, fields: [], description: '', nextRuns: [],
      error: 'Expected 5 fields (min hour dom month dow) or 6 fields (sec min hour dom month dow)',
    }
  }

  const names = hasSeconds ? FIELD_NAMES_6 : FIELD_NAMES_5
  const ranges = hasSeconds ? FIELD_RANGES_6 : FIELD_RANGES

  try {
    const fields: CronField[] = parts.map((part, i) => {
      const [min, max] = ranges[i]
      let values = expandPart(part, min, max)
      if (names[i] === 'day of week') values = normalizeDow(values)
      return {
        name: names[i],
        raw: part,
        values,
        description: describeField(names[i], values, min, max),
      }
    })

    if (fields.some((f) => f.values.length === 0)) {
      return { valid: false, expression: trimmed, fields, description: '', nextRuns: [], error: 'One or more fields have no valid values' }
    }

    const description = preset ? `${preset} (${buildDescription(fields)})` : buildDescription(fields)

    return {
      valid: true,
      expression: trimmed,
      preset,
      fields,
      description,
      nextRuns: getNextRuns(fields, hasSeconds, 10),
    }
  } catch (e) {
    return { valid: false, expression: trimmed, fields: [], description: '', nextRuns: [], error: (e as Error).message }
  }
}
