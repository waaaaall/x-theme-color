const STYLE_ID = "x-theme-color-overrides";
const DEFAULTS = { enabled: true, themeColor: "#15202b" };

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function createThemeFromColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [h, s] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    background: hslToRgb(h, s, 12),
    secondaryBg: hslToRgb(h, s, 15),
    border: hslToRgb(h, s, 25),
    text: hslToRgb(h, s, 55)
  };
}

function rgbCss([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function buildCssTemplate(theme) {
  const bg = rgbCss(theme.background);
  const bord = rgbCss(theme.border);
  const txt = rgbCss(theme.text);
  return `
/* 選択色ベースのカラーテーマ */
body, .r-kemksi {
  background-color: ${bg} !important;
}
.r-5zmot {
  background-color: rgb(${theme.background[0]}, ${theme.background[1]}, ${theme.background[2]}, 0.65) !important;
}
.r-1kqtdi0, .r-1roi411 {
  border-color: ${bord} !important;
}
.r-2sztyj {
  border-top-color: ${bord} !important;
}
.r-1igl3o0 {
  border-bottom-color: ${bord} !important;
}
[style*="color: rgb(113, 118, 123);"] {
  color: ${txt} !important;
}

body,
[data-testid="primaryColumn"],
[data-testid="pill-contents-container"] > div,
[role="menu"],
:has(
  [data-testid="app-bar-back"],
  [data-testid="ScrollSnap-prevButtonWrapper"],
  [aria-label^="タイムライン"],
  [aria-label^="検索"],
  [aria-label^="プレミアム"],
  [aria-label^="おすすめ"],
  [aria-label^="スペース"]
){
  background-color: ${bg} !important;
}

:has(
  > div > [data-icon="icon-messages-stroke"],
  > div > [data-testid="GrokDrawerHeader"]
),
svg[aria-label="認証済みアカウント"]{
  display: none !important;
}
`.trim();
}

function buildCss({ enabled, themeColor }) {
  if (!enabled) return "";
  const hex = themeColor ?? DEFAULTS.themeColor;
  const theme = createThemeFromColor(hex);
  if (!theme) return "";
  return buildCssTemplate(theme);
}

function upsertStyle(cssText) {
  let style = document.getElementById(STYLE_ID);
  if (!cssText) {
    if (style) style.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = cssText;
}

const storage = chrome.storage.local;

async function applyFromStorage() {
  let stored;
  try {
    stored = await storage.get(Object.keys(DEFAULTS));
  } catch {
    stored = {};
  }
  const data = { ...DEFAULTS, ...stored };
  const css = buildCss(data);
  upsertStyle(css);
}

function run() {
  applyFromStorage();
}

run();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  applyFromStorage();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "X_THEME_REFRESH") applyFromStorage();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") applyFromStorage();
});

const observer = new MutationObserver(() => {
  if (!document.getElementById(STYLE_ID)) run();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
