// background.js (MV3)

const COHUB_URL = "http://localhost:3000/";  // your app URL
const FOCUS_LIMIT_MIN = 0.2;              // ~5s for testing (0.0833*60 ≈ 5s)
let activeTabId = null;
let activeDomain = null;
let startedAtMs = null;

function getDomain(url = "") {
  try { return new URL(url).hostname || null; } catch { return null; }
}

function inferTopicFromTab(tab) {
  const hay = ((tab.title || "") + " " + (tab.url || "")).toLowerCase();
  if (hay.includes("kafka")) return "Kafka migration";
  if (hay.includes("azure")) return "Azure / cloud compliance";
  if (hay.includes("react")) return "React frontend";
  if (hay.includes("etl") || hay.includes("pipeline")) return "Data / ETL";
  if (hay.includes("ai") || hay.includes("ml")) return "AI / ML";
  return "your current task";
}

function resetFocus(tab) {
  activeTabId = tab?.id ?? null;
  activeDomain = getDomain(tab?.url);
  startedAtMs = Date.now();
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { resetFocus(await chrome.tabs.get(tabId)); } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId !== activeTabId) return;
  if (changeInfo.status === "complete") resetFocus(tab);
});

// Every 5s, check focus and nudge via in-page toast
setInterval(async () => {
  if (!activeTabId || !startedAtMs) return;

  let tab;
  try { tab = await chrome.tabs.get(activeTabId); } catch { return; }

  const currentDomain = getDomain(tab.url);
  if (!currentDomain || currentDomain !== activeDomain) {
    resetFocus(tab);
    return;
  }

  const minutes = (Date.now() - startedAtMs) / 60000;
  if (minutes >= FOCUS_LIMIT_MIN) {
    const topic = inferTopicFromTab(tab);
    // Ask the content script to show the toast
    chrome.tabs.sendMessage(activeTabId, {
      type: "COHUB_TOAST",
      topic,
      url: COHUB_URL
    });
    startedAtMs = Date.now(); // reset so it doesn't spam every 5s
  }
}, 5000);

// Optional: allow a popup or devtools to trigger a manual toast
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TEST_TOAST" && activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      type: "COHUB_TOAST",
      topic: "this page",
      url: COHUB_URL
    });
    sendResponse?.({ ok: true });
  }
});
