import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AppLayout from './components/layout/AppLayout';
import { observeAuth } from './services/auth-handler';

// Pages
import Lobby from './pages/Lobby';
import AiNexus from './pages/AiNexus';
import MarketDashboard from './pages/MarketDashboard';
import CurrencyCenter from './pages/CurrencyCenter';
import Symbols from './pages/Symbols';
import Colors from './pages/Colors';
import EmojiDatabase from './pages/EmojiDatabase';
import HexEditor from './pages/HexEditor';
import Settings from './pages/Settings';

function Messages() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
            <div style={{ fontSize: '3rem' }}>📡</div>
            <h2 style={{ color: 'var(--accent-primary)', margin: 0 }}>MESSAGES</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                No active transmissions.<br />Real-time messaging coming soon.
            </p>
        </div>
    );
}

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
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = (u) => { setUser(u); };
    const handleLogout = () => { setUser(null); };

    if (loading) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)', color: 'var(--accent-primary)', fontSize: '1rem', letterSpacing: '3px', fontWeight: 700 }}>
                INITIALIZING NEXUS CORE...
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={!user ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/lobby" />}
                />

                {user ? (
                    <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
                        <Route path="/" element={<Navigate to="/lobby" />} />
                        <Route path="/nexus" element={<Navigate to="/lobby" />} />
                        <Route path="/AIChat" element={<AiNexus />} />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/chat" element={<Messages />} />
                        <Route path="/market" element={<MarketDashboard />} />
                        <Route path="/currencies" element={<CurrencyCenter />} />
                        <Route path="/symbols" element={<Symbols />} />
                        <Route path="/colors" element={<Colors />} />
                        <Route path="/emojis" element={<EmojiDatabase />} />
                        <Route path="/hex-editor" element={<HexEditor />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<div style={{ color: 'var(--text-muted)', padding: '20px' }}>Page Not Found</div>} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </Router>
    );
}
