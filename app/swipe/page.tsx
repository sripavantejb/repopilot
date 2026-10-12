'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { PullRequest, SwipeAction, ChatMessage, SessionStats, AIContext, DecisionRecord, ImpactResult } from './_types'
import { Header } from './_components/header'
import { CardStack, ActionButtons } from './_components/card-stack'
import { AIContextPanel } from './_components/ai-context-panel'
import { toast } from 'sonner'
import type { GitHubConfig } from './_components/github-settings-modal'
import { BottomStrip } from './_components/bottom-strip'
import { MobileContextSheet } from './_components/mobile-context-sheet'
import { KeyboardHints } from './_components/keyboard-hints'
import { SessionSummary } from './_components/session-summary'
import { DecisionHistory } from './_components/decision-history'
import { ViewSwitcher, type ViewMode } from './_components/view-switcher'
import { ViewRiskMatrix } from './_components/view-risk-matrix'
import { ViewContributorFocus } from './_components/view-contributor-focus'
import { ViewCategoryGroup } from './_components/view-category-group'
import { ViewDependencyGraph } from './_components/view-dependency-graph'
import { localRiskScore } from './_components/view-helpers'

type DeeperAction = 'risk_verbose' | 'callers' | 'tests' | 'compare'

function formatDeeperResult(action: DeeperAction, data: Record<string, unknown>): string {
  if (data.error) return `Error: ${typeof data.error === 'string' ? data.error : 'Unknown error'}`

  switch (action) {
    case 'risk_verbose': {
      const score = data.score as number
      const reasons = (data.reasons as { text: string; source: string }[])
        .map((r) => `• [${r.source}] ${r.text}`)
        .join('\n')
      return `Risk score: ${score}/100\n\nFactors:\n${reasons || 'No significant risk factors detected.'}`
    }
    case 'callers': {
      const results = data.results as { filename: string; hits: { line: number; content: string }[] }[]
      if (!results.length) return `No callers found for "${String(data.functionName)}".`
      return results
        .map((r) => {
          const hits = r.hits.map((h) => `  L${h.line}: ${h.content.trim()}`).join('\n')
          return `${r.filename}:\n${hits}`
        })
        .join('\n\n')
    }
    case 'tests': {
      const related = data.relatedTests as string[]
      const modules = data.changedModules as string[]
      const note = data.note as string | undefined
      if (note || !related.length) {
        return `Changed: ${modules.join(', ')}\n\nNo test files found covering these modules. Consider adding tests.`
      }
      const list = related.map((f) => `• ${f}`).join('\n')
      return `Changed: ${modules.join(', ')}\n\nRelated tests:\n${list}`
    }
    case 'compare': {
      const files = data.files as { filename: string; status: string; additions: number; deletions: number; contentSnippet: string | null }[]
      return files
        .map((f) => {
          const stats = `+${f.additions}/-${f.deletions}`
          const snippet = f.contentSnippet ? '\n' + f.contentSnippet.slice(0, 200).trim() + '…' : ''
          return `${f.filename} [${f.status}] ${stats}${snippet}`
        })
        .join('\n\n')
    }
  }
}

function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const urlMatch = /github\.com\/([^/]+)\/([^/\s]+)/.exec(input)
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') }
  const parts = input.trim().split('/')
  if (parts.length === 2 && parts[0] && parts[1]) return { owner: parts[0], repo: parts[1] }
  return null
}

// Ingesting/Loading state component
function IngestingState({ isIngesting, isLoadingPRs, repo }: { isIngesting: boolean; isLoadingPRs: boolean; repo: string }) {
  const [dotIndex, setDotIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Cycling dots animation
  useEffect(() => {
    if (!isIngesting) return
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 4)
    }, 600)
    return () => clearInterval(interval)
  }, [isIngesting])

  // Fake progress bar animation (0 -> 70% over ~20s)
  useEffect(() => {
    if (!isIngesting) {
      setProgress(0)
      return
    }
    const startTime = Date.now()
    const duration = 20000 // 20 seconds to reach 70%
    const targetProgress = 70

    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * targetProgress, targetProgress)
      setProgress(newProgress)
      if (elapsed < duration && isIngesting) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isIngesting])

  const dots = ['', '.', '..', '...'][dotIndex]

  // Loading from DB (fast state)
  if (!isIngesting && isLoadingPRs) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="font-mono text-sm text-muted-foreground animate-pulse"
        >
          Loading…
        </motion.div>
      </div>
    )
  }

  // Ingesting from GitHub
  return (
    <div className="flex h-64 flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-3"
      >
        {/* Repo name */}
        <div className="font-mono text-lg font-medium text-foreground">{repo}</div>

        {/* Animated dots */}
        <div className="h-4 font-mono text-sm text-muted-foreground">
          <span className="inline-block w-6">{dots}</span>
        </div>

        {/* Status line */}
        <div className="font-mono text-sm text-muted-foreground">Fetching PRs from GitHub…</div>

        {/* Progress bar */}
        <div className="mt-2 h-0.5 w-48 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-[#22C55E]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
        </div>
      </motion.div>
    </div>
  )
}

const SKELETON_CONTEXT: AIContext = {
  risk: { score: 0, rationale: 'Loading…', reasons: [] },
  summary: ['Loading context…'],
  similarPRs: [],
  contributor: { handle: '…', avatarUrl: '', priorPRs: 0, mergeRate: 0, firstPR: '…' },
}

export default function SwipePage() {
  // Repo state
  const [repoInput, setRepoInput] = useState('')
  const [repoId, setRepoId] = useState<string | null>(null)
  const [isIngesting, setIsIngesting] = useState(false)

  // PR state
  const [prList, setPrList] = useState<PullRequest[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoadingPRs, setIsLoadingPRs] = useState(false)

  // Context state
  const [context, setContext] = useState<AIContext | null>(null)
  const [isLoadingContext, setIsLoadingContext] = useState(false)

  // Impact map state
  const [impact, setImpact] = useState<ImpactResult | null>(null)
  const [isLoadingImpact, setIsLoadingImpact] = useState(false)

  // Session
  const [sessionId, setSessionId] = useState<string | null>(null)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('swipe')

  // BYOK — Anthropic key stored in localStorage, passed as header to /api/chat
  const [userApiKey, setUserApiKey] = useState('')
  useEffect(() => {
    const stored = localStorage.getItem('repopilot:apiKey') ?? ''
    setUserApiKey(stored)
  }, [])
  const handleApiKeyChange = (key: string) => {
    setUserApiKey(key)
    if (key) localStorage.setItem('repopilot:apiKey', key)
    else localStorage.removeItem('repopilot:apiKey')
  }

  // GitHub Integration state
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    token: '',
    autoMerge: false,
    mergeMethod: 'squash',
    syncReviews: false,
  })
  const [mergingPrNumber, setMergingPrNumber] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('repopilot:githubConfig')
      if (stored) {
        setGithubConfig(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const handleGitHubConfigChange = (newConfig: GitHubConfig) => {
    setGithubConfig(newConfig)
    try {
      localStorage.setItem('repopilot:githubConfig', JSON.stringify(newConfig))
    } catch {
      // ignore
    }
  }

  // Execute PR Merge on GitHub
  const executeMerge = useCallback(
    async (pr: PullRequest) => {
      const parsed = parseRepoInput(repoInput)
      if (!parsed) {
        toast.error('Cannot merge: repository could not be identified.')
        return false
      }

      setMergingPrNumber(pr.number)
      const toastId = toast.loading(`Merging PR #${pr.number} via ${githubConfig.mergeMethod}…`)

      try {
        const res = await fetch('/api/prs/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(githubConfig.token ? { 'x-github-token': githubConfig.token } : {}),
          },
          body: JSON.stringify({
            owner: parsed.owner,
            repo: parsed.repo,
            pullNumber: pr.number,
            mergeMethod: githubConfig.mergeMethod,
            prId: pr.id,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          toast.error(`Could not merge PR #${pr.number}`, {
            id: toastId,
            description: data.error || 'GitHub returned an error.',
          })
          return false
        }

        toast.success(`PR #${pr.number} merged! 🎉`, {
          id: toastId,
          description: data.message || `Successfully merged into ${parsed.owner}/${parsed.repo}`,
        })

        // Update PR state to merged in local list
        setPrList((prev) =>
          prev.map((item) => (item.number === pr.number ? { ...item, state: 'merged' } : item))
        )
        return true
      } catch (err: any) {
        toast.error(`Merge failed on PR #${pr.number}`, {
          id: toastId,
          description: err.message || 'Network request failed.',
        })
        return false
      } finally {
        setMergingPrNumber(null)
      }
    },
    [repoInput, githubConfig]
  )

  // Execute GitHub Review on PR
  const executeReview = useCallback(
    async (pr: PullRequest, action: 'approve' | 'changes') => {
      const parsed = parseRepoInput(repoInput)
      if (!parsed || !githubConfig.token) return

      try {
        await fetch('/api/prs/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-github-token': githubConfig.token,
          },
          body: JSON.stringify({
            owner: parsed.owner,
            repo: parsed.repo,
            pullNumber: pr.number,
            event: action === 'approve' ? 'APPROVE' : 'REQUEST_CHANGES',
          }),
        })
      } catch (err) {
        console.warn('Failed to submit GitHub review:', err)
      }
    },
    [repoInput, githubConfig.token]
  )

  // Streak + stats
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState<SessionStats>({ approved: 0, changesRequested: 0, skipped: 0 })
  const [lastAction, setLastAction] = useState<SwipeAction | null>(null)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>([])
  const [historyFilter, setHistoryFilter] = useState<SwipeAction | null>(null)

  // Emit stats to parent (Chrome extension side panel) via postMessage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.parent.postMessage(
        {
          type: 'REPOPILOT_STATS_UPDATE',
          stats: {
            approved: stats.approved,
            changesRequested: stats.changesRequested,
            skipped: stats.skipped,
          },
          prCount: prList.length,
          currentIndex,
          repo: repoInput,
        },
        '*'
      )
    } catch {
      // Not in an iframe — ignore
    }
  }, [stats, prList.length, currentIndex, repoInput])


  // Simple streaming chat — avoids @ai-sdk/react v3 protocol issues
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)


  const sendChatMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setIsChatLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-user-api-key': userApiKey } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          prId: prList[currentIndex]?.id,
          repoId,
          sessionId,
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: 'Chat unavailable. Add an API key via the ⌘ button.' } : m))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m))
      }
    } catch {
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: 'Something went wrong. Try again.' } : m))
    } finally {
      setIsChatLoading(false)
    }
  }, [messages, userApiKey, prList, currentIndex, repoId, sessionId])

  // Listen for summary trigger from extension sidepanel iframe parent
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'REPOPILOT_TRIGGER_SUMMARY' && typeof e.data.message === 'string') {
        sendChatMessage(e.data.message)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [sendChatMessage])

  const startSession = useCallback(async (repoId: string) => {
    const sessionRes = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId }),
    })
    const session = await sessionRes.json()
    setSessionId(session.id)
  }, [])

  // Fast path: try DB first, no GitHub call
  const loadFromCache = useCallback(async (repoStr: string) => {
    const parsed = parseRepoInput(repoStr)
    if (!parsed) return false
    const { owner, repo } = parsed

    setRepoInput(repoStr)
    setIsLoadingPRs(true)
    setPrList([])
    setCurrentIndex(0)
    setContext(null)
    setStreak(0)
    setStats({ approved: 0, changesRequested: 0, skipped: 0 })
    setLastAction(null)

    try {
      const res = await fetch(`/api/prs?owner=${owner}&repo=${repo}`)
      if (!res.ok) return false
      const data = await res.json()
      if (!data.prs?.length) return false
      setPrList(data.prs)
      setRepoId(data.repoId ?? null)
      if (data.repoId) await startSession(data.repoId)
      return true
    } catch {
      return false
    } finally {
      setIsLoadingPRs(false)
    }
  }, [startSession])

  // Full load: ingest from GitHub then read from DB
  const loadRepo = useCallback(async (repoStr: string) => {
    const parsed = parseRepoInput(repoStr)
    if (!parsed) return
    const { owner, repo } = parsed

    setRepoInput(repoStr)
    setIsIngesting(true)
    setIsLoadingPRs(true)
    setPrList([])
    setCurrentIndex(0)
    setContext(null)
    setStreak(0)
    setStats({ approved: 0, changesRequested: 0, skipped: 0 })
    setLastAction(null)

    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userApiKey ? { 'x-user-api-key': userApiKey } : {}) },
        body: JSON.stringify({ owner, name: repo }),
      })
      setIsIngesting(false)

      const res = await fetch(`/api/prs?owner=${owner}&repo=${repo}`)
      const data = await res.json()
      setPrList(data.prs ?? [])
      setRepoId(data.repoId ?? null)
      if (data.repoId) await startSession(data.repoId)
    } catch (error) {
      console.error('[v0] Failed to load repo:', error)
    } finally {
      setIsIngesting(false)
      setIsLoadingPRs(false)
    }
  }, [startSession])

  // Helper to extract owner, repo, and PR number
  const getPrParams = useCallback((pr: PullRequest) => {
    let owner = ''
    let repo = ''
    if (pr.htmlUrl) {
      const match = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(pr.htmlUrl)
      if (match) {
        owner = match[1]
        repo = match[2]
      }
    }
    if (!owner && repoInput) {
      const parsed = parseRepoInput(repoInput)
      if (parsed) {
        owner = parsed.owner
        repo = parsed.repo
      }
    }
    const params = new URLSearchParams()
    if (pr.id) params.set('prId', pr.id)
    if (owner) params.set('owner', owner)
    if (repo) params.set('repo', repo)
    if (pr.number) params.set('number', String(pr.number))
    return params.toString()
  }, [repoInput])

  // Load context for active PR
  const loadContext = useCallback(async (pr: PullRequest) => {
    if (!pr.id) return
    setIsLoadingContext(true)
    setContext(null)
    try {
      const qs = getPrParams(pr)
      const res = await fetch(`/api/context?${qs}`, {
        headers: userApiKey ? { 'x-user-api-key': userApiKey } : {},
      })
      if (res.ok) {
        const ctx = await res.json()
        if (ctx && ctx.risk) {
          setContext(ctx)
          return
        }
      }
      // Instant graceful fallback if endpoint didn't return valid context
      const fallbackScore = localRiskScore(pr)
      setContext({
        risk: {
          score: fallbackScore,
          rationale: fallbackScore > 50 ? 'Significant diff churn detected' : 'Standard review checklist applies',
          reasons: [
            { text: `${pr.filesChanged} file${pr.filesChanged === 1 ? '' : 's'} changed (+${pr.additions} -${pr.deletions})`, source: 'diff' },
            { text: `Author: @${pr.author.handle}`, source: 'contributor' },
          ],
        },
        prHtmlUrl: pr.htmlUrl,
        summary: [
          pr.title ? `${pr.title}.` : 'Pull request code changes.',
          `Touches +${pr.additions}/-${pr.deletions} lines across ${pr.filesChanged} files.`,
          'Automated security & quality verification.',
        ],
        similarPRs: [],
        contributor: {
          handle: pr.author.handle,
          avatarUrl: pr.author.avatarUrl,
          priorPRs: 1,
          mergeRate: 0,
          firstPR: pr.openedAt || 'recent',
        },
      })
    } catch (error) {
      console.error('[v0] Failed to load context:', error)
      const fallbackScore = localRiskScore(pr)
      setContext({
        risk: {
          score: fallbackScore,
          rationale: fallbackScore > 50 ? 'Significant diff churn detected' : 'Standard review checklist applies',
          reasons: [
            { text: `${pr.filesChanged} file${pr.filesChanged === 1 ? '' : 's'} changed (+${pr.additions} -${pr.deletions})`, source: 'diff' },
            { text: `Author: @${pr.author.handle}`, source: 'contributor' },
          ],
        },
        prHtmlUrl: pr.htmlUrl,
        summary: [
          pr.title ? `${pr.title}.` : 'Pull request code changes.',
          `Touches +${pr.additions}/-${pr.deletions} lines across ${pr.filesChanged} files.`,
          'Automated security & quality verification.',
        ],
        similarPRs: [],
        contributor: {
          handle: pr.author.handle,
          avatarUrl: pr.author.avatarUrl,
          priorPRs: 1,
          mergeRate: 0,
          firstPR: pr.openedAt || 'recent',
        },
      })
    } finally {
      setIsLoadingContext(false)
    }
  }, [userApiKey, getPrParams])

  // Load impact map for active PR — fetched in parallel with context, not blocking
  const loadImpact = useCallback(async (pr: PullRequest) => {
    if (!pr.id) return
    setIsLoadingImpact(true)
    setImpact(null)
    try {
      const qs = getPrParams(pr)
      const res = await fetch(`/api/impact?${qs}`)
      if (res.ok) {
        const imp = await res.json()
        setImpact(imp)
      } else {
        setImpact({
          changedFiles: [{ filename: pr.diff?.filePath || 'source.ts', symbols: [], additions: pr.additions, deletions: pr.deletions }],
          symbols: [],
          mermaidGraph: `graph TD\n  F0["${pr.diff?.filePath || 'source.ts'} (+${pr.additions} -${pr.deletions})"]:::file\n  classDef file fill:#FDF8F0,stroke:#D97706,stroke-width:1.5px,color:#1C1917;`,
        })
      }
    } catch {
      setImpact({
        changedFiles: [{ filename: pr.diff?.filePath || 'source.ts', symbols: [], additions: pr.additions, deletions: pr.deletions }],
        symbols: [],
        mermaidGraph: `graph TD\n  F0["${pr.diff?.filePath || 'source.ts'} (+${pr.additions} -${pr.deletions})"]:::file\n  classDef file fill:#FDF8F0,stroke:#D97706,stroke-width:1.5px,color:#1C1917;`,
      })
    } finally {
      setIsLoadingImpact(false)
    }
  }, [getPrParams])

  // Try cache first; only ingest if the DB has no data for this repo
  const handleRepoSubmit = useCallback(async (repoStr: string) => {
    const hit = await loadFromCache(repoStr)
    if (!hit) await loadRepo(repoStr)
  }, [loadFromCache, loadRepo])

  // Support ?repo=owner/repo in URL (useful for Chrome Extension & deep links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const repoParam = params.get('repo')
      if (repoParam && !repoInput && prList.length === 0) {
        handleRepoSubmit(repoParam)
      }
    }
  }, [handleRepoSubmit, repoInput, prList.length])

  // Load context + impact map when PR changes — both fire in parallel
  useEffect(() => {
    const pr = prList[currentIndex]
    if (pr) {
      loadContext(pr)
      loadImpact(pr)
    }
  }, [currentIndex, prList, loadContext, loadImpact])

  // Handle swipe action
  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      const pr = prList[currentIndex]
      if (!pr) return
      
      setLastAction(action)

      // Update stats
      setStats((prev) => ({
        ...prev,
        approved: action === 'approve' ? prev.approved + 1 : prev.approved,
        changesRequested: action === 'changes' ? prev.changesRequested + 1 : prev.changesRequested,
        skipped: action === 'skip' ? prev.skipped + 1 : prev.skipped,
      }))

      // Add to decision history
      setDecisionHistory((prev) => [
        {
          pr,
          action,
          decidedAt: new Date().toISOString(),
        },
        ...prev,
      ])

      // Update streak
      setStreak((prev) => (action !== 'skip' ? prev + 1 : 0))

      // Move to next card
      setCurrentIndex((prev) => prev + 1)

      // Record decision in DB (fire and forget)
      if (pr?.id && sessionId) {
        fetch('/api/decide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, prId: pr.id, action }),
        }).catch(console.error)
      }

      // Execute automated GitHub actions
      if (action === 'approve') {
        if (githubConfig.autoMerge) {
          executeMerge(pr)
        }
        if (githubConfig.syncReviews) {
          executeReview(pr, 'approve')
        }
      } else if (action === 'changes' && githubConfig.syncReviews) {
        executeReview(pr, 'changes')
      }
    },
    [prList, currentIndex, sessionId, githubConfig, executeMerge, executeReview]
  )

  // Handle chat message
  const handleSendMessage = useCallback(
    (content: string) => {
      sendChatMessage(content)
    },
    [sendChatMessage]
  )

  // Handle deeper action
  const handleDeeperAction = useCallback(
    async (action: DeeperAction): Promise<string> => {
      const pr = prList[currentIndex]
      if (!pr?.id || !repoId) return 'No active PR'

      try {
        const res = await fetch('/api/deeper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userApiKey ? { 'x-user-api-key': userApiKey } : {}),
          },
          body: JSON.stringify({
            action,
            prId: pr.id,
            repoId,
            prNumber: pr.number,
            prTitle: pr.title,
            authorHandle: pr.author?.handle,
            additions: pr.additions,
            deletions: pr.deletions,
            filesChanged: pr.filesChanged,
            filePath: pr.diff?.filePath,
            diffLines: pr.diff?.lines,
            repoFullName: repoInput,
          }),
        })
        const data = await res.json()
        return formatDeeperResult(action, data)
      } catch (error) {
        console.error('[swipe] Deeper action failed:', error)
        return 'Failed to fetch result'
      }
    },
    [prList, currentIndex, repoId]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

      if (e.key === '?') {
        e.preventDefault()
        setHintsOpen((prev) => !prev)
        return
      }

      if (isInputFocused) return

      switch (e.key.toLowerCase()) {
        case 'j':
          if (currentIndex < prList.length) handleSwipe('approve')
          break
        case 'f':
          if (currentIndex < prList.length) handleSwipe('changes')
          break
        case ' ':
          e.preventDefault()
          if (currentIndex < prList.length) handleSwipe('skip')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwipe, currentIndex, prList.length])

  const isLoading = isIngesting || isLoadingPRs
  const displayContext = isLoadingContext ? SKELETON_CONTEXT : (context ?? SKELETON_CONTEXT)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        currentPR={currentIndex + 1}
        totalPRs={prList.length}
        streak={streak}
        defaultRepo={repoInput}
        apiKey={userApiKey}
        githubConfig={githubConfig}
        onToggleHints={() => setHintsOpen(true)}
        onRepoSubmit={handleRepoSubmit}
        onApiKeyChange={handleApiKeyChange}
        onGitHubConfigChange={handleGitHubConfigChange}
        isLoading={isLoading}
      />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-6 pb-24 lg:flex-row lg:px-8 lg:pb-20">
        {/* Left column - Card stack or Session Summary */}
        <div className="w-full lg:w-[60%]">
          {isIngesting || isLoadingPRs ? (
            <IngestingState isIngesting={isIngesting} isLoadingPRs={isLoadingPRs} repo={repoInput} />
          ) : prList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <div className="font-mono text-sm text-foreground">Paste a GitHub repo to start reviewing</div>
              <div className="font-mono text-xs text-muted-foreground">
                e.g. <span className="text-foreground">resend/resend-node</span> or a full GitHub URL
              </div>
            </div>
          ) : currentIndex >= prList.length && viewMode === 'swipe' ? (
            <SessionSummary
              stats={{
                approved: stats.approved,
                changesRequested: stats.changesRequested,
                skipped: stats.skipped,
                totalReviewed: stats.approved + stats.changesRequested + stats.skipped,
              }}
              streak={streak}
              repoName={repoInput}
              onLoadRepo={loadRepo}
            />
          ) : (
            <>
              {/* View switcher — shown once PRs are loaded */}
              <div className="mb-4 flex items-center justify-between">
                <ViewSwitcher current={viewMode} onChange={setViewMode} />
                {viewMode === 'swipe' && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {Math.max(0, prList.length - currentIndex)} remaining
                  </span>
                )}
              </div>

              {/* View header */}
              <div className="mb-4">
                <h2 className="font-mono text-sm font-semibold text-foreground">
                  {viewMode === 'swipe' && 'Swipe'}
                  {viewMode === 'risk-matrix' && 'Risk Matrix'}
                  {viewMode === 'contributor' && 'By Contributor'}
                  {viewMode === 'category' && 'By Category'}
                  {viewMode === 'deps' && 'Dependencies'}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {viewMode === 'swipe' && 'Swipe right to approve, left to request changes, down to skip'}
                  {viewMode === 'risk-matrix' && 'PRs ranked by estimated risk — click any row to load details'}
                  {viewMode === 'contributor' && 'PRs grouped by author — click any card to load details'}
                  {viewMode === 'category' && 'PRs grouped by change type — click any card to load details'}
                  {viewMode === 'deps' && 'PRs with cross-references detected in title or body — click any node to load details'}
                </p>
              </div>

              {viewMode === 'swipe' && (
                <>
                  <CardStack
                    prs={prList}
                    currentIndex={currentIndex}
                    onSwipe={handleSwipe}
                    impact={impact}
                    isLoadingImpact={isLoadingImpact}
                    onMerge={executeMerge}
                    mergingPrNumber={mergingPrNumber}
                    autoMergeEnabled={githubConfig.autoMerge}
                  />
                  <ActionButtons onAction={handleSwipe} autoMergeEnabled={githubConfig.autoMerge} />
                  {lastAction && lastAction !== 'skip' && (
                    <motion.div
                      key={streak}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 text-center font-mono text-sm text-muted-foreground"
                    >
                      {streak >= 2 && `${streak} in a row!`}
                    </motion.div>
                  )}
                </>
              )}

              {viewMode === 'risk-matrix' && (
                <ViewRiskMatrix prs={prList} currentIndex={currentIndex} onSelect={setCurrentIndex} />
              )}
              {viewMode === 'contributor' && (
                <ViewContributorFocus prs={prList} currentIndex={currentIndex} onSelect={setCurrentIndex} />
              )}
              {viewMode === 'category' && (
                <ViewCategoryGroup prs={prList} currentIndex={currentIndex} onSelect={setCurrentIndex} />
              )}
              {viewMode === 'deps' && (
                <ViewDependencyGraph prs={prList} currentIndex={currentIndex} onSelect={setCurrentIndex} />
              )}
            </>
          )}
        </div>

        {/* Right column - AI Context Panel (desktop only) */}
        <aside className="sticky top-20 hidden h-[calc(100vh-120px)] w-[40%] overflow-hidden lg:block">
          <div className="h-full rounded-xl border border-border bg-secondary/50 p-4">
            <AIContextPanel
              context={displayContext}
              messages={messages}
              onSendMessage={handleSendMessage}
              onDeeperAction={handleDeeperAction}
              impact={impact}
              isLoadingImpact={isLoadingImpact}
              isLoadingContext={isLoadingContext}
            />
          </div>
        </aside>
      </main>

      {/* Mobile context sheet */}
      <MobileContextSheet
        context={displayContext}
        messages={messages}
        onSendMessage={handleSendMessage}
        onDeeperAction={handleDeeperAction}
        impact={impact}
        isLoadingImpact={isLoadingImpact}
      />

      <BottomStrip
        stats={stats}
        onFilterClick={(action) => setHistoryFilter(action)}
        onSummary={() => handleSendMessage(
          `Summarize my review session so far: I approved ${stats.approved}, requested changes on ${stats.changesRequested}, and skipped ${stats.skipped} PRs. What patterns stand out and what should I focus on next?`
        )}
      />

      <KeyboardHints open={hintsOpen} onClose={() => setHintsOpen(false)} />

      <AnimatePresence>
        {historyFilter && (
          <DecisionHistory
            decisions={decisionHistory.filter((d) => d.action === historyFilter)}
            action={historyFilter}
            onClose={() => setHistoryFilter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
