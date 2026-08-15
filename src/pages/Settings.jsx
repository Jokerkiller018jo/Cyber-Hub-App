import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth-handler';
import { auth, loadUserSettings, saveUserSettings } from '../services/firebase';
import { loadTheme, setTheme, ACCENT_COLORS } from '../services/theme';
import { getSearchBarStyle, setSearchBarStyle } from '../components/ui/SearchBar';
import SearchBar from '../components/ui/SearchBar';
import Icon from '../components/ui/Icon';

/* ─────────────────────────────────────────────────────────────
   Shared micro-components
───────────────────────────────────────────────────────────── */
function SectionCard({ children, style = {} }) {
    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,32,0.9), rgba(12,12,20,0.95))',
            border: '1px solid rgba(6,182,212,0.18)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
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
            marginBottom: '20px',
            paddingBottom: '14px',
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

/* ─────────────────────────────────────────────────────────────
   Main Settings component
───────────────────────────────────────────────────────── */
export default function Settings({ user, onLogout }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');

    // Guest detection — no email means logged in anonymously or not at all
    const isGuest = !user?.email;

    // My Account
    const [displayName, setDisplayName] = useState(user?.username || '');
    const [saveStatus, setSaveStatus] = useState('');
    const [saving, setSaving] = useState(false);

    // Security
    const [signingOut, setSigningOut] = useState(false);
    const [securityMsg, setSecurityMsg] = useState('');

    // Appearance (load initial state from theme service)
    const initialTheme = React.useMemo(() => loadTheme(), []);
    const [accentColor, setAccentColor] = useState(initialTheme.accent);
    const [customColor, setCustomColor] = useState(initialTheme.accent);
    const [glitch, setGlitch] = useState(initialTheme.glitch);
    const [glow, setGlow] = useState(initialTheme.glow);
    const [searchBarStyleVal, setSearchBarStyleVal] = useState(() => getSearchBarStyle());
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
        });
    }, [user?.uid]);

    // Apply and save theme changes
    useEffect(() => {
        setTheme({ accent: accentColor, glitch, glow });
    }, [accentColor, glitch, glow]);

    // Save all settings to Firestore (logged-in only)
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
        });
        setCloudMsg(result.ok ? 'saved' : (result.error || 'error'));
        setCloudSyncing(false);
        setTimeout(() => setCloudMsg(''), 6000);
    };

    // Notifications with localStorage persistence
    const [notifs, setNotifs] = useState(() => {
        try {
            const saved = localStorage.getItem('cyberhub_notifications');
            if (saved) return JSON.parse(saved);
        } catch (_) {}
        return {
            security: true,
            messages: true,
            market: false,
            system: false,
        };
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

    const tabs = [
        { id: 'account',       icon: 'user',       label: 'My Account' },
        { id: 'security',      icon: 'shield',     label: 'Security' },
        { id: 'appearance',    icon: 'appearance', label: 'Appearance' },
        { id: 'notifications', icon: 'bell',       label: 'Notifications' },
    ];


    /* ── Tab content ─────────────────────────────────────────── */
    const renderTab = () => {
        switch (activeTab) {

            case 'account': return (
                <div className="animate-fade">
                    <PageHeading>My Account</PageHeading>

                    <SectionCard>
                        <SectionTitle icon="user">Profile</SectionTitle>

                        {/* Avatar + identity */}
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
                                {/* Online dot */}
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

                        {/* Display name input */}
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

                        {/* Email (read-only) */}
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

            case 'security': return (
                <div className="animate-fade">
                    <PageHeading>Security</PageHeading>

                    {/* Connected accounts */}
                    <SectionCard>
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

                    {/* Session management */}
                    <SectionCard>
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
                            onMouseEnter={e => {
                                if (!signingOut) {
                                    e.currentTarget.style.background = 'rgba(255,68,68,0.15)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255,68,68,0.2)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,68,68,0.07)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Icon name="close" size={16} />
                            {signingOut ? 'DISCONNECTING...' : 'SIGN OUT ALL DEVICES'}
                        </button>
                    </SectionCard>
                </div>
            );

            case 'appearance': return (
                <div className="animate-fade">
                    <PageHeading>Appearance</PageHeading>

                    <SectionCard>
                        <SectionTitle icon="appearance">Accent Color</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
                            Choose your interface highlight color.
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

                        {/* Save to cloud button for logged-in users */}
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
                                        {cloudSyncing ? 'SYNCING...' : '☁ SAVE TO CLOUD'}
                                    </button>
                                    {cloudMsg === 'saved' && <span style={{ fontSize: '0.82rem', color: '#00ff88' }}>✓ Synced to your account</span>}
                                    {cloudMsg && cloudMsg !== 'saved' && (
                                        <span style={{ fontSize: '0.78rem', color: '#ff4444', maxWidth: '300px', lineHeight: '1.4' }}>
                                            ✕ {cloudMsg.includes('permission') || cloudMsg.includes('PERMISSION')
                                                ? 'Firestore not set up. Enable it in Firebase Console → Firestore Database.'
                                                : cloudMsg.includes('not-found') || cloudMsg.includes('NOT_FOUND')
                                                ? 'Firestore database not created yet. Go to Firebase Console → Firestore Database → Create.'
                                                : cloudMsg}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard>
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

                    <SectionCard>
                        <SectionTitle icon="settings">Search Bar Style</SectionTitle>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
                            Choose how search bars look across the app. Changes apply immediately.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { id: 'glass',     label: 'Glass',     desc: 'Frosted-glass box with focus glow' },
                                { id: 'pill',      label: 'Pill',      desc: 'Fully rounded capsule shape' },
                                { id: 'underline', label: 'Underline', desc: 'Minimal flat with bottom border only' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => { setSearchBarStyleVal(opt.id); setSearchBarStyle(opt.id); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        borderRadius: 'var(--radius-medium)',
                                        border: searchBarStyleVal === opt.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: searchBarStyleVal === opt.id ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                    }}
                                    onMouseEnter={e => { if (searchBarStyleVal !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => { if (searchBarStyleVal !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '3px', color: searchBarStyleVal === opt.id ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
                                            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                        </svg>
                                        Preview…
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            );

            case 'notifications': return (
                <div className="animate-fade">
                    <PageHeading>Notifications</PageHeading>

                    <SectionCard>
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
        <div className="settings-layout">

            {/* ── Sidebar ── */}
            <div className="settings-sidebar">
                {/* User mini-card */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', marginBottom: '32px',
                    background: 'rgba(6,182,212,0.06)',
                    border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: '12px'
                }}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            objectFit: 'cover', border: '1.5px solid var(--accent-primary)', flexShrink: 0
                        }} />
                    ) : (
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: 'rgba(6,182,212,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', flexShrink: 0
                        }}>👤</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.username || 'Operative'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email || '—'}
                        </div>
                    </div>
                </div>

                {/* Section label */}
                <div style={{
                    fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.15em',
                    color: 'rgba(136,136,153,0.6)', padding: '0 12px', marginBottom: '8px'
                }}>
                    USER SETTINGS
                </div>

                {/* Nav tabs */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
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
                        );
                    })}
                </nav>

                {/* Spacer + back button */}
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ height: '1px', background: 'rgba(6,182,212,0.1)', marginBottom: '20px' }} />
                    <button
                        onClick={handleSignOutAll}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: user?.email ? '1px solid #ff4444' : '1px solid var(--accent-success)',
                            color: user?.email ? '#ff4444' : 'var(--accent-success)',
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 'bold',
                            transition: 'all var(--transition-fast)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = user?.email ? 'rgba(255, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                            e.target.style.boxShadow = user?.email ? '0 0 15px rgba(255,68,68,0.2)' : '0 0 15px rgba(16,185,129,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {user?.email ? 'DISCONNECT SOURCE' : 'ADD ACCOUNT'}
                    </button>
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

            {/* ── Content Area ── */}
            <div className="settings-content">
                {/* Close button */}
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

                {/* Guest banner */}
                {isGuest && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '12px 18px',
                        background: 'rgba(245,158,11,0.07)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        maxWidth: '580px'
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '3px' }}>Guest Mode</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                You are not signed in. Settings are saved on this device only and will reset if you clear your browser data. <strong style={{ color: '#f59e0b' }}>Sign in to sync your settings across all devices.</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content */}
                <div style={{ maxWidth: '580px' }}>
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
