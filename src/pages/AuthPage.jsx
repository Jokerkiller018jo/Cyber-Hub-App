import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginWithGoogleRedirect } from '../services/auth-handler';
import Icon from '../components/ui/Icon';
import MatrixBackground from '../components/canvas/MatrixBackground';

export default function AuthPage({ onLogin }) {
    const navigate = useNavigate();
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
                padding: '44px 36px',
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
                        width: '72px',
                        height: '72px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        marginBottom: '16px',
                        boxShadow: '0 0 24px rgba(6, 182, 212, 0.5), 0 0 10px rgba(168, 85, 247, 0.4)',
                        border: '1.5px solid rgba(6, 182, 212, 0.4)'
                    }}
                />
                <h1 style={{
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    fontSize: '1.6rem'
                }}>
                    CYBER-HUB
                </h1>
                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '32px',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                }}>
                    Awaiting secure credentials...
                </p>

                {/* Error message */}
                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-small)',
                        marginBottom: '20px',
                        width: '100%',
                        fontSize: '0.82rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Google Sign-In Primary button */}
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
                        fontSize: '0.92rem',
                        letterSpacing: '0.08em',
                        marginBottom: '12px'
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

                {/* Direct Full-Page Redirect Alternative */}
                <button
                    onClick={handleDirectRedirect}
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-small)',
                        color: 'var(--text-muted)',
                        padding: '9px',
                        fontSize: '0.78rem',
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

                {/* Divider */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    margin: '22px 0',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ margin: '0 12px', fontSize: '0.75rem', opacity: 0.5 }}>OR</span>
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
