import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { handleLogout } from '../../services/auth-handler';

export default function Sidebar({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close sidebar on route change (mobile nav item tap)
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const doLogout = async () => {
        try {
            await handleLogout();
            onLogout();
            navigate('/login');
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const navItems = [
        { path: '/AIChat',      name: 'AI Chat',    icon: 'robot' },
        { path: '/lobby',       name: 'LOBBY',      icon: 'home' },
        { path: '/chat',        name: 'MESSAGES',   icon: 'message' },
        { path: '/market',      name: 'MARKET',     icon: 'chart' },
        { path: '/currencies',  name: 'CURRENCIES', icon: 'bank' },
        { path: '/symbols',     name: 'TOOLBOX',    icon: 'database' },
        { path: '/hex-editor',  name: 'HEX EDITOR', icon: 'microscope' },
    ];

    return (
        <>
            {/* ── Hamburger button (mobile only) ── */}
            <button
                id="hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                style={{
                    display: 'none',           // shown via CSS @media
                    position: 'fixed',
                    top: '14px',
                    left: '14px',
                    zIndex: 300,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-small)',
                    width: '42px',
                    height: '42px',
                    cursor: 'pointer',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px',
                }}
            >
                <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text-main)', borderRadius: '2px' }} />
                <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text-main)', borderRadius: '2px' }} />
                <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text-main)', borderRadius: '2px' }} />
            </button>

            {/* ── Backdrop (mobile only) ── */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 199,
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* ── Sidebar panel ── */}
            <aside
                id="app-sidebar"
                style={{
                    width: 'var(--sidebar-width)',
                    height: '100%',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px 10px',
                    zIndex: 200,
                    position: 'relative',
                    flexShrink: 0,
                    // mobile: fixed overlay, slide in/out
                    transition: 'transform var(--transition-smooth)',
                }}
                data-mobile-open={mobileOpen}
            >
                {/* Close button inside sidebar (mobile) */}
                <button
                    id="sidebar-close-btn"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    style={{
                        display: 'none', // shown via CSS @media
                        position: 'absolute',
                        top: '14px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.4rem',
                        lineHeight: 1,
                        padding: '4px 8px',
                    }}
                >
                    ✕
                </button>

                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: 'var(--text-main)',
                    letterSpacing: '1px'
                }}>
                    NEXUS CORE
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 15px',
                                borderRadius: 'var(--radius-small)',
                                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                background: isActive ? 'rgba(176,0,255,0.1)' : 'transparent',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                transition: 'all var(--transition-fast)',
                            })}
                            className="sidebar-item"
                        >
                            <Icon name={item.icon} size={18} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div style={{
                    marginTop: 'auto',
                    padding: '15px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-medium)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#333',
                            backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                            backgroundSize: 'cover',
                            marginRight: '10px',
                            flexShrink: 0,
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.username || 'Guest'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', flexShrink: 0 }} />
                                Active Node
                            </span>
                        </div>
                        <NavLink
                            to="/settings"
                            style={({ isActive }) => ({
                                background: 'transparent', border: 'none', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                            })}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <Icon name="settings" size={20} />
                        </NavLink>
                    </div>
                    <button
                        onClick={doLogout}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #ff4444',
                            color: '#ff4444',
                            padding: '8px',
                            borderRadius: 'var(--radius-small)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 68, 68, 0.1)';
                            e.target.style.boxShadow = '0 0 15px rgba(255,68,68,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        DISCONNECT SOURCE
                    </button>
                </div>
            </aside>

            {/* ── Responsive CSS injected via style tag ── */}
            <style>{`
                @media (max-width: 768px) {
                    #hamburger-btn {
                        display: flex !important;
                    }
                    #sidebar-close-btn {
                        display: block !important;
                    }
                    #app-sidebar {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        height: 100dvh !important;
                        transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
                        box-shadow: ${mobileOpen ? '4px 0 40px rgba(176,0,255,0.25)' : 'none'};
                    }
                }
            `}</style>
        </>
    );
}
