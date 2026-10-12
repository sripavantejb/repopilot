// RepoPilot GitHub Content Script
// Injects an "Open in RepoPilot" trigger directly on GitHub PRs, Issues, and Code pages

(function initRepoPilotInjector() {
  function getRepoInfo() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const isIssues = parts[2] === "issues";
      const isPulls = parts[2] === "pull" || parts[2] === "pulls";
      const isCode = !isIssues && !isPulls;

      return {
        owner: parts[0],
        repo: parts[1],
        fullName: `${parts[0]}/${parts[1]}`,
        isIssues,
        isPulls,
        isCode,
      };
    }
    return null;
  }

  function injectButton() {
    if (document.getElementById("repopilot-inject-btn")) return;

    const repoInfo = getRepoInfo();
    if (!repoInfo) return;

    // Look for GitHub's subnav / action container
    const nav = document.querySelector(".pagehead-actions, #repository-container-header nav, .UnderlineNav-body");
    if (!nav) return;

    const btn = document.createElement("button");
    btn.id = "repopilot-inject-btn";
    btn.className = "btn btn-sm btn-primary";
    btn.style.marginLeft = "8px";
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";
    btn.style.backgroundColor = repoInfo.isIssues || repoInfo.isPulls ? "#22C55E" : "#3B82F6";
    btn.style.borderColor = repoInfo.isIssues || repoInfo.isPulls ? "#16A34A" : "#2563EB";
    btn.style.color = "#ffffff";
    btn.style.fontWeight = "600";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.padding = "3px 10px";

    const label = repoInfo.isIssues ? "RepoPilot: PR Finder" : repoInfo.isPulls ? "RepoPilot: PR Triage" : "RepoPilot: Diagram";

    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <span>${label}</span>
    `;

    btn.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "TRIGGER_OPEN_SIDEPANEL",
        repo: repoInfo,
      });
    });

    nav.appendChild(btn);
  }

  // Observe navigation in GitHub's Turbo / PJAX client-side router
  const observer = new MutationObserver(() => {
    injectButton();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  injectButton();
})();
