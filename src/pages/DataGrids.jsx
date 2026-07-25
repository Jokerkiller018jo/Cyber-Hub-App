import React, { useState, useEffect } from 'react';

export default function DataGrids({ type }) {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Generate mock data based on type
        const items = [];
        if (type === 'colors') {
            for(let i=0; i<100; i++) {
                const r = Math.floor(Math.random()*255);
                const g = Math.floor(Math.random()*255);
                const b = Math.floor(Math.random()*255);
                items.push({ id: i, title: `Color ${i}`, value: `rgb(${r},${g},${b})` });
            }
        } else if (type === 'symbols') {
            const symbols = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];
            for(let i=0; i<50; i++) {
                items.push({ id: i, title: `Symbol ${i}`, value: symbols[i % symbols.length] });
            }
        } else if (type === 'currencies') {
            const fiats = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
            for(let i=0; i<20; i++) {
                items.push({ id: i, title: fiats[i % fiats.length], value: `$${(Math.random()*1000).toFixed(2)}` });
            }
        }
        setData(items);
    }, [type]);

    const filtered = data.filter(d => 
        d.title.toLowerCase().includes(search.toLowerCase()) || 
        d.value.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem', textTransform: 'uppercase' }}>{type} DATA</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>Data repository access.</p>
                </div>
                
                <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '250px' }}
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                overflowY: 'auto',
                paddingBottom: '20px'
            }}>
                {filtered.map(item => (
                    <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.title}</div>
                        {type === 'colors' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '20px', background: item.value, borderRadius: '4px', border: '1px solid var(--border-color)' }}></div>
                                <div style={{ fontWeight: 'bold' }}>{item.value}</div>
                            </div>
                        ) : (
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                {item.value}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
