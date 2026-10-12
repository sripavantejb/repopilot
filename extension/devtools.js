// RepoPilot Chrome Developer Tools Panel Integration
// Adds a dedicated "RepoPilot" panel in Chrome DevTools (F12)

chrome.devtools.panels.create(
  "RepoPilot",
  "icons/icon-16.png",
  "sidepanel.html",
  function (panel) {
    console.log("[RepoPilot] DevTools panel registered successfully.");
  }
);
