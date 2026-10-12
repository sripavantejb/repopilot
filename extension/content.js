// RepoPilot GitHub Content Script
// Injects "Open in RepoPilot" triggers and Live Risk Score Evaluation Badges directly on GitHub

(function initRepoPilotInjector() {
  const isWebLanding =
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("repopilot") ||
    window.location.hostname.includes("vercel.app");

  if (isWebLanding) {
    // Announce extension presence to the landing page
    document.documentElement.setAttribute("data-repopilot-extension", "true");

    function notifyLandingPage() {
      window.dispatchEvent(
        new CustomEvent("repopilot:extension:status", {
          detail: {
            installed: true,
            version: "1.1.0",
            sidepanelAvailable: true,
            devtoolsAvailable: true,
          },
        })
      );
      window.postMessage(
        {
          type: "REPOPILOT_EXTENSION_STATUS",
          installed: true,
          version: "1.1.0",
          sidepanelAvailable: true,
          devtoolsAvailable: true,
        },
        "*"
      );
    }

    notifyLandingPage();
    const pingInterval = setInterval(notifyLandingPage, 1200);
    setTimeout(() => clearInterval(pingInterval), 30000);

    window.addEventListener("message", (event) => {
      if (event.data?.type === "CHECK_REPOPILOT_EXTENSION") {
        notifyLandingPage();
      } else if (event.data?.type === "OPEN_REPOPILOT_SIDEPANEL") {
        chrome.runtime.sendMessage({
          type: "TRIGGER_OPEN_SIDEPANEL",
          mode: event.data?.mode || "prs",
        });
      }
    });

    return;
  }

  function getRepoInfo() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const isIssues = parts[2] === "issues";
      const isPulls = parts[2] === "pull" || parts[2] === "pulls";
      const isPR = parts[2] === "pull" && !!parts[3];
      const isCode = !isIssues && !isPulls;

      return {
        owner: parts[0],
        repo: parts[1],
        fullName: `${parts[0]}/${parts[1]}`,
        isIssues,
        isPulls,
        isPR,
        prNumber: isPR ? parseInt(parts[3], 10) : null,
        isCode,
      };
    }
    return null;
  }

  function extractPRDataFromDOM() {
    const repoInfo = getRepoInfo();
    if (!repoInfo || !repoInfo.isPR) return null;

    // Title
    const titleEl = document.querySelector(".js-issue-title, [data-component='PH_Title'], h1.gh-header-title");
    const title = titleEl ? titleEl.textContent.trim() : document.title.replace(/ · Pull Request.*$/, "");

    // Additions & deletions
    let additions = 0;
    let deletions = 0;
    const diffstat = document.querySelector("#diffstat, .diffstat");
    if (diffstat) {
      const text = diffstat.textContent || "";
      const addMatch = text.match(/\+([\d,]+)/);
      const delMatch = text.match(/-([\d,]+)/);
      if (addMatch) additions = parseInt(addMatch[1].replace(/,/g, ""), 10);
      if (delMatch) deletions = parseInt(delMatch[1].replace(/,/g, ""), 10);
    }

    // Files changed count
    let changedFiles = 1;
    const filesTab = document.querySelector("#files_tab_counter, [data-tab-item='files-tab'] .Counter");
    if (filesTab) {
      changedFiles = parseInt(filesTab.textContent.trim().replace(/,/g, ""), 10) || 1;
    }

    // Body
    const bodyEl = document.querySelector(".comment-body, .js-comment-body");
    const body = bodyEl ? bodyEl.textContent.trim().slice(0, 500) : "";

    // Author
    const authorEl = document.querySelector(".author, [data-hovercard-type='user']");
    const authorHandle = authorEl ? authorEl.textContent.trim() : "contributor";

    // Changed file names (if on files tab or headers exist)
    const fileHeaders = document.querySelectorAll(".file-header [data-path], .file-info [title]");
    const files = [];
    fileHeaders.forEach((el) => {
      const name = el.getAttribute("data-path") || el.getAttribute("title") || el.textContent.trim();
      if (name && !files.includes(name)) files.push(name);
    });

    return {
      title,
      body,
      additions,
      deletions,
      changedFiles,
      files,
      authorHandle,
      contributorTotalPrs: 1,
      contributorMergedPrs: 0,
      prNumber: repoInfo.prNumber,
    };
  }

  async function injectBadges() {
    const repoInfo = getRepoInfo();
    if (!repoInfo) return;

    // Look for GitHub's subnav / action container
    const nav = document.querySelector(
      ".pagehead-actions, #repository-container-header nav, .UnderlineNav-body, .gh-header-actions"
    );
    if (!nav) return;

    // 1. Injected Primary RepoPilot Trigger Button
    if (!document.getElementById("repopilot-inject-btn")) {
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

      const label = repoInfo.isIssues
        ? "RepoPilot: PR Finder"
        : repoInfo.isPulls
        ? "RepoPilot: PR Triage"
        : "RepoPilot: Diagram";

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
          mode: repoInfo.isPulls ? "prs" : "diagram",
          repo: repoInfo,
        });
      });

      nav.appendChild(btn);
    }

    // 2. Injected Risk Score Badge (If viewing a PR)
    if (repoInfo.isPR && !document.getElementById("repopilot-risk-badge")) {
      const prData = extractPRDataFromDOM();
      if (!prData) return;

      // Evaluate risk score using active rule set
      let activeRuleSet = null;
      if (window.RepoPilotRulesEngine) {
        try {
          const loaded = await window.RepoPilotRulesEngine.loadRuleSets();
          activeRuleSet = loaded.ruleSets.find((s) => s.id === loaded.activeId) || loaded.ruleSets[0];
        } catch {}
      }

      const evaluation = window.RepoPilotRulesEngine
        ? window.RepoPilotRulesEngine.evaluateRiskScore(activeRuleSet, prData)
        : { score: 20, riskLevel: "low", riskColor: "#2E7D32", riskBg: "#E8F5E9" };

      const riskBadge = document.createElement("button");
      riskBadge.id = "repopilot-risk-badge";
      riskBadge.className = "btn btn-sm";
      riskBadge.style.marginLeft = "6px";
      riskBadge.style.display = "inline-flex";
      riskBadge.style.alignItems = "center";
      riskBadge.style.gap = "5px";
      riskBadge.style.backgroundColor = evaluation.riskBg;
      riskBadge.style.borderColor = evaluation.riskColor;
      riskBadge.style.color = evaluation.riskColor;
      riskBadge.style.fontWeight = "700";
      riskBadge.style.cursor = "pointer";
      riskBadge.style.borderRadius = "9999px";
      riskBadge.style.padding = "3px 10px";
      riskBadge.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      riskBadge.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";

      const topReasons = evaluation.triggeredRules?.map((r) => `• ${r.name}`).join("\n") || "No risk flags triggered";
      riskBadge.title = `Rule Set: ${evaluation.ruleSetName}\nRisk Score: ${evaluation.score}/100 (${evaluation.riskLevel.toUpperCase()})\n\nFactors:\n${topReasons}\n\nClick to inspect in RepoPilot Rules Hub`;

      riskBadge.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${evaluation.riskColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>Risk: ${evaluation.score}/100</span>
      `;

      riskBadge.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          type: "TRIGGER_OPEN_SIDEPANEL",
          mode: "rules",
          repo: repoInfo,
          pr: prData,
        });
        chrome.runtime.sendMessage({
          type: "CHECK_RISK_FOR_PR",
          pr: prData,
        });
      });

      nav.appendChild(riskBadge);
    }
  }

  // Answer requests for PR data from the side panel
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_GITHUB_PR_DATA") {
      const prData = extractPRDataFromDOM();
      sendResponse({ pr: prData });
    }
    return true;
  });

  // Observe navigation in GitHub's Turbo / PJAX client-side router
  const observer = new MutationObserver(() => {
    injectBadges();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  injectBadges();
})();
