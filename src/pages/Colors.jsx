import React, { useState, useMemo } from 'react';

// Curated color palettes
const PALETTES = [
    // Cyberpunk
    { name: 'Cyberpunk', hex: '#B000FF', rgb: [176, 0, 255], group: 'Neon' },
    { name: 'Neon Blue', hex: '#00D4FF', rgb: [0, 212, 255], group: 'Neon' },
    { name: 'Neon Green', hex: '#00FF88', rgb: [0, 255, 136], group: 'Neon' },
    { name: 'Neon Pink', hex: '#FF006E', rgb: [255, 0, 110], group: 'Neon' },
    { name: 'Neon Orange', hex: '#FF6600', rgb: [255, 102, 0], group: 'Neon' },
    { name: 'Neon Yellow', hex: '#FFE600', rgb: [255, 230, 0], group: 'Neon' },
    // Pastel
    { name: 'Lavender', hex: '#B5A0E8', rgb: [181, 160, 232], group: 'Pastel' },
    { name: 'Peach', hex: '#FFCBA4', rgb: [255, 203, 164], group: 'Pastel' },
    { name: 'Mint', hex: '#A8E6CF', rgb: [168, 230, 207], group: 'Pastel' },
    { name: 'Baby Blue', hex: '#A8D8EA', rgb: [168, 216, 234], group: 'Pastel' },
    { name: 'Rose', hex: '#FFB7B2', rgb: [255, 183, 178], group: 'Pastel' },
    { name: 'Lemon', hex: '#FFEAA7', rgb: [255, 234, 167], group: 'Pastel' },
    // Dark
    { name: 'Void Black', hex: '#0A0A0F', rgb: [10, 10, 15], group: 'Dark' },
    { name: 'Deep Space', hex: '#0D0D1A', rgb: [13, 13, 26], group: 'Dark' },
    { name: 'Midnight', hex: '#1A1A2E', rgb: [26, 26, 46], group: 'Dark' },
    { name: 'Dark Slate', hex: '#16213E', rgb: [22, 33, 62], group: 'Dark' },
    { name: 'Carbon', hex: '#2C2C2C', rgb: [44, 44, 44], group: 'Dark' },
    { name: 'Charcoal', hex: '#36454F', rgb: [54, 69, 79], group: 'Dark' },
    // Material
    { name: 'Red 500', hex: '#F44336', rgb: [244, 67, 54], group: 'Material' },
    { name: 'Pink 500', hex: '#E91E63', rgb: [233, 30, 99], group: 'Material' },
    { name: 'Purple 500', hex: '#9C27B0', rgb: [156, 39, 176], group: 'Material' },
    { name: 'Blue 500', hex: '#2196F3', rgb: [33, 150, 243], group: 'Material' },
    { name: 'Teal 500', hex: '#009688', rgb: [0, 150, 136], group: 'Material' },
    { name: 'Green 500', hex: '#4CAF50', rgb: [76, 175, 80], group: 'Material' },
    { name: 'Amber 500', hex: '#FFC107', rgb: [255, 193, 7], group: 'Material' },
    { name: 'Orange 500', hex: '#FF9800', rgb: [255, 152, 0], group: 'Material' },
    // Gradients (represented as start color)
    { name: 'Sunset Start', hex: '#FF6B6B', rgb: [255, 107, 107], group: 'Vibrant' },
    { name: 'Ocean Blue', hex: '#0072FF', rgb: [0, 114, 255], group: 'Vibrant' },
    { name: 'Aurora', hex: '#00C9FF', rgb: [0, 201, 255], group: 'Vibrant' },
    { name: 'Cosmic', hex: '#8B00FF', rgb: [139, 0, 255], group: 'Vibrant' },
    { name: 'Emerald', hex: '#00B09B', rgb: [0, 176, 155], group: 'Vibrant' },
    { name: 'Gold', hex: '#F7971E', rgb: [247, 151, 30], group: 'Vibrant' },
];

const GROUPS = ['All', 'Neon', 'Pastel', 'Dark', 'Material', 'Vibrant'];

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        switch(max) {
            case r: h = ((g-b)/d + (g<b?6:0))/6; break;
            case g: h = ((b-r)/d + 2)/6; break;
            case b: h = ((r-g)/d + 4)/6; break;
        }
    }
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}

export default function Colors() {
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('All');
    const [copied, setCopied] = useState(null);
    const [copyFormat, setCopyFormat] = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        return PALETTES.filter(c => {
            const matchesGroup = group === 'All' || c.group === group;
            const matchesSearch = !search ||
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.hex.toLowerCase().includes(search.toLowerCase());
            return matchesGroup && matchesSearch;
        });
    }, [search, group]);

    const copy = (text, id, format) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setCopyFormat(format);
        setTimeout(() => { setCopied(null); setCopyFormat(''); }, 1500);
    };

    const getLuminance = (hex) => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return (0.299*r + 0.587*g + 0.114*b) / 255;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>COLOR SPECTRUM</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        {filtered.length} colors · Click to copy HEX, RGB, or HSL
                    </p>
                </div>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search by name or hex..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '250px' }}
                />
            </div>

            {/* Group Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {GROUPS.map(g => (
                    <button key={g} onClick={() => setGroup(g)} style={{
                        background: group === g ? 'rgba(176,0,255,0.15)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${group === g ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: group === g ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '7px 16px', borderRadius: 'var(--radius-small)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                    }}>{g}</button>
                ))}
            </div>

            {/* Selected Color Preview */}
            {selected && (
                <div className="card" style={{ marginBottom: '15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-medium)', background: selected.hex, border: '2px solid rgba(255,255,255,0.1)', boxShadow: `0 0 30px ${selected.hex}60` }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '5px' }}>{selected.name}</div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'HEX', value: selected.hex },
                                { label: 'RGB', value: `rgb(${selected.rgb.join(', ')})` },
                                { label: 'HSL', value: hexToHSL(selected.hex) },
                            ].map(fmt => (
                                <button key={fmt.label} onClick={() => copy(fmt.value, 'preview-' + fmt.label, fmt.label)} style={{
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)', padding: '6px 14px', borderRadius: 'var(--radius-small)',
                                    cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600,
                                    transition: 'all 0.15s'
                                }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(176,0,255,0.1)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                                >
                                    {copied === 'preview-' + fmt.label ? '✓ Copied!' : `${fmt.label}: ${fmt.value}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Color Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px', alignContent: 'start', paddingBottom: '20px' }}>
                {filtered.map((color, idx) => {
                    const isLight = getLuminance(color.hex) > 0.5;
                    const textColor = isLight ? '#000' : '#fff';
                    return (
                        <div
                            key={idx}
                            className="card animate-fade"
                            onClick={() => setSelected(color)}
                            style={{
                                padding: 0, overflow: 'hidden', cursor: 'pointer',
                                border: selected?.hex === color.hex ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: selected?.hex === color.hex ? `0 0 20px ${color.hex}40` : 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {/* Color swatch */}
                            <div style={{ height: '80px', background: color.hex, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: textColor, fontWeight: 900, fontSize: '0.9rem', fontFamily: 'monospace', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{color.hex}</span>
                            </div>
                            {/* Info */}
                            <div style={{ padding: '12px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-main)' }}>{color.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    rgb({color.rgb.join(', ')})
                                </div>
                            </div>
                            {/* Copy buttons */}
                            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {[['HEX', color.hex], ['RGB', `rgb(${color.rgb.join(', ')})`]].map(([fmt, val]) => (
                                    <button key={fmt} onClick={e => { e.stopPropagation(); copy(val, `${idx}-${fmt}`, fmt); }} style={{
                                        flex: 1, background: 'transparent', border: 'none', borderRight: fmt === 'HEX' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        color: 'var(--text-muted)', fontSize: '0.7rem', padding: '7px', cursor: 'pointer', fontWeight: 700,
                                        transition: 'all 0.15s'
                                    }}
                                        onMouseEnter={e => { e.target.style.background = 'rgba(176,0,255,0.1)'; e.target.style.color = 'var(--text-main)'; }}
                                        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-muted)'; }}
                                    >
                                        {copied === `${idx}-${fmt}` ? '✓' : fmt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
