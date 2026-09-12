// ── CyberHub Color Picker — picker-window.js ─────────────────────────────────
// This script runs inside the small floating window opened by the keyboard shortcut.
// It auto-launches EyeDropper, displays results, and saves to history.

const HISTORY_KEY  = 'cyberhub_color_history';
const SETTINGS_KEY = 'cyberhub_settings';
const MAX_HISTORY  = 10;

// DOM
const phaseIdle    = document.getElementById('phaseIdle');
const phasePicking = document.getElementById('phasePicking');
const phaseResult  = document.getElementById('phaseResult');
const rSwatch      = document.getElementById('rSwatch');
const rGlow        = document.getElementById('rGlow');
const rHex         = document.getElementById('rHex');
const rRgb         = document.getElementById('rRgb');
const rHsl         = document.getElementById('rHsl');
const rCopyHex     = document.getElementById('rCopyHex');
const rCopyRgb     = document.getElementById('rCopyRgb');
const rCopyHsl     = document.getElementById('rCopyHsl');
const rPickAgain   = document.getElementById('rPickAgain');
const closeBtn     = document.getElementById('closeBtn');
const toast        = document.getElementById('toast');

let toastTimer = null;
let currentColor = null;

// ── Colour Maths ──────────────────────────────────────────────────────────────

function hexToRgb(hex) {
    const c = hex.replace('#', '');
    return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max - min;
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (delta) {
        s = delta / (1 - Math.abs(2*l - 1));
        switch(max) {
            case r: h = ((g-b)/delta + (g<b?6:0))/6; break;
            case g: h = ((b-r)/delta + 2)/6; break;
            case b: h = ((r-g)/delta + 4)/6; break;
        }
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

// ── Phase Switching ───────────────────────────────────────────────────────────

function showPhase(name) {
    phaseIdle.classList.add('hidden');
    phasePicking.classList.add('hidden');
    phaseResult.classList.add('hidden');
    if (name === 'idle')    phaseIdle.classList.remove('hidden');
    if (name === 'picking') phasePicking.classList.remove('hidden');
    if (name === 'result')  phaseResult.classList.remove('hidden');
}

// ── Apply Color to Result Panel ───────────────────────────────────────────────

function applyResult(hex) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    currentColor = { hex: hex.toUpperCase(), r, g, b, h, s, l };

    rSwatch.style.background = hex;
    rGlow.style.background   = hex;
    rHex.textContent = currentColor.hex;
    rRgb.textContent = `rgb(${r}, ${g}, ${b})`;
    rHsl.textContent = `hsl(${h}, ${s}%, ${l}%)`;

    showPhase('result');
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

async function copyText(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('success');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('success'); }, 1200);
        showToast(`Copied  ${text}`);
    } catch {
        showToast('Copy failed');
    }
}

// ── History ───────────────────────────────────────────────────────────────────

function pushHistory(hex) {
    const upperHex = hex.toUpperCase();
    chrome.storage.local.get([HISTORY_KEY, SETTINGS_KEY], (res) => {
        let h = res[HISTORY_KEY] || [];
        const s = res[SETTINGS_KEY] || {};
        const max = parseInt(s.maxHistory) || MAX_HISTORY;
        h = h.filter(c => c.toUpperCase() !== upperHex);
        h.unshift(upperHex);
        if (h.length > max) h = h.slice(0, max);
        chrome.storage.local.set({ [HISTORY_KEY]: h });
    });
}

// ── Settings ──────────────────────────────────────────────────────────────────

function getSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    } catch { return {}; }
}

// ── EyeDropper ────────────────────────────────────────────────────────────────

async function launchPicker() {
    if (!window.EyeDropper) {
        phaseIdle.querySelector('.phase-label').textContent = 'EyeDropper not supported';
        phaseIdle.querySelector('.phase-sub').textContent   = 'Use Chrome 95+, Edge 95+, or Brave.';
        return;
    }

    showPhase('picking');

    try {
        const dropper = new EyeDropper();
        const result  = await dropper.open();
        const hex     = result.sRGBHex;

        applyResult(hex);
        pushHistory(hex);

        // Auto-copy if setting is enabled
        const settings = getSettings();
        if (settings.autoCopy) {
            await navigator.clipboard.writeText(hex.toUpperCase()).catch(() => {});
            showToast(`Auto-copied  ${hex.toUpperCase()}`);
        }

        // Auto-close if setting is enabled
        if (settings.autoClose) {
            setTimeout(() => window.close(), 1500);
        }

    } catch (err) {
        // Handle normal cancellations and activation requirements silently without console errors
        showPhase('idle');
    }
}

// ── Event Listeners ───────────────────────────────────────────────────────────

closeBtn.addEventListener('click', () => window.close());

// Click anywhere on idle phase triggers picker
phaseIdle.addEventListener('click', () => launchPicker());

// Keyboard navigation
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        launchPicker();
    } else if (e.key === 'Escape') {
        window.close();
    }
});

rCopyHex.addEventListener('click', () => currentColor && copyText(currentColor.hex, rCopyHex));
rCopyRgb.addEventListener('click', () => currentColor && copyText(`rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`, rCopyRgb));
rCopyHsl.addEventListener('click', () => currentColor && copyText(`hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%)`, rCopyHsl));
rPickAgain.addEventListener('click', () => launchPicker());

// Clicking swatch copies HEX
rSwatch.addEventListener('click', () => currentColor && copyText(currentColor.hex, rCopyHex));

// ── Auto-focus on open ───────────────────────────────────────────────────────
window.addEventListener('load', () => {
    // Focus phaseIdle so hitting Space or Enter immediately triggers launchPicker
    if (phaseIdle) {
        phaseIdle.focus();
    }
});

