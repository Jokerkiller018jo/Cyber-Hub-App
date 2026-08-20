import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AppLayout from './components/layout/AppLayout';
import { observeAuth } from './services/auth-handler';

// Pages
import Lobby from './pages/Lobby';
import MarketDashboard from './pages/MarketDashboard';
import CurrencyCenter from './pages/CurrencyCenter';
import Symbols from './pages/Vault';
import Settings from './pages/Settings';
import LoadingScreen from './components/ui/LoadingScreen';

function Messages({ user }) {
    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--bg-base)', color: 'var(--text-main)', borderRadius: 'var(--radius-large)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {/* Sidebar */}
            <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: '900', fontSize: '1.2rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>💬</span> NEXUS CHAT
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: 'rgba(176,0,255,0.15)', borderLeft: '3px solid var(--accent-primary)' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>Nexus Operator</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Awaiting secure transmission...
                        </div>
                    </div>
                    {/* Dummy Chat */}
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>Echo Team</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            All clear at Sector 7.
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
                {/* Chat Header */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>
                        NO
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Nexus Operator</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-dark)' }}>Online</div>
                    </div>
                </div>
                {/* Messages List */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(176,0,255,0.1)', padding: '12px 18px', borderRadius: '0 15px 15px 15px', maxWidth: '75%', border: '1px solid rgba(176,0,255,0.3)', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        Greetings, Operative. Welcome to the secure comms channel. This line is end-to-end encrypted.
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '5px' }}>12:42 PM</div>
                    </div>
                </div>
                {/* Input Area */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>📎</span>
                    <input type="text" placeholder="Transmit secure message..." style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none', fontSize: '0.95rem' }} />
                    <button style={{ padding: '12px 25px', borderRadius: '25px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' }}>SEND</button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [introDone, setIntroDone] = useState(false);

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
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = (u) => { setUser(u); };
    const handleLogout = () => { setUser(null); };

    if (!authReady || !introDone) {
        return <LoadingScreen onComplete={() => setIntroDone(true)} />;
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
                        <Route path="/AIChat" element={<Navigate to="/lobby" />} />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/chat" element={<Messages user={user} />} />
                        <Route path="/market" element={<MarketDashboard />} />
                        <Route path="/currencies" element={<CurrencyCenter />} />
                        <Route path="/symbols" element={<Symbols user={user} />} />
                        <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
                        <Route path="*" element={<div style={{ color: 'var(--text-muted)', padding: '20px' }}>Page Not Found</div>} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </Router>
    );
}
