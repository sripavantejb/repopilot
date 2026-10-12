'use client'

import React, { useEffect, useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import {
  GitFork,
  Star,
  Folder,
  FileCode,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
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

export default function DiagramPage() {
  const [repoInput, setRepoInput] = useState('')
  const [activeRepo, setActiveRepo] = useState<string | null>(null)
  const [data, setData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const mermaidRef = useRef<HTMLDivElement>(null)

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

  // Load repo from URL query param if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const repoParam = params.get('repo')
      if (repoParam) {
        loadDiagram(repoParam)
      } else {
        loadDiagram('resend/resend-node')
      }
    }
  }, [])

  // Render Mermaid dynamically via CDN to keep package bundle zero-overhead
  useEffect(() => {
    if (!data?.mermaid || !mermaidRef.current) return

    let isMounted = true

    const renderGraph = async () => {
      try {
        // Load mermaid from script tag dynamically if not on window
        if (!(window as any).mermaid) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
          script.async = true
          document.body.appendChild(script)
          await new Promise((resolve) => {
            script.onload = resolve
          })
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
    return () => {
      isMounted = false
    }
  }, [data?.mermaid])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/[0.06] bg-[#FDF8F0]/90 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-white">
              <span className="text-[11px] font-bold">RP</span>
            </div>
            <span className="skew-wordmark font-black tracking-[-0.04em] text-base text-[#1a1a1a]">
              {"REPOPILOT".split("").map((char, i) => (
                <span key={i}>{char}</span>
              ))}
            </span>
            <span className="rounded-full bg-[#B4C7EF]/30 border border-black/[0.08] px-2.5 py-0.5 text-xs font-semibold text-[#1a1a1a]">
              Architecture AST
            </span>
          </Link>
        </div>

        {/* Center: Repo search input */}
        <div className="flex flex-1 justify-center px-4 max-w-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDiagram(repoInput)}
              placeholder="owner/repo (e.g. facebook/react)"
              disabled={isLoading}
              className="w-full rounded-full border border-black/[0.08] bg-white px-4 py-2 pl-10 pr-24 text-sm text-[#1a1a1a] placeholder:text-[#888] shadow-sm focus:border-black/30 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#888]" />
            <button
              onClick={() => loadDiagram(repoInput)}
              disabled={isLoading}
              className="absolute right-1.5 top-1.5 rounded-full bg-[#1a1a1a] px-3.5 py-1 text-xs font-semibold text-white transition hover:bg-black"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {activeRepo && (
            <Link
              href={`/swipe?repo=${encodeURIComponent(activeRepo)}`}
              className="flex items-center gap-1.5 rounded-full bg-[#C8E6C9]/40 border border-[#2E7D32]/30 px-3.5 py-1.5 text-xs font-semibold text-[#2E7D32] transition hover:bg-[#C8E6C9]/60 shadow-sm"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Triage PRs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Architecture View */}
      <main className="flex flex-1 flex-col p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="flex h-[420px] flex-col items-center justify-center p-8 text-center bg-white rounded-[20px] border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#B4C7EF]/30 border border-black/[0.08] px-3.5 py-1 text-[12px] font-semibold text-[#1a1a1a] mb-5">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              <span>RepoPilot AST Engine</span>
            </div>
            
            <div className="relative w-14 h-14 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-black/[0.06] border-t-[#1a1a1a] animate-spin" />
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-black text-xs">
                RP
              </div>
            </div>

            <h3 className="font-serif text-[22px] font-medium text-[#1a1a1a] mb-1">
              Analyzing Codebase Architecture
            </h3>
            <p className="text-[14px] text-[#666] max-w-sm">
              Parsing AST nodes, dependency trees, and module topology for <span className="font-mono text-[#1a1a1a]">{activeRepo}</span>…
            </p>

            <div className="mt-5 w-40 h-1 bg-black/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-[#1a1a1a] rounded-full animate-pulse" style={{ width: '65%' }} />
            </div>
          </div>
        ) : error ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-center bg-white rounded-[20px] border border-black/[0.06] p-8">
            <div className="text-[#D64545] font-medium text-sm">{error}</div>
            <button
              onClick={() => loadDiagram(repoInput || 'resend/resend-node')}
              className="rounded-full bg-[#1a1a1a] text-white px-5 py-2 text-xs font-semibold hover:bg-black"
            >
              Try Demo Repo
            </button>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            {/* Repo Header Meta Card (§7.4) */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div>
                <h1 className="flex items-center gap-2 font-serif text-[26px] font-medium text-[#1a1a1a]">
                  <span>{data.repo}</span>
                  <a
                    href={`https://github.com/${data.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#666] hover:text-[#1a1a1a] transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </h1>
                <p className="mt-1 text-[14px] text-[#666]">{data.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#444]">
                <div className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-[#b45309] font-medium border border-[#b45309]/20">
                  <Star className="h-3.5 w-3.5 text-[#b45309]" />
                  <span>{data.stars} stars</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#B4C7EF]/30 px-3 py-1 text-[#1a1a1a] font-medium border border-black/[0.08]">
                  <FileCode className="h-3.5 w-3.5 text-[#1a1a1a]" />
                  <span>{data.totalFiles} files</span>
                </div>
                {data.language && (
                  <span className="rounded-full bg-[#F5F5F5] border border-black/[0.06] px-3 py-1 text-[#333] font-semibold">
                    {data.language}
                  </span>
                )}
              </div>
            </div>

            {/* Architecture Diagram Canvas & Module Explorer */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Mermaid Architecture Map */}
              <div className="lg:col-span-2 rounded-[20px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-black/[0.05] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#1a1a1a]" />
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333]">
                      Architecture & Dependency Graph
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#666] font-mono">Auto-synthesized</span>
                </div>

                <div
                  ref={mermaidRef}
                  className="flex-1 overflow-auto rounded-[14px] bg-[#FAFAF8] border border-black/[0.04] p-4 text-center min-h-[460px] flex items-center justify-center"
                />
              </div>

              {/* Right Col: Module Explorer & Entry Points */}
              <div className="flex flex-col gap-6">
                {/* Entry points */}
                <div className="rounded-[20px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#333] mb-3">
                    <FileCode className="h-4 w-4 text-[#2E7D32]" />
                    Entry Points
                  </h3>
                  {data.entryPoints.length > 0 ? (
                    <ul className="space-y-1.5 font-mono text-xs">
                      {data.entryPoints.map((ep) => (
                        <li
                          key={ep}
                          className="rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/20 px-3 py-1.5 text-[#2E7D32] font-semibold"
                        >
                          {ep}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-[#666]">Standard repository entry points</div>
                  )}
                </div>

                {/* Top Modules */}
                <div className="rounded-[20px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex-1">
                  <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#333] mb-3">
                    <Folder className="h-4 w-4 text-[#1a1a1a]" />
                    Top Modules ({data.topLevelDirs.length})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {data.topLevelDirs.map((dir) => {
                      const mod = data.modules[dir]
                      const isSelected = selectedModule === dir
                      return (
                        <div
                          key={dir}
                          onClick={() => setSelectedModule(dir)}
                          className={`cursor-pointer rounded-[12px] border p-3 transition ${
                            isSelected
                              ? 'border-black/30 bg-[#B4C7EF]/30'
                              : 'border-black/[0.06] bg-[#FAFAF8] hover:bg-[#F5F5F0]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-xs font-semibold text-[#1a1a1a]">
                            <span>📁 {dir}</span>
                            <span className="text-[#666] font-normal">{mod?.count || 0} files</span>
                          </div>
                          {isSelected && mod?.files && (
                            <div className="mt-2.5 flex flex-col gap-1 border-t border-black/[0.06] pt-2 font-mono text-[11px] text-[#444]">
                              {mod.files.map((f) => (
                                <span key={f} className="truncate">
                                  📄 {f}
                                </span>
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
    </div>
  )
}
