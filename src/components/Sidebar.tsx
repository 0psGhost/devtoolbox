import { useState, useMemo } from 'react'
import { Search, Sun, Moon, Monitor, ExternalLink } from 'lucide-react'
import { tools } from '../tools/registry'
import { CATEGORY_LABELS, type ToolCategory } from '../types/tool'
import { useTheme } from '../hooks/useTheme'

interface SidebarProps {
  activeToolId: string
  onSelectTool: (id: string) => void
}

export function Sidebar({ activeToolId, onSelectTool }: SidebarProps) {
  const [query, setQuery] = useState('')
  const { theme, cycleTheme } = useTheme()

  const filtered = useMemo(() => {
    if (!query.trim()) return tools
    const q = query.toLowerCase()
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.includes(q))
    )
  }, [query])

  const grouped = useMemo(() => {
    const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[]
    return categories
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        tools: filtered.filter((t) => t.category === cat),
      }))
      .filter((g) => g.tools.length > 0)
  }, [filtered])

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <aside className="flex flex-col w-64 shrink-0 border-r border-border bg-surface h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">DT</span>
          </div>
          <div>
            <h1 className="font-semibold text-text-primary text-sm leading-tight">DevToolbox</h1>
            <p className="text-[11px] text-text-muted">Open-source utilities</p>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-md border border-border bg-surface-raised pl-8 pr-3 py-1.5
              text-sm text-text-primary placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {grouped.map(({ category, label, tools: catTools }) => (
          <div key={category}>
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {label}
            </p>
            <ul className="space-y-0.5">
              {catTools.map((tool) => {
                const Icon = tool.icon
                const active = tool.id === activeToolId
                return (
                  <li key={tool.id}>
                    <button
                      onClick={() => onSelectTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors
                        ${active
                          ? 'bg-accent/15 text-accent font-medium'
                          : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                        }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">No tools found</p>
        )}
      </nav>

      <div className="p-3 border-t border-border flex items-center justify-between">
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={16} />
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          title="GitHub"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </aside>
  )
}
