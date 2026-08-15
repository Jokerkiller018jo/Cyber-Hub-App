/**
 * theme.js — Cyber-Hub theme engine
 * Manages accent color, glitch & glow effects via CSS variables + localStorage.
 */

const STORAGE_KEY = 'cyberhub_theme';

export const ACCENT_COLORS = [
    { hex: '#B000FF', hover: '#D500F9', dark: '#6A0DAD', name: 'Cyber Violet' },
    { hex: '#00D4FF', hover: '#33DDFF', dark: '#007FA8', name: 'Neon Cyan' },
    { hex: '#00FF88', hover: '#33FFAA', dark: '#00994D', name: 'Matrix Green' },
    { hex: '#FF006E', hover: '#FF3389', dark: '#99003E', name: 'Hot Crimson' },
    { hex: '#FFB800', hover: '#FFC933', dark: '#997000', name: 'Solar Gold' },
];

export const DEFAULT_THEME = {
    accent: '#B000FF',
    glitch: true,
    glow: true,
};

/** Load saved theme from localStorage (falls back to defaults) */
export function loadTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...DEFAULT_THEME, ...JSON.parse(stored) };
    } catch (_) {}
    return { ...DEFAULT_THEME };
}

/** Save theme to localStorage */
export function saveTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch (_) {}
}

/** Apply a theme object to the document CSS variables immediately */
export function applyTheme(theme) {
    const root = document.documentElement;
    const colorDef = ACCENT_COLORS.find(c => c.hex === theme.accent) || ACCENT_COLORS[0];

    root.style.setProperty('--accent-primary', colorDef.hex);
    root.style.setProperty('--accent-hover',   colorDef.hover);
    root.style.setProperty('--accent-dark',    colorDef.dark);
    root.style.setProperty('--border-color',   hexToRgba(colorDef.hex, 0.25));

    // Glitch animation toggle
    if (theme.glitch) {
        root.style.removeProperty('--glitch-display');
    } else {
        root.style.setProperty('--glitch-display', 'none');
    }

    // Glow effect toggle — zero out hover shadow when off
    root.style.setProperty(
        '--hover-glow',
        theme.glow ? `0 0 25px ${hexToRgba(colorDef.hex, 0.35)}` : 'none'
    );
}

/** Convenience: apply + save together */
export function setTheme(theme) {
    applyTheme(theme);
    saveTheme(theme);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
