const DEFAULTS = { enabled: true, themeColor: "#15202b" };
const storage = chrome.storage.local;

function $(id) { return document.getElementById(id); }

async function load() {
  let stored = await storage.get(Object.keys(DEFAULTS));
  const hasLocal = Object.keys(stored).length > 0;
  if (!hasLocal) {
    const fromSync = await chrome.storage.sync.get(Object.keys(DEFAULTS));
    if (Object.keys(fromSync).length > 0) {
      await storage.set(fromSync);
      stored = fromSync;
    }
  }
  const data = { ...DEFAULTS, ...stored };
  $("enabled").checked = data.enabled;
  $("themeColor").value = data.themeColor;
  notifyContentToRefresh();
}

async function onToggle() {
  await storage.set({ enabled: $("enabled").checked });
}

async function onColorChange() {
  await storage.set({ themeColor: $("themeColor").value });
}

function notifyContentToRefresh() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url && /twitter\.com|x\.com/.test(tab.url)) {
      chrome.tabs.sendMessage(tab.id, { type: "X_THEME_REFRESH" }).catch(() => {});
    }
  });
}

$("enabled").addEventListener("change", onToggle);
$("themeColor").addEventListener("input", onColorChange);
load();
