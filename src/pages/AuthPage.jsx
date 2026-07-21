import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle, registerUser } from '../services/auth-handler';
import Icon from '../components/ui/Icon';
import DnaBackground from '../components/canvas/DnaBackground';

export default function AuthPage({ onLogin }) {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isRegistering) {
                if (!phone) throw new Error("Phone number is required for Node Registration.");
                const user = await registerUser(email, password, username || email.split('@')[0], phone);
                onLogin(user);
            } else {
                const user = await loginWithEmail(email, password);
                onLogin(user);
            }
            navigate('/nexus');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            const user = await loginWithGoogle();
            onLogin(user);
            navigate('/nexus');
        } catch (err) {
            setError("Google Auth Failed: " + err.message);
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
            <DnaBackground />
            
            <div className="glass-panel" style={{
                position: 'relative',
                zIndex: 10,
                width: '400px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'slideUp var(--transition-smooth) forwards'
            }}>
                <h1 style={{ color: 'var(--text-main)', marginBottom: '5px', textAlign: 'center' }}>
                    {isRegistering ? "CREATE NODE" : "CYBER-HUB"}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
                    Awaiting secure credentials...
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        padding: '10px',
                        borderRadius: 'var(--radius-small)',
                        marginBottom: '20px',
                        width: '100%',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {isRegistering && (
                        <>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Codename (Username)" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Phone Link (+1 ...)" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </>
                    )}
                    
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Passkey" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    
                    <button type="submit" className="cyber-button" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? "PROCESSING..." : isRegistering ? "REGISTER" : "AUTHORIZE"}
                    </button>
                </form>

                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    margin: '25px 0',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ margin: '0 10px', fontSize: '0.8rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="cyber-button" onClick={handleGoogle} style={{ flex: 1, padding: '8px', minWidth: '100px' }}>
                        <Icon name="google" size={18} />
                    </button>
                    <button className="cyber-button" onClick={() => alert('Mock Discord Auth')} style={{ flex: 1, padding: '8px', minWidth: '100px', borderColor: '#5865F2', color: '#5865F2' }}>
                        <Icon name="discord" size={18} />
                    </button>
                    <button className="cyber-button" onClick={() => alert('Mock GitHub Auth')} style={{ flex: 1, padding: '8px', minWidth: '100px', borderColor: '#F0F0F5', color: '#F0F0F5' }}>
                        <Icon name="github" size={18} />
                    </button>
                </div>

                <p 
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{
                        marginTop: '30px',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                >
                    {isRegistering ? "Back to Secure Login" : "Sign up for a new Node Access"}
                </p>
                
                <p 
                    onClick={() => {
                        onLogin({ username: 'Guest Operative', avatar: '' });
                        navigate('/nexus');
                    }}
                    style={{
                        marginTop: '15px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        border: '1px solid var(--border-color)',
                        padding: '5px 15px',
                        borderRadius: 'var(--radius-small)'
                    }}
                >
                    BYPASS TO DEMO MODE
                </p>
            </div>
        </div>
    );
}
