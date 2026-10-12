// RepoPilot Chrome Extension Side Panel Logic
// Unified single-origin engine: Architecture Diagram + PR Review & Triage

const APP_BASE_URL = "http://localhost:3000";

const frame = document.getElementById("repopilot-frame");
const emptyState = document.getElementById("empty-state");
const currentRepoEl = document.getElementById("current-repo");
const pageTagEl = document.getElementById("page-tag");
const popoutBtn = document.getElementById("popout-btn");
const refreshBtn = document.getElementById("refresh-btn");
const defaultDemoBtn = document.getElementById("default-demo-btn");

const tabDiagram = document.getElementById("tab-diagram");
const tabPRs = document.getElementById("tab-prs");

let activeRepoFullName = null;
let currentMode = "prs"; // 'diagram' | 'prs'

// Handle iframe smooth load transition
frame.addEventListener("load", () => {
  if (frame.src !== "about:blank") {
    frame.classList.add("loaded");
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
    // Native architecture diagram route
    targetUrl = `${APP_BASE_URL}/diagram?repo=${encodeURIComponent(activeRepoFullName)}`;
  } else {
    // PR review and issue triage route
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

initializeState();
