// RepoPilot Chrome Extension Side Panel Logic
// Unified single-origin engine: Architecture Diagram + PR Review & Triage + Custom Risk Rule Sets

const PROD_BASE_URL = "https://repopilot-orcin.vercel.app";
let APP_BASE_URL = PROD_BASE_URL;

// Main View Elements
const frame = document.getElementById("repopilot-frame");
const emptyState = document.getElementById("empty-state");
const loaderOverlay = document.getElementById("loader-overlay");
const loaderTitle = document.getElementById("loader-title");
const loaderDesc = document.getElementById("loader-desc");
const loaderModeBadge = document.getElementById("loader-mode-badge");

const currentRepoEl = document.getElementById("current-repo");
const pageTagEl = document.getElementById("page-tag");
const popoutBtn = document.getElementById("popout-btn");
const refreshBtn = document.getElementById("refresh-btn");
const defaultDemoBtn = document.getElementById("default-demo-btn");

// Tabs
const tabDiagram = document.getElementById("tab-diagram");
const tabPRs = document.getElementById("tab-prs");
const tabRules = document.getElementById("tab-rules");
const prBadge = document.getElementById("pr-badge");
const rulesBadge = document.getElementById("rules-badge");

// Native Bottom Stats Bar elements
const bottomStatsBar = document.getElementById("bottom-stats-bar");
const statApproved = document.getElementById("stat-approved");
const statChanges = document.getElementById("stat-changes");
const statSkipped = document.getElementById("stat-skipped");
const summaryBtn = document.getElementById("summary-btn");
const toastEl = document.getElementById("toast-msg");

// Rules Hub & Risk Checker Elements
const rulesContainer = document.getElementById("rules-container");
const rulesetSelect = document.getElementById("ruleset-select");
const rulesetDescText = document.getElementById("ruleset-desc-text");
const btnNewRuleset = document.getElementById("btn-new-ruleset");
const btnDuplicateRuleset = document.getElementById("btn-duplicate-ruleset");
const btnResetRuleset = document.getElementById("btn-reset-ruleset");
const btnDeleteRuleset = document.getElementById("btn-delete-ruleset");

const riskScoreNumber = document.getElementById("risk-score-number");
const riskScoreStatus = document.getElementById("risk-score-status");
const riskTargetLabel = document.getElementById("risk-target-label");
const riskTargetStats = document.getElementById("risk-target-stats");
const btnEvalActivePr = document.getElementById("btn-eval-active-pr");
const btnToggleSim = document.getElementById("btn-toggle-sim");
const simulatorBox = document.getElementById("simulator-box");

const simLines = document.getElementById("sim-lines");
const simLinesVal = document.getElementById("sim-lines-val");
const simFiles = document.getElementById("sim-files");
const simFilesVal = document.getElementById("sim-files-val");
const simTitle = document.getElementById("sim-title");
const simFilenames = document.getElementById("sim-filenames");
const simAuthorPrs = document.getElementById("sim-author-prs");

const triggeredCount = document.getElementById("triggered-count");
const triggeredList = document.getElementById("triggered-list");
const rulesCountLabel = document.getElementById("rules-count-label");
const rulesList = document.getElementById("rules-list");
const btnAddRule = document.getElementById("btn-add-rule");

// Modals
const ruleModal = document.getElementById("rule-modal");
const ruleModalTitle = document.getElementById("rule-modal-title");
const ruleForm = document.getElementById("rule-form");
const ruleFormId = document.getElementById("rule-form-id");
const ruleInputName = document.getElementById("rule-input-name");
const ruleInputCategory = document.getElementById("rule-input-category");
const ruleInputCondition = document.getElementById("rule-input-condition");
const groupParamThreshold = document.getElementById("group-param-threshold");
const labelParamThreshold = document.getElementById("label-param-threshold");
const ruleInputThreshold = document.getElementById("rule-input-threshold");
const groupParamPattern = document.getElementById("group-param-pattern");
const labelParamPattern = document.getElementById("label-param-pattern");
const ruleInputPattern = document.getElementById("rule-input-pattern");
const ruleInputPoints = document.getElementById("rule-input-points");
const ruleInputReason = document.getElementById("rule-input-reason");
const btnCancelRule = document.getElementById("btn-cancel-rule");

const rulesetModal = document.getElementById("ruleset-modal");
const rulesetForm = document.getElementById("ruleset-form");
const rulesetInputName = document.getElementById("ruleset-input-name");
const rulesetInputDesc = document.getElementById("ruleset-input-desc");
const rulesetBaseTemplate = document.getElementById("ruleset-base-template");
const btnCancelRuleset = document.getElementById("btn-cancel-ruleset");

// State
let activeRepoFullName = null;
let currentMode = "prs"; // 'diagram' | 'prs' | 'rules'
let toastTimer = null;

let allRuleSets = [];
let activeRuleSetId = "litigo-standard";

// Active PR data used for risk checking
let currentEvaluatedPR = {
  title: "feat: add core integration and docs",
  body: "Includes core feature improvements, unit tests, and updated README guidelines.",
  additions: 200,
  deletions: 50,
  changedFiles: 4,
  files: ["src/index.ts", "package.json", "README.md", "src/core.test.ts"],
  authorHandle: "alex-dev",
  contributorTotalPrs: 0,
  contributorMergedPrs: 0,
  isSandbox: true,
};

function showToast(msg, type = "info", durationMs = 3500) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, durationMs);
}

function showLoader(title, desc, badge) {
  if (loaderOverlay) {
    if (title && loaderTitle) loaderTitle.textContent = title;
    if (desc && loaderDesc) loaderDesc.textContent = desc;
    if (badge && loaderModeBadge) loaderModeBadge.textContent = badge;
    loaderOverlay.classList.remove("hidden");
  }
}

function hideLoader() {
  if (loaderOverlay) {
    loaderOverlay.classList.add("hidden");
  }
}

// Handle iframe smooth load transition
frame.addEventListener("load", () => {
  if (frame.src && frame.src !== "about:blank") {
    frame.classList.add("loaded");
    setTimeout(() => {
      hideLoader();
      broadcastRuleSetToFrame();
    }, 200);
  }
});

function updateBottomBar() {
  if (!bottomStatsBar) return;
  if (currentMode === "prs" && activeRepoFullName) {
    bottomStatsBar.classList.add("visible");
  } else {
    bottomStatsBar.classList.remove("visible");
  }
}

function setMode(mode) {
  currentMode = mode;
  tabDiagram.classList.remove("active");
  tabPRs.classList.remove("active");
  if (tabRules) tabRules.classList.remove("active");

  if (mode === "diagram") {
    tabDiagram.classList.add("active");
    if (rulesContainer) rulesContainer.classList.remove("active");
  } else if (mode === "rules") {
    if (tabRules) tabRules.classList.add("active");
    if (rulesContainer) rulesContainer.classList.add("active");
  } else {
    tabPRs.classList.add("active");
    if (rulesContainer) rulesContainer.classList.remove("active");
  }

  updateBottomBar();
  renderActiveView();
}

function getActiveRuleSet() {
  if (!allRuleSets || allRuleSets.length === 0) {
    return RepoPilotRulesEngine.DEFAULT_RULESETS[0];
  }
  return allRuleSets.find((s) => s.id === activeRuleSetId) || allRuleSets[0];
}

function broadcastRuleSetToFrame() {
  if (!frame || !frame.contentWindow || frame.src === "about:blank") return;
  try {
    const activeSet = getActiveRuleSet();
    frame.contentWindow.postMessage(
      {
        type: "REPOPILOT_UPDATE_RULESET",
        ruleSet: activeSet,
      },
      "*"
    );
  } catch {}
}

function renderActiveView() {
  // If in rules mode, rules hub operates even without a detected repo (sandbox / simulator works immediately)
  if (currentMode === "rules") {
    hideLoader();
    emptyState.style.display = "none";
    frame.style.display = "none";
    if (rulesContainer) rulesContainer.classList.add("active");
    renderRulesHub();
    return;
  }

  if (rulesContainer) rulesContainer.classList.remove("active");

  if (!activeRepoFullName) {
    hideLoader();
    emptyState.style.display = "flex";
    frame.style.display = "none";
    frame.classList.remove("loaded");
    currentRepoEl.textContent = "None";
    currentRepoEl.title = "No repository detected";
    pageTagEl.textContent = "GitHub";
    updateBottomBar();
    return;
  }

  emptyState.style.display = "none";
  frame.style.display = "block";

  let targetUrl = "";
  if (currentMode === "diagram") {
    showLoader(
      "Parsing Architecture AST",
      `Analyzing modules and call graphs for ${activeRepoFullName}...`,
      "AST Visualizer"
    );
    targetUrl = `${APP_BASE_URL}/diagram?repo=${encodeURIComponent(activeRepoFullName)}&embed=1`;
  } else {
    showLoader(
      "Scanning Pull Requests",
      `Loading PR deck & risk rules for ${activeRepoFullName}...`,
      "PR Triage & Review"
    );
    targetUrl = `${APP_BASE_URL}/swipe?repo=${encodeURIComponent(activeRepoFullName)}&embed=1`;
  }

  if (frame.src !== targetUrl) {
    frame.classList.remove("loaded");
    frame.src = targetUrl;
  }
  updateBottomBar();
}

function updateRepoView(repoFullName, isIssues, isPulls, isCode) {
  if (!repoFullName) {
    activeRepoFullName = null;
    renderActiveView();
    return;
  }

  activeRepoFullName = repoFullName;
  currentRepoEl.textContent = repoFullName;
  currentRepoEl.title = repoFullName;

  // Auto-switch modes contextually if not already examining rules:
  if (currentMode !== "rules") {
    if (isIssues) {
      pageTagEl.textContent = "Issues Detected → PR Triage";
      setMode("prs");
    } else if (isPulls) {
      pageTagEl.textContent = "PRs Detected → PR Triage";
      setMode("prs");
    } else {
      pageTagEl.textContent = "Code Detected → Architecture";
      setMode("diagram");
    }
  } else {
    pageTagEl.textContent = "Rules & Risk Analysis";
  }

  // If on a PR page or repo, check active PR
  checkActiveGitHubPR(false);
}

// ─── Rules & Risk Score Logic ────────────────────────────────────────────────

async function initializeRules() {
  const loaded = await RepoPilotRulesEngine.loadRuleSets();
  allRuleSets = loaded.ruleSets;
  activeRuleSetId = loaded.activeId || allRuleSets[0].id;
  renderRulesHub();
}

function updateRulesBadge() {
  const activeSet = getActiveRuleSet();
  const enabledCount = activeSet.rules.filter((r) => r.enabled).length;
  if (rulesBadge) {
    rulesBadge.textContent = enabledCount;
    rulesBadge.classList.add("visible");
  }
  if (rulesCountLabel) {
    rulesCountLabel.textContent = `${enabledCount} of ${activeSet.rules.length} enabled`;
  }
}

function renderRulesHub() {
  const activeSet = getActiveRuleSet();

  // 1. Populate Dropdown
  if (rulesetSelect) {
    rulesetSelect.innerHTML = "";
    allRuleSets.forEach((set) => {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = `${set.name}${set.isPreset ? " (Preset)" : ""}`;
      if (set.id === activeRuleSetId) opt.selected = true;
      rulesetSelect.appendChild(opt);
    });
  }

  if (rulesetDescText) {
    rulesetDescText.textContent = activeSet.description || "Custom risk rules and weight configurations.";
  }

  // Delete button only visible for custom (non-preset) rule sets
  if (btnDeleteRuleset) {
    btnDeleteRuleset.style.display = activeSet.isPreset ? "none" : "inline-flex";
  }

  updateRulesBadge();

  // 2. Render Rules List
  if (rulesList) {
    rulesList.innerHTML = "";
    activeSet.rules.forEach((rule) => {
      const row = document.createElement("div");
      row.className = `rule-row-item ${rule.enabled ? "" : "disabled"}`;

      let conditionDesc = rule.conditionType.replace(/_/g, " ");
      if (rule.params.threshold !== undefined) conditionDesc += ` > ${rule.params.threshold}`;
      else if (rule.params.pattern) conditionDesc += `: ${rule.params.pattern}`;
      else if (rule.params.minLength) conditionDesc += ` < ${rule.params.minLength} chars`;

      const pointsStr = rule.points > 0 ? `+${rule.points} pts` : `${rule.points} pts`;
      const isPositive = rule.points <= 0;

      row.innerHTML = `
        <div class="rule-row-info">
          <div class="rule-row-title-line">
            <span class="category-chip">${rule.category || "diff"}</span>
            <span class="rule-row-title">${escapeHtml(rule.name)}</span>
            <span class="points-badge ${isPositive ? "positive" : ""}">${pointsStr}</span>
          </div>
          <div class="rule-row-summary" title="${escapeHtml(conditionDesc)}">${escapeHtml(conditionDesc)}</div>
        </div>
        <div class="rule-row-actions">
          <label class="switch-label" title="${rule.enabled ? "Disable rule" : "Enable rule"}">
            <input type="checkbox" ${rule.enabled ? "checked" : ""} data-rule-id="${rule.id}" />
            <span class="switch-slider"></span>
          </label>
          <button class="btn-icon-del" data-del-id="${rule.id}" title="Delete Rule">✕</button>
        </div>
      `;

      // Toggle rule event
      const toggleInput = row.querySelector('input[type="checkbox"]');
      toggleInput.addEventListener("change", (e) => {
        rule.enabled = e.target.checked;
        saveActiveRuleSetChanges();
        evaluateCurrentPR();
        updateRulesBadge();
        row.className = `rule-row-item ${rule.enabled ? "" : "disabled"}`;
      });

      // Delete rule event
      const delBtn = row.querySelector(".btn-icon-del");
      delBtn.addEventListener("click", () => {
        if (confirm(`Delete rule "${rule.name}"?`)) {
          activeSet.rules = activeSet.rules.filter((r) => r.id !== rule.id);
          saveActiveRuleSetChanges();
          renderRulesHub();
          showToast(`Deleted rule "${rule.name}"`, "info");
        }
      });

      rulesList.appendChild(row);
    });
  }

  // 3. Evaluate Risk Score against current target PR
  evaluateCurrentPR();
}

function evaluateCurrentPR() {
  const activeSet = getActiveRuleSet();
  const evaluation = RepoPilotRulesEngine.evaluateRiskScore(activeSet, currentEvaluatedPR);

  // Update Score & Status Badge
  if (riskScoreNumber) {
    riskScoreNumber.textContent = evaluation.score;
    riskScoreNumber.style.color = evaluation.riskColor;
  }

  if (riskScoreStatus) {
    riskScoreStatus.textContent = `${evaluation.riskLevel} Risk`;
    riskScoreStatus.className = `risk-status-pill ${evaluation.riskLevel}`;
  }

  // Target PR Info
  if (riskTargetLabel) {
    riskTargetLabel.textContent = currentEvaluatedPR.title || "Untitled Pull Request";
    riskTargetLabel.title = currentEvaluatedPR.title;
  }
  if (riskTargetStats) {
    const totalLines = (currentEvaluatedPR.additions || 0) + (currentEvaluatedPR.deletions || 0);
    riskTargetStats.textContent = `+${currentEvaluatedPR.additions || 0}/-${currentEvaluatedPR.deletions || 0} (${totalLines} lines) · ${currentEvaluatedPR.changedFiles || 1} files`;
  }

  // Triggered List
  if (triggeredCount) triggeredCount.textContent = evaluation.triggeredRules.length;
  if (triggeredList) {
    triggeredList.innerHTML = "";
    if (evaluation.triggeredRules.length === 0) {
      triggeredList.innerHTML = `
        <div style="font-size: 11px; color: #2E7D32; font-weight: 500; padding: 4px 0; display:flex; align-items:center; gap:5px;">
          <span>✓</span><span>No risk flags triggered. PR complies with all active security rules.</span>
        </div>
      `;
    } else {
      evaluation.triggeredRules.forEach((tr) => {
        const item = document.createElement("div");
        const isDiscount = tr.points <= 0;
        item.className = `trigger-item ${isDiscount ? "discount" : ""}`;

        const pts = tr.points > 0 ? `+${tr.points} pts` : `${tr.points} pts`;

        item.innerHTML = `
          <div class="trigger-left">
            <div>
              <span class="category-chip">${tr.category}</span>
              <span class="trigger-name">${escapeHtml(tr.name)}</span>
            </div>
            <div class="trigger-reason">${escapeHtml(tr.reason)}</div>
          </div>
          <span class="points-badge ${isDiscount ? "positive" : ""}">${pts}</span>
        `;
        triggeredList.appendChild(item);
      });
    }
  }

  broadcastRuleSetToFrame();
}

async function saveActiveRuleSetChanges() {
  await RepoPilotRulesEngine.saveRuleSets(allRuleSets, activeRuleSetId);
  broadcastRuleSetToFrame();
}

// Check active GitHub PR from current tab
async function checkActiveGitHubPR(showMessage = true) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !tab.url.includes("github.com")) {
      if (showMessage) showToast("No active GitHub tab found. Testing in sandbox mode.", "info");
      return;
    }

    const url = new URL(tab.url);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 4 && parts[2] === "pull") {
      const owner = parts[0];
      const repo = parts[1];
      const prNumber = parseInt(parts[3], 10);

      if (showMessage) showToast(`Scanning PR #${prNumber} on ${owner}/${repo}…`, "info", 2000);

      // Attempt to fetch fresh metadata from backend API or inspect DOM
      try {
        const apiUrl = `${APP_BASE_URL}/api/context?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&pullNumber=${prNumber}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data?.pr) {
            currentEvaluatedPR = {
              title: data.pr.title,
              body: data.pr.body || "",
              additions: data.pr.additions || 0,
              deletions: data.pr.deletions || 0,
              changedFiles: data.pr.changedFiles || 1,
              files: data.files || [],
              authorHandle: data.pr.authorHandle || "contributor",
              contributorTotalPrs: data.contributor?.totalPrs || 0,
              contributorMergedPrs: data.contributor?.mergedPrs || 0,
              isSandbox: false,
              prNumber,
            };
            syncSimulatorWithPR(currentEvaluatedPR);
            evaluateCurrentPR();
            if (showMessage) {
              const score = RepoPilotRulesEngine.evaluateRiskScore(getActiveRuleSet(), currentEvaluatedPR).score;
              showToast(`✓ Evaluated PR #${prNumber} · Risk Score: ${score}/100`, "success");
            }
            return;
          }
        }
      } catch (e) {
        console.warn("Direct API PR check failed, falling back to tab inspection:", e);
      }

      // Fallback: request from content script in tab
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_GITHUB_PR_DATA" });
        if (response?.pr) {
          currentEvaluatedPR = {
            ...response.pr,
            isSandbox: false,
            prNumber,
          };
          syncSimulatorWithPR(currentEvaluatedPR);
          evaluateCurrentPR();
          if (showMessage) {
            const score = RepoPilotRulesEngine.evaluateRiskScore(getActiveRuleSet(), currentEvaluatedPR).score;
            showToast(`✓ Scanned PR #${prNumber} from page · Score: ${score}/100`, "success");
          }
          return;
        }
      } catch {}
    } else if (parts.length >= 2) {
      // On repo page, fetch first open PR if available
      const owner = parts[0];
      const repo = parts[1];
      try {
        const res = await fetch(`${APP_BASE_URL}/api/prs?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.prs && data.prs.length > 0) {
            const first = data.prs[0];
            currentEvaluatedPR = {
              title: first.title,
              body: first.body || "",
              additions: first.additions || 100,
              deletions: first.deletions || 20,
              changedFiles: first.filesChanged || 3,
              files: [first.diff?.filePath || "src/index.ts"],
              authorHandle: first.author?.handle || "contributor",
              contributorTotalPrs: 1,
              contributorMergedPrs: 0,
              isSandbox: false,
              prNumber: first.number,
            };
            syncSimulatorWithPR(currentEvaluatedPR);
            evaluateCurrentPR();
            if (showMessage) showToast(`Loaded PR #${first.number} from ${owner}/${repo}`, "info");
            return;
          }
        }
      } catch {}
    }

    if (showMessage) showToast("Could not extract live PR details. Using simulator sandbox.", "info");
  } catch (err) {
    if (showMessage) showToast("Scan error: " + err.message, "error");
  }
}

function syncSimulatorWithPR(pr) {
  const total = (pr.additions || 0) + (pr.deletions || 0);
  if (simLines) {
    simLines.value = total;
    if (simLinesVal) simLinesVal.textContent = total;
  }
  if (simFiles) {
    simFiles.value = pr.changedFiles || 1;
    if (simFilesVal) simFilesVal.textContent = pr.changedFiles || 1;
  }
  if (simTitle) simTitle.value = pr.title || "";
  if (simFilenames) {
    const names = Array.isArray(pr.files)
      ? pr.files.map((f) => (typeof f === "string" ? f : f.filename || ""))
      : [];
    simFilenames.value = names.join(", ");
  }
  if (simAuthorPrs) {
    simAuthorPrs.value = pr.contributorTotalPrs || 0;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

// Mode Navigation
tabDiagram.addEventListener("click", () => setMode("diagram"));
tabPRs.addEventListener("click", () => setMode("prs"));
if (tabRules) tabRules.addEventListener("click", () => setMode("rules"));

// Rule Set Dropdown
rulesetSelect.addEventListener("change", (e) => {
  activeRuleSetId = e.target.value;
  saveActiveRuleSetChanges();
  renderRulesHub();
  showToast(`Switched to "${getActiveRuleSet().name}"`, "info");
});

// New Rule Set
btnNewRuleset.addEventListener("click", () => {
  rulesetInputName.value = "";
  rulesetInputDesc.value = "";
  rulesetModal.classList.add("open");
});

btnCancelRuleset.addEventListener("click", () => {
  rulesetModal.classList.remove("open");
});

rulesetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = rulesetInputName.value.trim();
  if (!name) return;

  const desc = rulesetInputDesc.value.trim();
  const base = rulesetBaseTemplate.value;

  let initialRules = [];
  if (base !== "empty") {
    const template = RepoPilotRulesEngine.DEFAULT_RULESETS.find((s) => s.id === base);
    if (template) {
      initialRules = RepoPilotRulesEngine.cloneObject(template.rules);
    }
  }

  const newId = `custom-${Date.now()}`;
  const newSet = {
    id: newId,
    name,
    description: desc || "Custom user rule set",
    isPreset: false,
    rules: initialRules,
  };

  allRuleSets.push(newSet);
  activeRuleSetId = newId;
  saveActiveRuleSetChanges();
  rulesetModal.classList.remove("open");
  renderRulesHub();
  showToast(`Created Rule Set "${name}"`, "success");
});

// Duplicate Rule Set
btnDuplicateRuleset.addEventListener("click", () => {
  const current = getActiveRuleSet();
  const newId = `copy-${Date.now()}`;
  const copy = {
    id: newId,
    name: `${current.name} (Copy)`,
    description: current.description,
    isPreset: false,
    rules: RepoPilotRulesEngine.cloneObject(current.rules),
  };

  allRuleSets.push(copy);
  activeRuleSetId = newId;
  saveActiveRuleSetChanges();
  renderRulesHub();
  showToast(`Duplicated into "${copy.name}"`, "success");
});

// Reset Rule Set
btnResetRuleset.addEventListener("click", () => {
  const current = getActiveRuleSet();
  const preset = RepoPilotRulesEngine.DEFAULT_RULESETS.find((s) => s.id === current.id);
  if (!preset) {
    if (confirm("Reset all rules in this custom set?")) {
      current.rules = [];
      saveActiveRuleSetChanges();
      renderRulesHub();
      showToast("Cleared rules in custom set", "info");
    }
    return;
  }

  if (confirm(`Reset "${current.name}" back to standard preset settings?`)) {
    current.rules = RepoPilotRulesEngine.cloneObject(preset.rules);
    saveActiveRuleSetChanges();
    renderRulesHub();
    showToast(`Reset "${current.name}" to factory rules`, "success");
  }
});

// Delete Rule Set
btnDeleteRuleset.addEventListener("click", () => {
  const current = getActiveRuleSet();
  if (current.isPreset) return;

  if (confirm(`Are you sure you want to delete "${current.name}"?`)) {
    allRuleSets = allRuleSets.filter((s) => s.id !== current.id);
    activeRuleSetId = allRuleSets[0].id;
    saveActiveRuleSetChanges();
    renderRulesHub();
    showToast(`Deleted rule set "${current.name}"`, "info");
  }
});

// Add Rule Modal
btnAddRule.addEventListener("click", () => {
  ruleFormId.value = "";
  ruleModalTitle.textContent = "Create Custom Risk Rule";
  ruleInputName.value = "";
  ruleInputCategory.value = "diff";
  ruleInputCondition.value = "lines_changed";
  ruleInputThreshold.value = "300";
  ruleInputPattern.value = "";
  ruleInputPoints.value = "20";
  ruleInputReason.value = "Diff exceeds limit ({value} lines)";
  updateConditionFields();
  ruleModal.classList.add("open");
});

btnCancelRule.addEventListener("click", () => {
  ruleModal.classList.remove("open");
});

ruleInputCondition.addEventListener("change", updateConditionFields);

function updateConditionFields() {
  const val = ruleInputCondition.value;
  if (val === "filename_pattern" || val === "title_keyword") {
    groupParamThreshold.style.display = "none";
    groupParamPattern.style.display = "flex";
    if (val === "filename_pattern") {
      labelParamPattern.textContent = "File Name Regex Pattern";
      ruleInputPattern.placeholder = "e.g. (\\.env|secrets?|credentials?|\\.pem)";
      if (!ruleInputReason.value || ruleInputReason.value.includes("lines")) {
        ruleInputReason.value = "Touches sensitive file pattern: {matches}";
      }
    } else {
      labelParamPattern.textContent = "Title Keyword Regex";
      ruleInputPattern.placeholder = "e.g. (security|auth|crypto|breaking|urgent)";
      if (!ruleInputReason.value || ruleInputReason.value.includes("lines")) {
        ruleInputReason.value = "PR title flags critical keywords: {matches}";
      }
    }
  } else {
    groupParamPattern.style.display = "none";
    groupParamThreshold.style.display = "flex";
    if (val === "lines_changed") {
      labelParamThreshold.textContent = "Lines Changed Threshold";
      ruleInputThreshold.value = "300";
      ruleInputReason.value = "Lines changed exceeds limit ({value} lines)";
    } else if (val === "files_changed") {
      labelParamThreshold.textContent = "Files Count Threshold";
      ruleInputThreshold.value = "10";
      ruleInputReason.value = "Too many files modified ({value} files)";
    } else if (val === "missing_tests") {
      labelParamThreshold.textContent = "Min Files Before Requiring Tests";
      ruleInputThreshold.value = "3";
      ruleInputReason.value = "Missing test files when touching {value} files";
    } else if (val === "short_description") {
      labelParamThreshold.textContent = "Min PR Description Length (Chars)";
      ruleInputThreshold.value = "20";
      ruleInputReason.value = "PR description too short ({value} chars)";
    } else if (val === "first_time_contributor") {
      groupParamThreshold.style.display = "none";
      ruleInputReason.value = "First contribution from author";
    } else if (val === "new_contributor") {
      labelParamThreshold.textContent = "Max Prior PRs to Consider New";
      ruleInputThreshold.value = "3";
      ruleInputReason.value = "New contributor with only {value} prior PRs";
    } else if (val === "low_merge_rate") {
      labelParamThreshold.textContent = "Merge Rate % Below Threshold";
      ruleInputThreshold.value = "40";
      ruleInputReason.value = "Low contributor merge rate: {value}%";
    } else if (val === "small_pr") {
      labelParamThreshold.textContent = "Max Lines for Discount";
      ruleInputThreshold.value = "50";
      ruleInputPoints.value = "-10";
      ruleInputReason.value = "Small PR under 50 lines (-10 risk)";
    } else if (val === "trusted_contributor") {
      labelParamThreshold.textContent = "Min Merged PRs for Trust";
      ruleInputThreshold.value = "10";
      ruleInputPoints.value = "-15";
      ruleInputReason.value = "Author is trusted with {value} merged PRs";
    }
  }
}

ruleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = ruleInputName.value.trim();
  if (!name) return;

  const currentSet = getActiveRuleSet();
  const category = ruleInputCategory.value;
  const conditionType = ruleInputCondition.value;
  const points = parseInt(ruleInputPoints.value, 10) || 10;
  const reasonTemplate = ruleInputReason.value.trim() || "Condition met ({value})";

  const params = {};
  if (conditionType === "filename_pattern" || conditionType === "title_keyword") {
    params.pattern = ruleInputPattern.value.trim();
  } else if (conditionType === "lines_changed" || conditionType === "files_changed") {
    params.threshold = parseInt(ruleInputThreshold.value, 10) || 0;
  } else if (conditionType === "missing_tests") {
    params.thresholdFiles = parseInt(ruleInputThreshold.value, 10) || 3;
    params.testPattern = RepoPilotRulesEngine.TEST_FILES_PATTERN;
  } else if (conditionType === "short_description") {
    params.minLength = parseInt(ruleInputThreshold.value, 10) || 20;
  } else if (conditionType === "new_contributor") {
    params.maxPriorPRs = parseInt(ruleInputThreshold.value, 10) || 3;
  } else if (conditionType === "low_merge_rate") {
    params.thresholdPercent = parseInt(ruleInputThreshold.value, 10) || 40;
    params.minPriorPRs = 5;
  } else if (conditionType === "small_pr") {
    params.maxLines = parseInt(ruleInputThreshold.value, 10) || 50;
  } else if (conditionType === "trusted_contributor") {
    params.minMerged = parseInt(ruleInputThreshold.value, 10) || 10;
  }

  const newRule = {
    id: ruleFormId.value || `rule_${Date.now()}`,
    name,
    category,
    conditionType,
    params,
    points,
    reasonTemplate,
    enabled: true,
  };

  currentSet.rules.push(newRule);
  saveActiveRuleSetChanges();
  ruleModal.classList.remove("open");
  renderRulesHub();
  showToast(`Added rule "${name}" to ${currentSet.name}`, "success");
});

// Scan Active PR Button
btnEvalActivePr.addEventListener("click", () => {
  checkActiveGitHubPR(true);
});

// Toggle Simulator Sandbox
btnToggleSim.addEventListener("click", () => {
  const isHidden = simulatorBox.style.display === "none";
  simulatorBox.style.display = isHidden ? "flex" : "none";
  btnToggleSim.textContent = isHidden ? "Sandbox Simulator ▴" : "Sandbox Simulator ▾";
});

// Simulator Interactive Inputs
function updateFromSimulator() {
  const lines = parseInt(simLines.value, 10);
  const files = parseInt(simFiles.value, 10);
  const title = simTitle.value;
  const filenamesRaw = simFilenames.value;
  const authorPrs = parseInt(simAuthorPrs.value, 10) || 0;

  if (simLinesVal) simLinesVal.textContent = lines;
  if (simFilesVal) simFilesVal.textContent = files;

  const fileList = filenamesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  currentEvaluatedPR = {
    title,
    body: "Simulated sandbox PR description.",
    additions: Math.round(lines * 0.8),
    deletions: Math.round(lines * 0.2),
    changedFiles: files,
    files: fileList.length > 0 ? fileList : ["src/index.ts"],
    authorHandle: "sim-contributor",
    contributorTotalPrs: authorPrs,
    contributorMergedPrs: authorPrs > 0 ? Math.floor(authorPrs * 0.5) : 0,
    isSandbox: true,
  };

  evaluateCurrentPR();
}

simLines.addEventListener("input", updateFromSimulator);
simFiles.addEventListener("input", updateFromSimulator);
simTitle.addEventListener("input", updateFromSimulator);
simFilenames.addEventListener("input", updateFromSimulator);
simAuthorPrs.addEventListener("input", updateFromSimulator);

// Controls (Popout, Refresh, Demo)
popoutBtn.addEventListener("click", () => {
  if (currentMode === "rules") {
    chrome.tabs.create({ url: `${APP_BASE_URL}/swipe` });
    return;
  }
  if (!activeRepoFullName) {
    chrome.tabs.create({ url: `${APP_BASE_URL}/swipe` });
    return;
  }

  const target = currentMode === "diagram"
    ? `${APP_BASE_URL}/diagram?repo=${encodeURIComponent(activeRepoFullName)}`
    : `${APP_BASE_URL}/swipe?repo=${encodeURIComponent(activeRepoFullName)}`;
  chrome.tabs.create({ url: target });
});

refreshBtn.addEventListener("click", () => {
  if (currentMode === "rules") {
    checkActiveGitHubPR(true);
    return;
  }
  if (frame.src && frame.src !== "about:blank") {
    frame.classList.remove("loaded");
    showLoader("Refreshing View", "Reloading latest repository data...", "Live Sync");
    frame.src = frame.src;
  }
});

defaultDemoBtn.addEventListener("click", () => {
  updateRepoView("resend/resend-node", true, false, false);
});

// ─── Native Bottom Stats Bar (Sync via postMessage) ──────────────────────────
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "REPOPILOT_STATS_UPDATE") {
    const { stats, prCount } = event.data;
    if (statApproved) statApproved.textContent = stats.approved ?? 0;
    if (statChanges) statChanges.textContent = stats.changesRequested ?? 0;
    if (statSkipped) statSkipped.textContent = stats.skipped ?? 0;

    if (prBadge) {
      if (typeof prCount === "number" && prCount > 0) {
        prBadge.textContent = prCount;
        prBadge.classList.add("visible");
      } else {
        prBadge.classList.remove("visible");
      }
    }

    const totalDecisions = (stats.approved ?? 0) + (stats.changesRequested ?? 0) + (stats.skipped ?? 0);
    if (summaryBtn) {
      summaryBtn.disabled = totalDecisions === 0;
    }

    if (prCount > 0 && currentMode === "prs") {
      bottomStatsBar?.classList.add("visible");
    }
  } else if (event.data.type === "REPOPILOT_REQUEST_RULESET") {
    broadcastRuleSetToFrame();
  }
});

// "Generate review summary"
summaryBtn?.addEventListener("click", () => {
  if (!frame || frame.src === "about:blank") return;

  const approved = parseInt(statApproved?.textContent || "0", 10);
  const changes = parseInt(statChanges?.textContent || "0", 10);
  const skipped = parseInt(statSkipped?.textContent || "0", 10);
  const total = approved + changes + skipped;

  if (total === 0) {
    showToast("Review some PRs first — swipe right to approve, left to request changes.", "info");
    return;
  }

  try {
    frame.contentWindow.postMessage(
      {
        type: "REPOPILOT_TRIGGER_SUMMARY",
        message: `Summarize my review session so far: I approved ${approved}, requested changes on ${changes}, and skipped ${skipped} PRs. What patterns stand out and what should I focus on next?`,
      },
      "*"
    );
    showToast("✓ Generating review summary via Gemma AI…", "success", 3000);
  } catch {
    showToast("Could not reach swipe panel. Try opening in a tab ↗", "error");
  }
});

// Runtime messages from content script or background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GITHUB_REPO_CHANGED" && message.repo) {
    updateRepoView(
      message.repo.fullName,
      message.repo.isIssues,
      message.repo.isPulls,
      message.repo.isCode
    );
  } else if (message.type === "TRIGGER_OPEN_SIDEPANEL") {
    if (message.mode === "rules") {
      setMode("rules");
    }
    if (message.repo) {
      updateRepoView(
        message.repo.fullName,
        message.repo.isIssues,
        message.repo.isPulls,
        message.repo.isCode
      );
    }
  } else if (message.type === "CHECK_RISK_FOR_PR" && message.pr) {
    currentEvaluatedPR = {
      ...message.pr,
      isSandbox: false,
    };
    syncSimulatorWithPR(currentEvaluatedPR);
    evaluateCurrentPR();
  }
});

// Check session storage on initial side panel open
async function initializeState() {
  await initializeRules();

  try {
    const sync = await chrome.storage.sync.get(["customBackendUrl"]);
    if (sync?.customBackendUrl) {
      APP_BASE_URL = sync.customBackendUrl.replace(/\/$/, "");
    } else {
      APP_BASE_URL = PROD_BASE_URL;
    }
  } catch {
    APP_BASE_URL = PROD_BASE_URL;
  }

  try {
    const session = await chrome.storage.session.get([
      "activeRepo",
      "isIssues",
      "isPulls",
      "isCode",
    ]);

    if (session?.activeRepo) {
      updateRepoView(session.activeRepo, session.isIssues, session.isPulls, session.isCode);
      return;
    }
  } catch {}

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.includes("github.com")) {
      const parts = new URL(tab.url).pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const repoName = `${parts[0]}/${parts[1]}`;
        const isIssues = parts[2] === "issues";
        const isPulls = parts[2] === "pull" || parts[2] === "pulls";
        const isCode = !isIssues && !isPulls;
        updateRepoView(repoName, isIssues, isPulls, isCode);
        return;
      }
    }
  } catch {}

  renderActiveView();
}

initializeState();
