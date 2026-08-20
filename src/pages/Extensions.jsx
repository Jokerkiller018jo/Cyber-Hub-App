import React, { useState } from 'react';
import Icon from '../components/ui/Icon';

export default function Extensions({ user }) {
    const [extensions, setExtensions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '24px', paddingBottom: '30px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                            <Icon name="extension" size={28} />
                        </span>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                            EXTENSIONS
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                        Manage installed add-ons and modular extensions for Cyber-Hub.
                    </p>
                </div>
            </div>

            {/* ── Empty State / Clean Extensions Management Hub ── */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(20,20,32,0.85), rgba(12,12,20,0.92))',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-large, 16px)',
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                maxWidth: '680px',
                margin: '20px auto 0 auto'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(6,182,212,0.12)',
                    border: '1px solid rgba(6,182,212,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    boxShadow: '0 0 20px rgba(6,182,212,0.2)'
                }}>
                    <Icon name="extension" size={32} />
                </div>

                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                        No Extensions Installed
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.5', margin: 0 }}>
                        Your extensions workspace is clean and ready. Add-ons and custom modular plugins will appear here once connected.
                    </p>
                </div>

                <div style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-small, 8px)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em'
                }}>
                    MODULAR EXTENSION ENGINE · READY
                </div>
            </div>
        </div>
    );
}
