import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../components/ui/Icon';
import SearchBar from '../components/ui/SearchBar';
import './ColorHistory.css';
import { 
    loadColorHistory, 
    addColorToHistory, 
    removeColorFromHistory, 
    toggleFavoriteColor, 
    clearColorHistory,
    exportColorsToText,
    hexToRGB,
    hexToHSL,
    hslToHex,
    rgbToHex,
    getNearestColorName,
    getContrastRatio,
    generateColorHarmonies
} from '../services/colorHistory';

export default function ColorHistory({ user }) {
    const isGuest = !user?.uid || !user?.email;

    const [history, setHistory] = useState(() => loadColorHistory());
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'hue' | 'brightness'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [copiedId, setCopiedId] = useState(null);
    const [copiedFormat, setCopiedFormat] = useState('');
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('css');
    const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

    // Active Picker Studio State
    const [currentHex, setCurrentHex] = useState('#00F0FF');
    const [currentRgb, setCurrentRgb] = useState({ r: 0, g: 240, b: 255 });
    const [currentHsl, setCurrentHsl] = useState({ h: 184, s: 100, l: 50 });
    const [colorName, setColorName] = useState('Neon Aqua');

    // Check EyeDropper API support
    useEffect(() => {
        setIsEyeDropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
    }, []);

    // Listen to history updates
    useEffect(() => {
        const handleUpdate = (e) => {
            if (e.detail) setHistory(e.detail);
        };
        window.addEventListener('cyberhub_color_history_update', handleUpdate);
        return () => window.removeEventListener('cyberhub_color_history_update', handleUpdate);
    }, []);

    // Sync state when currentHex changes
    const updateFromHex = (hex) => {
        let clean = hex.trim();
        if (!clean.startsWith('#')) clean = '#' + clean;
        if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
            clean = clean.toUpperCase();
            setCurrentHex(clean);
            const [r, g, b] = hexToRGB(clean);
            setCurrentRgb({ r, g, b });
            setCurrentHsl(hexToHSL(clean));
            setColorName(getNearestColorName(clean));
        }
    };

    const handleRgbChange = (channel, val) => {
        const num = Math.max(0, Math.min(255, parseInt(val, 10) || 0));
        const updated = { ...currentRgb, [channel]: num };
        setCurrentRgb(updated);
        const hex = rgbToHex(updated.r, updated.g, updated.b);
        setCurrentHex(hex);
        setCurrentHsl(hexToHSL(hex));
        setColorName(getNearestColorName(hex));
    };

    // Native EyeDropper Action
    const handlePickScreenColor = async () => {
        if (typeof window !== 'undefined' && 'EyeDropper' in window) {
            try {
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                if (result && result.sRGBHex) {
                    const pickedHex = result.sRGBHex.toUpperCase();
                    updateFromHex(pickedHex);
                    const newEntry = addColorToHistory({
                        hex: pickedHex,
                        source: 'Screen EyeDropper'
                    }, user?.uid);
                    setHistory(prev => [newEntry, ...prev.filter(c => c.hex !== pickedHex)]);
                    copyText(pickedHex, 'hero-hex', 'HEX');
                }
            } catch (err) {
                // User canceled or denied eyedropper
            }
        }
    };

    const handleAddCurrentToHistory = () => {
        const newEntry = addColorToHistory({
            hex: currentHex,
            name: colorName,
            source: 'Color Studio'
        }, user?.uid);
        setHistory(prev => [newEntry, ...prev.filter(c => c.hex !== currentHex)]);
        copyText(currentHex, 'hero-hex', 'HEX');
    };

    const handleGenerateRandom = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const hex = rgbToHex(r, g, b);
        updateFromHex(hex);
    };

    const copyText = useCallback((text, id, format = 'HEX') => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setCopiedFormat(format);
        setTimeout(() => setCopiedId(null), 1500);
    }, []);

    const handleDeleteItem = (e, id) => {
        e.stopPropagation();
        const updated = removeColorFromHistory(id, user?.uid);
        setHistory(updated);
    };

    const handleToggleFavorite = (e, id) => {
        e.stopPropagation();
        const updated = toggleFavoriteColor(id, user?.uid);
        setHistory(updated);
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all color picking history?')) {
            const updated = clearColorHistory(user?.uid);
            setHistory(updated);
        }
    };

    // Harmonies for active color
    const harmonies = useMemo(() => generateColorHarmonies(currentHex), [currentHex]);
    const contrastVsWhite = useMemo(() => getContrastRatio(currentHex, '#FFFFFF'), [currentHex]);
    const contrastVsBlack = useMemo(() => getContrastRatio(currentHex, '#000000'), [currentHex]);

    // Filter & Sort History
    const filteredHistory = useMemo(() => {
        let list = [...history];

        // Search Filter
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(item => 
                item.hex.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q) ||
                item.source?.toLowerCase().includes(q)
            );
        }

        // Category Filter
        if (filterCategory === 'favorites') {
            list = list.filter(item => item.isFavorite);
        } else if (filterCategory !== 'all') {
            list = list.filter(item => {
                const { h, s, l } = hexToHSL(item.hex);
                if (filterCategory === 'grayscale') return s < 12 || l < 8 || l > 92;
                if (filterCategory === 'reds') return (h >= 345 || h <= 15) && s >= 12;
                if (filterCategory === 'oranges') return h > 15 && h <= 45 && s >= 12;
                if (filterCategory === 'yellows') return h > 45 && h <= 70 && s >= 12;
                if (filterCategory === 'greens') return h > 70 && h <= 165 && s >= 12;
                if (filterCategory === 'cyans') return h > 165 && h <= 200 && s >= 12;
                if (filterCategory === 'blues') return h > 200 && h <= 260 && s >= 12;
                if (filterCategory === 'purples') return h > 260 && h <= 300 && s >= 12;
                if (filterCategory === 'pinks') return h > 300 && h < 345 && s >= 12;
                return true;
            });
        }

        // Sort
        if (sortBy === 'newest') {
            list.sort((a, b) => b.timestamp - a.timestamp);
        } else if (sortBy === 'oldest') {
            list.sort((a, b) => a.timestamp - b.timestamp);
        } else if (sortBy === 'hue') {
            list.sort((a, b) => hexToHSL(a.hex).h - hexToHSL(b.hex).h);
        } else if (sortBy === 'brightness') {
            list.sort((a, b) => hexToHSL(b.hex).l - hexToHSL(a.hex).l);
        }

        return list;
    }, [history, search, filterCategory, sortBy]);

    const formatTime = (ts) => {
        if (!ts) return 'Recent';
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="color-history-container">
            
            {/* ── Header ── */}
            <header className="ch-header">
                <div className="ch-header-row">
                    <div className="ch-title-wrap">
                        <div className="ch-title-icon">
                            <Icon name="eyedropper" size={20} />
                        </div>
                        <div>
                            <h1 className="ch-title-text">
                                PICKING COLOR HISTORY
                            </h1>
                            <p className="ch-subtitle">
                                Precision screen eyedropper, live color studio, harmonic spectrum analyzer, and pick logs.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats & Cloud Status */}
                    <div className="ch-header-actions">
                        <div style={{
                            padding: '5px 12px', borderRadius: '20px',
                            background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)',
                            color: '#ec4899', fontSize: '0.75rem', fontWeight: 700
                        }}>
                            {history.length} Logged Color{history.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{
                            padding: '5px 12px', borderRadius: '20px',
                            background: isGuest ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 255, 136, 0.1)',
                            border: `1px solid ${isGuest ? 'var(--border-color)' : 'rgba(0, 255, 136, 0.3)'}`,
                            color: isGuest ? 'var(--text-muted)' : '#00ff88', fontSize: '0.75rem', fontWeight: 600
                        }}>
                            {isGuest ? '● Local Storage' : '● Cloud Synced'}
                        </div>
                        <button
                            onClick={() => setExportModalOpen(true)}
                            className="cyber-button"
                            style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Icon name="download" size={14} />
                            EXPORT
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Hero Eyedropper & Color Studio Card ── */}
            <section className="ch-studio-card">
                {/* Visual Ambient Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: currentHex,
                    opacity: 0.14,
                    filter: 'blur(50px)',
                    pointerEvents: 'none'
                }} />

                {/* Left: Swatch & Actions */}
                <div className="ch-studio-preview">
                    <div className="ch-studio-swatch-row">
                        {/* Interactive Color Box */}
                        <div 
                            className="ch-studio-swatch-box"
                            style={{
                                background: currentHex,
                                boxShadow: `0 0 24px ${currentHex}55, 0 6px 16px rgba(0,0,0,0.5)`,
                            }}
                        >
                            <input
                                type="color"
                                value={currentHex}
                                onChange={e => updateFromHex(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0,
                                    cursor: 'pointer',
                                    width: '100%',
                                    height: '100%'
                                }}
                                title="Click to open color palette"
                            />
                        </div>

                        {/* Color Meta */}
                        <div className="ch-studio-info">
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                                Active Color
                            </div>
                            <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.02em', margin: '2px 0' }}>
                                {colorName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    color: currentHex,
                                    background: 'rgba(0,0,0,0.4)',
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {currentHex}
                                </span>
                                <button
                                    onClick={() => copyText(currentHex, 'hero-hex', 'HEX')}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-main)',
                                        padding: '3px 8px',
                                        borderRadius: '5px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {copiedId === 'hero-hex' ? '✓ COPIED' : 'COPY'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ch-studio-actions">
                        {isEyeDropperSupported ? (
                            <button
                                onClick={handlePickScreenColor}
                                style={{
                                    flex: 1,
                                    minWidth: '140px',
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-small, 6px)',
                                    color: '#fff',
                                    padding: '8px 14px',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    letterSpacing: '0.03em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
                                    transition: 'transform 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                                <Icon name="eyedropper" size={16} />
                                PICK SCREEN COLOR
                            </button>
                        ) : (
                            <label style={{
                                flex: 1,
                                minWidth: '140px',
                                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                borderRadius: 'var(--radius-small, 6px)',
                                color: '#fff',
                                padding: '8px 14px',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)'
                            }}>
                                <Icon name="palette" size={16} />
                                PICK COLOR
                                <input
                                    type="color"
                                    value={currentHex}
                                    onChange={e => updateFromHex(e.target.value)}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                />
                            </label>
                        )}

                        <button
                            onClick={handleAddCurrentToHistory}
                            style={{
                                background: 'rgba(0, 240, 255, 0.15)',
                                border: '1px solid #00f0ff',
                                color: '#00f0ff',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-small, 6px)',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <Icon name="plus" size={15} />
                            SAVE
                        </button>

                        <button
                            onClick={handleGenerateRandom}
                            title="Generate Random Cyber Color"
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-small, 6px)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Icon name="wand" size={15} />
                        </button>
                    </div>

                    {/* WCAG Contrast Ratio Badges */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <span style={{ color: 'var(--text-muted)' }}>vs White:</span>
                            <span style={{ color: contrastVsWhite >= 4.5 ? '#00ff88' : '#ff4466', fontWeight: 800 }}>
                                {contrastVsWhite}:1 {contrastVsWhite >= 4.5 ? '✓ AA' : '✕'}
                            </span>
                        </div>
                        <div style={{
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <span style={{ color: 'var(--text-muted)' }}>vs Black:</span>
                            <span style={{ color: contrastVsBlack >= 4.5 ? '#00ff88' : '#ff4466', fontWeight: 800 }}>
                                {contrastVsBlack}:1 {contrastVsBlack >= 4.5 ? '✓ AA' : '✕'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: RGB Sliders & Harmonies */}
                <div className="ch-studio-controls">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="ch-slider-row">
                            <span style={{ width: '16px', color: '#ff4466', fontWeight: 800, fontSize: '0.75rem' }}>R</span>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={currentRgb.r}
                                onChange={e => handleRgbChange('r', e.target.value)}
                                style={{ accentColor: '#ff4466' }}
                            />
                            <span style={{ width: '30px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                                {currentRgb.r}
                            </span>
                        </div>
                        <div className="ch-slider-row">
                            <span style={{ width: '16px', color: '#00ff88', fontWeight: 800, fontSize: '0.75rem' }}>G</span>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={currentRgb.g}
                                onChange={e => handleRgbChange('g', e.target.value)}
                                style={{ accentColor: '#00ff88' }}
                            />
                            <span style={{ width: '30px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                                {currentRgb.g}
                            </span>
                        </div>
                        <div className="ch-slider-row">
                            <span style={{ width: '16px', color: '#00f0ff', fontWeight: 800, fontSize: '0.75rem' }}>B</span>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={currentRgb.b}
                                onChange={e => handleRgbChange('b', e.target.value)}
                                style={{ accentColor: '#00f0ff' }}
                            />
                            <span style={{ width: '30px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                                {currentRgb.b}
                            </span>
                        </div>
                    </div>

                    {/* Harmonies */}
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '6px' }}>
                            Harmonies:
                        </div>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {[
                                ...harmonies.complementary,
                                ...harmonies.triadic,
                                ...harmonies.analogous
                            ].filter((h, idx, arr) => arr.indexOf(h) === idx).slice(0, 7).map((hex, i) => (
                                <div
                                    key={`${hex}-${i}`}
                                    onClick={() => updateFromHex(hex)}
                                    title={`Sample ${hex}`}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '5px',
                                        background: hex,
                                        cursor: 'pointer',
                                        border: currentHex === hex ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                        boxShadow: currentHex === hex ? `0 0 8px ${hex}` : 'none',
                                        transition: 'transform 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Search & Filter Controls ── */}
            <div className="ch-controls-bar">
                <div className="ch-search-container">
                    <SearchBar
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onClear={() => setSearch('')}
                        placeholder="Search by HEX, name, or source…"
                        id="color-history-search"
                    />
                </div>

                <div className="ch-tools-group">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-small, 6px)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">🕒 Newest</option>
                        <option value="oldest">⏳ Oldest</option>
                        <option value="hue">🌈 Hue</option>
                        <option value="brightness">☀️ Brightness</option>
                    </select>

                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                background: viewMode === 'grid' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                                border: 'none',
                                color: viewMode === 'grid' ? '#ec4899' : 'var(--text-muted)',
                                padding: '4px 7px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title="Grid Swatch View"
                        >
                            <Icon name="grid" size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                background: viewMode === 'list' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                                border: 'none',
                                color: viewMode === 'list' ? '#ec4899' : 'var(--text-muted)',
                                padding: '4px 7px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title="List Table View"
                        >
                            <Icon name="browser" size={14} />
                        </button>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            style={{
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                color: '#ff6666',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-small, 6px)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Icon name="trash" size={13} />
                            CLEAR
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filter Chips */}
            <div className="ch-category-scroll">
                {[
                    { id: 'all', label: 'All Colors' },
                    { id: 'favorites', label: '★ Favorites' },
                    { id: 'cyans', label: 'Cyans & Aquas' },
                    { id: 'blues', label: 'Blues' },
                    { id: 'purples', label: 'Purples' },
                    { id: 'pinks', label: 'Pinks & Magentas' },
                    { id: 'reds', label: 'Reds' },
                    { id: 'oranges', label: 'Oranges' },
                    { id: 'yellows', label: 'Yellows' },
                    { id: 'greens', label: 'Greens & Limes' },
                    { id: 'grayscale', label: 'Grayscale & Dark' },
                ].map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className="ch-category-btn"
                        style={{
                            border: `1px solid ${filterCategory === cat.id ? '#ec4899' : 'var(--border-color)'}`,
                            background: filterCategory === cat.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(0,0,0,0.3)',
                            color: filterCategory === cat.id ? '#fff' : 'var(--text-muted)',
                            fontWeight: filterCategory === cat.id ? 700 : 500,
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── Color History Cards Display ── */}
            {filteredHistory.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--text-muted)',
                    background: 'rgba(18, 18, 26, 0.25)',
                    borderRadius: 'var(--radius-large, 12px)',
                    border: '1px dashed var(--border-color)'
                }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎨</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1rem' }}>
                        No Colors in History
                    </div>
                    <p style={{ fontSize: '0.78rem', maxWidth: '380px', margin: '4px auto 14px auto' }}>
                        Use the "PICK SCREEN COLOR" button above or sample colors anywhere across Cyber-Hub to build your palette history.
                    </p>
                    <button
                        onClick={handleGenerateRandom}
                        className="cyber-button"
                        style={{ padding: '7px 16px', fontSize: '0.78rem' }}
                    >
                        Generate First Cyber Color
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="ch-cards-grid">
                    {filteredHistory.map((item) => {
                        const [r, g, b] = hexToRGB(item.hex);
                        const { h, s, l } = hexToHSL(item.hex);

                        return (
                            <div
                                key={item.id}
                                className="card"
                                onClick={() => updateFromHex(item.hex)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '10px',
                                    gap: '8px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    background: 'rgba(18, 18, 26, 0.4)',
                                    border: currentHex === item.hex ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: currentHex === item.hex ? '0 0 14px rgba(236, 72, 153, 0.3)' : 'none',
                                    transition: 'all 0.18s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = '#ec4899';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = currentHex === item.hex ? '#ec4899' : 'rgba(255,255,255,0.08)';
                                }}
                            >
                                {/* Top Badges: Favorite + Delete */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                        {formatTime(item.timestamp)}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <button
                                            onClick={(e) => handleToggleFavorite(e, item.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: item.isFavorite ? '#ffdd00' : 'rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                padding: '0 2px',
                                                lineHeight: 1
                                            }}
                                            title="Toggle Favorite"
                                        >
                                            {item.isFavorite ? '★' : '☆'}
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteItem(e, item.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                padding: '0 2px',
                                                lineHeight: 1
                                            }}
                                            title="Delete from history"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Visual Color Box */}
                                <div style={{
                                    height: '52px',
                                    borderRadius: '7px',
                                    background: item.hex,
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: `0 3px 10px ${item.hex}44`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} />

                                {/* Meta Info */}
                                <div>
                                    <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                        color: item.hex,
                                        letterSpacing: '0.03em'
                                    }}>
                                        {item.hex}
                                    </div>
                                    <div style={{
                                        fontSize: '0.68rem',
                                        color: 'var(--text-main)',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.name}
                                    </div>
                                </div>

                                {/* Copy Actions */}
                                <div style={{ display: 'flex', gap: '3px', marginTop: 'auto' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyText(item.hex, item.id, 'HEX'); }}
                                        style={cardActionBtn}
                                    >
                                        HEX
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyText(`rgb(${r}, ${g}, ${b})`, `${item.id}-rgb`, 'RGB'); }}
                                        style={cardActionBtn}
                                    >
                                        RGB
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyText(`hsl(${h}, ${s}%, ${l}%)`, `${item.id}-hsl`, 'HSL'); }}
                                        style={cardActionBtn}
                                    >
                                        HSL
                                    </button>
                                </div>

                                {/* Toast Badge */}
                                {(copiedId === item.id || copiedId === `${item.id}-rgb` || copiedId === `${item.id}-hsl`) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: '#ec4899',
                                        color: '#fff',
                                        fontSize: '0.55rem',
                                        fontWeight: 800,
                                        padding: '2px 5px',
                                        borderRadius: '4px',
                                        zIndex: 10,
                                        boxShadow: '0 0 8px rgba(236, 72, 153, 0.8)'
                                    }}>
                                        ✓ {copiedFormat}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List Table View */
                <div className="ch-table-wrap">
                    <table className="ch-table">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '8px 12px' }}>SWATCH</th>
                                <th style={{ padding: '8px 12px' }}>NAME</th>
                                <th style={{ padding: '8px 12px' }}>HEX</th>
                                <th style={{ padding: '8px 12px' }}>RGB / HSL</th>
                                <th style={{ padding: '8px 12px' }}>SOURCE</th>
                                <th style={{ padding: '8px 12px' }}>TIME</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((item) => {
                                const [r, g, b] = hexToRGB(item.hex);
                                const { h, s, l } = hexToHSL(item.hex);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => updateFromHex(item.hex)}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '6px 12px' }}>
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '5px',
                                                background: item.hex,
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                boxShadow: `0 0 6px ${item.hex}44`
                                            }} />
                                        </td>
                                        <td style={{ padding: '6px 12px', fontWeight: 700, color: 'var(--text-main)' }}>
                                            {item.name}
                                        </td>
                                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontWeight: 800, color: item.hex }}>
                                            {item.hex}
                                        </td>
                                        <td style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                            rgb({r},{g},{b}) · hsl({h},{s}%,{l}%)
                                        </td>
                                        <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>
                                            {item.source || 'Eyedropper'}
                                        </td>
                                        <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>
                                            {formatTime(item.timestamp)}
                                        </td>
                                        <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyText(item.hex, item.id, 'HEX'); }}
                                                    style={{ ...cardActionBtn, padding: '3px 7px' }}
                                                >
                                                    {copiedId === item.id ? '✓' : 'COPY'}
                                                </button>
                                                <button
                                                    onClick={(e) => handleToggleFavorite(e, item.id)}
                                                    style={{ background: 'transparent', border: 'none', color: item.isFavorite ? '#ffdd00' : 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.9rem' }}
                                                >
                                                    {item.isFavorite ? '★' : '☆'}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteItem(e, item.id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Export Modal ── */}
            {exportModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary, #12121a)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-large, 14px)',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>
                                EXPORT COLOR PALETTE
                            </h3>
                            <button
                                onClick={() => setExportModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Format Tabs */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[
                                { id: 'css', label: 'CSS Variables' },
                                { id: 'tailwind', label: 'Tailwind Config' },
                                { id: 'json', label: 'JSON Data' },
                                { id: 'hex-list', label: 'HEX List' }
                            ].map(fmt => (
                                <button
                                    key={fmt.id}
                                    onClick={() => setExportFormat(fmt.id)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 3px',
                                        borderRadius: '5px',
                                        border: `1px solid ${exportFormat === fmt.id ? '#ec4899' : 'var(--border-color)'}`,
                                        background: exportFormat === fmt.id ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                                        color: exportFormat === fmt.id ? '#fff' : 'var(--text-muted)',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {fmt.label}
                                </button>
                            ))}
                        </div>

                        {/* Code Block Preview */}
                        <textarea
                            readOnly
                            value={exportColorsToText(filteredHistory, exportFormat)}
                            style={{
                                width: '100%',
                                height: '180px',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: '#00f0ff',
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
                                padding: '10px',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                onClick={() => setExportModalOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    padding: '7px 14px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                }}
                            >
                                CLOSE
                            </button>
                            <button
                                onClick={() => {
                                    copyText(exportColorsToText(filteredHistory, exportFormat), 'modal-export', 'Code');
                                }}
                                className="cyber-button"
                                style={{ padding: '7px 18px', fontSize: '0.75rem' }}
                            >
                                {copiedId === 'modal-export' ? '✓ COPIED' : 'COPY CODE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const cardActionBtn = {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-main)',
    fontSize: '0.6rem',
    padding: '3px 1px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.15s'
};
