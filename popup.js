const DEFAULTS = { enabled: true, themeColor: "#15202b" };
const storage = chrome.storage.local;

function $(id) {
  return document.getElementById(id);
}

function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function notifyContent(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "X_THEME_UPDATE", data }).catch(() => {});
    }
  });
}

async function load() {
  let stored = await storage.get(Object.keys(DEFAULTS));
  const hasLocal = Object.keys(stored).length > 0;
  if (!hasLocal && chrome.storage.sync) {
    try {
      const fromSync = await chrome.storage.sync.get(Object.keys(DEFAULTS));
      if (Object.keys(fromSync).length > 0) {
        await storage.set(fromSync);
        stored = fromSync;
      }
    } catch {
      // ignore sync storage error
    }
  }
  const data = { ...DEFAULTS, ...stored };
  $("enabled").checked = data.enabled;
  $("themeColor").value = data.themeColor;
  notifyContent(data);
}

const saveStorageDebounced = debounce(async (data) => {
  await storage.set(data);
}, 150);

function onToggle() {
  const data = { enabled: $("enabled").checked, themeColor: $("themeColor").value };
  notifyContent(data);
  storage.set({ enabled: data.enabled });
}

function onColorChange() {
  const data = { enabled: $("enabled").checked, themeColor: $("themeColor").value };
  // 即座にタブに色をプレビュー反映
  notifyContent(data);
  // ストレージへの書き込みは debounce
  saveStorageDebounced({ themeColor: data.themeColor });
}

$("enabled").addEventListener("change", onToggle);
$("themeColor").addEventListener("input", onColorChange);
load();
