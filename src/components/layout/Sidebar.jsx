import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import SearchBar from '../ui/SearchBar';
import { handleLogout } from '../../services/auth-handler';
import { 
    loadLayoutConfig, 
    saveLayoutConfig, 
    getOrderedNavItems, 
    DEFAULT_NAV_ITEMS 
} from '../../services/layoutConfig';

export default function Sidebar({ user, onLogout, onOpenCommandBar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [layout, setLayout] = useState(() => loadLayoutConfig());
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // Listen for layout changes across the app
    useEffect(() => {
        const updateLayout = () => setLayout(loadLayoutConfig());
        window.addEventListener('cyberhub_layout_change', updateLayout);
        window.addEventListener('storage', updateLayout);
        return () => {
            window.removeEventListener('cyberhub_layout_change', updateLayout);
            window.removeEventListener('storage', updateLayout);
        };
    }, []);

    // Close sidebar on mobile route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const isTop = layout.sidebarPosition === 'top';
    const isRight = layout.sidebarPosition === 'right';
    const isFloating = layout.sidebarPosition === 'floating';
    const isCompact = layout.sidebarMode === 'compact' && !isTop;

    const navItems = getOrderedNavItems(layout.navOrder);

    // Drag-and-drop reordering for tabs
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        if (draggedId && draggedId !== id) {
            setDragOverId(id);
        }
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedId && draggedId !== targetId) {
            const currentOrder = [...(layout.navOrder || DEFAULT_NAV_ITEMS.map(i => i.id))];
            const draggedIdx = currentOrder.indexOf(draggedId);
            const targetIdx = currentOrder.indexOf(targetId);

            if (draggedIdx !== -1 && targetIdx !== -1) {
                currentOrder.splice(draggedIdx, 1);
                currentOrder.splice(targetIdx, 0, draggedId);
                const updated = { ...layout, navOrder: currentOrder };
                setLayout(updated);
                saveLayoutConfig(updated);
            }
        }
        setDraggedId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    // Toggle compact mode
    const toggleCompact = () => {
        const nextMode = layout.sidebarMode === 'compact' ? 'expanded' : 'compact';
        const updated = { ...layout, sidebarMode: nextMode };
        setLayout(updated);
        saveLayoutConfig(updated);
    };

    // ── TOP NAVBAR MODE ──
    if (isTop) {
        return (
            <header style={{
                height: '64px',
                width: '100%',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                zIndex: 200,
                position: 'relative',
                backdropFilter: 'var(--glass-blur)',
                flexShrink: 0,
            }}>
                {/* Brand */}
                <div 
                    onClick={() => navigate('/lobby')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        letterSpacing: '1px',
                        color: 'var(--text-main)'
                    }}
                >
                    <img src="/favicon.jpg" alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 0 10px rgba(6,182,212,0.35)' }} />
                    NEXUS CORE
                    <span style={badgeStyle}>v0.1.8</span>
                </div>

                {/* Nav Items (Horizontal, Draggable) */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onDragEnd={handleDragEnd}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    borderRadius: 'var(--radius-small)',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
                                    border: dragOverId === item.id ? '1px dashed var(--accent-primary)' : '1px solid transparent',
                                    borderBottom: isActive ? '2px solid var(--accent-primary)' : '1px solid transparent',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    transition: 'all 0.15s ease',
                                    opacity: draggedId === item.id ? 0.4 : 1,
                                    cursor: 'grab'
                                }}
                            >
                                <Icon name={item.icon} size={16} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Right Utilities (Command bar trigger, Extensions, Settings, User) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={onOpenCommandBar}
                        style={iconBtnStyle}
                        title="Command Bar (Ctrl+K)"
                    >
                        <Icon name="search" size={16} />
                        <kbd style={kbdTiny}>Ctrl+K</kbd>
                    </button>

                    <button
                        onClick={() => navigate('/extensions')}
                        style={{
                            ...iconBtnStyle,
                            background: location.pathname === '/extensions' ? 'rgba(6,182,212,0.15)' : 'transparent',
                            color: location.pathname === '/extensions' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                        title="Extensions"
                    >
                        <Icon name="extension" size={18} />
                    </button>

                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            ...iconBtnStyle,
                            background: location.pathname === '/settings' ? 'rgba(6,182,212,0.15)' : 'transparent',
                            color: location.pathname === '/settings' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                        title="Settings"
                    >
                        <Icon name="settings" size={18} />
                    </button>

                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(6,182,212,0.2)',
                        backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                        backgroundSize: 'cover',
                        border: '1.5px solid var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                    }}>
                        {!user?.avatar && '👤'}
                    </div>
                </div>
            </header>
        );
    }

    // ── VERTICAL SIDEBAR / FLOATING DOCK MODE (LEFT / RIGHT) ──
    const sidebarWidth = isCompact ? '68px' : isFloating ? '74px' : '240px';

    return (
        <>
            {/* Hamburger button (Mobile) */}
            <button
                id="hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: '14px',
                    left: isRight ? 'auto' : '14px',
                    right: isRight ? '14px' : 'auto',
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

            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.65)',
                        zIndex: 199,
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                />
            )}

            {/* Main Sidebar Element */}
            <aside
                id="app-sidebar"
                style={{
                    width: sidebarWidth,
                    height: isFloating ? 'calc(100vh - 40px)' : '100%',
                    margin: isFloating ? '20px 0 20px 20px' : 0,
                    background: 'var(--bg-secondary)',
                    borderRight: isRight ? 'none' : '1px solid var(--border-color)',
                    borderLeft: isRight ? '1px solid var(--border-color)' : 'none',
                    borderRadius: isFloating ? 'var(--radius-large)' : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: isCompact || isFloating ? '18px 8px' : '20px 14px',
                    zIndex: 200,
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    boxShadow: isFloating ? '0 12px 36px rgba(0,0,0,0.5), 0 0 20px var(--border-color)' : 'none',
                }}
                data-mobile-open={mobileOpen}
            >
                {/* Header Brand */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCompact || isFloating ? 'center' : 'space-between',
                    marginBottom: '20px',
                    padding: '0 4px',
                }}>
                    <div 
                        onClick={() => navigate('/lobby')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCompact || isFloating ? '0' : '10px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            fontWeight: 900,
                            letterSpacing: '1px',
                            fontSize: isCompact || isFloating ? '0.75rem' : '1.1rem',
                        }}
                    >
                        <img 
                            src="/favicon.jpg" 
                            alt="Logo" 
                            style={{ 
                                width: isCompact || isFloating ? '34px' : '28px', 
                                height: isCompact || isFloating ? '34px' : '28px', 
                                borderRadius: '8px', 
                                objectFit: 'cover',
                                boxShadow: '0 0 12px rgba(6,182,212,0.4)' 
                            }} 
                        />
                        {!isCompact && !isFloating && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>NEXUS CORE</span>
                                <span style={badgeStyle}>v0.1.8</span>
                            </div>
                        )}
                    </div>

                    {!isFloating && (
                        <button
                            onClick={toggleCompact}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.15s',
                            }}
                            title={isCompact ? 'Expand Sidebar' : 'Compact Sidebar'}
                        >
                            <span style={{ fontSize: '1rem', transform: isCompact ? 'rotate(180deg)' : 'none' }}>
                                {isRight ? (isCompact ? '◀' : '▶') : (isCompact ? '▶' : '◀')}
                            </span>
                        </button>
                    )}
                </div>

                {/* Arc Command Bar Quick Trigger */}
                <button
                    onClick={onOpenCommandBar}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCompact || isFloating ? 'center' : 'space-between',
                        padding: isCompact || isFloating ? '10px' : '9px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-small)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        marginBottom: '16px',
                        transition: 'all 0.15s ease',
                    }}
                    title="Open Command Bar (Ctrl+K)"
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon name="search" size={16} />
                        {!isCompact && !isFloating && <span>Search & Jump...</span>}
                    </span>
                    {!isCompact && !isFloating && <kbd style={kbdTiny}>Ctrl+K</kbd>}
                </button>

                {/* Optional embedded Search Bar */}
                {layout.searchBarPlacement === 'sidebar' && !isCompact && !isFloating && (
                    <div style={{ marginBottom: '16px' }}>
                        <SearchBar placeholder="Quick Filter..." />
                    </div>
                )}

                {/* Navigation Items (Draggable) */}
                <nav style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onDragEnd={handleDragEnd}
                                title={item.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCompact || isFloating ? 'center' : 'flex-start',
                                    gap: '12px',
                                    padding: isCompact || isFloating ? '12px' : '10px 14px',
                                    borderRadius: 'var(--radius-small)',
                                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                    background: isActive ? 'rgba(6,182,212,0.14)' : 'transparent',
                                    borderLeft: !isRight && isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                    borderRight: isRight && isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                    border: dragOverId === item.id ? '1px dashed var(--accent-primary)' : undefined,
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.86rem',
                                    cursor: 'grab',
                                    transition: 'all 0.15s ease',
                                    opacity: draggedId === item.id ? 0.35 : 1,
                                    position: 'relative'
                                }}
                                className="sidebar-nav-link"
                            >
                                <span style={{
                                    color: isActive ? 'var(--accent-primary)' : 'inherit',
                                    display: 'flex',
                                    flexShrink: 0
                                }}>
                                    <Icon name={item.icon} size={18} />
                                </span>
                                {!isCompact && !isFloating && (
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.name}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Utilities */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    {/* Extensions Tab */}
                    <button
                        onClick={() => navigate('/extensions')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCompact || isFloating ? 'center' : 'flex-start',
                            gap: '10px',
                            padding: '10px',
                            background: location.pathname === '/extensions' ? 'rgba(6,182,212,0.12)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-small)',
                            color: location.pathname === '/extensions' ? 'var(--accent-primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                        }}
                        title="Extensions"
                    >
                        <span style={{ display: 'flex', color: location.pathname === '/extensions' ? 'var(--accent-primary)' : 'inherit' }}>
                            <Icon name="extension" size={18} />
                        </span>
                        {!isCompact && !isFloating && <span>Extensions</span>}
                    </button>

                    {/* Settings Tab */}
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCompact || isFloating ? 'center' : 'flex-start',
                            gap: '10px',
                            padding: '10px',
                            background: location.pathname === '/settings' ? 'rgba(6,182,212,0.12)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-small)',
                            color: location.pathname === '/settings' ? 'var(--accent-primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                        }}
                        title="Settings & Layout Studio"
                    >
                        <span style={{ display: 'flex', color: location.pathname === '/settings' ? 'var(--accent-primary)' : 'inherit' }}>
                            <Icon name="settings" size={18} />
                        </span>
                        {!isCompact && !isFloating && <span>Settings</span>}
                    </button>

                    {/* User Profile Mini Node */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCompact || isFloating ? 'center' : 'flex-start',
                        gap: '10px',
                        padding: isCompact || isFloating ? '6px 0' : '8px 10px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(6,182,212,0.2)',
                            backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                            backgroundSize: 'cover',
                            border: '1px solid var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            flexShrink: 0
                        }}>
                            {!user?.avatar && '👤'}
                        </div>

                        {!isCompact && !isFloating && (
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: 'var(--text-main)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user?.username || 'Guest'}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-success)' }}>
                                    ● Active Node
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    #hamburger-btn {
                        display: flex !important;
                    }
                    #app-sidebar {
                        position: fixed !important;
                        top: 0;
                        left: ${isRight ? 'auto' : 0};
                        right: ${isRight ? 0 : 'auto'};
                        height: 100dvh !important;
                        width: 240px !important;
                        margin: 0 !important;
                        transform: ${mobileOpen ? 'translateX(0)' : isRight ? 'translateX(100%)' : 'translateX(-100%)'};
                        box-shadow: ${mobileOpen ? '0 0 50px rgba(0,0,0,0.8)' : 'none'};
                    }
                }
            `}</style>
        </>
    );
}

const badgeStyle = {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--accent-primary)',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.3)',
    padding: '2px 8px',
    borderRadius: '10px',
    letterSpacing: '0.05em'
};

const iconBtnStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-small)',
    padding: '6px 12px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    transition: 'all 0.15s ease'
};

const kbdTiny = {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1px 5px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    border: '1px solid rgba(255,255,255,0.1)'
};
