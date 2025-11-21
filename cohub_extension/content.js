// content.js

function ensureToastRoot() {
  let root = document.getElementById("cohub-toast-root");
  if (root) return root;
  root = document.createElement("div");
  root.id = "cohub-toast-root";
  document.documentElement.appendChild(root);
  return root;
}

function renderToast({ topic, url }) {
  const root = ensureToastRoot();

  // Remove an existing toast if present
  const prev = document.getElementById("cohub-toast");
  if (prev) prev.remove();

  const toast = document.createElement("div");
  toast.id = "cohub-toast";
  toast.innerHTML = `
    <div class="cohub-toast__card">
      <div class="cohub-toast__title">CoHub suggestion</div>
      <div class="cohub-toast__msg">
        You’ve been focused on <b>${topic}</b> for a while. 
        Want help finding similar projects & the right people?
      </div>
      <div class="cohub-toast__actions">
        <a class="cohub-toast__btn cohub-toast__btn--primary" href="${url}" target="_blank" rel="noopener">Open CoHub</a>
        <button class="cohub-toast__btn cohub-toast__btn--ghost" id="cohub-toast-dismiss">Dismiss</button>
      </div>
    </div>
  `;
  root.appendChild(toast);

  // Auto-hide after 10s, or on Dismiss click
  const remove = () => toast.remove();
  document.getElementById("cohub-toast-dismiss")?.addEventListener("click", remove);
  setTimeout(remove, 10000);
}

// Listen for the background's nudge
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "COHUB_TOAST") {
    renderToast({ topic: msg.topic || "your task", url: msg.url });
  }
});
