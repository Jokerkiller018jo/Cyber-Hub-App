import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { ACCENT_COLORS, setTheme, loadTheme } from '../../services/theme';
import { loadLayoutConfig, saveLayoutConfig, DEFAULT_NAV_ITEMS } from '../../services/layoutConfig';
import { setSearchBarStyle } from './SearchBar';

export default function CommandBar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Construct all executable commands
    const commands = useMemo(() => {
        const currentTheme = loadTheme();
        const currentLayout = loadLayoutConfig();

        const list = [
            // ── Navigation ──
            ...DEFAULT_NAV_ITEMS.map(item => ({
                id: `nav-${item.id}`,
                category: 'Navigation',
                title: item.name,
                subtitle: item.desc || item.path,
                icon: item.icon,
                action: () => {
                    navigate(item.path);
                    onClose();
                }
            })),
            {
                id: 'nav-settings',
                category: 'Navigation',
                title: 'SETTINGS',
                subtitle: 'Preferences, layout studio, theme & security',
                icon: 'settings',
                action: () => {
                    navigate('/settings');
                    onClose();
                }
            },

            // ── Sidebar Docking & Mode ──
            {
                id: 'layout-dock-left',
                category: 'Sidebar Docking',
                title: 'Dock Sidebar to Left',
                subtitle: currentLayout.sidebarPosition === 'left' ? 'Currently Active' : 'Move navigation bar to the left',
                icon: 'sidebar',
                action: () => {
                    saveLayoutConfig({ ...currentLayout, sidebarPosition: 'left' });
                    onClose();
                }
            },
            {
                id: 'layout-dock-right',
                category: 'Sidebar Docking',
                title: 'Dock Sidebar to Right (Zen Style)',
                subtitle: currentLayout.sidebarPosition === 'right' ? 'Currently Active' : 'Move navigation bar to the right',
                icon: 'sidebar',
                action: () => {
                    saveLayoutConfig({ ...currentLayout, sidebarPosition: 'right' });
                    onClose();
                }
            },
            {
                id: 'layout-dock-top',
                category: 'Sidebar Docking',
                title: 'Dock Navigation to Top Navbar',
                subtitle: currentLayout.sidebarPosition === 'top' ? 'Currently Active' : 'Convert sidebar to horizontal top navbar',
                icon: 'browser',
                action: () => {
                    saveLayoutConfig({ ...currentLayout, sidebarPosition: 'top' });
                    onClose();
                }
            },
            {
                id: 'layout-dock-floating',
                category: 'Sidebar Docking',
                title: 'Floating Icon Dock Mode',
                subtitle: currentLayout.sidebarPosition === 'floating' ? 'Currently Active' : 'Compact floating glass island dock',
                icon: 'sparkles',
                action: () => {
                    saveLayoutConfig({ ...currentLayout, sidebarPosition: 'floating' });
                    onClose();
                }
            },
            {
                id: 'layout-toggle-compact',
                category: 'Sidebar Style',
                title: currentLayout.sidebarMode === 'compact' ? 'Expand Sidebar (Show Labels)' : 'Compact Sidebar (Icons Only)',
                subtitle: 'Toggle slim icon-only sidebar mode with hover tooltips',
                icon: 'appearance',
                action: () => {
                    const nextMode = currentLayout.sidebarMode === 'compact' ? 'expanded' : 'compact';
                    saveLayoutConfig({ ...currentLayout, sidebarMode: nextMode });
                    onClose();
                }
            },

            // ── Themes & Color Accents ──
            ...ACCENT_COLORS.map(c => ({
                id: `theme-${c.hex}`,
                category: 'Theme Accents',
                title: `Switch Theme to ${c.name}`,
                subtitle: c.hex,
                icon: 'appearance',
                badgeColor: c.hex,
                action: () => {
                    setTheme({ ...currentTheme, accent: c.hex });
                    onClose();
                }
            })),

            // ── Search Bar Styles ──
            {
                id: 'search-pill',
                category: 'Search Bar Styles',
                title: 'Search Style: Pill',
                subtitle: 'Fully rounded capsule shape',
                icon: 'search',
                action: () => {
                    setSearchBarStyle('pill');
                    onClose();
                }
            },
            {
                id: 'search-glass',
                category: 'Search Bar Styles',
                title: 'Search Style: Glass',
                subtitle: 'Frosted glass with glow on focus',
                icon: 'search',
                action: () => {
                    setSearchBarStyle('glass');
                    onClose();
                }
            },
            {
                id: 'search-neumorphic',
                category: 'Search Bar Styles',
                title: 'Search Style: Neumorphic',
                subtitle: 'Soft 3D extruded look with deep shadows',
                icon: 'search',
                action: () => {
                    setSearchBarStyle('neumorphic');
                    onClose();
                }
            },
            {
                id: 'search-cyber',
                category: 'Search Bar Styles',
                title: 'Search Style: Cyber-Tech',
                subtitle: 'Angled futuristic cyber chamfer borders',
                icon: 'search',
                action: () => {
                    setSearchBarStyle('cyber');
                    onClose();
                }
            },
            {
                id: 'search-terminal',
                category: 'Search Bar Styles',
                title: 'Search Style: Terminal',
                subtitle: 'Blocky monospace hacker input',
                icon: 'search',
                action: () => {
                    setSearchBarStyle('terminal');
                    onClose();
                }
            },

            // ── UI Effects ──
            {
                id: 'toggle-matrix-bg',
                category: 'Visual Shaders',
                title: currentLayout.matrixBackground?.enabled ? 'Disable Matrix Rain Background' : 'Enable Matrix Rain Background',
                subtitle: 'Digital cascading character rain',
                icon: 'sparkles',
                action: () => {
                    const enabled = !currentLayout.matrixBackground?.enabled;
                    saveLayoutConfig({
                        ...currentLayout,
                        matrixBackground: { ...currentLayout.matrixBackground, enabled }
                    });
                    onClose();
                }
            },
            {
                id: 'toggle-glow',
                category: 'Visual Shaders',
                title: currentTheme.glow ? 'Disable Hover Glow' : 'Enable Hover Glow',
                subtitle: 'Interactive element neon aura',
                icon: 'sparkles',
                action: () => {
                    setTheme({ ...currentTheme, glow: !currentTheme.glow });
                    onClose();
                }
            },
            {
                id: 'toggle-glitch',
                category: 'Visual Shaders',
                title: currentTheme.glitch ? 'Disable CRT Glitch Animations' : 'Enable CRT Glitch Animations',
                subtitle: 'Cyberpunk CRT distortion effect',
                icon: 'sparkles',
                action: () => {
                    setTheme({ ...currentTheme, glitch: !currentTheme.glitch });
                    onClose();
                }
            }
        ];

        return list;
    }, [navigate, onClose]);

    // Filter commands by user query
    const filtered = useMemo(() => {
        if (!query.trim()) return commands;
        const q = query.toLowerCase();
        return commands.filter(c => 
            c.title.toLowerCase().includes(q) || 
            c.category.toLowerCase().includes(q) || 
            c.subtitle.toLowerCase().includes(q)
        );
    }, [commands, query]);

    // Reset selected index when filtered list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filtered.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    filtered[selectedIndex].action();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onClose]);

    // Scroll active item into view
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        if (el) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '12vh',
                animation: 'fadeIn 0.15s ease-out',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '640px',
                    background: 'linear-gradient(180deg, rgba(24, 24, 32, 0.96) 0%, rgba(14, 14, 20, 0.98) 100%)',
                    border: '1px solid var(--border-highlight)',
                    borderRadius: 'var(--radius-large)',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '68vh',
                }}
            >
                {/* Search input header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'rgba(0,0,0,0.25)',
                }}>
                    <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                        <Icon name="search" size={20} />
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type a command, module name, theme or action..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-main)',
                            fontSize: '1.05rem',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                        }}
                    />
                    <kbd style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                    }}>
                        ESC
                    </kbd>
                </div>

                {/* Results list */}
                <div
                    ref={listRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                    }}
                >
                    {filtered.length === 0 ? (
                        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No commands matching "{query}"
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            return (
                                <div
                                    key={item.id}
                                    data-index={idx}
                                    onClick={() => item.action()}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '10px 14px',
                                        borderRadius: 'var(--radius-medium)',
                                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.12s ease, border-color 0.12s ease',
                                    }}
                                >
                                    {/* Icon or Color swatch */}
                                    {item.badgeColor ? (
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: item.badgeColor,
                                            boxShadow: `0 0 10px ${item.badgeColor}88`,
                                            flexShrink: 0
                                        }} />
                                    ) : (
                                        <span style={{
                                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                                            display: 'flex',
                                            flexShrink: 0
                                        }}>
                                            <Icon name={item.icon || 'star'} size={18} />
                                        </span>
                                    )}

                                    {/* Text info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            color: isSelected ? 'var(--text-main)' : 'var(--text-main)',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.75rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.subtitle}
                                        </div>
                                    </div>

                                    {/* Category badge */}
                                    <span style={{
                                        fontSize: '0.68rem',
                                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}>
                                        {item.category}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 18px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'rgba(0,0,0,0.3)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                }}>
                    <div style={{ display: 'flex', gap: '14px' }}>
                        <span><kbd style={kbdStyle}>↑</kbd> <kbd style={kbdStyle}>↓</kbd> Navigate</span>
                        <span><kbd style={kbdStyle}>↵</kbd> Select</span>
                        <span><kbd style={kbdStyle}>ESC</kbd> Close</span>
                    </div>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Arc Command Bar</span>
                </div>
            </div>
        </div>
    );
}

const kbdStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    border: '1px solid rgba(255, 255, 255, 0.1)',
};
