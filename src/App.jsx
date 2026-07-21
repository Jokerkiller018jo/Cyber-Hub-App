import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AppLayout from './components/layout/AppLayout';
import { observeAuth } from './services/auth-handler';

// Pages
import AiNexus from './pages/AiNexus';
import MarketDashboard from './pages/MarketDashboard';
import HexEditor from './pages/HexEditor';
import Settings from './pages/Settings';
import DataGrids from './pages/DataGrids';
import EmojiDatabase from './pages/EmojiDatabase';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = observeAuth((u) => {
            if (u) {
                setUser({
                    uid: u.uid,
                    email: u.email,
                    username: u.displayName || u.email?.split('@')[0],
                    avatar: u.photoURL
                });
            } else {
                // If they are a guest, we keep them logged in state as guest unless explicitly logged out
                // But this listener overwrites guest state if firebase says null.
                // We'll handle this smoothly.
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = (u) => {
        setUser(u);
    };

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)', color: 'var(--accent-primary)' }}>
                INITIALIZING NEXUS CORE...
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/login" 
                    element={!user ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/nexus" />} 
                />
                
                {user ? (
                    <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
                        <Route path="/" element={<Navigate to="/nexus" />} />
                        <Route path="/nexus" element={<AiNexus />} />
                        <Route path="/lobby" element={<div style={{color:'var(--text-main)'}}><h2>LOBBY</h2><p>Welcome to the main node.</p></div>} />
                        <Route path="/chat" element={<div style={{color:'var(--text-main)'}}><h2>MESSAGES</h2><p>No active transmissions.</p></div>} />
                        <Route path="/market" element={<MarketDashboard />} />
                        <Route path="/currencies" element={<DataGrids type="currencies" />} />
                        <Route path="/symbols" element={<DataGrids type="symbols" />} />
                        <Route path="/colors" element={<DataGrids type="colors" />} />
                        <Route path="/emojis" element={<EmojiDatabase />} />
                        <Route path="/hex-editor" element={<HexEditor />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<div style={{color:'var(--text-muted)'}}>Page Under Construction or Porting...</div>} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </Router>
    );
}
