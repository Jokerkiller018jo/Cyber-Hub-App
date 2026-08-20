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
import Extensions from './pages/Extensions';
import Settings from './pages/Settings';
import LoadingScreen from './components/ui/LoadingScreen';

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
                        <Route path="/chat" element={<Navigate to="/lobby" />} />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/market" element={<MarketDashboard />} />
                        <Route path="/currencies" element={<CurrencyCenter />} />
                        <Route path="/symbols" element={<Symbols user={user} />} />
                        <Route path="/extensions" element={<Extensions user={user} />} />
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
