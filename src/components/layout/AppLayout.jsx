import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DnaBackground from '../canvas/DnaBackground';

export default function AppLayout({ user, onLogout }) {
    const location = useLocation();
    const isLobby = location.pathname === '/lobby';

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <DnaBackground />

            {!isLobby && <Sidebar user={user} onLogout={onLogout} />}

            <main style={{
                flex: 1,
                position: 'relative',
                zIndex: 10,
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                minWidth: 0,   // prevent flex overflow
            }}>
                <div className="glass-panel" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    overflow: 'hidden',
                    minHeight: 0,
                }}>
                    <Outlet />
                </div>
            </main>

            {/* Mobile main-area padding — give room for the hamburger button */}
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
