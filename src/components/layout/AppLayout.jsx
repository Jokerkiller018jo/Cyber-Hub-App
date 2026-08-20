import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DynamicBackground from '../canvas/DynamicBackground';
import CommandBar from '../ui/CommandBar';
import SearchBar from '../ui/SearchBar';
import { loadLayoutConfig, applyLayoutConfig } from '../../services/layoutConfig';

export default function AppLayout({ user, onLogout }) {
    const location = useLocation();
    const isLobby = location.pathname === '/lobby';
    const [layout, setLayout] = useState(() => loadLayoutConfig());
    const [commandBarOpen, setCommandBarOpen] = useState(false);

    // Initial layout setup & listener
    useEffect(() => {
        applyLayoutConfig(layout);

        const handleLayoutUpdate = (e) => {
            const updated = e.detail || loadLayoutConfig();
            setLayout(updated);
            applyLayoutConfig(updated);
        };

        window.addEventListener('cyberhub_layout_change', handleLayoutUpdate);
        window.addEventListener('storage', handleLayoutUpdate);
        return () => {
            window.removeEventListener('cyberhub_layout_change', handleLayoutUpdate);
            window.removeEventListener('storage', handleLayoutUpdate);
        };
    }, []);

    // Global shortcut: Ctrl+K or Cmd+K to toggle Command Bar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandBarOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isTop = layout.sidebarPosition === 'top';
    const isRight = layout.sidebarPosition === 'right';

    return (
        <div style={{
            display: 'flex',
            flexDirection: isTop ? 'column' : 'row',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Dynamic Interactive Background */}
            <DynamicBackground />

            {/* Global Arc Command Bar */}
            <CommandBar
                isOpen={commandBarOpen}
                onClose={() => setCommandBarOpen(false)}
            />

            {/* Sidebar rendered on Left / Top */}
            {!isLobby && !isRight && (
                <Sidebar
                    user={user}
                    onLogout={onLogout}
                    onOpenCommandBar={() => setCommandBarOpen(true)}
                />
            )}

            {/* Main Outlet Workspace */}
            <main style={{
                flex: 1,
                position: 'relative',
                zIndex: 10,
                padding: 'var(--ui-padding, 20px)',
                display: 'flex',
                flexDirection: 'column',
                height: isTop ? 'calc(100vh - 64px)' : '100vh',
                overflow: 'hidden',
                minWidth: 0,
            }}>
                {/* Optional Header Search Bar */}
                {layout.searchBarPlacement === 'header' && !isLobby && (
                    <div style={{
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                    }}>
                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <SearchBar placeholder="Universal search across modules..." />
                        </div>
                        <button
                            onClick={() => setCommandBarOpen(true)}
                            style={{
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                padding: '8px 14px',
                                borderRadius: 'var(--radius-small)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>⚡ COMMAND BAR</span>
                            <kbd style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Ctrl+K</kbd>
                        </button>
                    </div>
                )}

                <div className="glass-panel" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    overflow: 'hidden',
                    minHeight: 0,
                    borderRadius: 'var(--radius-large)',
                }}>
                    <Outlet />
                </div>
            </main>

            {/* Sidebar rendered on Right (Zen style) */}
            {!isLobby && isRight && (
                <Sidebar
                    user={user}
                    onLogout={onLogout}
                    onOpenCommandBar={() => setCommandBarOpen(true)}
                />
            )}

            {/* Mobile padding override */}
            <style>{`
                @media (max-width: 768px) {
                    main {
                        padding: 70px 12px 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}
