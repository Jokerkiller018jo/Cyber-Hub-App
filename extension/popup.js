// ── CyberHub Color Picker — popup.js ──────────────────────────────────────────

// DOM Elements
const swatch      = document.getElementById('swatch');
const swatchGlow  = document.getElementById('swatchGlow');
const hexVal      = document.getElementById('hexVal');
const rgbVal      = document.getElementById('rgbVal');
const hslVal      = document.getElementById('hslVal');
const pickBtn     = document.getElementById('pickBtn');
const copyHex     = document.getElementById('copyHex');
const copyRgb     = document.getElementById('copyRgb');
const copyHsl     = document.getElementById('copyHsl');
const copyRow     = document.getElementById('copyRow');
const toast       = document.getElementById('toast');
const historyGrid = document.getElementById('historyGrid');
const historyEmpty= document.getElementById('historyEmpty');
const clearBtn    = document.getElementById('clearBtn');
const unsupported       = document.getElementById('unsupported');
const openSettings      = document.getElementById('openSettings');
const pickPrecisionBtn  = document.getElementById('pickPrecisionBtn');

const HISTORY_KEY  = 'cyberhub_color_history';
const SETTINGS_KEY = 'cyberhub_settings';
const MAX_HISTORY  = 10;

// ── State ──────────────────────────────────────────────────────────────────────
let currentColor = null;   // { hex, r, g, b }
let toastTimer   = null;

// ── Settings Helper ────────────────────────────────────────────────────────────

function getSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
}

// ── Colour Maths ───────────────────────────────────────────────────────────────

/** Parse a sRGB hex string (#RRGGBB) → { r, g, b } */
function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
}

/** { r, g, b } → "hsl(H, S%, L%)" string + individual values */
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));
        switch (max) {
            case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / delta + 2) / 6; break;
            case b: h = ((r - g) / delta + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/** Determine a suitable text colour (white / black) for a given bg */
function contrastColor(r, g, b) {
    // Relative luminance (WCAG)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 140 ? '#000000' : '#ffffff';
}

// ── UI Updates ─────────────────────────────────────────────────────────────────

function applyColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const upperHex     = hex.toUpperCase();

    currentColor = { hex: upperHex, r, g, b, h, s, l };

    // Swatch
    swatch.style.background   = hex;
    swatch.classList.add('has-color');

    // Glow — use the picked colour itself
    swatchGlow.style.background = hex;

    // Values
    hexVal.textContent = upperHex;
    rgbVal.textContent = `rgb(${r}, ${g}, ${b})`;
    hslVal.textContent = `hsl(${h}, ${s}%, ${l}%)`;

    hexVal.classList.add('has-value');
    rgbVal.classList.add('has-value');
    hslVal.classList.add('has-value');

    // Enable copy buttons
    copyRow.style.opacity      = '1';
    copyRow.style.pointerEvents= 'all';
}

function resetDisplay() {
    swatch.style.background = '#18181b';
    swatch.classList.remove('has-color');
    swatchGlow.style.background = 'transparent';
    hexVal.textContent = '—';
    rgbVal.textContent = '—';
    hslVal.textContent = '—';
    hexVal.classList.remove('has-value');
    rgbVal.classList.remove('has-value');
    hslVal.classList.remove('has-value');
    copyRow.style.opacity      = '0.4';
    copyRow.style.pointerEvents= 'none';
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(msg = 'Copied!') {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

async function copyToClipboard(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1200);
        showToast(`Copied  ${text}`);
    } catch {
        showToast('Copy failed');
    }
}

// ── History (Unified chrome.storage.local) ──────────────────────────────────

function loadHistory(callback) {
    chrome.storage.local.get([HISTORY_KEY], (res) => {
        let history = res[HISTORY_KEY];
        if (!Array.isArray(history)) {
            // Migrate from legacy localStorage if present
            try {
                const old = localStorage.getItem(HISTORY_KEY);
                history = old ? JSON.parse(old) : [];
                if (history && history.length) {
                    chrome.storage.local.set({ [HISTORY_KEY]: history });
                }
            } catch {
                history = [];
            }
        }
        if (callback) callback(history || []);
    });
}

function saveHistory(history, callback) {
    chrome.storage.local.set({ [HISTORY_KEY]: history }, () => {
        if (callback) callback();
    });
}

function pushHistory(hex) {
    const upperHex = hex.toUpperCase();
    loadHistory((history) => {
        history = history.filter(h => h.toUpperCase() !== upperHex);
        history.unshift(upperHex);
        if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
        saveHistory(history, () => {
            renderHistory(history);
        });
    });
}

function renderHistory(history) {
    historyGrid.innerHTML = '';

    if (!history || history.length === 0) {
        historyEmpty.style.display = 'block';
        clearBtn.style.display     = 'none';
        return;
    }

    historyEmpty.style.display = 'none';
    clearBtn.style.display     = 'block';

    history.forEach(hex => {
        const el = document.createElement('div');
        el.className          = 'history-swatch';
        el.style.background   = hex;
        el.dataset.hex        = hex;
        el.title              = hex;
        el.setAttribute('aria-label', `Select color ${hex}`);
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');

        el.addEventListener('click', () => {
            applyColor(hex);
        });

        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                applyColor(hex);
            }
        });

        historyGrid.appendChild(el);
    });
}

// ── EyeDropper ────────────────────────────────────────────────────────────────

async function pickColor() {
    // Check support
    if (!window.EyeDropper) {
        unsupported.style.display = 'flex';
        pickBtn.style.display     = 'none';
        return;
    }

    pickBtn.classList.add('picking');
    pickBtn.textContent = '… Picking — click any pixel';

    try {
        const dropper = new EyeDropper();
        const result  = await dropper.open();       // blocks until user clicks or cancels

        const hex = result.sRGBHex;                 // "#RRGGBB"
        applyColor(hex);
        pushHistory(hex);

        // Auto-copy if setting is enabled
        const settings = getSettings();
        const fmt      = settings.defaultFormat || 'hex';
        if (settings.autoCopy) {
            let valueToCopy = currentColor.hex;
            if (fmt === 'rgb') valueToCopy = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            if (fmt === 'hsl') valueToCopy = `hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%)`;
            await navigator.clipboard.writeText(valueToCopy).catch(() => {});
            showToast(`Auto-copied  ${valueToCopy}`);
        }
    } catch (err) {
        // User pressed Escape — not a real error
        if (err.name !== 'AbortError') {
            console.error('[CyberHub Picker]', err);
        }
    } finally {
        pickBtn.classList.remove('picking');
        pickBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.41-1.42-1.42 1.42 1.41 1.41-6.6 6.6A2 2 0 0 0 5 16v3h3a2 2 0 0 0 1.42-.59l6.6-6.6 1.41 1.42 1.42-1.42-1.42-1.41 3.12-3.12a1 1 0 0 0 0-1.65zM8 17H7v-1l6.59-6.59 1 1L8 17z"/>
            </svg>
            Pick Color with Pen`;
    }
}

// ── Event Listeners ───────────────────────────────────────────────────────────

if (pickPrecisionBtn) {
    pickPrecisionBtn.addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({ action: 'LAUNCH_PRECISION_PEN' });
            window.close();
        } catch (err) {
            console.error('[CyberHub Precision Pen]', err);
        }
    });
}

pickBtn.addEventListener('click', pickColor);

copyHex.addEventListener('click', () => {
    if (!currentColor) return;
    copyToClipboard(currentColor.hex, copyHex);
});

copyRgb.addEventListener('click', () => {
    if (!currentColor) return;
    copyToClipboard(`rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`, copyRgb);
});

copyHsl.addEventListener('click', () => {
    if (!currentColor) return;
    copyToClipboard(`hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%)`, copyHsl);
});

// Clicking the main swatch also copies HEX
swatch.addEventListener('click', () => {
    if (!currentColor) return;
    copyToClipboard(currentColor.hex, copyHex);
});

clearBtn.addEventListener('click', () => {
    saveHistory([], () => {
        renderHistory([]);
    });
});

// Open settings page
openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

// ── Live Storage Sync ─────────────────────────────────────────────────────────
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[HISTORY_KEY]) {
        const newHist = changes[HISTORY_KEY].newValue || [];
        renderHistory(newHist);
        if (newHist.length > 0) {
            applyColor(newHist[0]);
        }
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────

(function init() {
    // Disable copy buttons until a colour is picked
    copyRow.style.opacity      = '0.4';
    copyRow.style.pointerEvents= 'none';

    // Load & render history from shared storage
    loadHistory((history) => {
        renderHistory(history);
        if (history.length > 0) {
            applyColor(history[0]);
        }
    });

    // EyeDropper availability check
    if (!window.EyeDropper) {
        unsupported.style.display = 'flex';
        pickBtn.disabled          = true;
        pickBtn.style.opacity     = '0.4';
        pickBtn.style.cursor      = 'not-allowed';
    }
})();
