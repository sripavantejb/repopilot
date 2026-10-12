// RepoPilot Chrome Extension Service Worker (Manifest V3)

// Configure side panel behavior on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Failed to set side panel behavior:", error));

// Helper: parse repo and section from GitHub URL
function parseGithubRepo(urlStr) {
  try {
    const url = new URL(urlStr);
    if (!url.hostname.includes("github.com")) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      // Exclude special GitHub top-level pages
      const ignored = ["settings", "marketplace", "explore", "notifications", "orgs", "topics", "pulls", "issues"];
      if (ignored.includes(owner)) return null;

      const section = parts[2];
      const isIssues = section === "issues";
      const isPulls = section === "pull" || section === "pulls";
      const isCode = !isIssues && !isPulls; // e.g. /tree, /blob, or repo root

      return {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        isIssues,
        isPulls,
        isCode,
        section: section || "root",
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

// When a tab is updated (user navigates or switches pages on GitHub)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const repoInfo = parseGithubRepo(tab.url);
  if (!repoInfo) return;

  // Persist current repo info in session storage
  await chrome.storage.session.set({
    activeRepo: repoInfo.fullName,
    lastGithubUrl: tab.url,
    isIssues: repoInfo.isIssues,
    isPulls: repoInfo.isPulls,
    isCode: repoInfo.isCode,
  });

  // Automatically enable and open the side panel for this tab if enabled
  const { autoOpen = true } = await chrome.storage.local.get("autoOpen");
  if (autoOpen && repoInfo.fullName) {
    try {
      await chrome.sidePanel.open({ tabId });
    } catch (err) {
      if (tab.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
      }
    }
  }

  // Notify side panel if it's currently open
  chrome.runtime.sendMessage({
    type: "GITHUB_REPO_CHANGED",
    repo: repoInfo,
  }).catch(() => {});
});

// When user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab?.url) return;
    const repoInfo = parseGithubRepo(tab.url);
    if (repoInfo) {
      await chrome.storage.session.set({
        activeRepo: repoInfo.fullName,
        lastGithubUrl: tab.url,
        isIssues: repoInfo.isIssues,
        isPulls: repoInfo.isPulls,
        isCode: repoInfo.isCode,
      });

      chrome.runtime.sendMessage({
        type: "GITHUB_REPO_CHANGED",
        repo: repoInfo,
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Tab activation error:", err);
  }
});

// Allow content scripts to trigger sidepanel opening
chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "TRIGGER_OPEN_SIDEPANEL") {
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;
    if (tabId) {
      chrome.sidePanel.open({ tabId }).catch(() => {
        if (windowId) chrome.sidePanel.open({ windowId }).catch(() => {});
      });
    }
  }
});
