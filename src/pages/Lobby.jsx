import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '28px', paddingBottom: '20px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>COMMAND CENTER</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        Real-time market intelligence — Node synced
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                        {time.toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Nav Tabs — bigger cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                {[
                    { label: 'Market',     path: '/market',     icon: '📈' },
                    { label: 'Currencies', path: '/currencies', icon: '💲' },
                    { label: 'Vault',      path: '/symbols',    icon: '🔐' },
                    { label: 'Hex Editor', path: '/hex-editor', icon: '🔢' },
                    { label: 'Settings',   path: '/settings',   icon: '⚙️' },
                ].map(tab => (
                    <div
                        key={tab.label}
                        className="card"
                        onClick={() => navigate(tab.path)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '14px',
                            padding: '28px 16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease',
                            minHeight: '130px',
                            textAlign: 'center',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.background = 'rgba(6,182,212,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{tab.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                            {tab.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-success)', display: 'inline-block' }} />
                    INFO
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                        { label: 'Data Source',  value: 'CoinGecko API',  icon: '🔗' },
                        { label: 'Refresh Rate', value: '60 seconds',     icon: '🔄' },
                        { label: 'Protocol',     value: 'HTTPS / REST',   icon: '🔒' },
                        { label: 'Session',      value: 'Secure Active',  icon: '✅' },
                    ].map(item => (
                        <div key={item.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '1px' }}>{item.label}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
