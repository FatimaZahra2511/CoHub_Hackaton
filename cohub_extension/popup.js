const COHUB_URL = "http://localhost:3000";

document.getElementById("open").addEventListener("click", () => {
  chrome.tabs.create({ url: COHUB_URL });
});

document.getElementById("testNotify")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TEST_NOTIFY" }, () => {
    alert("Nudge sent! If you don’t see it, check your system notifications.");
  });
});


