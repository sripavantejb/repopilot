'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { GitMerge, Check, X, ArrowDown } from 'lucide-react'
import type { PullRequest, SwipeAction, ImpactResult } from '../_types'
import { PRCard } from './pr-card'

interface CardStackProps {
  readonly prs: PullRequest[]
  readonly currentIndex: number
  readonly onSwipe: (action: SwipeAction) => void
  readonly impact?: ImpactResult | null
  readonly isLoadingImpact?: boolean
  readonly onMerge?: (pr: PullRequest) => void
  readonly mergingPrNumber?: number | null
  readonly autoMergeEnabled?: boolean
}

export function CardStack({
  prs,
  currentIndex,
  onSwipe,
  impact,
  isLoadingImpact,
  onMerge,
  mergingPrNumber,
  autoMergeEnabled,
}: CardStackProps) {
  const visiblePRs = prs.slice(currentIndex, currentIndex + 3)

  return (
    <div className="relative h-[520px] w-full lg:h-[600px]">
      <AnimatePresence mode="popLayout">
        {visiblePRs.map((pr, index) => (
          <motion.div
            key={pr.number}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 },
            }}
            className="absolute inset-0"
          >
            <PRCard
              pr={pr}
              isActive={index === 0}
              stackIndex={index}
              onSwipe={onSwipe}
              impact={index === 0 ? impact : null}
              isLoadingImpact={index === 0 ? (isLoadingImpact ?? false) : false}
              onMerge={onMerge}
              isMerging={mergingPrNumber === pr.number}
              autoMergeEnabled={autoMergeEnabled}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ActionButtonsProps {
  readonly onAction: (action: SwipeAction) => void
  readonly autoMergeEnabled?: boolean
}

export function ActionButtons({ onAction, autoMergeEnabled }: ActionButtonsProps) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3">
      <button
        onClick={() => onAction('changes')}
        className="group flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#DC2626] bg-card font-mono text-sm font-medium text-[#DC2626] transition-colors hover:bg-[#DC2626]/10 shadow-xs active:scale-[0.98]"
      >
        <X className="h-4 w-4" />
        <span>Request changes</span>
        <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          F
        </span>
      </button>
      <button
        onClick={() => onAction('skip')}
        className="group flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card font-mono text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary shadow-xs active:scale-[0.98]"
      >
        <ArrowDown className="h-4 w-4" />
        <span>Skip</span>
        <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          space
        </span>
      </button>
      <button
        onClick={() => onAction('approve')}
        className={`group flex h-12 items-center justify-center gap-2 rounded-xl border-2 font-mono text-sm font-medium transition-all shadow-xs active:scale-[0.98] ${
          autoMergeEnabled
            ? 'border-purple-600 bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20'
            : 'border-[#22C55E] bg-card text-[#22C55E] hover:bg-[#22C55E]/10'
        }`}
      >
        {autoMergeEnabled ? <GitMerge className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        <span>{autoMergeEnabled ? 'Approve & Merge' : 'Approve'}</span>
        <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          J
        </span>
      </button>
    </div>
  )
}
