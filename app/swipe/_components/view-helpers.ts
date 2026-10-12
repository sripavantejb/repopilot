import type { PullRequest } from '../_types'

export function localRiskScore(pr: PullRequest): number {
  let score = 20
  const title = (pr.title || '').toLowerCase()
  const churn = (pr.additions || 0) + (pr.deletions || 0)
  const files = pr.filesChanged || 1

  // Churn factor
  if (churn > 800) score += 35
  else if (churn > 300) score += 25
  else if (churn > 100) score += 15
  else if (churn > 30) score += 8

  // File count spread
  if (files > 15) score += 25
  else if (files > 8) score += 15
  else if (files > 3) score += 8

  // Semantic category risk
  if (/security|auth|token|secret|credential|crypto|permission/i.test(title)) score += 30
  else if (/break|migration|schema|deprecat/i.test(title)) score += 25
  else if (/refactor|rewrite|core|engine/i.test(title)) score += 15
  else if (/fix|bug|crash|leak|error/i.test(title)) score += 10
  else if (/doc|readme|typo|comment|license/i.test(title)) score = Math.max(12, score - 15)

  return Math.min(95, Math.max(10, score))
}


export function riskColor(score: number) {
  if (score >= 70) return 'bg-red-100 text-red-700 border-red-200'
  if (score >= 40) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export const CATEGORY_ORDER = [
  'Security', 'Breaking', 'Bug Fix', 'Feature',
  'Refactor', 'Testing', 'Maintenance', 'CI/CD', 'Docs', 'Other',
]

export const CATEGORY_STYLE: Record<string, { dot: string; header: string }> = {
  Security:    { dot: 'bg-red-600',    header: 'bg-red-50 text-red-800 border-red-200' },
  Breaking:    { dot: 'bg-orange-500', header: 'bg-orange-50 text-orange-800 border-orange-200' },
  'Bug Fix':   { dot: 'bg-red-400',    header: 'bg-red-50 text-red-700 border-red-200' },
  Feature:     { dot: 'bg-blue-500',   header: 'bg-blue-50 text-blue-700 border-blue-200' },
  Refactor:    { dot: 'bg-purple-500', header: 'bg-purple-50 text-purple-700 border-purple-200' },
  Testing:     { dot: 'bg-cyan-500',   header: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  Maintenance: { dot: 'bg-slate-400',  header: 'bg-slate-50 text-slate-700 border-slate-200' },
  'CI/CD':     { dot: 'bg-indigo-500', header: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  Docs:        { dot: 'bg-green-500',  header: 'bg-green-50 text-green-700 border-green-200' },
  Other:       { dot: 'bg-gray-400',   header: 'bg-gray-50 text-gray-600 border-gray-200' },
}

export function inferCategory(pr: PullRequest): string {
  const title = (pr.title ?? '').toLowerCase()
  if (/^(security|auth)(\(|:|\s)/.test(title)) return 'Security'
  if (/breaking.?change|^break/.test(title)) return 'Breaking'
  if (/^(fix|bug)(\(|:|\s)/.test(title)) return 'Bug Fix'
  if (/^(feat|add|new)(\(|:|\s)/.test(title)) return 'Feature'
  if (/^refactor(\(|:|\s)|^cleanup(\(|:|\s)/.test(title)) return 'Refactor'
  if (/^test(\(|:|\s)/.test(title)) return 'Testing'
  if (/^(ci|build)(\(|:|\s)/.test(title)) return 'CI/CD'
  if (/^docs?(\(|:|\s)/.test(title)) return 'Docs'
  if (/^(chore|deps|bump)(\(|:|\s)/.test(title)) return 'Maintenance'
  return 'Other'
}
