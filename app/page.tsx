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
  Github,
  Download,
  Chrome,
  Copy,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { ChromeExtensionModal } from "@/components/chrome-extension-modal"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false)
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)
  const [copiedExtensionsUrl, setCopiedExtensionsUrl] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Listen for extension handshake
  useEffect(() => {
    const handleStatus = (e: any) => {
      if (e.detail?.installed || e.data?.installed) {
        setIsExtensionInstalled(true)
      }
    }

    if (typeof document !== "undefined" && document.documentElement.getAttribute("data-repopilot-extension") === "true") {
      setIsExtensionInstalled(true)
    }

    window.addEventListener("repopilot:extension:status", handleStatus)
    window.addEventListener("message", handleStatus)

    return () => {
      window.removeEventListener("repopilot:extension:status", handleStatus)
      window.removeEventListener("message", handleStatus)
    }
  }, [])

  const handleDirectDownloadZip = () => {
    const link = document.createElement("a")
    link.href = "/api/extension/download"
    link.download = "repopilot-extension.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Downloading repopilot-extension.zip (16.8 KB)", {
      description: "Extract the zip and load unpacked via chrome://extensions.",
    })
  }

  const handleCopyExtensionsUrl = async () => {
    try {
      await navigator.clipboard.writeText("chrome://extensions")
      setCopiedExtensionsUrl(true)
      toast.success("Copied 'chrome://extensions' to clipboard!", {
        description: "Open a new tab (⌘+T) and paste into the address bar.",
      })
      setTimeout(() => setCopiedExtensionsUrl(false), 2500)
    } catch {
      toast.error("Failed to copy URL. Open chrome://extensions manually.")
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1a1a1a] selection:bg-[#B4C7EF] selection:text-[#1a1a1a] font-sans">
      {/* 7.1 Floating Pill Navigation */}
      <nav 
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between md:justify-start gap-3 sm:gap-5 px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10" 
            : "bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-black/[0.06]"
        } backdrop-blur-xl whitespace-nowrap`}
        style={{ maxWidth: "calc(100vw - 32px)", width: "max-content" }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-white flex-shrink-0">
            <GitPullRequest className="h-3.5 w-3.5" />
          </div>
          {/* 2.4 Wordmark: REPOPILOT uppercase Inter 900 skewed -8deg */}
          <span className="skew-wordmark font-black tracking-[-0.04em] text-[17px] text-[#1a1a1a] select-none">
            {"REPOPILOT".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-[#333] ml-1 flex-shrink-0">
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
        <div className="hidden lg:block w-px h-5 bg-black/10 flex-shrink-0" />

        {/* Chrome Extension Pill */}
        <button
          onClick={() => setIsExtensionModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-[#1a1a1a] transition-all hover:-translate-y-0.5 shadow-sm flex-shrink-0"
        >
          <Chrome className="h-3.5 w-3.5 text-[#2E7D32]" />
          <span>Chrome DevTools</span>
          <span className="text-[10px] bg-[#C8E6C9] text-[#2E7D32] px-1.5 py-0.2 rounded-full font-bold">.ZIP</span>
        </button>

        {/* Primary CTA pill */}
        <Link
          href="/swipe"
          className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-4 py-2 text-[14px] font-semibold text-white transition-all hover:bg-black hover:-translate-y-0.5 flex-shrink-0"
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

          {/* Organic Layered Paper Clouds (§9) */}
          <div className="absolute top-10 left-10 pointer-events-none hidden sm:block opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="relative w-28 h-8 bg-white rounded-full">
              <div className="absolute -top-4 left-3 w-10 h-10 bg-white rounded-full" />
              <div className="absolute -top-6 left-9 w-12 h-12 bg-white rounded-full" />
            </div>
          </div>

          <div className="absolute top-12 right-12 pointer-events-none hidden sm:block opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="relative w-36 h-9 bg-white rounded-full">
              <div className="absolute -top-5 left-4 w-12 h-12 bg-white rounded-full" />
              <div className="absolute -top-7 left-14 w-14 h-14 bg-white rounded-full" />
              <div className="absolute -top-4 right-4 w-10 h-10 bg-white rounded-full" />
            </div>
          </div>
          
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
              <button
                onClick={() => setIsExtensionModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-white/95 border border-black/[0.08] px-7 py-3.5 text-[15px] font-semibold text-[#1a1a1a] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:bg-white hover:-translate-y-0.5"
              >
                <Chrome className="h-4 w-4 text-[#2E7D32]" />
                <span>Load Chrome DevTools</span>
                <span className="text-[11px] font-mono bg-[#f0ede6] text-[#666] px-2 py-0.5 rounded-full font-semibold">.zip</span>
              </button>
              <Link
                href="/diagram"
                className="flex items-center gap-2 rounded-full bg-white/70 border border-black/[0.06] px-6 py-3.5 text-[15px] font-medium text-[#333] transition-all hover:bg-white/90"
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

            {/* Direct extension status banner */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-[12px] text-[#555]">
              <span className={`w-2 h-2 rounded-full ${isExtensionInstalled ? "bg-[#2E7D32] animate-pulse" : "bg-[#f59e0b]"}`} />
              <span className="font-medium">
                {isExtensionInstalled ? "RepoPilot Extension Active in Chrome" : "Chrome DevTools & Side Panel Available"}
              </span>
              <span className="text-black/30">•</span>
              <button
                onClick={handleDirectDownloadZip}
                className="underline font-semibold text-[#1a1a1a] hover:text-black flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ZIP (16.8 KB)</span>
              </button>
              <span className="text-black/30">•</span>
              <button
                onClick={handleCopyExtensionsUrl}
                className="underline font-semibold text-[#1a1a1a] hover:text-black flex items-center gap-1 transition"
              >
                {copiedExtensionsUrl ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExtensionsUrl ? "Copied 'chrome://extensions'" : "Copy chrome://extensions"}</span>
              </button>
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

          {/* Card 3: Soft Green (#C8E6C9) - Chrome Side Panel & DevTools */}
          <div className="rounded-[24px] bg-[#C8E6C9] p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#333] mb-3 flex items-center justify-between">
                <span>Seamless Workflow</span>
                <span className="text-[11px] bg-white/80 px-2 py-0.5 rounded-full font-mono text-[#2E7D32]">Manifest V3</span>
              </div>
              <h3 className="text-[28px] md:text-[34px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                One-Click Chrome <em>Side Panel & DevTools</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#333] max-w-[420px]">
                Review right on github.com or inside Chrome Developer Tools (F12). RepoPilot slides out as a native side panel and DevTools panel with inline architectural explanations and instant PR analysis.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleDirectDownloadZip}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] hover:bg-black text-white px-5 py-2.5 text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .ZIP</span>
                </button>
                <button
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 hover:bg-white text-[#1a1a1a] px-5 py-2.5 text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <Chrome className="h-3.5 w-3.5 text-[#2E7D32]" />
                  <span>Load to Chrome DevTools</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual mini-mock */}
            <div className="mt-8 p-4 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#333] pb-2 border-b">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                  <span>Chrome DevTools & Side Panel</span>
                </div>
                <span className="font-mono text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded text-[#666]">F12 or Side Panel</span>
              </div>
              <p className="mt-2 text-[12px] text-[#444]">
                Side panel docks alongside PR conversations, plus a dedicated "RepoPilot" tab inside Chrome Developer Tools.
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

      {/* Chrome Developer Tools & Side Panel Showcase Banner */}
      <section className="py-12 px-4 md:px-12 max-w-6xl mx-auto">
        <div className="rounded-[24px] bg-white border border-black/[0.08] p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#C8E6C9]/40 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#B4C7EF]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C8E6C9]/60 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2E7D32] mb-3">
                <Chrome className="w-3.5 h-3.5" />
                <span>Developer Mode Ready • Manifest V3</span>
              </div>
              <h3 className="text-[28px] md:text-[38px] font-serif font-[500] text-[#1a1a1a] leading-tight">
                Download ZIP & Load Directly into <em>Chrome Developer Tools</em>
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#555] max-w-[540px]">
                No waiting for web store approvals. Download the pre-packaged <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded font-mono text-[12px]">repopilot-extension.zip</code>, load unpacked into Chrome in seconds, and review pull requests natively inside Chrome DevTools (F12) or the companion side panel.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDirectDownloadZip}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] hover:bg-black text-white px-6 py-3 text-[14px] font-semibold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extension (.zip)</span>
                  <span className="text-[11px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-full">16.8 KB</span>
                </button>

                <button
                  onClick={handleCopyExtensionsUrl}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-black/10 hover:bg-black/[0.02] text-[#1a1a1a] px-5 py-3 text-[14px] font-semibold transition-all shadow-sm hover:-translate-y-0.5"
                >
                  {copiedExtensionsUrl ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4 text-[#666]" />}
                  <span>{copiedExtensionsUrl ? "Copied 'chrome://extensions'!" : "Copy chrome://extensions"}</span>
                </button>

                <button
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B4C7EF]/30 hover:bg-[#B4C7EF]/50 text-[#1a1a1a] px-5 py-3 text-[14px] font-semibold transition-all hover:-translate-y-0.5"
                >
                  <span>Interactive Setup Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Status Ribbon */}
              <div className="mt-6 flex items-center gap-3 text-[13px] text-[#666]">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isExtensionInstalled ? "bg-[#2E7D32] animate-pulse" : "bg-[#f59e0b]"}`} />
                  <span className="font-medium text-[#1a1a1a]">
                    {isExtensionInstalled ? "Status: Active & Handshake Established" : "Status: Awaiting Unpacked Load in Chrome"}
                  </span>
                </div>
                <span className="text-black/20">•</span>
                <span>Includes DevTools Tab & Side Panel</span>
              </div>
            </div>

            {/* Right Column: Mini DevTools Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-[16px] bg-[#1E1E1E] text-white p-4 shadow-xl border border-white/10 font-mono text-[12px]">
                {/* DevTools window header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[11px] text-[#888]">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-[#888]">Elements</span>
                    <span className="text-[#888]">Console</span>
                    <span className="text-[#888]">Sources</span>
                    <span className="text-[#888]">Network</span>
                    <span className="text-white bg-[#333] px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
                      RepoPilot
                    </span>
                  </div>
                  <div className="text-[10px] text-[#666]">DevTools F12</div>
                </div>

                {/* DevTools panel content */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9CDCFE]">target:</span>
                    <span className="text-[#CE9178]">"github.com/facebook/react/pull/31400"</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9CDCFE]">risk_score:</span>
                    <span className="text-[#4EC9B0]">92 / 100 (Safe)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9CDCFE]">ast_impact:</span>
                    <span className="text-[#DCDCAA]">3 modules downstream</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#2D2D2D] text-[11px] text-[#DDD] space-y-1">
                    <div className="text-[#4CAF50] font-bold">✓ Ready for instant triage</div>
                    <div className="text-[10px] text-[#AAA]">Hotkeys: [J] Approve • [F] Request Changes • [Space] Next</div>
                  </div>
                </div>
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
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[16px] font-semibold text-[#1a1a1a] font-sans">
                  Download ZIP & Load to Chrome Developer Tools
                </h4>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${isExtensionInstalled ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF8E1] text-[#b45309]"}`}>
                  {isExtensionInstalled ? "✓ Active in Chrome" : "Awaiting Unpacked"}
                </span>
              </div>
              <p className="mt-1 text-[14px] text-[#666] leading-[1.6]">
                Download the extension ZIP below, unzip it, and load it unpacked in Chrome to enable both the Side Panel and the Chrome Developer Tools (F12) panel.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDirectDownloadZip}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] text-white text-[12px] font-semibold hover:bg-black transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ZIP (16.8 KB)</span>
                </button>
                <button
                  onClick={handleCopyExtensionsUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-[#333] text-[12px] font-medium hover:bg-white/80 transition shadow-sm"
                >
                  {copiedExtensionsUrl ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExtensionsUrl ? "Copied 'chrome://extensions'" : "Copy chrome://extensions"}</span>
                </button>
                <button
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0F4FF] border border-[#B4C7EF] text-[#1a1a1a] text-[12px] font-semibold hover:bg-[#E5EEFF] transition shadow-sm"
                >
                  <Chrome className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Interactive Setup Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
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
