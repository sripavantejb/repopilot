"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  GitPullRequest, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  Terminal, 
  ExternalLink,
  Github
} from "lucide-react"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1a1a1a] selection:bg-[#B4C7EF] selection:text-[#1a1a1a] font-sans">
      {/* 7.1 Floating Pill Navigation */}
      <nav 
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-2.5 rounded-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10" 
            : "bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-black/[0.06]"
        } backdrop-blur-xl`}
        style={{ maxWidth: "calc(100vw - 32px)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-white">
            <GitPullRequest className="h-4 w-4" />
          </div>
          {/* 2.4 Wordmark: REPOPILOT uppercase Inter 900 skewed -8deg */}
          <span className="skew-wordmark font-black tracking-[-0.04em] text-lg text-[#1a1a1a]">
            {"REPOPILOT".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#333] ml-2">
          <Link href="/swipe" className="transition hover:text-[#1a1a1a]">
            Review Queue
          </Link>
          <Link href="/diagram" className="transition hover:text-[#1a1a1a]">
            Architecture AST
          </Link>
          <a href="#features" className="transition hover:text-[#1a1a1a]">
            Intelligence
          </a>
          <a href="#how-it-works" className="transition hover:text-[#1a1a1a]">
            Install & Setup
          </a>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-px h-5 bg-black/10" />

        {/* Primary CTA pill */}
        <Link
          href="/swipe"
          className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-4 py-2 text-[14px] font-semibold text-white transition-all hover:bg-black hover:-translate-y-0.5"
        >
          <span>Start Triage</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* 9. Hero Section with Paper Sky & Layered Mountains */}
      <section className="relative pt-32 pb-20 px-4 md:px-12 overflow-hidden">
        {/* Sky gradient frame with 24px bottom radius */}
        <div 
          className="mx-auto max-w-6xl rounded-[24px] border border-black/[0.06] overflow-hidden relative pt-16 pb-12 px-6 md:px-16"
          style={{
            background: "linear-gradient(180deg, #A8D4EC 0%, #C7E4F5 45%, #FDF8F0 100%)",
          }}
        >
          {/* Halftone texture overlay */}
          <div className="absolute inset-0 halftone-dots opacity-40 pointer-events-none" />

          {/* Paper clouds */}
          <div className="absolute top-8 left-12 w-28 h-10 bg-white/80 rounded-full blur-[0.5px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
          <div className="absolute top-14 right-16 w-36 h-12 bg-white/85 rounded-full blur-[0.5px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
          
          {/* Content container */}
          <div className="relative z-10 text-center max-w-[760px] mx-auto">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-black/[0.06] px-3.5 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              Gemma 4 AI PR Intelligence & Architecture
            </div>

            {/* Hero H1: Playfair Display 500 with em italic */}
            <h1 className="text-[40px] md:text-[62px] leading-[1.14] font-serif font-[500] tracking-[-0.01em] text-[#1a1a1a]">
              Review pull requests with deep context, <em>not guesswork.</em>
            </h1>

            {/* Lead paragraph */}
            <p className="mt-6 text-[17px] md:text-[19px] leading-[1.6] text-[#333] max-w-[620px] mx-auto font-sans">
              Instant AI risk analysis, AST codebase architecture graphs, and gesture-driven GitHub triage. Built for engineering teams and open source maintainers.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/swipe"
                className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              >
                <span>Launch Review Deck</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/diagram"
                className="flex items-center gap-2 rounded-full bg-white/90 border border-black/[0.08] px-7 py-3.5 text-[15px] font-semibold text-[#1a1a1a] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:bg-white hover:-translate-y-0.5"
              >
                <Layers className="h-4 w-4 text-[#B4C7EF]" />
                <span>Architecture Graph</span>
              </Link>
              <a
                href="https://github.com/sripavantejb/repopilot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-white/70 border border-black/[0.06] px-6 py-3.5 text-[15px] font-medium text-[#333] transition-all hover:bg-white/90"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* 7.5 Hero Mockup: macOS Browser Window showing PR Review & Risk */}
          <div className="mt-14 relative z-10 max-w-[880px] mx-auto rounded-[20px] bg-white border border-black/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* macOS Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#f5f5f5] border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-[6px] bg-white border border-black/[0.04] text-[12px] text-[#888] font-mono">
                <span>repopilot.dev/swipe?repo=shadcn/ui</span>
              </div>
              <div className="text-[11px] font-medium text-[#666]">RepoPilot v2.4</div>
            </div>

            {/* Mockup Body: Two Column Comparison & Triage */}
            <div className="p-6 md:p-8 bg-[#FAFAF8] grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: PR Intelligence & Risk Card */}
              <div className="p-5 rounded-[14px] bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#D64545] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D64545]" />
                      High Risk Detected
                    </span>
                    <span className="rounded-full bg-[#FFF5F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#D64545] border border-[#D64545]/20">
                      Score: 34 / 100
                    </span>
                  </div>

                  <h4 className="font-serif text-[18px] font-[600] text-[#1a1a1a]">
                    feat(auth): migrate session storage to Redis cluster
                  </h4>
                  <p className="mt-1 text-[13px] text-[#666]">
                    PR #418 • 14 files changed • +412 / -89
                  </p>

                  <div className="mt-4 p-3 rounded-[8px] bg-[#FFF5F5] border border-[#D64545]/15 text-[12px] text-[#333]">
                    <div className="font-semibold text-[#D64545] mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Gemma 4 Heuristic Warnings:
                    </div>
                    <ul className="space-y-1 text-[#444] list-disc list-inside">
                      <li>Unbounded token expiration window in auth middleware</li>
                      <li>Missing fallback handler during Redis cluster reconnects</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <span className="text-[12px] text-[#666]">Swipe action:</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FFF5F5] text-[#D64545] text-[12px] font-medium border border-[#D64545]/20">
                      ← Request Changes [F]
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[12px] font-medium border border-[#2E7D32]/20">
                      Approve [J] →
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Codebase Architecture & AST Impact */}
              <div className="p-5 rounded-[14px] bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#2E7D32] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                      AST Impact Graph
                    </span>
                    <span className="rounded-full bg-[#B4C7EF]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#1a1a1a]">
                      3 Downstream Deps
                    </span>
                  </div>

                  <h4 className="font-serif text-[18px] font-[600] text-[#1a1a1a]">
                    Affected System Boundaries
                  </h4>
                  <p className="mt-1 text-[13px] text-[#666]">
                    Target module: <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[11px]">lib/session.ts</code>
                  </p>

                  <div className="mt-4 p-3.5 rounded-[10px] bg-[#F8F8F5] border border-black/[0.04] space-y-2 text-[12px]">
                    <div className="flex items-center justify-between text-[#333]">
                      <span className="font-mono">api/auth/route.ts</span>
                      <span className="text-[10px] bg-[#C8E6C9] px-1.5 py-0.5 rounded text-[#2E7D32] font-semibold">Direct Call</span>
                    </div>
                    <div className="flex items-center justify-between text-[#333]">
                      <span className="font-mono">middleware.ts</span>
                      <span className="text-[10px] bg-[#FFE8D6] px-1.5 py-0.5 rounded text-[#b45309] font-semibold">Edge Worker</span>
                    </div>
                    <div className="flex items-center justify-between text-[#333]">
                      <span className="font-mono">services/billing.ts</span>
                      <span className="text-[10px] bg-[#E5DEFF] px-1.5 py-0.5 rounded text-[#5B21B6] font-semibold">Secondary</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <span className="text-[12px] text-[#666]">Interactive graph</span>
                  <Link href="/diagram" className="text-[12px] font-semibold text-[#1a1a1a] hover:underline flex items-center gap-1">
                    Explore nodes <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Torn Paper Mountain Silhouettes anchored at bottom */}
          <div className="relative h-20 -mb-12 mt-6 overflow-hidden pointer-events-none opacity-90">
            <div className="absolute -bottom-6 left-[5%] w-[45%] h-24 mountain-periwinkle" />
            <div className="absolute -bottom-6 right-[15%] w-[50%] h-28 mountain-sand" />
            <div className="absolute -bottom-6 right-[-5%] w-[35%] h-20 mountain-wheat" />
          </div>
        </div>
      </section>

      {/* 7.3 Feature Cards Grid with Pastel Palette */}
      <section id="features" className="py-20 px-4 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-2">
            Engineered For Speed & Confidence
          </div>
          <h2 className="text-[34px] md:text-[46px] font-serif font-[500] tracking-[-0.01em] text-[#1a1a1a]">
            Everything needed to triage with <em>certainty.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Soft Blue (#B4C7EF) - Architecture Diagrams */}
          <div className="rounded-[24px] bg-[#B4C7EF] p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-3">
                Codebase Topology
              </div>
              <h3 className="text-[28px] md:text-[34px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                Deep AST Architecture <em>Visualizer</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#333] max-w-[420px]">
                Understand what actually breaks. RepoPilot parses full repo ASTs into dependency clusters, call graphs, and blast-radius heatmaps for incoming changes.
              </p>
              <div className="mt-6">
                <Link
                  href="/diagram"
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 hover:bg-white/95 text-[#1a1a1a] px-6 py-2.5 text-[14px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  Generate Diagram
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual mini-mock */}
            <div className="mt-8 p-4 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between text-[11px] text-[#666] border-b pb-2 mb-2 font-mono">
                <span>GRAPH GENERATOR</span>
                <span className="text-[#2E7D32]">Ready</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-[#444]">
                <div>• Parsed 24 modules across 3 directory boundaries</div>
                <div>• Identified 8 circular reference hazards</div>
                <div>• Exportable to SVG, PNG, and Mermaid diagram format</div>
              </div>
            </div>
          </div>

          {/* Card 2: Soft Peach (#FFE8D6) - Gemma 4 AI Risk Analysis */}
          <div className="rounded-[24px] bg-[#FFE8D6] p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-3">
                Risk & Heuristics
              </div>
              <h3 className="text-[28px] md:text-[34px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                Gemma 4 AI <em>PR Risk Scoring</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#333] max-w-[420px]">
                Pre-trained code models analyze git diffs to detect security vulnerabilities, test coverage deficits, breaking schema alterations, and subtle regressions before merge.
              </p>
              <div className="mt-6">
                <Link
                  href="/swipe"
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 hover:bg-white/95 text-[#1a1a1a] px-6 py-2.5 text-[14px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  Inspect Risk Scoring
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual mini-mock */}
            <div className="mt-8 p-4 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[#1a1a1a]">Automated Security Audit</span>
                <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                  92% Compliance
                </span>
              </div>
              {/* Progress bar (§7.8) */}
              <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: "92%" }} />
              </div>
              <div className="text-[11px] text-[#666]">
                Zero plaintext secrets • Type-safety preserved • Tests added
              </div>
            </div>
          </div>

          {/* Card 3: Soft Green (#C8E6C9) - Chrome Side Panel */}
          <div className="rounded-[24px] bg-[#C8E6C9] p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-3">
                Seamless Workflow
              </div>
              <h3 className="text-[28px] md:text-[34px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                One-Click Chrome <em>Side Panel</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#333] max-w-[420px]">
                Review right on github.com without leaving your browser tab. RepoPilot slides out as a native Chrome side panel providing instant AI summaries and diff breakdowns.
              </p>
              <div className="mt-6">
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 hover:bg-white/95 text-[#1a1a1a] px-6 py-2.5 text-[14px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  Load Extension
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Visual mini-mock */}
            <div className="mt-8 p-4 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#333] pb-2 border-b">
                <span>github.com/facebook/react/pull/31400</span>
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              </div>
              <p className="mt-2 text-[12px] text-[#444]">
                Sidepanel docks alongside PR conversations with inline architectural explanations.
              </p>
            </div>
          </div>

          {/* Card 4: Lavender (#E5DEFF) - Model Context Protocol & Cursor */}
          <div className="rounded-[24px] bg-[#E5DEFF] p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-3">
                Extensibility
              </div>
              <h3 className="text-[28px] md:text-[34px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                Native MCP Server & <em>Agent Tools</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#333] max-w-[420px]">
                Connect RepoPilot directly into Claude Desktop or Cursor IDE through the Model Context Protocol. Run codebase queries, PR triages, and reviews directly from your editor.
              </p>
              <div className="mt-6">
                <Link
                  href="/api/mcp"
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 hover:bg-white/95 text-[#1a1a1a] px-6 py-2.5 text-[14px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  MCP Protocol Endpoint
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual mini-mock */}
            <div className="mt-8 p-4 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#5B21B6] mb-1">
                <Terminal className="h-3 w-3" />
                <span>mcp-server: repopilot</span>
              </div>
              <div className="text-[11px] font-mono text-[#333] bg-[#f5f5f5] p-2 rounded">
                GET /api/mcp → Tools: review_pr, generate_diagram
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7.12 Install & Setup Steps Card */}
      <section id="how-it-works" className="py-20 px-4 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-2">
            Get Up & Running In 60 Seconds
          </div>
          <h2 className="text-[32px] md:text-[42px] font-serif font-[500] text-[#1a1a1a]">
            How to use <em>RepoPilot</em>
          </h2>
        </div>

        <div className="rounded-[20px] bg-white border border-black/[0.06] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          {/* Step 1 */}
          <div className="flex items-start gap-5 py-4 border-b border-black/[0.05]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B4C7EF] flex items-center justify-center font-semibold text-[13px] text-[#1a1a1a]">
              1
            </div>
            <div>
              <h4 className="text-[16px] font-semibold text-[#1a1a1a] font-sans">
                Review Any Repository on the Web
              </h4>
              <p className="mt-1 text-[14px] text-[#666] leading-[1.6]">
                Navigate to <Link href="/swipe" className="font-medium text-[#1a1a1a] underline">repopilot.dev/swipe</Link> and enter any public GitHub repository (e.g. <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">vercel/next.js</code>) to load PRs into your card deck.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-5 py-4 border-b border-black/[0.05]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B4C7EF] flex items-center justify-center font-semibold text-[13px] text-[#1a1a1a]">
              2
            </div>
            <div>
              <h4 className="text-[16px] font-semibold text-[#1a1a1a] font-sans">
                Load the Chrome Extension in Developer Mode
              </h4>
              <p className="mt-1 text-[14px] text-[#666] leading-[1.6]">
                Go to <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">chrome://extensions</code>, enable Developer mode, click <span className="font-semibold text-[#1a1a1a]">Load unpacked</span>, and select the <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">/extension</code> directory in this repo.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-5 py-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B4C7EF] flex items-center justify-center font-semibold text-[13px] text-[#1a1a1a]">
              3
            </div>
            <div>
              <h4 className="text-[16px] font-semibold text-[#1a1a1a] font-sans">
                Triage with Hotkeys or Swipes
              </h4>
              <p className="mt-1 text-[14px] text-[#666] leading-[1.6]">
                Use <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">J</code> to approve, <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">F</code> to request changes, and <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[12px] font-mono">Space</code> to skip. Real-time feedback pushes directly to GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Wordmark (CTA) Inter 900 skewed -8deg */}
          <div className="skew-wordmark font-black tracking-[-0.04em] text-[40px] md:text-[48px] text-[#1a1a1a] mb-4">
            {"REPOPILOT".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
          <h2 className="text-[32px] md:text-[44px] font-serif font-[500] tracking-[-0.01em] text-[#1a1a1a]">
            Ready to streamline your <em>review queue?</em>
          </h2>
          <p className="mt-4 text-[17px] text-[#666] max-w-[480px] mx-auto">
            Zero friction, open source, and equipped with Gemini & Gemma 4 reasoning out of the box.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/swipe"
              className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all hover:bg-black hover:-translate-y-0.5"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7.13 Editorial Footer */}
      <footer className="py-12 px-4 border-t border-black/[0.06] text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1a1a1a]">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <span>RepoPilot</span>
            <span className="text-[#999] font-normal">— Intelligent PR Deck & Context</span>
          </div>

          <div className="flex items-center gap-6 text-[14px] text-[#666]">
            <Link href="/swipe" className="hover:text-[#1a1a1a] transition">
              Review Deck
            </Link>
            <Link href="/diagram" className="hover:text-[#1a1a1a] transition">
              AST Explorer
            </Link>
            <a href="https://github.com/sripavantejb/repopilot" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition">
              GitHub Repo
            </a>
          </div>

          <div className="text-[13px] text-[#999]">
            © {new Date().getFullYear()} RepoPilot • Litigo Design System
          </div>
        </div>
      </footer>
    </div>
  )
}
