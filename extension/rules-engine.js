// RepoPilot Risk Score Rules Engine
// Provides extensible rule sets and risk score evaluation for Chrome Extension & Web App

(function (global) {
  'use strict';

  const HIGH_RISK_PATTERN = '(package\\.json|package-lock\\.json|pnpm-lock\\.yaml|yarn\\.lock|\\.env|drizzle\\.config|next\\.config|tsconfig|Dockerfile|docker-compose|\\.github/workflows)';
  const TEST_FILES_PATTERN = '(\\.(test|spec)\\.(ts|tsx|js|jsx)$|__tests__/)';
  const SECURITY_FILES_PATTERN = '(\\.env|secrets?|keys?|credentials?|certs?|tokens?|auth)';

  const DEFAULT_RULESETS = [
    {
      id: 'litigo-standard',
      name: 'Litigo Standard Engine',
      description: 'Default calibrated scoring model balancing diff complexity, critical configs, and contributor history.',
      isPreset: true,
      rules: [
        {
          id: 'std_lines_huge',
          name: 'Large Diff (> 500 lines)',
          category: 'diff',
          conditionType: 'lines_changed',
          params: { threshold: 500 },
          points: 20,
          reasonTemplate: 'Large diff: {value} lines changed',
          enabled: true,
        },
        {
          id: 'std_lines_med',
          name: 'Medium Diff (> 200 lines)',
          category: 'diff',
          conditionType: 'lines_changed',
          params: { threshold: 200, maxThreshold: 500 },
          points: 10,
          reasonTemplate: 'Medium diff: {value} lines changed',
          enabled: true,
        },
        {
          id: 'std_files_huge',
          name: 'Broad Blast Radius (> 20 files)',
          category: 'diff',
          conditionType: 'files_changed',
          params: { threshold: 20 },
          points: 15,
          reasonTemplate: '{value} files changed across the codebase',
          enabled: true,
        },
        {
          id: 'std_files_med',
          name: 'Medium File Spread (> 10 files)',
          category: 'diff',
          conditionType: 'files_changed',
          params: { threshold: 10, maxThreshold: 20 },
          points: 8,
          reasonTemplate: '{value} files changed',
          enabled: true,
        },
        {
          id: 'std_critical_config',
          name: 'Modifies Critical Config / Lockfiles',
          category: 'config',
          conditionType: 'filename_pattern',
          params: { pattern: HIGH_RISK_PATTERN },
          points: 20,
          reasonTemplate: 'Touches critical config/build files: {matches}',
          enabled: true,
        },
        {
          id: 'std_missing_tests',
          name: 'No Test Coverage Added (> 3 files)',
          category: 'diff',
          conditionType: 'missing_tests',
          params: { thresholdFiles: 3, testPattern: TEST_FILES_PATTERN },
          points: 10,
          reasonTemplate: 'No test files updated despite touching {value} files',
          enabled: true,
        },
        {
          id: 'std_short_desc',
          name: 'Inadequate PR Description (< 20 chars)',
          category: 'diff',
          conditionType: 'short_description',
          params: { minLength: 20 },
          points: 10,
          reasonTemplate: 'PR description is missing or very brief ({value} chars)',
          enabled: true,
        },
        {
          id: 'std_first_time_contrib',
          name: 'First-time Contributor',
          category: 'contributor',
          conditionType: 'first_time_contributor',
          params: {},
          points: 15,
          reasonTemplate: 'First contribution from this author to this repository',
          enabled: true,
        },
        {
          id: 'std_new_contrib',
          name: 'New Contributor (< 3 prior PRs)',
          category: 'contributor',
          conditionType: 'new_contributor',
          params: { maxPriorPRs: 3 },
          points: 8,
          reasonTemplate: 'Author is new with only {value} prior PRs',
          enabled: true,
        },
        {
          id: 'std_low_merge_rate',
          name: 'Low Historical Merge Rate (< 40%)',
          category: 'contributor',
          conditionType: 'low_merge_rate',
          params: { minPriorPRs: 5, thresholdPercent: 40 },
          points: 10,
          reasonTemplate: 'Low author historical merge rate: {value}%',
          enabled: true,
        },
      ],
    },
    {
      id: 'strict-security',
      name: 'Strict Security & Compliance',
      description: 'Zero-tolerance rule set prioritizing secrets, lockfile changes, auth alterations, and unverified authors.',
      isPreset: true,
      rules: [
        {
          id: 'sec_env_secrets',
          name: 'Touches Environment / Secret Files',
          category: 'security',
          conditionType: 'filename_pattern',
          params: { pattern: SECURITY_FILES_PATTERN },
          points: 35,
          reasonTemplate: 'Touches sensitive credentials or secret configs: {matches}',
          enabled: true,
        },
        {
          id: 'sec_auth_keywords',
          name: 'Auth / Crypto / Permission Keywords in Title',
          category: 'security',
          conditionType: 'title_keyword',
          params: { pattern: '(security|auth|token|secret|credential|crypto|permission|rbac|cve|injection)' },
          points: 30,
          reasonTemplate: 'PR title flags high-security changes: {matches}',
          enabled: true,
        },
        {
          id: 'sec_lockfile_change',
          name: 'Modifies Dependencies or Lockfiles',
          category: 'config',
          conditionType: 'filename_pattern',
          params: { pattern: '(package\\.json|yarn\\.lock|pnpm-lock\\.yaml|package-lock\\.json|go\\.mod|Cargo\\.lock)' },
          points: 25,
          reasonTemplate: 'Dependency manifests modified: {matches}',
          enabled: true,
        },
        {
          id: 'sec_lines_strict',
          name: 'Diff Exceeds 300 Lines',
          category: 'diff',
          conditionType: 'lines_changed',
          params: { threshold: 300 },
          points: 25,
          reasonTemplate: 'Diff complexity exceeds audit threshold: {value} lines',
          enabled: true,
        },
        {
          id: 'sec_require_tests',
          name: 'Missing Tests on Any Multi-file Change',
          category: 'diff',
          conditionType: 'missing_tests',
          params: { thresholdFiles: 2, testPattern: TEST_FILES_PATTERN },
          points: 20,
          reasonTemplate: 'Security policy requires test suite additions for changes > 2 files',
          enabled: true,
        },
        {
          id: 'sec_first_time_untrusted',
          name: 'Unverified Author (First Contribution)',
          category: 'contributor',
          conditionType: 'first_time_contributor',
          params: {},
          points: 25,
          reasonTemplate: 'Author has no prior merged PRs on this repo',
          enabled: true,
        },
        {
          id: 'sec_files_spread',
          name: 'File Count > 8',
          category: 'diff',
          conditionType: 'files_changed',
          params: { threshold: 8 },
          points: 20,
          reasonTemplate: 'Touches {value} files across the repository',
          enabled: true,
        },
      ],
    },
    {
      id: 'fast-startup',
      name: 'Fast Startup & Low Friction',
      description: 'Permissive rule set for fast-moving teams. Grants discounts for docs and small diffs.',
      isPreset: true,
      rules: [
        {
          id: 'fast_huge_diff',
          name: 'Massive PR (> 800 lines)',
          category: 'diff',
          conditionType: 'lines_changed',
          params: { threshold: 800 },
          points: 25,
          reasonTemplate: 'Unusually massive PR: {value} lines',
          enabled: true,
        },
        {
          id: 'fast_sec_critical',
          name: 'Critical Security Files Only',
          category: 'security',
          conditionType: 'filename_pattern',
          params: { pattern: '(\\.env|secrets?|keys?\\.json)' },
          points: 25,
          reasonTemplate: 'Directly edits sensitive credentials: {matches}',
          enabled: true,
        },
        {
          id: 'fast_docs_discount',
          name: 'Documentation Discount',
          category: 'diff',
          conditionType: 'title_keyword',
          params: { pattern: '(doc|docs|readme|typo|license|comment)' },
          points: -15,
          reasonTemplate: 'Documentation or minor typo update (-15 risk points)',
          enabled: true,
        },
        {
          id: 'fast_micro_pr_discount',
          name: 'Micro PR (< 50 lines)',
          category: 'diff',
          conditionType: 'small_pr',
          params: { maxLines: 50 },
          points: -10,
          reasonTemplate: 'Small scoped change under 50 lines (-10 risk points)',
          enabled: true,
        },
        {
          id: 'fast_trusted_author',
          name: 'Trusted Contributor (> 10 merged PRs)',
          category: 'contributor',
          conditionType: 'trusted_contributor',
          params: { minMerged: 10 },
          points: -15,
          reasonTemplate: 'Author is trusted with {value} merged PRs (-15 risk points)',
          enabled: true,
        },
      ],
    },
  ];

  function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function testRuleCondition(rule, prData) {
    const totalLines = (Number(prData.additions) || 0) + (Number(prData.deletions) || 0);
    const filesCount = Number(prData.changedFiles) || (Array.isArray(prData.files) ? prData.files.length : 1);
    const title = String(prData.title || '');
    const body = String(prData.body || '').trim();
    const priorPRs = Number(prData.contributorTotalPrs) || 0;
    const mergedPRs = Number(prData.contributorMergedPrs) || 0;

    // Normalizing file list
    const fileNames = Array.isArray(prData.files)
      ? prData.files.map((f) => (typeof f === 'string' ? f : f.filename || ''))
      : [];

    switch (rule.conditionType) {
      case 'lines_changed': {
        const threshold = Number(rule.params.threshold) || 0;
        const maxThreshold = rule.params.maxThreshold ? Number(rule.params.maxThreshold) : Infinity;
        if (totalLines > threshold && totalLines <= maxThreshold) {
          return { triggered: true, details: { value: totalLines } };
        }
        return { triggered: false };
      }

      case 'files_changed': {
        const threshold = Number(rule.params.threshold) || 0;
        const maxThreshold = rule.params.maxThreshold ? Number(rule.params.maxThreshold) : Infinity;
        if (filesCount > threshold && filesCount <= maxThreshold) {
          return { triggered: true, details: { value: filesCount } };
        }
        return { triggered: false };
      }

      case 'filename_pattern': {
        try {
          const regex = new RegExp(rule.params.pattern || '', rule.params.caseSensitive ? '' : 'i');
          const matched = fileNames.filter((name) => regex.test(name));
          if (matched.length > 0) {
            return {
              triggered: true,
              details: {
                matches: matched.slice(0, 3).join(', ') + (matched.length > 3 ? ` (+${matched.length - 3} more)` : ''),
                count: matched.length,
              },
            };
          }
        } catch (e) {
          console.warn('Invalid regex in filename_pattern rule:', e);
        }
        return { triggered: false };
      }

      case 'missing_tests': {
        const threshold = Number(rule.params.thresholdFiles) || 3;
        try {
          const testRegex = new RegExp(rule.params.testPattern || TEST_FILES_PATTERN, 'i');
          const hasTests = fileNames.some((name) => testRegex.test(name));
          if (!hasTests && filesCount > threshold) {
            return { triggered: true, details: { value: filesCount } };
          }
        } catch (e) {
          console.warn('Invalid test regex:', e);
        }
        return { triggered: false };
      }

      case 'title_keyword': {
        try {
          const regex = new RegExp(rule.params.pattern || '', rule.params.caseSensitive ? '' : 'i');
          const match = title.match(regex);
          if (match) {
            return { triggered: true, details: { matches: match[0] } };
          }
        } catch (e) {
          console.warn('Invalid title regex:', e);
        }
        return { triggered: false };
      }

      case 'short_description': {
        const minLen = Number(rule.params.minLength) || 20;
        if (body.length < minLen) {
          return { triggered: true, details: { value: body.length } };
        }
        return { triggered: false };
      }

      case 'first_time_contributor': {
        if (priorPRs === 0) {
          return { triggered: true, details: { value: 0 } };
        }
        return { triggered: false };
      }

      case 'new_contributor': {
        const maxPrior = Number(rule.params.maxPriorPRs) || 3;
        if (priorPRs > 0 && priorPRs < maxPrior) {
          return { triggered: true, details: { value: priorPRs } };
        }
        return { triggered: false };
      }

      case 'low_merge_rate': {
        const minPrior = Number(rule.params.minPriorPRs) || 5;
        const thresholdPercent = Number(rule.params.thresholdPercent) || 40;
        if (priorPRs >= minPrior) {
          const ratePercent = Math.round((mergedPRs / priorPRs) * 100);
          if (ratePercent < thresholdPercent) {
            return { triggered: true, details: { value: ratePercent } };
          }
        }
        return { triggered: false };
      }

      case 'small_pr': {
        const maxLines = Number(rule.params.maxLines) || 50;
        if (totalLines > 0 && totalLines <= maxLines) {
          return { triggered: true, details: { value: totalLines } };
        }
        return { triggered: false };
      }

      case 'trusted_contributor': {
        const minMerged = Number(rule.params.minMerged) || 10;
        if (mergedPRs >= minMerged) {
          return { triggered: true, details: { value: mergedPRs } };
        }
        return { triggered: false };
      }

      default:
        return { triggered: false };
    }
  }

  function formatReason(template, details) {
    if (!template) return 'Risk rule condition triggered';
    if (!details) return template;
    let res = template;
    for (const [key, val] of Object.entries(details)) {
      res = res.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return res;
  }

  function evaluateRiskScore(ruleSet, prData) {
    if (!ruleSet || !Array.isArray(ruleSet.rules)) {
      ruleSet = DEFAULT_RULESETS[0];
    }

    let calculatedScore = 0;
    const triggeredRules = [];
    const passedRules = [];

    for (const rule of ruleSet.rules) {
      if (!rule.enabled) continue;
      const test = testRuleCondition(rule, prData);
      if (test.triggered) {
        calculatedScore += Number(rule.points) || 0;
        triggeredRules.push({
          ruleId: rule.id,
          name: rule.name,
          category: rule.category,
          points: rule.points,
          reason: formatReason(rule.reasonTemplate, test.details),
        });
      } else {
        passedRules.push(rule);
      }
    }

    const finalScore = Math.min(100, Math.max(0, calculatedScore));

    let riskLevel = 'low';
    let riskColor = '#2E7D32'; // Litigo green
    let riskBg = '#E8F5E9';
    let riskBorder = 'rgba(46, 125, 50, 0.2)';

    if (finalScore >= 70) {
      riskLevel = 'high';
      riskColor = '#D64545'; // Litigo danger red
      riskBg = '#FFF5F5';
      riskBorder = 'rgba(214, 69, 69, 0.25)';
    } else if (finalScore >= 40) {
      riskLevel = 'moderate';
      riskColor = '#D97706'; // Litigo amber
      riskBg = '#FEF3C7';
      riskBorder = 'rgba(217, 119, 6, 0.25)';
    }

    const totalLines = (Number(prData.additions) || 0) + (Number(prData.deletions) || 0);
    const filesCount = Number(prData.changedFiles) || (Array.isArray(prData.files) ? prData.files.length : 1);

    return {
      score: finalScore,
      riskLevel,
      riskColor,
      riskBg,
      riskBorder,
      ruleSetName: ruleSet.name,
      ruleSetId: ruleSet.id,
      triggeredRules,
      passedRules,
      totalLines,
      filesCount,
    };
  }

  // Storage API with Chrome extension & localStorage fallback
  async function loadRuleSets() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(['repopilot_rulesets', 'repopilot_active_ruleset_id']);
        let sets = stored.repopilot_rulesets;
        let activeId = stored.repopilot_active_ruleset_id;

        if (!sets || !Array.isArray(sets) || sets.length === 0) {
          sets = cloneObject(DEFAULT_RULESETS);
          activeId = 'litigo-standard';
          await chrome.storage.local.set({
            repopilot_rulesets: sets,
            repopilot_active_ruleset_id: activeId,
          });
        }
        return { ruleSets: sets, activeId: activeId || sets[0].id };
      }
    } catch (e) {
      console.warn('Chrome storage unavailable, using localStorage:', e);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const setsRaw = localStorage.getItem('repopilot_rulesets');
        const activeId = localStorage.getItem('repopilot_active_ruleset_id') || 'litigo-standard';
        if (setsRaw) {
          const sets = JSON.parse(setsRaw);
          return { ruleSets: sets, activeId };
        }
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    return {
      ruleSets: cloneObject(DEFAULT_RULESETS),
      activeId: 'litigo-standard',
    };
  }

  async function saveRuleSets(ruleSets, activeId) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          repopilot_rulesets: ruleSets,
          repopilot_active_ruleset_id: activeId,
        });
      }
    } catch (e) {
      console.warn('Chrome storage save failed:', e);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('repopilot_rulesets', JSON.stringify(ruleSets));
        if (activeId) {
          localStorage.setItem('repopilot_active_ruleset_id', activeId);
        }
      }
    } catch (e) {
      console.warn('localStorage save error:', e);
    }

    // Broadcast update across frames & tabs
    try {
      if (typeof window !== 'undefined' && window.postMessage) {
        window.postMessage(
          {
            type: 'REPOPILOT_RULESET_CHANGED',
            activeId,
            ruleSets,
          },
          '*'
        );
      }
    } catch {}
  }

  const RepoPilotRulesEngine = {
    DEFAULT_RULESETS,
    testRuleCondition,
    evaluateRiskScore,
    loadRuleSets,
    saveRuleSets,
    cloneObject,
    HIGH_RISK_PATTERN,
    TEST_FILES_PATTERN,
    SECURITY_FILES_PATTERN,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RepoPilotRulesEngine;
  }

  global.RepoPilotRulesEngine = RepoPilotRulesEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
