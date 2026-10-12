"use client"

import React, { useState, useEffect } from "react"
import { 
  Download, 
  Chrome, 
  Copy, 
  Check, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  FolderDown, 
  X, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react"
import { toast } from "sonner"

interface ChromeExtensionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChromeExtensionModal({ isOpen, onClose }: ChromeExtensionModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  // Listen for extension installation ping
  useEffect(() => {
    const handleStatus = (e: any) => {
      if (e.detail?.installed || e.data?.installed) {
        setIsInstalled(true)
      }
    }

    // Check DOM attribute
    if (typeof document !== "undefined" && document.documentElement.getAttribute("data-repopilot-extension") === "true") {
      setIsInstalled(true)
    }

    window.addEventListener("repopilot:extension:status", handleStatus)
    window.addEventListener("message", handleStatus)

    // Periodic check
    const checkTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.documentElement.getAttribute("data-repopilot-extension") === "true") {
        setIsInstalled(true)
      }
    }, 2000)

    return () => {
      window.removeEventListener("repopilot:extension:status", handleStatus)
      window.removeEventListener("message", handleStatus)
      clearInterval(checkTimer)
    }
  }, [])

  if (!isOpen) return null

  const handleDownloadZip = () => {
    setIsDownloading(true)
    const link = document.createElement("a")
    link.href = "/api/extension/download"
    link.download = "repopilot-extension.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Downloading repopilot-extension.zip", {
      description: "Extract the zip file to a folder to load it into Chrome.",
    })

    setTimeout(() => {
      setIsDownloading(false)
      setActiveStep(2)
    }, 1200)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText("chrome://extensions")
      setCopiedUrl(true)
      toast.success("Copied 'chrome://extensions' to clipboard!", {
        description: "Open a new tab (⌘+T / Ctrl+T) and paste into the address bar.",
      })
      setTimeout(() => setCopiedUrl(false), 2500)
    } catch {
      toast.error("Failed to copy. Please type chrome://extensions in a new tab.")
    }
  }

  const handleCheckConnection = () => {
    setIsChecking(true)
    window.postMessage({ type: "CHECK_REPOPILOT_EXTENSION" }, "*")

    setTimeout(() => {
      const detected = 
        typeof document !== "undefined" && 
        (document.documentElement.getAttribute("data-repopilot-extension") === "true" || isInstalled)
      
      setIsChecking(false)
      if (detected) {
        setIsInstalled(true)
        toast.success("RepoPilot Extension is active & connected!", {
          description: "Both the Chrome Side Panel and DevTools panel are ready.",
        })
      } else {
        toast.info("Extension not detected yet", {
          description: "Make sure you loaded the unpacked folder in chrome://extensions, then refresh this page.",
        })
      }
    }, 900)
  }

  const handleOpenSidepanel = () => {
    window.postMessage({ type: "OPEN_REPOPILOT_SIDEPANEL" }, "*")
    toast.success("Triggered Side Panel", {
      description: "If GitHub is open, RepoPilot is now docked.",
    })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FDF8F0] rounded-[24px] border border-black/10 shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden text-[#1a1a1a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#B4C7EF] flex items-center justify-center text-[#1a1a1a]">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-[20px] font-[600] text-[#1a1a1a] leading-none">
                Load Extension to Chrome Developer Tools
              </h3>
              <p className="text-[12px] text-[#666] mt-1">
                Direct installation via Chrome Unpacked Developer Mode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#666] hover:text-[#1a1a1a] transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Status Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-white border border-black/[0.06] shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isInstalled ? "bg-[#2E7D32] animate-pulse" : "bg-[#f59e0b]"}`} />
              <div>
                <span className="text-[12px] font-semibold text-[#1a1a1a]">
                  Extension Status:
                </span>{" "}
                <span className={`text-[12px] font-medium ${isInstalled ? "text-[#2E7D32]" : "text-[#b45309]"}`}>
                  {isInstalled ? "Active & Connected in Chrome" : "Awaiting Unpacked Load"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckConnection}
                disabled={isChecking}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] hover:bg-[#eaeaea] text-[#333] transition"
              >
                {isChecking ? "Checking..." : "Check Status"}
              </button>
              {isInstalled && (
                <button
                  onClick={handleOpenSidepanel}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#2E7D32] text-white hover:bg-[#256828] transition"
                >
                  Open Side Panel
                </button>
              )}
            </div>
          </div>

          {/* Quick 1-Click Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-[#1a1a1a] text-white font-semibold text-[14px] shadow-sm hover:bg-black hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Downloading..." : "1. Download Extension (.zip)"}</span>
            </button>

            <button
              onClick={handleCopyUrl}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-white border border-black/[0.1] text-[#1a1a1a] font-semibold text-[14px] shadow-sm hover:bg-white/80 hover:-translate-y-0.5 transition-all"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4 text-[#666]" />}
              <span>{copiedUrl ? "Copied 'chrome://extensions'!" : "2. Copy chrome://extensions"}</span>
            </button>
          </div>

          {/* Step-by-Step Interactive Guide */}
          <div className="space-y-3 pt-2">
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#666]">
              3-Step Developer Mode Setup
            </div>

            {/* Step 1 */}
            <div 
              className={`p-4 rounded-[16px] border transition-all ${
                activeStep === 1 
                  ? "bg-white border-black/15 shadow-sm" 
                  : "bg-white/60 border-black/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#B4C7EF] text-[#1a1a1a] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-semibold text-[#1a1a1a]">
                      Download & Unpack the Extension ZIP
                    </h4>
                    <span className="text-[11px] font-mono text-[#666] bg-[#f5f5f5] px-2 py-0.5 rounded">
                      repopilot-extension.zip
                    </span>
                  </div>
                  <p className="text-[13px] text-[#666] mt-1 leading-[1.5]">
                    Click <button onClick={handleDownloadZip} className="font-semibold text-[#1a1a1a] underline inline">Download Extension (.zip)</button> above. Double-click the downloaded zip file to extract it into a folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              className={`p-4 rounded-[16px] border transition-all ${
                activeStep === 2 
                  ? "bg-white border-black/15 shadow-sm" 
                  : "bg-white/60 border-black/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FFE8D6] text-[#1a1a1a] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-[#1a1a1a]">
                    Open Extensions & Toggle "Developer mode"
                  </h4>
                  <p className="text-[13px] text-[#666] mt-1 leading-[1.5]">
                    Open a new tab in Chrome, paste <code className="bg-[#f0ede6] px-1.5 py-0.5 rounded font-mono text-[12px] text-[#1a1a1a]">chrome://extensions</code> into the URL bar, and toggle on <strong className="text-[#1a1a1a]">Developer mode</strong> in the upper-right corner.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              className={`p-4 rounded-[16px] border transition-all ${
                activeStep === 3 
                  ? "bg-white border-black/15 shadow-sm" 
                  : "bg-white/60 border-black/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#C8E6C9] text-[#1a1a1a] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-[#1a1a1a]">
                    Click "Load unpacked" & Select Folder
                  </h4>
                  <p className="text-[13px] text-[#666] mt-1 leading-[1.5]">
                    Click the <strong className="text-[#1a1a1a]">Load unpacked</strong> button in the top toolbar, then select the extracted extension folder. RepoPilot will immediately register!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DevTools & SidePanel Dual Mode Note */}
          <div className="p-4 rounded-[16px] bg-[#E5DEFF]/50 border border-[#5B21B6]/15 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#5B21B6] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#333] leading-[1.5]">
              <strong className="text-[#5B21B6]">Both Side Panel & Chrome DevTools included:</strong>
              <div className="mt-1">
                • <strong>Side Panel:</strong> Click the RepoPilot icon in your Chrome toolbar or visit any GitHub PR.
                <br />
                • <strong>Developer Tools:</strong> Press <code className="bg-white/80 px-1 py-0.5 rounded font-mono">F12</code> or <code className="bg-white/80 px-1 py-0.5 rounded font-mono">⌥+⌘+I</code> on any page — a dedicated <span className="font-semibold">"RepoPilot"</span> panel appears in your DevTools drawer!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-black/[0.06] flex items-center justify-between">
          <a
            href="https://github.com/facebook/react/pull/31400"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#666] hover:text-[#1a1a1a] flex items-center gap-1.5 transition"
          >
            <span>Test on sample GitHub PR</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[13px] font-medium text-[#666] hover:text-[#1a1a1a] hover:bg-black/[0.04] transition"
            >
              Done
            </button>
            <button
              onClick={handleDownloadZip}
              className="px-5 py-2 rounded-full text-[13px] font-semibold bg-[#1a1a1a] text-white hover:bg-black transition shadow-sm"
            >
              Download ZIP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
