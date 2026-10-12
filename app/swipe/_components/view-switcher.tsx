'use client'

import { Layers, LayoutGrid, Users, Tags, GitFork, type LucideIcon } from 'lucide-react'

export type ViewMode = 'swipe' | 'risk-matrix' | 'contributor' | 'category' | 'deps'

interface Props {
  current: ViewMode
  onChange: (v: ViewMode) => void
}

const VIEWS: { id: ViewMode; icon: LucideIcon; title: string }[] = [
  { id: 'swipe',       icon: Layers,     title: 'Swipe' },
  { id: 'risk-matrix', icon: LayoutGrid, title: 'Risk Matrix' },
  { id: 'contributor', icon: Users,      title: 'By Contributor' },
  { id: 'category',    icon: Tags,       title: 'By Category' },
  { id: 'deps',        icon: GitFork,    title: 'Dependencies' },
]

export function ViewSwitcher({ current, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-sm">
      {VIEWS.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={title}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            current === id
              ? 'bg-foreground text-background shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}
