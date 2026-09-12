/**
 * colorHistory.js — Color Picking History & Extraction Engine
 * Manages picked colors, local/cloud persistence, color naming, conversions, and palette exports.
 */

import { loadUserSettings, saveUserSettings } from './firebase';

const STORAGE_KEY = 'cyberhub_color_history';

// ── Color Conversion Utilities ────────────────────────────────────────────────
export function hexToRGB(hex) {
    let clean = (hex || '#000000').replace(/^#/, '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16) || 0;
    return [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
    ];
}

export function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToHSL(hex) {
    const [r255, g255, b255] = hexToRGB(hex);
    const r = r255 / 255;
    const g = g255 / 255;
    const b = b255 / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            default: break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hslToHex(h, s, l) {
    const lNorm = l / 100;
    const a = (s / 100) * Math.min(lNorm, 1 - lNorm);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function getLuminance(hex) {
    const [r, g, b] = hexToRGB(hex).map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1, hex2) {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return ((bright + 0.05) / (dark + 0.05)).toFixed(2);
}

// ── Color Naming System ───────────────────────────────────────────────────────
const NAMED_PALETTE = [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Ghost White', hex: '#F8F9FA' },
    { name: 'Silver Mist', hex: '#E2E8F0' },
    { name: 'Slate Gray', hex: '#64748B' },
    { name: 'Charcoal Cyber', hex: '#1E293B' },
    { name: 'Obsidian Black', hex: '#0F172A' },
    { name: 'Pure Black', hex: '#000000' },
    { name: 'Neon Red', hex: '#EF4444' },
    { name: 'Crimson Blade', hex: '#DC2626' },
    { name: 'Ruby Glow', hex: '#E11D48' },
    { name: 'Flame Orange', hex: '#F97316' },
    { name: 'Cyber Amber', hex: '#F59E0B' },
    { name: 'Solar Yellow', hex: '#EAB308' },
    { name: 'Electric Lime', hex: '#84CC16' },
    { name: 'Matrix Green', hex: '#22C55E' },
    { name: 'Neon Emerald', hex: '#10B981' },
    { name: 'Cyber Cyan', hex: '#06B6D4' },
    { name: 'Neon Aqua', hex: '#00F0FF' },
    { name: 'Sky Electric', hex: '#0EA5E9' },
    { name: 'Cobalt Blue', hex: '#3B82F6' },
    { name: 'Neon Indigo', hex: '#6366F1' },
    { name: 'Hyper Violet', hex: '#8B5CF6' },
    { name: 'Plasma Purple', hex: '#A855F7' },
    { name: 'Neon Fuchsia', hex: '#D946EF' },
    { name: 'Cyber Pink', hex: '#EC4899' },
    { name: 'Hot Magenta', hex: '#FF007F' },
];

export function getNearestColorName(hex) {
    const [r1, g1, b1] = hexToRGB(hex);
    let minDistance = Infinity;
    let closestName = 'Custom Color';

    for (const item of NAMED_PALETTE) {
        const [r2, g2, b2] = hexToRGB(item.hex);
        // Euclidean distance in RGB color space
        const d = Math.sqrt(
            Math.pow(r1 - r2, 2) + 
            Math.pow(g1 - g2, 2) + 
            Math.pow(b1 - b2, 2)
        );
        if (d < minDistance) {
            minDistance = d;
            closestName = item.name;
        }
    }
    return closestName;
}

// ── Color Harmonies Generator ────────────────────────────────────────────────
export function generateColorHarmonies(hex) {
    const { h, s, l } = hexToHSL(hex);
    return {
        complementary: [
            hex,
            hslToHex((h + 180) % 360, s, l)
        ],
        analogous: [
            hslToHex((h + 330) % 360, s, l),
            hex,
            hslToHex((h + 30) % 360, s, l)
        ],
        triadic: [
            hex,
            hslToHex((h + 120) % 360, s, l),
            hslToHex((h + 240) % 360, s, l)
        ],
        tetradic: [
            hex,
            hslToHex((h + 90) % 360, s, l),
            hslToHex((h + 180) % 360, s, l),
            hslToHex((h + 270) % 360, s, l)
        ],
        monochromatic: [
            hslToHex(h, s, Math.max(10, l - 30)),
            hslToHex(h, s, Math.max(15, l - 15)),
            hex,
            hslToHex(h, s, Math.min(85, l + 15)),
            hslToHex(h, s, Math.min(95, l + 30))
        ]
    };
}

// ── History Storage & Management ─────────────────────────────────────────────
export function loadColorHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (_) {}
    return [
        { id: 'c_init_1', hex: '#00F0FF', name: 'Neon Aqua', timestamp: Date.now() - 3600000 * 2, source: 'Eyedropper', isFavorite: true },
        { id: 'c_init_2', hex: '#A855F7', name: 'Plasma Purple', timestamp: Date.now() - 3600000 * 5, source: 'Picker', isFavorite: true },
        { id: 'c_init_3', hex: '#10B981', name: 'Neon Emerald', timestamp: Date.now() - 3600000 * 12, source: 'Palette', isFavorite: false },
        { id: 'c_init_4', hex: '#FF007F', name: 'Hot Magenta', timestamp: Date.now() - 3600000 * 24, source: 'Spectrum', isFavorite: false },
        { id: 'c_init_5', hex: '#F59E0B', name: 'Cyber Amber', timestamp: Date.now() - 3600000 * 36, source: 'Eyedropper', isFavorite: false }
    ];
}

export function saveLocalColorHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('cyberhub_color_history_update', { detail: history }));
}

/** Add a picked color to history and sync with cloud/local */
export function addColorToHistory(colorInput, userUid = null) {
    let hex = typeof colorInput === 'string' ? colorInput : colorInput.hex;
    if (!hex.startsWith('#')) hex = '#' + hex;
    hex = hex.toUpperCase();

    const name = (typeof colorInput === 'object' && colorInput.name) || getNearestColorName(hex);
    const source = (typeof colorInput === 'object' && colorInput.source) || 'Eyedropper';

    const currentHistory = loadColorHistory();
    const existingIndex = currentHistory.findIndex(c => c.hex === hex);

    const newEntry = {
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        hex,
        name,
        source,
        timestamp: Date.now(),
        isFavorite: existingIndex >= 0 ? currentHistory[existingIndex].isFavorite : false,
        rgb: hexToRGB(hex),
        hsl: hexToHSL(hex)
    };

    // Filter out if already in history and place at top
    const updated = [newEntry, ...currentHistory.filter(c => c.hex !== hex)].slice(0, 300);
    saveLocalColorHistory(updated);

    // Cloud backup if user is logged in
    if (userUid && userUid !== 'anonymous') {
        saveUserSettings(userUid, { colorHistory: updated }).catch(e => console.warn('Color history cloud sync error:', e));
    }

    return newEntry;
}

export function removeColorFromHistory(id, userUid = null) {
    const current = loadColorHistory();
    const updated = current.filter(c => c.id !== id);
    saveLocalColorHistory(updated);

    if (userUid && userUid !== 'anonymous') {
        saveUserSettings(userUid, { colorHistory: updated }).catch(() => {});
    }
    return updated;
}

export function toggleFavoriteColor(id, userUid = null) {
    const current = loadColorHistory();
    const updated = current.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
    saveLocalColorHistory(updated);

    if (userUid && userUid !== 'anonymous') {
        saveUserSettings(userUid, { colorHistory: updated }).catch(() => {});
    }
    return updated;
}

export function clearColorHistory(userUid = null) {
    const updated = [];
    saveLocalColorHistory(updated);

    if (userUid && userUid !== 'anonymous') {
        saveUserSettings(userUid, { colorHistory: updated }).catch(() => {});
    }
    return updated;
}

// ── Export Formats ────────────────────────────────────────────────────────────
export function exportColorsToText(colors, format = 'css') {
    if (!colors || colors.length === 0) return '';

    switch (format) {
        case 'css':
            return `:root {\n` + colors.map((c, i) => `  --color-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || i + 1}: ${c.hex};`).join('\n') + `\n}`;
        case 'tailwind':
            const obj = {};
            colors.forEach((c, i) => {
                const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || `color_${i + 1}`;
                obj[key] = c.hex;
            });
            return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 8)}\n    }\n  }\n};`;
        case 'json':
            return JSON.stringify(colors.map(c => ({
                name: c.name,
                hex: c.hex,
                rgb: hexToRGB(c.hex),
                hsl: hexToHSL(c.hex),
                timestamp: new Date(c.timestamp).toISOString()
            })), null, 2);
        case 'hex-list':
            return colors.map(c => c.hex).join('\n');
        default:
            return colors.map(c => `${c.name}: ${c.hex}`).join('\n');
    }
}
