// RepoPilot Chrome Extension Side Panel Logic
// Unified single-origin engine: Architecture Diagram + PR Review & Triage

const PROD_BASE_URL = "https://repopilot-orcin.vercel.app";
let APP_BASE_URL = PROD_BASE_URL;

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

const tabDiagram = document.getElementById("tab-diagram");
const tabPRs = document.getElementById("tab-prs");

let activeRepoFullName = null;
let currentMode = "prs"; // 'diagram' | 'prs'

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
    // Brief settle time for app hydration
    setTimeout(() => {
      hideLoader();
    }, 250);
  }
});

function setMode(mode) {
  currentMode = mode;
  if (mode === "diagram") {
    tabDiagram.classList.add("active");
    tabPRs.classList.remove("active");
  } else {
    tabPRs.classList.add("active");
    tabDiagram.classList.remove("active");
  }
  renderActiveView();
}

function renderActiveView() {
  if (!activeRepoFullName) {
    hideLoader();
    emptyState.style.display = "flex";
    frame.style.display = "none";
    frame.classList.remove("loaded");
    currentRepoEl.textContent = "None";
    pageTagEl.textContent = "GitHub";
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
    targetUrl = `${APP_BASE_URL}/diagram?repo=${encodeURIComponent(activeRepoFullName)}`;
  } else {
    showLoader(
      "Scanning Pull Requests",
      `Loading PR deck & Gemma 4 risk scores for ${activeRepoFullName}...`,
      "PR Triage & Review"
    );
    targetUrl = `${APP_BASE_URL}/swipe?repo=${encodeURIComponent(activeRepoFullName)}`;
  }

  if (frame.src !== targetUrl) {
    frame.classList.remove("loaded");
    frame.src = targetUrl;
  }
}

function updateRepoView(repoFullName, isIssues, isPulls, isCode) {
  if (!repoFullName) {
    activeRepoFullName = null;
    renderActiveView();
    return;
  }

  activeRepoFullName = repoFullName;
  currentRepoEl.textContent = repoFullName;

  // Auto-switch modes contextually:
  // - When on Issues or Pull Requests -> Activate PR & Issue Triage
  // - When on Code (tree / blob / root) -> Activate Git Architecture Diagram
  if (isIssues) {
    pageTagEl.textContent = "Issues Detected → PR Triage";
    setMode("prs");
  } else if (isPulls) {
    pageTagEl.textContent = "Pull Requests Detected → PR Triage";
    setMode("prs");
  } else {
    pageTagEl.textContent = "Code Detected → Git Architecture";
    setMode("diagram");
  }
}

// Check session storage on initial side panel open
async function initializeState() {
  const sync = await chrome.storage.sync.get(["customBackendUrl"]);
  if (sync.customBackendUrl) {
    APP_BASE_URL = sync.customBackendUrl.replace(/\/$/, "");
  } else {
    APP_BASE_URL = PROD_BASE_URL;
  }

  const session = await chrome.storage.session.get([
    "activeRepo",
    "isIssues",
    "isPulls",
    "isCode",
  ]);

  if (session.activeRepo) {
    updateRepoView(session.activeRepo, session.isIssues, session.isPulls, session.isCode);
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.includes("github.com")) {
      const parts = new URL(tab.url).pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const repoName = `${parts[0]}/${parts[1]}`;
        const isIssues = parts[2] === "issues";
        const isPulls = parts[2] === "pull" || parts[2] === "pulls";
        const isCode = !isIssues && !isPulls;
        updateRepoView(repoName, isIssues, isPulls, isCode);
      }
    }
  }
}

// Mode tab clicks
tabDiagram.addEventListener("click", () => setMode("diagram"));
tabPRs.addEventListener("click", () => setMode("prs"));

// Listen for updates from service worker or content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GITHUB_REPO_CHANGED" && message.repo) {
    updateRepoView(
      message.repo.fullName,
      message.repo.isIssues,
      message.repo.isPulls,
      message.repo.isCode
    );
  } else if (message.type === "TRIGGER_OPEN_SIDEPANEL" && message.repo) {
    updateRepoView(
      message.repo.fullName,
      message.repo.isIssues,
      message.repo.isPulls,
      message.repo.isCode
    );
  }
});

// Controls
popoutBtn.addEventListener("click", () => {
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
  if (frame.src && frame.src !== "about:blank") {
    frame.classList.remove("loaded");
    frame.src = frame.src;
  }
});

defaultDemoBtn.addEventListener("click", () => {
  updateRepoView("resend/resend-node", true, false, false);
});

// ─── Native Bottom Stats Bar ──────────────────────────────────────────────────
const bottomStatsBar = document.getElementById("bottom-stats-bar");
const statApproved = document.getElementById("stat-approved");
const statChanges = document.getElementById("stat-changes");
const statSkipped = document.getElementById("stat-skipped");
const summaryBtn = document.getElementById("summary-btn");
const toastEl = document.getElementById("toast-msg");

let toastTimer = null;

function showToast(msg, type = "info", durationMs = 4000) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, durationMs);
}

// Show / hide the bottom stats bar based on current mode
function updateBottomBar() {
  if (!bottomStatsBar) return;
  if (currentMode === "prs" && activeRepoFullName) {
    bottomStatsBar.classList.add("visible");
  } else {
    bottomStatsBar.classList.remove("visible");
  }
}

// Listen for postMessages from the swipe page iframe
window.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "REPOPILOT_STATS_UPDATE") return;

  const { stats, prCount, currentIndex: idx, repo } = event.data;

  // Update counters
  if (statApproved) statApproved.textContent = stats.approved ?? 0;
  if (statChanges) statChanges.textContent = stats.changesRequested ?? 0;
  if (statSkipped) statSkipped.textContent = stats.skipped ?? 0;

  // Enable summary button only once at least one decision has been made
  const totalDecisions = (stats.approved ?? 0) + (stats.changesRequested ?? 0) + (stats.skipped ?? 0);
  if (summaryBtn) {
    summaryBtn.disabled = totalDecisions === 0;
  }

  // Show bar once we have PRs loaded
  if (prCount > 0 && currentMode === "prs") {
    bottomStatsBar?.classList.add("visible");
  }
});

// "Generate review summary" — send message into the iframe to trigger the chat summary
summaryBtn?.addEventListener("click", () => {
  if (!frame || frame.src === "about:blank") return;

  // PostMessage into the swipe page iframe to trigger summary chat
  const approved = parseInt(statApproved?.textContent || "0", 10);
  const changes = parseInt(statChanges?.textContent || "0", 10);
  const skipped = parseInt(statSkipped?.textContent || "0", 10);
  const total = approved + changes + skipped;

  if (total === 0) {
    showToast("Review some PRs first — swipe right to approve, left to request changes.", "info");
    return;
  }

  // Inject the summary request via postMessage into the iframe
  try {
    frame.contentWindow.postMessage(
      {
        type: "REPOPILOT_TRIGGER_SUMMARY",
        message: `Summarize my review session so far: I approved ${approved}, requested changes on ${changes}, and skipped ${skipped} PRs. What patterns stand out and what should I focus on next?`,
      },
      "*"
    );
    showToast("✓ Generating review summary via Gemma…", "success", 3000);
  } catch (e) {
    showToast("Could not reach swipe panel. Try opening in a tab ↗", "error");
  }
});

// Patch setMode to also update bottom bar visibility
const _origSetMode = setMode;
// Override to also call updateBottomBar after mode switches
tabDiagram.addEventListener("click", () => { updateBottomBar(); });
tabPRs.addEventListener("click", () => { updateBottomBar(); });

initializeState();
