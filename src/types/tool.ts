import { type LucideIcon } from 'lucide-react'
import { type ComponentType } from 'react'

export type ToolCategory =
  | 'format'
  | 'encode'
  | 'convert'
  | 'generate'
  | 'inspect'
  | 'devops'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: LucideIcon
  component: ComponentType
  keywords?: string[]
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  format: 'Format & Validate',
  encode: 'Encode & Decode',
  convert: 'Converters',
  generate: 'Generators',
  inspect: 'Inspectors',
  devops: 'DevOps & Infra',
}
