import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../services/auth-handler';
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
            onLogin(user);
            navigate('/nexus');
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
                width: '400px',
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'slideUp var(--transition-smooth) forwards'
            }}>
                {/* Logo / Title */}
                <h1 style={{
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                    textAlign: 'center',
                    letterSpacing: '0.1em'
                }}>
                    CYBER-HUB
                </h1>
                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '40px',
                    fontSize: '0.9rem',
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
                        marginBottom: '24px',
                        width: '100%',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Google Sign-In button */}
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
                        padding: '14px',
                        fontSize: '0.95rem',
                        letterSpacing: '0.08em'
                    }}
                >
                    {loading ? (
                        'AUTHENTICATING...'
                    ) : (
                        <>
                            <Icon name="google" size={20} />
                            SIGN IN WITH GOOGLE
                        </>
                    )}
                </button>

                {/* Divider */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    margin: '28px 0',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ margin: '0 12px', fontSize: '0.75rem', opacity: 0.5 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                {/* Demo mode bypass */}
                <p
                    onClick={() => {
                        onLogin({ username: 'Guest Operative', avatar: '' });
                        navigate('/nexus');
                    }}
                    style={{
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        border: '1px solid var(--border-color)',
                        padding: '6px 20px',
                        borderRadius: 'var(--radius-small)',
                        transition: 'border-color var(--transition-fast), color var(--transition-fast)'
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
                    BYPASS TO DEMO MODE
                </p>
            </div>
        </div>
    );
}
