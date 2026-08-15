import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';

export default function Lobby() {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, []);

    const navTabs = [
        { label: 'Market',     path: '/market',     icon: 'trending-up', color: '#06b6d4' },
        { label: 'Currencies', path: '/currencies', icon: 'dollar',       color: '#10b981' },
        { label: 'Vault',      path: '/symbols',    icon: 'database',     color: '#f59e0b' },
        { label: 'Hex Editor', path: '/hex-editor', icon: 'code',         color: '#818cf8' },
        { label: 'Settings',   path: '/settings',   icon: 'settings',     color: '#94a3b8' },
    ];

    const infoCards = [
        { label: 'Data Source',  value: 'CoinGecko API',  icon: 'link',         color: '#06b6d4' },
        { label: 'Refresh Rate', value: '60 seconds',     icon: 'refresh',      color: '#10b981' },
        { label: 'Protocol',     value: 'HTTPS / REST',   icon: 'shield',       color: '#f59e0b' },
        { label: 'Session',      value: 'Secure Active',  icon: 'check-circle', color: '#10b981' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '28px', paddingBottom: '20px' }}>

            {/* ── Header ── */}
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

            {/* ── System Tabs ── */}
            <div>
                {/* Section label */}
                <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: 'var(--accent-primary)', display: 'inline-block', flexShrink: 0
                    }} />
                    SYSTEM TABS
                    <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'block' }} />
                </div>

                {/* Tab cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
                    {navTabs.map(tab => (
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
                                minHeight: '130px',
                                textAlign: 'center',
                                transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.background = `${tab.color}10`;
                                e.currentTarget.style.borderColor = `${tab.color}55`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <span style={{ color: tab.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name={tab.icon} size={32} />
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                                {tab.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Info ── */}
            <div>
                {/* Section label */}
                <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: 'var(--accent-success)', display: 'inline-block', flexShrink: 0
                    }} />
                    INFO
                    <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'block' }} />
                </div>

                {/* Info cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {infoCards.map(item => (
                        <div key={item.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
                            <span style={{ color: item.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <Icon name={item.icon} size={20} />
                            </span>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '3px' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                    {item.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
