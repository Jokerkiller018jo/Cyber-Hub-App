import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { handleLogout } from '../../services/auth-handler';

export default function Sidebar({ user, onLogout }) {
    const navigate = useNavigate();

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
        { path: '/AIChat', name: 'AI Chat', icon: 'brain' },
        { path: '/lobby', name: 'LOBBY', icon: 'home' },
        { path: '/chat', name: 'MESSAGES', icon: 'message' },
        { path: '/market', name: 'MARKET', icon: 'chart' },
        { path: '/currencies', name: 'CURRENCIES', icon: 'bank' },
        { path: '/symbols', name: 'SYMBOLS', icon: 'symbol' },
        { path: '/colors', name: 'COLORS', icon: 'palette' },
        { path: '/emojis', name: 'EMOJIS', icon: 'emoji' },
        { path: '/hex-editor', name: 'HEX EDITOR', icon: 'microscope' },
        { path: '/settings', name: 'SETTINGS', icon: 'settings' }
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            height: '100%',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 10px',
            zIndex: 100,
            position: 'relative'
        }}>
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

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            transition: 'all var(--transition-fast)'
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
                        marginRight: '10px'
                    }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.username || 'Guest'}</span>
                        <span style={{ fontSize: '0.7rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%' }}></div>
                            Active Node
                        </span>
                    </div>
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
                        transition: 'all var(--transition-fast)'
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
    );
}
