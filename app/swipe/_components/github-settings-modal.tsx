'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  GitMerge,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
} from 'lucide-react'

export interface GitHubConfig {
  token: string
  autoMerge: boolean
  mergeMethod: 'squash' | 'merge' | 'rebase'
  syncReviews: boolean
}

interface GitHubSettingsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly config: GitHubConfig
  readonly onSaveConfig: (config: GitHubConfig) => void
}

interface GitHubUserVerification {
  authenticated: boolean
  login?: string
  name?: string
  avatarUrl?: string
  scopes?: string[]
  hasRepoScope?: boolean
  error?: string
}

export function GitHubSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: GitHubSettingsModalProps) {
  const [tokenDraft, setTokenDraft] = useState(config.token)
  const [autoMerge, setAutoMerge] = useState(config.autoMerge)
  const [mergeMethod, setMergeMethod] = useState<'squash' | 'merge' | 'rebase'>(config.mergeMethod)
  const [syncReviews, setSyncReviews] = useState(config.syncReviews)
  const [showToken, setShowToken] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState<GitHubUserVerification | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync state when config changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTokenDraft(config.token)
      setAutoMerge(config.autoMerge)
      setMergeMethod(config.mergeMethod)
      setSyncReviews(config.syncReviews)
      setSaveSuccess(false)
      if (config.token) {
        verifyToken(config.token)
      } else {
        setVerification(null)
      }
    }
  }, [isOpen, config])

  const verifyToken = async (pat: string) => {
    if (!pat.trim()) {
      setVerification(null)
      return
    }
    setVerifying(true)
    try {
      const res = await fetch('/api/github/user', {
        headers: { 'x-github-token': pat.trim() },
      })
      const data = await res.json()
      setVerification(data)
    } catch {
      setVerification({ authenticated: false, error: 'Network error verifying token' })
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = () => {
    onSaveConfig({
      token: tokenDraft.trim(),
      autoMerge,
      mergeMethod,
      syncReviews,
    })
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      onClose()
    }, 600)
  }

  const handleClear = () => {
    setTokenDraft('')
    setAutoMerge(false)
    setSyncReviews(false)
    setVerification(null)
    onSaveConfig({
      token: '',
      autoMerge: false,
      mergeMethod: 'squash',
      syncReviews: false,
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-card-foreground">GitHub Integration & Auto-Merge</h2>
              <p className="text-xs text-muted-foreground">
                Authorize direct PR merging and review actions
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {/* Token Section */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=RepoPilot+PR+Triage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-blue-500 hover:underline"
                >
                  Generate Token (repo scope)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative mt-2">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenDraft}
                  onChange={(e) => {
                    setTokenDraft(e.target.value)
                    setVerification(null)
                  }}
                  onBlur={() => {
                    if (tokenDraft.trim() && (!verification || !verification.authenticated)) {
                      verifyToken(tokenDraft)
                    }
                  }}
                  placeholder="ghp_... or github_pat_..."
                  className="w-full rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 pr-20 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => verifyToken(tokenDraft)}
                    disabled={verifying || !tokenDraft.trim()}
                    className="rounded bg-secondary px-2 py-1 font-mono text-[11px] font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test'}
                  </button>
                </div>
              </div>

              {/* Token verification badge */}
              {verifying && (
                <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying GitHub token…</span>
                </div>
              )}

              {verification && !verifying && (
                <div
                  className={`mt-2.5 flex items-start gap-2.5 rounded-xl border p-2.5 ${
                    verification.authenticated
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {verification.authenticated ? (
                    <>
                      {verification.avatarUrl ? (
                        <img
                          src={verification.avatarUrl}
                          alt={verification.login}
                          className="h-6 w-6 rounded-full border border-emerald-500/30"
                        />
                      ) : (
                        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      )}
                      <div className="text-xs">
                        <div className="font-semibold">
                          Connected as @{verification.login}
                        </div>
                        <div className="font-mono text-[11px] opacity-80">
                          {verification.hasRepoScope
                            ? '✓ Full "repo" scope detected (can merge PRs)'
                            : '⚠ Warning: "repo" scope not detected. May fail on write operations.'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-semibold">Verification Failed</div>
                        <div className="font-mono text-[11px] opacity-90">{verification.error}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Automation Options */}
            <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-3.5">
              {/* Auto-Merge Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-semibold text-foreground">
                    Auto-Merge on Approve (Swipe Right / J)
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Automatically executes PR merge on GitHub whenever you swipe right to approve.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoMerge(!autoMerge)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoMerge ? 'bg-purple-600' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoMerge ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Merge Method Selector */}
              <div className="border-t border-border pt-3">
                <div className="font-mono text-xs font-semibold text-foreground">Merge Strategy</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'squash', label: 'Squash & merge', desc: 'Combines commits' },
                      { id: 'merge', label: 'Merge commit', desc: 'Preserves history' },
                      { id: 'rebase', label: 'Rebase & merge', desc: 'Linear history' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMergeMethod(m.id)}
                      className={`flex flex-col rounded-lg border p-2 text-left transition-all ${
                        mergeMethod === m.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                          : 'border-border bg-card/60 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <span className="font-mono text-xs font-medium">{m.label}</span>
                      <span className="text-[10px] opacity-75">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Reviews Toggle */}
              <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                <div>
                  <div className="font-mono text-xs font-semibold text-foreground">
                    Post GitHub Reviews on Swipe
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Submits formal GitHub review events (Approve or Request Changes) along with decisions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncReviews(!syncReviews)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    syncReviews ? 'bg-purple-600' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      syncReviews ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Note on permissions */}
            <p className="text-[11px] text-muted-foreground">
              Note: Merging requires maintainer or write permissions on the target repository. Your token is stored locally in your browser and never saved to our database.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              onClick={handleClear}
              className="font-mono text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              Clear Token
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-3.5 py-1.5 font-mono text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-1.5 font-mono text-xs font-medium text-background hover:opacity-90 transition-opacity"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
