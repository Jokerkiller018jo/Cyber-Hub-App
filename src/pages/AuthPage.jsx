import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    loginWithGoogle, 
    loginWithGoogleRedirect, 
    loginWithEmail, 
    registerWithEmail 
} from '../services/auth-handler';
import Icon from '../components/ui/Icon';
import MatrixBackground from '../components/canvas/MatrixBackground';

export default function AuthPage({ onLogin }) {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState('google'); // 'google' | 'email'
    const [isRegister, setIsRegister] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await loginWithGoogle();
            if (user) {
                onLogin(user);
                navigate('/lobby');
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDirectRedirect = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogleRedirect();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            let user;
            if (isRegister) {
                user = await registerWithEmail(email, password);
            } else {
                user = await loginWithEmail(email, password);
            }
            if (user) {
                onLogin({
                    uid: user.uid,
                    email: user.email,
                    username: user.displayName || user.email?.split('@')[0],
                    avatar: user.photoURL || ''
                });
                navigate('/lobby');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <MatrixBackground />

            <div className="glass-panel" style={{
                position: 'relative',
                zIndex: 10,
                width: '420px',
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'slideUp var(--transition-smooth) forwards'
            }}>
                {/* Logo / Title */}
                <img
                    src="/favicon.png"
                    alt="Cyber-Hub Logo"
                    style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        marginBottom: '14px',
                        boxShadow: '0 0 24px rgba(6, 182, 212, 0.5), 0 0 10px rgba(168, 85, 247, 0.4)',
                        border: '1.5px solid rgba(6, 182, 212, 0.4)'
                    }}
                />
                <h1 style={{
                    color: 'var(--text-main)',
                    marginBottom: '4px',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    fontSize: '1.5rem',
                    fontWeight: 800
                }}>
                    CYBER-HUB
                </h1>
                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '22px',
                    fontSize: '0.82rem',
                    textAlign: 'center'
                }}>
                    Awaiting secure credentials...
                </p>

                {/* Mode Selector */}
                <div style={{
                    display: 'flex',
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '3px',
                    marginBottom: '20px'
                }}>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('google'); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: authMode === 'google' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                            border: authMode === 'google' ? '1px solid #06b6d4' : '1px solid transparent',
                            color: authMode === 'google' ? '#06b6d4' : 'var(--text-muted)',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        Google Auth
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('email'); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: authMode === 'email' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                            border: authMode === 'email' ? '1px solid #06b6d4' : '1px solid transparent',
                            color: authMode === 'email' ? '#06b6d4' : 'var(--text-muted)',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        Email / Password
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.12)',
                        border: '1px solid #ff4444',
                        color: '#ff6666',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-small)',
                        marginBottom: '18px',
                        width: '100%',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Google Sign-In View */}
                {authMode === 'google' ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            className="cyber-button"
                            onClick={handleGoogle}
                            disabled={loading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '13px',
                                fontSize: '0.9rem',
                                letterSpacing: '0.08em'
                            }}
                        >
                            {loading ? (
                                'AUTHENTICATING...'
                            ) : (
                                <>
                                    <Icon name="google" size={18} />
                                    SIGN IN WITH GOOGLE
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDirectRedirect}
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-small)',
                                color: 'var(--text-muted)',
                                padding: '9px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.color = 'var(--text-main)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            Browser Redirect Sign-In (No Popups)
                        </button>
                    </div>
                ) : (
                    /* Email / Password View */
                    <form onSubmit={handleEmailAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="cyber-button"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '0.88rem',
                                letterSpacing: '0.08em',
                                marginTop: '4px'
                            }}
                        >
                            {loading ? 'PROCESSING...' : (isRegister ? 'CREATE ACCOUNT' : 'SECURE LOGIN')}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '4px' }}>
                            <span 
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                style={{ 
                                    color: '#06b6d4', 
                                    fontSize: '0.76rem', 
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </span>
                        </div>
                    </form>
                )}

                {/* Divider */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    margin: '20px 0',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ margin: '0 12px', fontSize: '0.72rem', opacity: 0.5 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                {/* Join as Guest */}
                <p
                    onClick={() => {
                        onLogin({ username: 'Guest Operative', avatar: '' });
                        navigate('/lobby');
                    }}
                    style={{
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-color)',
                        padding: '7px 24px',
                        borderRadius: 'var(--radius-small)',
                        transition: 'all 0.15s ease',
                        margin: 0
                    }}
                    onMouseEnter={e => {
                        e.target.style.borderColor = 'var(--accent-primary)';
                        e.target.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={e => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.color = 'var(--text-muted)';
                    }}
                >
                    Join as Guest
                </p>
            </div>
        </div>
    );
}
