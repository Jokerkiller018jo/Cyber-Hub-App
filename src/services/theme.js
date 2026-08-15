/**
 * theme.js — Cyber-Hub theme engine
 * Manages accent color, glitch & glow effects via CSS variables + localStorage.
 */

const STORAGE_KEY = 'cyberhub_theme';

export const ACCENT_COLORS = [
    { hex: '#06b6d4', hover: '#22d3ee', dark: '#0891b2', name: 'Electric Cyan' },
    { hex: '#10b981', hover: '#34d399', dark: '#059669', name: 'Emerald Node' },
    { hex: '#f59e0b', hover: '#fbbf24', dark: '#d97706', name: 'Solar Flare' },
    { hex: '#6366f1', hover: '#818cf8', dark: '#4f46e5', name: 'Indigo Core' },
    { hex: '#e2e8f0', hover: '#f8fafc', dark: '#94a3b8', name: 'Monochrome' },
];

export const DEFAULT_THEME = {
    accent: '#06b6d4',
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

/** Derive hover/dark variants from any arbitrary hex color */
function deriveVariants(hex) {
    // Try to find a preset match first
    const preset = ACCENT_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    if (preset) return { hover: preset.hover, dark: preset.dark };

    // Otherwise derive programmatically
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Hover = lighten by ~15%
    const lighten = v => Math.min(255, Math.round(v + (255 - v) * 0.18));
    // Dark = darken by ~15%
    const darken  = v => Math.max(0,   Math.round(v * 0.82));

    const toHex = (r, g, b) => '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    return {
        hover: toHex(lighten(r), lighten(g), lighten(b)),
        dark:  toHex(darken(r),  darken(g),  darken(b)),
    };
}

/** Apply a theme object to the document CSS variables immediately */
export function applyTheme(theme) {
    const root = document.documentElement;
    const hex = theme.accent || DEFAULT_THEME.accent;
    const { hover, dark } = deriveVariants(hex);

    root.style.setProperty('--accent-primary', hex);
    root.style.setProperty('--accent-hover',   hover);
    root.style.setProperty('--accent-dark',    dark);
    root.style.setProperty('--border-color',   hexToRgba(hex, 0.25));

    // Glitch animation toggle
    if (theme.glitch) {
        root.style.removeProperty('--glitch-display');
    } else {
        root.style.setProperty('--glitch-display', 'none');
    }

    // Glow effect toggle — zero out hover shadow when off
    root.style.setProperty(
        '--hover-glow',
        theme.glow ? `0 0 25px ${hexToRgba(hex, 0.35)}` : 'none'
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
