const DEFAULTS = { enabled: true, themeColor: "#15202b" };
const storage = chrome.storage.local;

function $(id) {
  return document.getElementById(id);
}

function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
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
      // sync storage が利用できない場合は無視
    }
  }
  const data = { ...DEFAULTS, ...stored };
  $("enabled").checked = data.enabled;
  $("themeColor").value = data.themeColor;
}

async function onToggle() {
  await storage.set({ enabled: $("enabled").checked });
}

const onColorChangeDebounced = debounce(async () => {
  await storage.set({ themeColor: $("themeColor").value });
}, 100);

$("enabled").addEventListener("change", onToggle);
$("themeColor").addEventListener("input", onColorChangeDebounced);
load();
