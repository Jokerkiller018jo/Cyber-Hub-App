/**
 * layoutConfig.js — Arc & Zen Browser-inspired Modular Layout Engine
 * Manages sidebar docking (Left/Right/Top/Floating), compact vs expanded modes,
 * drag-and-drop tab ordering, search bar placement, glass shaders, dynamic backgrounds, and corner styles.
 */

const STORAGE_KEY = 'cyberhub_layout_config';

export const DEFAULT_NAV_ITEMS = [
    { id: 'lobby',       path: '/lobby',       name: 'LOBBY',      icon: 'home',      desc: 'Main overview & modules' },
    { id: 'market',      path: '/market',      name: 'MARKET',     icon: 'chart',     desc: 'Live financial tracker' },
    { id: 'currencies',  path: '/currencies',  name: 'CURRENCIES', icon: 'bank',      desc: 'Fiat & Forex converter' },
    { id: 'symbols',     path: '/symbols',     name: 'VAULT',      icon: 'database',  desc: 'Unicode symbols & tools' },
    { id: 'extensions',  path: '/extensions',  name: 'EXTENSIONS', icon: 'extension', desc: 'Cyber addons & modular tools' },
];

export const BACKGROUND_CATEGORIES = [
    {
        id: 'gradient',
        name: 'Gradient & Color Effects',
        items: [
            { id: 'moving-gradient',   name: 'Moving Gradient',      desc: 'Smooth, looping multi-colored gradient flow', icon: 'sparkles' },
            { id: 'liquid-gradient',   name: 'Liquid Gradient',      desc: 'Fluid mesh warping distortion effect',       icon: 'palette' },
            { id: 'floating-orbs',     name: 'Floating Color Orbs',  desc: 'Soft glowing blurred balls floating smoothly', icon: 'sparkles' },
            { id: 'sliding-diagonals', name: 'Sliding Diagonals',    desc: 'Cyberpunk illuminated diagonal moving bands', icon: 'chart' },
            { id: 'animated-wave',     name: 'Animated Wave',        desc: 'Undulating harmonic sine waves',              icon: 'trending-up' },
        ]
    },
    {
        id: 'nature',
        name: 'Nature & Organic Motion',
        items: [
            { id: 'soft-clouds',       name: 'Soft Clouds',          desc: 'Ethereal rolling mist and drifting clouds',   icon: 'globe' },
            { id: 'falling-leaves',    name: 'Falling Leaves',       desc: 'Drifting leaves with gentle sway & rotation', icon: 'symbol' },
            { id: 'gentle-ripples',    name: 'Gentle Ripples',       desc: 'Concentric water ripple waves pulsing softly', icon: 'globe' },
            { id: 'aurora-borealis',   name: 'Aurora Borealis',      desc: 'Waving celestial ribbons of polar light',     icon: 'sparkles' },
            { id: 'snow-flurries',     name: 'Snow Flurries',        desc: 'Gentle snowflakes falling with wind draft',   icon: 'sparkles' },
        ]
    },
    {
        id: 'tech',
        name: 'Tech & Futuristic',
        items: [
            { id: 'matrix-rain',       name: 'Matrix Rain',          desc: 'Classic cascading cyber green/cyan code',     icon: 'code' },
            { id: 'star-particles',    name: 'Star Particles',       desc: 'Connected constellation network web',         icon: 'star' },
            { id: 'digital-lines',     name: 'High-Tech Digital Lines', desc: 'Pulsing neon circuit traces & cyber grid', icon: 'grid' },
            { id: 'hyperspeed-space',  name: 'Hyperspeed Space',     desc: '3D warp-drive starfield streaks',             icon: 'lightning' },
            { id: 'glowing-bokeh',     name: 'Glowing Bokeh',        desc: 'Floating out-of-focus neon hexagons & discs', icon: 'sparkles' },
            { id: 'liquid-metal',      name: 'Liquid Metal',         desc: 'Chrome mercury flow & iridescent waves',      icon: 'shield' },
        ]
    }
];

export const DEFAULT_LAYOUT = {
    sidebarPosition: 'left',       // 'left' | 'right' | 'top' | 'floating'
    sidebarMode: 'expanded',       // 'expanded' | 'compact' | 'autohide'
    searchBarPlacement: 'sidebar', // 'sidebar' | 'header' | 'command-bar'
    navOrder: ['lobby', 'market', 'currencies', 'symbols', 'extensions'],
    glassLevel: 'standard',        // 'subtle' | 'standard' | 'heavy' | 'solid'
    borderStyle: 'cyber-chamfer',  // 'rounded' | 'cyber-chamfer' | 'sharp' | 'pill'
    uiDensity: 'balanced',         // 'compact' | 'balanced' | 'spacious'
    background: {
        enabled: true,
        type: 'matrix-rain',       // One of the 16 background effect types
        speed: 50,                 // 10 to 100
        opacity: 0.8,              // 0.1 to 1.0
    },
    matrixBackground: {
        enabled: true,
        speed: 50,
        opacity: 0.8,
    }
};

/** Load saved layout from localStorage */
export function loadLayoutConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const bg = parsed.background || {
                enabled: parsed.matrixBackground?.enabled ?? true,
                type: parsed.matrixBackground?.enabled === false ? 'none' : 'matrix-rain',
                speed: parsed.matrixBackground?.speed || 50,
                opacity: parsed.matrixBackground?.opacity ?? 0.8
            };

            return {
                ...DEFAULT_LAYOUT,
                ...parsed,
                background: {
                    ...DEFAULT_LAYOUT.background,
                    ...bg
                },
                matrixBackground: {
                    ...DEFAULT_LAYOUT.matrixBackground,
                    ...(parsed.matrixBackground || {})
                }
            };
        }
    } catch (_) {}
    return { ...DEFAULT_LAYOUT };
}

/** Apply layout CSS variables & class hooks to document root */
export function applyLayoutConfig(config = DEFAULT_LAYOUT) {
    const root = document.documentElement;

    // Sidebar width and layout variables
    if (config.sidebarPosition === 'top') {
        root.style.setProperty('--sidebar-width', '100%');
        root.style.setProperty('--sidebar-height', '64px');
    } else if (config.sidebarMode === 'compact') {
        root.style.setProperty('--sidebar-width', '68px');
        root.style.setProperty('--sidebar-height', '100%');
    } else if (config.sidebarPosition === 'floating') {
        root.style.setProperty('--sidebar-width', '74px');
        root.style.setProperty('--sidebar-height', 'auto');
    } else {
        root.style.setProperty('--sidebar-width', '240px');
        root.style.setProperty('--sidebar-height', '100%');
    }

    // Glass Shader
    switch (config.glassLevel) {
        case 'subtle':
            root.style.setProperty('--glass-blur', 'blur(10px)');
            root.style.setProperty('--bg-panel', 'rgba(18, 18, 24, 0.45)');
            break;
        case 'heavy':
            root.style.setProperty('--glass-blur', 'blur(36px)');
            root.style.setProperty('--bg-panel', 'rgba(12, 12, 18, 0.85)');
            break;
        case 'solid':
            root.style.setProperty('--glass-blur', 'none');
            root.style.setProperty('--bg-panel', '#111116');
            break;
        case 'standard':
        default:
            root.style.setProperty('--glass-blur', 'blur(24px)');
            root.style.setProperty('--bg-panel', 'rgba(20, 20, 28, 0.65)');
            break;
    }

    // Corner Geometry
    switch (config.borderStyle) {
        case 'sharp':
            root.style.setProperty('--radius-small', '0px');
            root.style.setProperty('--radius-medium', '0px');
            root.style.setProperty('--radius-large', '0px');
            break;
        case 'pill':
            root.style.setProperty('--radius-small', '12px');
            root.style.setProperty('--radius-medium', '24px');
            root.style.setProperty('--radius-large', '32px');
            break;
        case 'rounded':
            root.style.setProperty('--radius-small', '8px');
            root.style.setProperty('--radius-medium', '14px');
            root.style.setProperty('--radius-large', '18px');
            break;
        case 'cyber-chamfer':
        default:
            root.style.setProperty('--radius-small', '4px');
            root.style.setProperty('--radius-medium', '10px');
            root.style.setProperty('--radius-large', '14px');
            break;
    }

    // UI Density
    switch (config.uiDensity) {
        case 'compact':
            root.style.setProperty('--ui-padding', '12px');
            root.style.setProperty('--element-gap', '8px');
            break;
        case 'spacious':
            root.style.setProperty('--ui-padding', '28px');
            root.style.setProperty('--element-gap', '16px');
            break;
        case 'balanced':
        default:
            root.style.setProperty('--ui-padding', '20px');
            root.style.setProperty('--element-gap', '12px');
            break;
    }
}

/** Save layout configuration & dispatch update event */
export function saveLayoutConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (_) {}
    applyLayoutConfig(config);
    window.dispatchEvent(new CustomEvent('cyberhub_layout_change', { detail: config }));
}

/** React hook / helper to get ordered nav items */
export function getOrderedNavItems(navOrder = DEFAULT_LAYOUT.navOrder) {
    const itemMap = new Map(DEFAULT_NAV_ITEMS.map(item => [item.id, item]));
    const ordered = [];
    
    // Add existing items in specified order
    for (const id of navOrder) {
        if (itemMap.has(id)) {
            ordered.push(itemMap.get(id));
            itemMap.delete(id);
        }
    }
    
    // Append any newly added items not yet in saved order
    for (const remaining of itemMap.values()) {
        ordered.push(remaining);
    }
    
    return ordered;
}
