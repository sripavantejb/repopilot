'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  GitFork,
  Star,
  Folder,
  FileCode,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  ChevronRight,
  Code2,
} from 'lucide-react'

interface DiagramData {
  repo: string
  description: string
  stars: number
  language: string
  defaultBranch: string
  totalFiles: number
  topLevelDirs: string[]
  entryPoints: string[]
  modules: Record<string, { files: string[]; count: number }>
  mermaid: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ExplainState {
  component: string | null
  loading: boolean
  explanation: string | null
  filesRead: string[]
  error: string | null
}

export default function DiagramPage() {
  const [repoInput, setRepoInput] = useState('')
  const [activeRepo, setActiveRepo] = useState<string | null>(null)
  const [data, setData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [isEmbedded, setIsEmbedded] = useState(false)
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsEmbedded(params.get('embed') === '1' || window.self !== window.top)
    }
  }, [])

  // Gitora-style: explain panel state
  const [explainState, setExplainState] = useState<ExplainState>({
    component: null, loading: false, explanation: null, filesRead: [], error: null,
  })
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const loadDiagram = async (repoName: string) => {
    const trimmed = repoName.trim().replace(/^https?:\/\/github\.com\//, '')
    const parts = trimmed.split('/')
    if (parts.length < 2) {
      setError('Please enter a valid owner/repo (e.g. resend/resend-node)')
      return
    }

    const [owner, repo] = parts
    setIsLoading(true)
    setError(null)
    setActiveRepo(`${owner}/${repo}`)
    setRepoInput(`${owner}/${repo}`)
    setExplainState({ component: null, loading: false, explanation: null, filesRead: [], error: null })
    setChatMessages([])

    try {
      const res = await fetch(`/api/diagram?owner=${owner}&repo=${repo}`)
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Failed to analyze repository')
      }
      const json: DiagramData = await res.json()
      setData(json)
      if (json.topLevelDirs.length > 0) {
        setSelectedModule(json.topLevelDirs[0])
      }
    } catch (err: any) {
      setError(err.message || 'Error generating architecture diagram')
    } finally {
      setIsLoading(false)
    }
  }

  // Gitora: click a module → explain it with Gemma 4
  const explainComponent = useCallback(async (component: string) => {
    if (!activeRepo) return
    const [owner, repo] = activeRepo.split('/')
    setExplainState({ component, loading: true, explanation: null, filesRead: [], error: null })
    setSelectedModule(component)

    try {
      const res = await fetch('/api/diagram/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, branch: data?.defaultBranch || 'main', component }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to explain component')
      setExplainState({ component, loading: false, explanation: json.explanation, filesRead: json.filesRead, error: null })
      // Seed the chat with this component context
      setChatMessages([{
        role: 'assistant',
        content: `I've analyzed **${component}** in \`${activeRepo}\`. Ask me anything about it — how it works, what depends on it, potential issues, or how to extend it.`,
      }])
      setChatOpen(true)
    } catch (err: any) {
      setExplainState({ component, loading: false, explanation: null, filesRead: [], error: err.message })
    }
  }, [activeRepo, data?.defaultBranch])

  // Gitora: codebase chat
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !activeRepo || chatLoading) return
    const [owner, repo] = activeRepo.split('/')
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)

    try {
      const res = await fetch('/api/diagram/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          branch: data?.defaultBranch || 'main',
          question: userMsg,
          // Provide component context if one is selected
          component: explainState.component || undefined,
        }),
      })
      const json = await res.json()
      const answer = json.explanation || json.error || 'Could not generate a response.'
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setChatLoading(false)
    }
  }, [chatInput, activeRepo, data?.defaultBranch, explainState.component, chatLoading])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Load repo from URL query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const repoParam = params.get('repo')
      loadDiagram(repoParam || 'resend/resend-node')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render Mermaid
  useEffect(() => {
    if (!data?.mermaid || !mermaidRef.current) return
    let isMounted = true

    const renderGraph = async () => {
      try {
        if (!(window as any).mermaid) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
          script.async = true
          document.body.appendChild(script)
          await new Promise((resolve) => { script.onload = resolve })
        }

        const mermaid = (window as any).mermaid
        if (mermaid && isMounted && mermaidRef.current) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              darkMode: true,
              background: '#09090b',
              primaryColor: '#1e293b',
              primaryTextColor: '#f8fafc',
              primaryBorderColor: '#3b82f6',
              lineColor: '#22c55e',
              secondaryColor: '#18181b',
              tertiaryColor: '#0f172a',
            },
          })
          const id = `mermaid-svg-${Date.now()}`
          const { svg } = await mermaid.render(id, data.mermaid)
          if (mermaidRef.current && isMounted) {
            mermaidRef.current.innerHTML = svg
          }
        }
      } catch (e) {
        console.warn('Mermaid render notice:', e)
      }
    }

    renderGraph()
    return () => { isMounted = false }
  }, [data?.mermaid])

  // Simple markdown renderer for AI responses
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 font-mono text-[11px]">$1</code>')
      .replace(/^### (.*)/gm, '<h3 class="font-semibold text-[13px] mt-3 mb-1">$1</h3>')
      .replace(/^## (.*)/gm, '<h2 class="font-semibold text-[14px] mt-4 mb-1">$1</h2>')
      .replace(/^# (.*)/gm, '<h1 class="font-bold text-[15px] mt-4 mb-2">$1</h1>')
      .replace(/^- (.*)/gm, '<li class="ml-3 list-disc">$1</li>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      {!isEmbedded ? (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/[0.06] bg-[#FDF8F0]/90 px-4 backdrop-blur-md lg:px-8 dark:bg-background/90 dark:border-border">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-white dark:bg-white dark:text-black">
                <span className="text-[11px] font-bold">RP</span>
              </div>
              <span className="skew-wordmark font-black tracking-[-0.04em] text-base text-[#1a1a1a] dark:text-foreground">
                {"REPOPILOT".split("").map((char, i) => (
                  <span key={i}>{char}</span>
                ))}
              </span>
              <span className="rounded-full bg-[#B4C7EF]/30 border border-black/[0.08] px-2.5 py-0.5 text-xs font-semibold text-[#1a1a1a] dark:text-foreground dark:border-border">
                Architecture AST
              </span>
            </Link>
          </div>

          {/* Center: Repo search */}
          <div className="flex flex-1 justify-center px-4 max-w-lg">
            <div className="relative w-full">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDiagram(repoInput)}
                placeholder="owner/repo (e.g. facebook/react)"
                disabled={isLoading}
                className="w-full rounded-full border border-black/[0.08] bg-white dark:bg-secondary dark:border-border px-4 py-2 pl-10 pr-24 text-sm text-[#1a1a1a] dark:text-foreground placeholder:text-[#888] shadow-sm focus:border-black/30 focus:outline-none"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#888]" />
              <button
                onClick={() => loadDiagram(repoInput)}
                disabled={isLoading}
                className="absolute right-1.5 top-1.5 rounded-full bg-[#1a1a1a] dark:bg-foreground px-3.5 py-1 text-xs font-semibold text-white dark:text-background transition hover:bg-black"
              >
                Analyze
              </button>
            </div>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            {activeRepo && (
              <>
                <button
                  onClick={() => setChatOpen((v) => !v)}
                  title="Ask Gemma about this codebase"
                  className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all ${
                    chatOpen
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ask Gemma</span>
                </button>
                <Link
                  href={`/swipe?repo=${encodeURIComponent(activeRepo)}`}
                  className="flex items-center gap-1.5 rounded-full bg-[#C8E6C9]/40 border border-[#2E7D32]/30 px-3.5 py-1.5 text-xs font-semibold text-[#2E7D32] transition hover:bg-[#C8E6C9]/60 shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Triage PRs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>
        </header>
      ) : (
        <div className="sticky top-0 z-40 flex h-9 items-center justify-between border-b border-black/[0.06] bg-[#FDF8F0]/95 px-3 backdrop-blur-md dark:bg-background/95 dark:border-border">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{activeRepo ?? 'Architecture AST'}</span>
          </div>
          <div className="flex items-center gap-2">
            {activeRepo && (
              <button
                onClick={() => setChatOpen((v) => !v)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs transition-colors ${
                  chatOpen ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
                }`}
                title="Ask Gemma about codebase architecture"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Ask Gemma</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Main Content */}
        <main className="flex flex-1 flex-col p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-[420px] flex-col items-center justify-center p-8 text-center bg-white dark:bg-card rounded-[20px] border border-black/[0.06] dark:border-border shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B4C7EF]/30 border border-black/[0.08] px-3.5 py-1 text-[12px] font-semibold text-[#1a1a1a] dark:text-foreground mb-5">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                <span>Gitora Analysis Engine</span>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-black/[0.06] border-t-[#1a1a1a] animate-spin dark:border-border dark:border-t-foreground" />
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] dark:bg-foreground text-white dark:text-background flex items-center justify-center font-black text-xs">
                  RP
                </div>
              </div>
              <h3 className="font-serif text-[22px] font-medium text-[#1a1a1a] dark:text-foreground mb-1">
                Analyzing Codebase Architecture
              </h3>
              <p className="text-[14px] text-[#666] dark:text-muted-foreground max-w-sm">
                Parsing AST nodes, dependency trees, and module topology for{' '}
                <span className="font-mono text-[#1a1a1a] dark:text-foreground">{activeRepo}</span>…
              </p>
              <div className="mt-5 w-40 h-1 bg-black/[0.06] dark:bg-border rounded-full overflow-hidden">
                <div className="h-full bg-[#1a1a1a] dark:bg-foreground rounded-full animate-pulse" style={{ width: '65%' }} />
              </div>
            </div>
          ) : error ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-center bg-white dark:bg-card rounded-[20px] border border-black/[0.06] dark:border-border p-8">
              <div className="text-[#D64545] font-medium text-sm">{error}</div>
              <button
                onClick={() => loadDiagram(repoInput || 'resend/resend-node')}
                className="rounded-full bg-[#1a1a1a] dark:bg-foreground text-white dark:text-background px-5 py-2 text-xs font-semibold hover:bg-black"
              >
                Try Demo Repo
              </button>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-6">
              {/* Repo Header Meta Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-black/[0.06] dark:border-border bg-white dark:bg-card p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <div>
                  <h1 className="flex items-center gap-2 font-serif text-[26px] font-medium text-[#1a1a1a] dark:text-foreground">
                    <span>{data.repo}</span>
                    <a href={`https://github.com/${data.repo}`} target="_blank" rel="noreferrer" className="text-[#666] hover:text-[#1a1a1a] dark:hover:text-foreground transition">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h1>
                  <p className="mt-1 text-[14px] text-[#666] dark:text-muted-foreground">{data.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#444]">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-[#b45309] font-medium border border-[#b45309]/20">
                    <Star className="h-3.5 w-3.5 text-[#b45309]" />
                    <span>{data.stars} stars</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#B4C7EF]/30 px-3 py-1 text-[#1a1a1a] dark:text-foreground font-medium border border-black/[0.08] dark:border-border">
                    <FileCode className="h-3.5 w-3.5" />
                    <span>{data.totalFiles} files</span>
                  </div>
                  {data.language && (
                    <span className="rounded-full bg-[#F5F5F5] dark:bg-secondary border border-black/[0.06] dark:border-border px-3 py-1 text-[#333] dark:text-foreground font-semibold">
                      {data.language}
                    </span>
                  )}
                </div>
              </div>

              {/* Architecture Diagram + Module Explorer */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Mermaid Architecture Map */}
                <div className="lg:col-span-2 rounded-[20px] border border-black/[0.06] dark:border-border bg-white dark:bg-card p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col">
                  <div className="flex items-center justify-between mb-4 border-b border-black/[0.05] dark:border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1a1a1a] dark:text-foreground" />
                      <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] dark:text-foreground">
                        Architecture & Dependency Graph
                      </h2>
                    </div>
                    <span className="text-[11px] text-[#666] dark:text-muted-foreground font-mono">Auto-synthesized</span>
                  </div>

                  <div
                    ref={mermaidRef}
                    className="flex-1 overflow-auto rounded-[14px] bg-[#FAFAF8] dark:bg-[#09090b] border border-black/[0.04] dark:border-border p-4 text-center min-h-[460px] flex items-center justify-center"
                  />
                </div>

                {/* Right Col: Module Explorer (Gitora-style clickable) */}
                <div className="flex flex-col gap-4">
                  {/* Gitora Explain Panel */}
                  {explainState.component && (
                    <div className="rounded-[20px] border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                            {explainState.component}
                          </span>
                        </div>
                        <button
                          onClick={() => setExplainState({ component: null, loading: false, explanation: null, filesRead: [], error: null })}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {explainState.loading ? (
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Gemma 4 analyzing {explainState.component}…</span>
                        </div>
                      ) : explainState.error ? (
                        <p className="text-xs text-red-500">{explainState.error}</p>
                      ) : explainState.explanation ? (
                        <>
                          <div
                            className="text-[12px] text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(explainState.explanation) }}
                          />
                          {explainState.filesRead.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-purple-500/20">
                              <div className="text-[10px] font-mono text-purple-600/60 dark:text-purple-400/60 mb-1">Files read:</div>
                              {explainState.filesRead.slice(0, 4).map((f) => (
                                <div key={f} className="text-[10px] font-mono text-purple-700/70 dark:text-purple-300/70 truncate">
                                  📄 {f}
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => setChatOpen(true)}
                            className="mt-3 w-full rounded-xl border border-purple-500/30 bg-purple-500/10 py-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Ask follow-up questions →
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Entry Points */}
                  {data.entryPoints.length > 0 && (
                    <div className="rounded-[20px] border border-black/[0.06] dark:border-border bg-white dark:bg-card p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                      <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#333] dark:text-foreground mb-3">
                        <FileCode className="h-4 w-4 text-[#2E7D32]" />
                        Entry Points
                      </h3>
                      <ul className="space-y-1.5 font-mono text-xs">
                        {data.entryPoints.map((ep) => (
                          <li
                            key={ep}
                            onClick={() => explainComponent(ep)}
                            className="cursor-pointer rounded-lg bg-[#E8F5E9] dark:bg-emerald-500/10 border border-[#2E7D32]/20 px-3 py-1.5 text-[#2E7D32] font-semibold hover:bg-[#C8E6C9] dark:hover:bg-emerald-500/20 transition flex items-center justify-between"
                          >
                            <span>{ep}</span>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Top Modules — Gitora-style: click to explain */}
                  <div className="rounded-[20px] border border-black/[0.06] dark:border-border bg-white dark:bg-card p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex-1">
                    <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#333] dark:text-foreground mb-3">
                      <Folder className="h-4 w-4 text-[#1a1a1a] dark:text-foreground" />
                      <span>Top Modules ({data.topLevelDirs.length})</span>
                      <span className="ml-auto rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        Click to explain ✨
                      </span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {data.topLevelDirs.map((dir) => {
                        const mod = data.modules[dir]
                        const isSelected = selectedModule === dir
                        const isExplained = explainState.component === dir
                        return (
                          <div
                            key={dir}
                            onClick={() => explainComponent(dir)}
                            className={`cursor-pointer rounded-[12px] border p-3 transition group ${
                              isExplained
                                ? 'border-purple-500/50 bg-purple-500/10'
                                : isSelected
                                  ? 'border-black/30 dark:border-border bg-[#B4C7EF]/30 dark:bg-secondary'
                                  : 'border-black/[0.06] dark:border-border bg-[#FAFAF8] dark:bg-secondary/50 hover:bg-[#F5F5F0] dark:hover:bg-secondary'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-xs font-semibold text-[#1a1a1a] dark:text-foreground">
                              <span>📁 {dir}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#666] dark:text-muted-foreground font-normal">{mod?.count || 0} files</span>
                                {explainState.loading && explainState.component === dir ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                                ) : (
                                  <Sparkles className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                                )}
                              </div>
                            </div>
                            {isSelected && mod?.files && !isExplained && (
                              <div className="mt-2.5 flex flex-col gap-1 border-t border-black/[0.06] dark:border-border pt-2 font-mono text-[11px] text-[#444] dark:text-muted-foreground">
                                {mod.files.slice(0, 3).map((f) => (
                                  <span key={f} className="truncate">📄 {f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        {/* Gitora Chat Side Panel */}
        {chatOpen && activeRepo && (
          <aside className="hidden lg:flex w-[360px] flex-col border-l border-border bg-card">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Ask Gemma</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{activeRepo}</div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat suggestion chips */}
            {chatMessages.length <= 1 && (
              <div className="flex flex-col gap-1.5 border-b border-border p-3">
                <div className="text-[10px] font-mono text-muted-foreground mb-1">Suggested questions:</div>
                {[
                  explainState.component ? `How does ${explainState.component} connect to the rest of the codebase?` : 'What is the main entry point?',
                  'What would break if I removed this module?',
                  'Explain the data flow from request to response',
                  'Which files are most important to read first?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setChatInput(q); }}
                    className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-left text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground text-background rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm border border-border'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-secondary border border-border px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Ask about this codebase…"
                  className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
              <p className="mt-1.5 text-center font-mono text-[10px] text-muted-foreground">
                Powered by Gemma 4 · Grounded in source code
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
