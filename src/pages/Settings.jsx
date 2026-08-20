import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth-handler';
import { auth, loadUserSettings, saveUserSettings } from '../services/firebase';
import { loadTheme, setTheme, ACCENT_COLORS } from '../services/theme';
import { getSearchBarStyle, setSearchBarStyle } from '../components/ui/SearchBar';
import SearchBar from '../components/ui/SearchBar';
import Icon from '../components/ui/Icon';
import { 
    loadLayoutConfig, 
    saveLayoutConfig, 
    DEFAULT_NAV_ITEMS,
    DEFAULT_LAYOUT 
} from '../services/layoutConfig';

/* ─────────────────────────────────────────────────────────────
   Shared micro-components
───────────────────────────────────────────────────────────── */
function SectionCard({ id, children, style = {} }) {
    return (
        <div id={id} style={{
            background: 'linear-gradient(145deg, rgba(20,20,32,0.9), rgba(12,12,20,0.95))',
            border: '1px solid rgba(6,182,212,0.18)',
            borderRadius: 'var(--radius-large, 16px)',
            padding: '26px',
            marginBottom: '18px',
            backdropFilter: 'var(--glass-blur, blur(10px))',
            scrollMarginTop: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            ...style
        }}>
            {children}
        </div>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(6,182,212,0.12)'
        }}>
            <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <Icon name={icon} size={18} />
            </span>
            <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
            }}>
                {children}
            </span>
        </div>
    );
}

function FieldLabel({ children }) {
    return (
        <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '8px'
        }}>
            {children}
        </label>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: '42px',
                height: '24px',
                borderRadius: '12px',
                background: checked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.12)',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.25s ease',
                boxShadow: checked ? '0 0 12px var(--accent-primary)' : 'none',
            }}
        >
            <div style={{
                position: 'absolute',
                top: '3px',
                left: checked ? '21px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.22s cubic-bezier(.4,0,.2,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
            }} />
        </div>
    );
}

const TAB_SECTIONS = {
    account: [
        { id: 'profile', label: 'Profile' }
    ],
    security: [
        { id: 'connected-accounts', label: 'Connected Accounts' },
        { id: 'sessions', label: 'Session Management' }
    ],
    appearance: [
        { id: 'docking', label: 'Sidebar Docking' },
        { id: 'sidebar-style', label: 'Sidebar Mode' },
        { id: 'nav-order', label: 'Tab Hierarchy' },
        { id: 'search-placement', label: 'Search Placement' },
        { id: 'theme', label: 'Color Spectrum' },
        { id: 'search-style', label: 'Search Bar Style' },
        { id: 'glass-shader', label: 'Glass Shaders' },
        { id: 'corners', label: 'Corner Geometry' },
        { id: 'density', label: 'UI Density' },
        { id: 'matrix-controls', label: 'Matrix Rain' },
        { id: 'effects', label: 'Interface Effects' },
    ],
    notifications: [
        { id: 'alerts', label: 'Alert Preferences' }
    ]
};

/* ─────────────────────────────────────────────────────────────
   Main Settings component
───────────────────────────────────────────────────────── */
export default function Settings({ user, onLogout }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('appearance');
    const [activeSection, setActiveSection] = useState('docking');

    // Guest detection
    const isGuest = !user?.email;

    // My Account
    const [displayName, setDisplayName] = useState(user?.username || '');
    const [saveStatus, setSaveStatus] = useState('');
    const [saving, setSaving] = useState(false);

    // Security
    const [signingOut, setSigningOut] = useState(false);
    const [securityMsg, setSecurityMsg] = useState('');

    // Appearance & Layout
    const initialTheme = useMemo(() => loadTheme(), []);
    const [accentColor, setAccentColor] = useState(initialTheme.accent);
    const [customColor, setCustomColor] = useState(initialTheme.accent);
    const [glitch, setGlitch] = useState(initialTheme.glitch);
    const [glow, setGlow] = useState(initialTheme.glow);
    const [searchBarStyleVal, setSearchBarStyleVal] = useState(() => getSearchBarStyle());
    const [layout, setLayout] = useState(() => loadLayoutConfig());

    // Drag-and-drop state for navigation hierarchy manager
    const [dragNavId, setDragNavId] = useState(null);
    const [dragOverNavId, setDragOverNavId] = useState(null);

    const [cloudSyncing, setCloudSyncing] = useState(false);
    const [cloudMsg, setCloudMsg] = useState('');

    // Load settings from Firestore on mount for logged-in users
    useEffect(() => {
        if (isGuest || !user?.uid) return;
        loadUserSettings(user.uid).then(data => {
            if (!data) return;
            if (data.accent)  { setAccentColor(data.accent); setCustomColor(data.accent); }
            if (data.glitch !== undefined) setGlitch(data.glitch);
            if (data.glow   !== undefined) setGlow(data.glow);
            if (data.searchBarStyle) { setSearchBarStyleVal(data.searchBarStyle); setSearchBarStyle(data.searchBarStyle); }
            if (data.notifications) setNotifs(data.notifications);
            if (data.layoutConfig) {
                setLayout(data.layoutConfig);
                saveLayoutConfig(data.layoutConfig);
            }
        });
    }, [user?.uid]);

    // Apply theme changes
    useEffect(() => {
        setTheme({ accent: accentColor, glitch, glow });
    }, [accentColor, glitch, glow]);

    // Apply layout changes
    const updateLayout = (updates) => {
        const next = { ...layout, ...updates };
        setLayout(next);
        saveLayoutConfig(next);
    };

    // Save all settings to Firestore
    const handleSaveToCloud = async () => {
        if (isGuest || !user?.uid) return;
        setCloudSyncing(true);
        setCloudMsg('');
        const result = await saveUserSettings(user.uid, {
            accent: accentColor,
            glitch,
            glow,
            searchBarStyle: searchBarStyleVal,
            notifications: notifs,
            layoutConfig: layout,
        });
        setCloudMsg(result.ok ? 'saved' : (result.error || 'error'));
        setCloudSyncing(false);
        setTimeout(() => setCloudMsg(''), 6000);
    };

    // Notifications
    const [notifs, setNotifs] = useState(() => {
        try {
            const saved = localStorage.getItem('cyberhub_notifications');
            if (saved) return JSON.parse(saved);
        } catch (_) {}
        return { security: true, messages: true, market: false, system: false };
    });

    const handleToggleNotif = (key, val) => {
        setNotifs(prev => {
            const next = { ...prev, [key]: val };
            try {
                localStorage.setItem('cyberhub_notifications', JSON.stringify(next));
            } catch (_) {}
            return next;
        });
    };

    const handleSaveName = async () => {
        setSaving(true);
        setSaveStatus('');
        try {
            const { updateProfile } = await import('firebase/auth');
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
                setSaveStatus('saved');
            }
        } catch (err) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleSignOutAll = async () => {
        setSigningOut(true);
        setSecurityMsg('');
        try {
            await logout();
            if (onLogout) onLogout();
            navigate('/login');
        } catch (err) {
            setSecurityMsg('Error: ' + err.message);
            setSigningOut(false);
        }
    };

    // Drag-and-drop tab ordering handlers
    const onTabDragStart = (e, id) => {
        setDragNavId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };
    const onTabDragOver = (e, id) => {
        e.preventDefault();
        if (dragNavId && dragNavId !== id) setDragOverNavId(id);
    };
    const onTabDrop = (e, targetId) => {
        e.preventDefault();
        if (dragNavId && dragNavId !== targetId) {
            const currentOrder = [...(layout.navOrder || DEFAULT_NAV_ITEMS.map(i => i.id))];
            const draggedIdx = currentOrder.indexOf(dragNavId);
            const targetIdx = currentOrder.indexOf(targetId);
            if (draggedIdx !== -1 && targetIdx !== -1) {
                currentOrder.splice(draggedIdx, 1);
                currentOrder.splice(targetIdx, 0, dragNavId);
                updateLayout({ navOrder: currentOrder });
            }
        }
        setDragNavId(null);
        setDragOverNavId(null);
    };

    const onTabDragEnd = () => {
        setDragNavId(null);
        setDragOverNavId(null);
    };
    const handleDragEnd = onTabDragEnd;

    const moveTab = (id, direction) => {
        const currentOrder = [...(layout.navOrder || DEFAULT_NAV_ITEMS.map(i => i.id))];
        const idx = currentOrder.indexOf(id);
        if (idx === -1) return;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= currentOrder.length) return;
        currentOrder.splice(idx, 1);
        currentOrder.splice(newIdx, 0, id);
        updateLayout({ navOrder: currentOrder });
    };

    const tabs = [
        { id: 'appearance',    icon: 'appearance', label: 'Appearance & Layout' },
        { id: 'account',       icon: 'user',       label: 'My Account' },
        { id: 'security',      icon: 'shield',     label: 'Security' },
        { id: 'notifications', icon: 'bell',       label: 'Notifications' },
    ];

    /* ── Tab content ─────────────────────────────────────────── */
    const renderTab = () => {
        switch (activeTab) {

            // ── APPEARANCE & MODULAR LAYOUT (Arc / Zen Studio) ──
            case 'appearance': return (
                <div className="animate-fade">
                    <PageHeading>Appearance & Modular Layout</PageHeading>

                    {/* 1. Sidebar Docking (Zen Browser style) */}
                    <SectionCard id="docking">
                        <SectionTitle icon="sidebar">Sidebar Docking Position</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                            Choose how the navigation dock attaches to your workspace (inspired by Zen & Arc).
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                            {[
                                { id: 'left',     label: 'Left Dock',     desc: 'Standard vertical', icon: '◀' },
                                { id: 'right',    label: 'Right Dock',    desc: 'Zen right side',    icon: '▶' },
                                { id: 'top',      label: 'Top Navbar',    desc: 'Horizontal header', icon: '▲' },
                                { id: 'floating', label: 'Floating Dock', desc: 'Glass island dock', icon: '✦' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ sidebarPosition: opt.id })}
                                    style={{
                                        padding: '14px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.sidebarPosition === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.sidebarPosition === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={e => { if (layout.sidebarPosition !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { if (layout.sidebarPosition !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                >
                                    <div style={{ fontSize: '1.2rem', marginBottom: '6px', color: layout.sidebarPosition === opt.id ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                        {opt.icon}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: layout.sidebarPosition === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 2. Sidebar Mode (Zen Compact Mode) */}
                    <SectionCard id="sidebar-style">
                        <SectionTitle icon="appearance">Sidebar Display Mode</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { id: 'expanded', label: 'Expanded Mode', desc: 'Full text labels and version tags' },
                                { id: 'compact',  label: 'Compact Mode (Zen)', desc: 'Slim icon-only bar with hover tooltips' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ sidebarMode: opt.id })}
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.sidebarMode === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.sidebarMode === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: layout.sidebarMode === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 3. Drag & Drop Navigation Hierarchy */}
                    <SectionCard id="nav-order">
                        <SectionTitle icon="database">Reorder Navigation Tabs (Drag & Drop)</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                            Drag items or click the arrows to reorder your navigation hierarchy. Changes reflect instantly across the sidebar.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(layout.navOrder || DEFAULT_NAV_ITEMS.map(i => i.id)).map((id, index, arr) => {
                                const item = DEFAULT_NAV_ITEMS.find(n => n.id === id) || { id, name: id.toUpperCase(), icon: 'star', path: '/' + id };
                                return (
                                    <div
                                        key={id}
                                        draggable
                                        onDragStart={(e) => onTabDragStart(e, id)}
                                        onDragOver={(e) => onTabDragOver(e, id)}
                                        onDrop={(e) => onTabDrop(e, id)}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            borderRadius: 'var(--radius-small)',
                                            background: dragOverNavId === id ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.03)',
                                            border: dragOverNavId === id ? '1.5px dashed var(--accent-primary)' : '1px solid var(--border-color)',
                                            cursor: 'grab',
                                            opacity: dragNavId === id ? 0.35 : 1,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>☰</span>
                                            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><Icon name={item.icon} size={16} /></span>
                                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.path}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                disabled={index === 0}
                                                onClick={() => moveTab(id, -1)}
                                                style={miniArrowBtn}
                                            >▲</button>
                                            <button
                                                disabled={index === arr.length - 1}
                                                onClick={() => moveTab(id, 1)}
                                                style={miniArrowBtn}
                                            >▼</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    {/* 4. Search Bar Placement (Arc style) */}
                    <SectionCard id="search-placement">
                        <SectionTitle icon="search">Search Bar Placement</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
                            Choose where universal search lives in your interface.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                            {[
                                { id: 'sidebar',     label: 'Inside Sidebar',     desc: 'Arc style vertical filter' },
                                { id: 'header',      label: 'Top Header Bar',     desc: 'Prominent header search' },
                                { id: 'command-bar', label: 'Command Bar Only',   desc: 'Keep UI clean; use Ctrl+K' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ searchBarPlacement: opt.id })}
                                    style={{
                                        padding: '14px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.searchBarPlacement === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.searchBarPlacement === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: layout.searchBarPlacement === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 5. Theme Accent Colors */}
                    <SectionCard id="theme">
                        <SectionTitle icon="appearance">Color Spectrum</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
                            Choose your interface highlight color or pick a custom hex hue.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            {ACCENT_COLORS.map(c => (
                                <div key={c.hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div
                                        onClick={() => setAccentColor(c.hex)}
                                        style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: c.hex,
                                            cursor: 'pointer',
                                            border: accentColor === c.hex ? '3px solid #fff' : '3px solid transparent',
                                            boxShadow: accentColor === c.hex ? `0 0 18px ${c.hex}99` : `0 0 8px ${c.hex}44`,
                                            transition: 'all 0.2s ease',
                                            transform: accentColor === c.hex ? 'scale(1.15)' : 'scale(1)'
                                        }}
                                        onMouseEnter={e => { if (accentColor !== c.hex) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={e => { if (accentColor !== c.hex) e.currentTarget.style.transform = 'scale(1)'; }}
                                    />
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.name}</span>
                                </div>
                            ))}

                            {/* Custom color picker */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: customColor,
                                        border: !ACCENT_COLORS.find(c => c.hex === accentColor) ? '3px solid #fff' : '3px solid transparent',
                                        boxShadow: !ACCENT_COLORS.find(c => c.hex === accentColor) ? `0 0 18px ${customColor}99` : `0 0 8px ${customColor}44`,
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem',
                                    }}>
                                        <input
                                            type="color"
                                            value={customColor}
                                            onChange={e => {
                                                setCustomColor(e.target.value);
                                                setAccentColor(e.target.value);
                                            }}
                                            style={{
                                                position: 'absolute', inset: 0,
                                                opacity: 0, width: '100%', height: '100%',
                                                cursor: 'pointer', border: 'none', padding: 0
                                            }}
                                            title="Pick custom color"
                                        />
                                        🎨
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Custom</span>
                            </div>
                        </div>

                        {/* Save to cloud button */}
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isGuest ? (
                                <div style={{
                                    fontSize: '0.8rem', color: '#f59e0b',
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    borderRadius: '8px', padding: '8px 14px',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    ⚠️ Changes are saved locally only. Sign in to sync across devices.
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="cyber-button"
                                        onClick={handleSaveToCloud}
                                        disabled={cloudSyncing}
                                        style={{ fontSize: '0.78rem', padding: '9px 18px' }}
                                    >
                                        {cloudSyncing ? 'SYNCING...' : '☁ SAVE ALL TO CLOUD'}
                                    </button>
                                    {cloudMsg === 'saved' && <span style={{ fontSize: '0.82rem', color: '#00ff88' }}>✓ Synced layout & theme to your account</span>}
                                    {cloudMsg && cloudMsg !== 'saved' && (
                                        <span style={{ fontSize: '0.78rem', color: '#ff4444', maxWidth: '300px', lineHeight: '1.4' }}>
                                            ✕ {cloudMsg}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>

                    {/* 6. Search Bar Visual Styles */}
                    <SectionCard id="search-style">
                        <SectionTitle icon="settings">Search Bar Style</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { id: 'glass',      label: 'Glass',       desc: 'Frosted-glass box with focus glow' },
                                { id: 'pill',       label: 'Pill',        desc: 'Fully rounded capsule shape' },
                                { id: 'underline',  label: 'Underline',   desc: 'Minimal flat with bottom border only' },
                                { id: 'neumorphic', label: 'Neumorphic',  desc: 'Soft 3D extruded look with deep shadows' },
                                { id: 'terminal',   label: 'Terminal',    desc: 'Blocky, square monospace hacking input' },
                                { id: 'cyber',      label: 'Cyber-Tech',  desc: 'Angled borders for a futuristic look' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => { setSearchBarStyleVal(opt.id); setSearchBarStyle(opt.id); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-medium)',
                                        border: searchBarStyleVal === opt.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: searchBarStyleVal === opt.id ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.88rem', marginBottom: '2px', color: searchBarStyleVal === opt.id ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '6px 12px',
                                        background: opt.id === 'glass' ? 'rgba(0,0,0,0.25)' : opt.id === 'pill' ? 'rgba(255,255,255,0.04)' : 'transparent',
                                        border: opt.id === 'underline' ? 'none' : '1px solid var(--border-color)',
                                        borderBottom: opt.id === 'underline' ? '2px solid var(--border-color)' : undefined,
                                        borderRadius: opt.id === 'pill' ? '999px' : opt.id === 'glass' ? 'var(--radius-small)' : '0',
                                        color: 'var(--text-muted)', fontSize: '0.78rem', width: '120px', pointerEvents: 'none',
                                    }}>
                                        🔍 Preview…
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 7. Glass Shader & Backdrop Blur */}
                    <SectionCard id="glass-shader">
                        <SectionTitle icon="sparkles">Glassmorphism & Transparency</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                            {[
                                { id: 'subtle',   label: 'Subtle Frost',  blur: '10px' },
                                { id: 'standard', label: 'Standard Glass', blur: '24px' },
                                { id: 'heavy',    label: 'Heavy Acrylic', blur: '36px' },
                                { id: 'solid',    label: 'Solid Matte',   blur: 'None' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ glassLevel: opt.id })}
                                    style={{
                                        padding: '12px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.glassLevel === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.glassLevel === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: layout.glassLevel === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Blur: {opt.blur}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 8. Corner Geometry */}
                    <SectionCard id="corners">
                        <SectionTitle icon="appearance">Corner Geometry</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                            {[
                                { id: 'cyber-chamfer', label: 'Cyber Chamfer', radius: '4px-10px' },
                                { id: 'rounded',       label: 'Smooth Rounded', radius: '8px-14px' },
                                { id: 'sharp',         label: 'Sharp Square',  radius: '0px' },
                                { id: 'pill',          label: 'Organic Pill',  radius: '12px-24px' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ borderStyle: opt.id })}
                                    style={{
                                        padding: '12px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.borderStyle === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.borderStyle === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: layout.borderStyle === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.radius}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 9. UI Density */}
                    <SectionCard id="density">
                        <SectionTitle icon="settings">UI Density</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {[
                                { id: 'compact',   label: 'Compact',   desc: 'Information dense' },
                                { id: 'balanced',  label: 'Balanced',  desc: 'Recommended' },
                                { id: 'spacious',  label: 'Spacious',  desc: 'Roomy comfort' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateLayout({ uiDensity: opt.id })}
                                    style={{
                                        padding: '12px',
                                        borderRadius: 'var(--radius-small)',
                                        border: layout.uiDensity === opt.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: layout.uiDensity === opt.id ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: layout.uiDensity === opt.id ? 'var(--accent-primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 10. Matrix Rain Background Shaders */}
                    <SectionCard id="matrix-controls">
                        <SectionTitle icon="sparkles">Matrix Digital Rain Controls</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Matrix Rain Background</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Falling character shader background</div>
                                </div>
                                <Toggle 
                                    checked={layout.matrixBackground?.enabled ?? true}
                                    onChange={(val) => updateLayout({
                                        matrixBackground: { ...(layout.matrixBackground || {}), enabled: val }
                                    })}
                                />
                            </div>

                            {layout.matrixBackground?.enabled && (
                                <>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                            <span>Falling Speed (Faster ↔ Slower)</span>
                                            <span>{layout.matrixBackground?.speed || 50}ms</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="20"
                                            max="120"
                                            step="5"
                                            value={layout.matrixBackground?.speed || 50}
                                            onChange={(e) => updateLayout({
                                                matrixBackground: { ...(layout.matrixBackground || {}), speed: Number(e.target.value) }
                                            })}
                                            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                            <span>Shader Opacity</span>
                                            <span>{Math.round((layout.matrixBackground?.opacity ?? 0.8) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={layout.matrixBackground?.opacity ?? 0.8}
                                            onChange={(e) => updateLayout({
                                                matrixBackground: { ...(layout.matrixBackground || {}), opacity: Number(e.target.value) }
                                            })}
                                            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </SectionCard>

                    {/* 11. Interface Effects */}
                    <SectionCard id="effects">
                        <SectionTitle icon="appearance">Interface Effects</SectionTitle>
                        {[
                            { label: 'Glitch Animations', desc: 'Adds CRT-style glitch effects on UI elements', key: 'glitch', val: glitch, set: setGlitch },
                            { label: 'Hover Glow',        desc: 'Glow on interactive elements',               key: 'glow',   val: glow,   set: setGlow   },
                        ].map(opt => (
                            <div key={opt.key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '3px' }}>{opt.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                                <Toggle checked={opt.val} onChange={opt.set} />
                            </div>
                        ))}
                    </SectionCard>
                </div>
            );

            // ── MY ACCOUNT ──
            case 'account': return (
                <div className="animate-fade">
                    <PageHeading>My Account</PageHeading>

                    <SectionCard id="profile">
                        <SectionTitle icon="user">Profile</SectionTitle>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="avatar" style={{
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        border: '2px solid var(--accent-primary)',
                                        objectFit: 'cover',
                                        boxShadow: '0 0 20px rgba(6,182,212,0.35)'
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(0,212,255,0.2))',
                                        border: '2px solid var(--accent-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        boxShadow: '0 0 20px rgba(6,182,212,0.3)'
                                    }}>👤</div>
                                )}
                                <div style={{
                                    position: 'absolute', bottom: '3px', right: '3px',
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: '#00ff88',
                                    border: '2px solid var(--bg-base)',
                                    boxShadow: '0 0 8px rgba(0,255,136,0.6)'
                                }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                                    {user?.username || 'Operative'}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email || '—'}</div>
                                <div style={{
                                    marginTop: '8px', fontSize: '0.7rem', fontWeight: '600',
                                    letterSpacing: '0.08em', color: '#00ff88',
                                    display: 'flex', alignItems: 'center', gap: '5px'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                                    ACTIVE NODE
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <FieldLabel>Display Name</FieldLabel>
                            <input
                                type="text"
                                className="input-field"
                                value={displayName}
                                onChange={e => { setDisplayName(e.target.value); setSaveStatus(''); }}
                                placeholder="Your operative codename"
                                style={{ fontSize: '0.95rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <FieldLabel>Email Address</FieldLabel>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={user?.email || ''}
                                    readOnly
                                    style={{ opacity: 0.5, cursor: 'not-allowed', paddingRight: '90px' }}
                                />
                                <span style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.1em',
                                    color: 'var(--text-muted)',
                                    background: 'rgba(255,255,255,0.06)',
                                    padding: '3px 8px', borderRadius: '6px'
                                }}>READ ONLY</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button className="cyber-button" onClick={handleSaveName} disabled={saving}>
                                {saving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            {saveStatus === 'saved' && (
                                <span style={{ fontSize: '0.82rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    ✓ Saved successfully
                                </span>
                            )}
                            {saveStatus === 'error' && (
                                <span style={{ fontSize: '0.82rem', color: '#ff4444' }}>
                                    ✕ Failed to save
                                </span>
                            )}
                        </div>
                    </SectionCard>
                </div>
            );

            // ── SECURITY ──
            case 'security': return (
                <div className="animate-fade">
                    <PageHeading>Security</PageHeading>

                    <SectionCard id="connected-accounts">
                        <SectionTitle icon="google">Connected Accounts</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.6' }}>
                            Your Cyber-Hub identity is authenticated through the following provider.
                        </p>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 18px',
                            borderRadius: '12px',
                            background: 'rgba(66,133,244,0.07)',
                            border: '1px solid rgba(66,133,244,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(66,133,244,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon name="google" size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>Google</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email || '—'}</div>
                                </div>
                            </div>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em',
                                color: user?.email ? '#00ff88' : '#ff4444',
                                background: user?.email ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)',
                                border: user?.email ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,68,68,0.25)',
                                padding: '4px 12px', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: user?.email ? '#00ff88' : '#ff4444', boxShadow: user?.email ? '0 0 6px #00ff88' : '0 0 6px #ff4444' }} />
                                {user?.email ? 'VERIFIED' : 'NOT CONNECTED'}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard id="sessions">
                        <SectionTitle icon="shield">Session Management</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: '1.6' }}>
                            Terminate all active sessions for your account. You will be redirected to the login screen.
                        </p>

                        {securityMsg && (
                            <div style={{
                                background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)',
                                color: '#ff4444', padding: '10px 14px', borderRadius: '8px',
                                fontSize: '0.84rem', marginBottom: '16px'
                            }}>
                                {securityMsg}
                            </div>
                        )}

                        <button
                            onClick={handleSignOutAll}
                            disabled={signingOut}
                            style={{
                                background: 'rgba(255,68,68,0.07)',
                                border: '1px solid rgba(255,68,68,0.4)',
                                color: '#ff6666',
                                padding: '11px 22px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                letterSpacing: '0.1em',
                                cursor: signingOut ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Icon name="close" size={16} />
                            {signingOut ? 'DISCONNECTING...' : 'SIGN OUT ALL DEVICES'}
                        </button>
                    </SectionCard>
                </div>
            );

            // ── NOTIFICATIONS ──
            case 'notifications': return (
                <div className="animate-fade">
                    <PageHeading>Notifications</PageHeading>

                    <SectionCard id="alerts">
                        <SectionTitle icon="bell">Alert Preferences</SectionTitle>
                        {[
                            { key: 'security', title: 'Security Alerts',      desc: 'New device or suspicious login detected' },
                            { key: 'messages', title: 'Direct Messages',       desc: 'Incoming secure transmissions' },
                            { key: 'market',   title: 'Market Updates',        desc: 'Daily crypto & stock movement summary' },
                            { key: 'system',   title: 'System Announcements',  desc: 'Network-wide broadcasts from Nexus Core' },
                        ].map((opt, i, arr) => (
                            <div key={opt.key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.92rem', marginBottom: '4px' }}>{opt.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                                <Toggle
                                    checked={notifs[opt.key]}
                                    onChange={v => handleToggleNotif(opt.key, v)}
                                />
                            </div>
                        ))}
                    </SectionCard>
                </div>
            );

            default: return null;
        }
    };

    /* ── Layout ─────────────────────────────────────────────── */
    return (
        <div className="settings-layout" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>

            {/* ── Left Settings Sub-Sidebar (Discord-Style with Scroll Spy) ── */}
            <div className="settings-sidebar" style={{
                width: '260px',
                height: '100%',
                background: 'rgba(12, 12, 18, 0.95)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                flexShrink: 0,
                overflowY: 'auto'
            }}>
                {/* User mini-card */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', marginBottom: '28px',
                    background: 'rgba(6,182,212,0.06)',
                    border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: '12px'
                }}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            objectFit: 'cover', border: '1.5px solid var(--accent-primary)', flexShrink: 0
                        }} />
                    ) : (
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(6,182,212,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', flexShrink: 0
                        }}>👤</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.username || 'Operative'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email || 'Guest Session'}
                        </div>
                    </div>
                </div>

                {/* Section label */}
                <div style={{
                    fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.15em',
                    color: 'rgba(136,136,153,0.6)', padding: '0 12px', marginBottom: '8px'
                }}>
                    SETTINGS & STUDIO
                </div>

                {/* Main Tabs List */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <React.Fragment key={tab.id}>
                                <button
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        const firstSec = TAB_SECTIONS[tab.id]?.[0]?.id;
                                        if (firstSec) setActiveSection(firstSec);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: isActive ? 'rgba(6,182,212,0.14)' : 'transparent',
                                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontWeight: isActive ? '600' : '400',
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'all 0.18s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                            width: '3px', borderRadius: '0 3px 3px 0',
                                            background: 'var(--accent-primary)',
                                            boxShadow: '0 0 8px var(--accent-primary)'
                                        }} />
                                    )}
                                    <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', display: 'flex' }}>
                                        <Icon name={tab.icon} size={17} />
                                    </span>
                                    {tab.label}
                                </button>
                                
                                {/* Scroll Spy Sub-navigation (Discord Style) */}
                                {isActive && TAB_SECTIONS[tab.id]?.length > 1 && (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        paddingLeft: '32px', margin: '4px 0 12px 0',
                                        position: 'relative'
                                    }}>
                                        {/* Vertical line indicator */}
                                        <div style={{
                                            position: 'absolute', left: '20px', top: '8px', bottom: '8px',
                                            width: '2px', background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '2px'
                                        }} />

                                        {TAB_SECTIONS[tab.id].map(sec => {
                                            const isSecActive = activeSection === sec.id;
                                            return (
                                                <button
                                                    key={sec.id}
                                                    onClick={() => {
                                                        setActiveSection(sec.id);
                                                        const el = document.getElementById(sec.id);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    style={{
                                                        background: 'transparent', border: 'none',
                                                        textAlign: 'left', padding: '5px 12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: isSecActive ? '600' : '400',
                                                        color: isSecActive ? 'var(--text-main)' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        transition: 'color 0.15s ease',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={e => { if (!isSecActive) e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { if (!isSecActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                                                >
                                                    {isSecActive && (
                                                        <div style={{
                                                            position: 'absolute', left: '-12px', top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            width: '2px', height: '14px',
                                                            background: 'var(--accent-primary)',
                                                            borderRadius: '2px', zIndex: 2
                                                        }} />
                                                    )}
                                                    {sec.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>

                {/* Bottom Back Button */}
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <button
                        onClick={() => navigate('/lobby')}
                        style={{
                            width: '100%', padding: '10px',
                            borderRadius: '10px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-muted)',
                            fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.05em',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = 'var(--text-main)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        ← Back to Hub
                    </button>
                </div>
            </div>

            {/* ── Content Area with Live Scroll Tracking ── */}
            <div 
                className="settings-content"
                style={{
                    flex: 1,
                    height: '100%',
                    overflowY: 'auto',
                    padding: '36px 48px',
                    position: 'relative',
                }}
                onScroll={(e) => {
                    const sections = TAB_SECTIONS[activeTab];
                    if (!sections || sections.length < 2) return;
                    
                    let currentSection = sections[0].id;
                    const containerTop = e.target.getBoundingClientRect().top;

                    for (const sec of sections) {
                        const el = document.getElementById(sec.id);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.top - containerTop <= 160) {
                                currentSection = sec.id;
                            }
                        }
                    }
                    setActiveSection(currentSection);
                }}
            >
                {/* Close (ESC) Button */}
                <button
                    onClick={() => navigate('/lobby')}
                    style={{
                        position: 'absolute', top: '24px', right: '32px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        width: '38px', height: '38px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'var(--text-main)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                    title="Close (ESC)"
                >
                    ✕
                </button>

                {/* Guest Banner */}
                {isGuest && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '12px 18px',
                        background: 'rgba(245,158,11,0.07)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        maxWidth: '680px'
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '3px' }}>Guest Mode</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                Settings and modular layout changes are stored on this machine. <strong style={{ color: '#f59e0b' }}>Sign in to sync your custom setup across all devices.</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content wrapper */}
                <div style={{ maxWidth: '680px' }}>
                    {renderTab()}
                </div>
            </div>
        </div>
    );
}

/* ── Inline helper for page headings ── */
function PageHeading({ children }) {
    return (
        <h2 style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            marginBottom: '24px',
        }}>
            {children}
        </h2>
    );
}

const miniArrowBtn = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'var(--text-main)',
    padding: '3px 8px',
    cursor: 'pointer',
    fontSize: '0.65rem'
};
