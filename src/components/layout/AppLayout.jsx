import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DnaBackground from '../canvas/DnaBackground';

export default function AppLayout({ user, onLogout }) {
    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <DnaBackground />
            
            <Sidebar user={user} onLogout={onLogout} />
            
            <main style={{
                flex: 1,
                position: 'relative',
                zIndex: 10,
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
            }}>
                <div className="glass-panel" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    overflow: 'hidden'
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
