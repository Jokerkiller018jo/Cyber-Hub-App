import React, { useState } from 'react';
import Icon from '../components/ui/Icon';

const EMOJI_DATA = [
    // Smileys & People
    { char: '😀', name: 'Grinning Face', cat: 'smileys' },
    { char: '😂', name: 'Face with Tears of Joy', cat: 'smileys' },
    { char: '🤣', name: 'Rolling on the Floor Laughing', cat: 'smileys' },
    { char: '😉', name: 'Winking Face', cat: 'smileys' },
    { char: '😍', name: 'Smiling Face with Heart-Eyes', cat: 'smileys' },
    { char: '😎', name: 'Smiling Face with Sunglasses', cat: 'smileys' },
    { char: '🤔', name: 'Thinking Face', cat: 'smileys' },
    { char: '🙄', name: 'Face with Rolling Eyes', cat: 'smileys' },
    { char: '😱', name: 'Face Screaming in Fear', cat: 'smileys' },
    { char: '💀', name: 'Skull', cat: 'smileys' },
    { char: '👽', name: 'Alien', cat: 'smileys' },
    { char: '👾', name: 'Alien Monster', cat: 'smileys' },
    { char: '🤖', name: 'Robot', cat: 'smileys' },
    { char: '🔥', name: 'Fire', cat: 'smileys' },
    { char: '✨', name: 'Sparkles', cat: 'smileys' },
    { char: '🦾', name: 'Mechanical Arm', cat: 'smileys' },
    { char: '🧠', name: 'Brain', cat: 'smileys' },

    // Animals & Nature
    { char: '🐱', name: 'Cat Face', cat: 'animals' },
    { char: '🐶', name: 'Dog Face', cat: 'animals' },
    { char: '🦊', name: 'Fox', cat: 'animals' },
    { char: '🦁', name: 'Lion', cat: 'animals' },
    { char: '🦖', name: 'T-Rex', cat: 'animals' },
    { char: '🦕', name: 'Sauropod', cat: 'animals' },
    { char: '🐙', name: 'Octopus', cat: 'animals' },
    { char: '🦈', name: 'Shark', cat: 'animals' },
    { char: '🐝', name: 'Honeybee', cat: 'animals' },
    { char: '🕷', name: 'Spider', cat: 'animals' },
    { char: '🐉', name: 'Dragon', cat: 'animals' },

    // Food & Drink
    { char: '🍎', name: 'Red Apple', cat: 'food' },
    { char: '🍌', name: 'Banana', cat: 'food' },
    { char: '🍕', name: 'Pizza', cat: 'food' },
    { char: '🍔', name: 'Hamburger', cat: 'food' },
    { char: '🍟', name: 'French Fries', cat: 'food' },
    { char: '🍩', name: 'Donut', cat: 'food' },
    { char: '🍺', name: 'Beer Mug', cat: 'food' },
    { char: '🍷', name: 'Wine Glass', cat: 'food' },
    { char: '☕', name: 'Hot Beverage', cat: 'food' },

    // Objects / Tech
    { char: '💻', name: 'Laptop', cat: 'objects' },
    { char: '🖥', name: 'Desktop Computer', cat: 'objects' },
    { char: '📱', name: 'Mobile Phone', cat: 'objects' },
    { char: '💾', name: 'Floppy Disk', cat: 'objects' },
    { char: '💿', name: 'Optical Disk', cat: 'objects' },
    { char: '🔒', name: 'Locked', cat: 'objects' },
    { char: '🔓', name: 'Unlocked', cat: 'objects' },
    { char: '🔑', name: 'Key', cat: 'objects' },
    { char: '🛡', name: 'Shield', cat: 'objects' },
    { char: '💣', name: 'Bomb', cat: 'objects' },
    { char: '🔮', name: 'Crystal Ball', cat: 'objects' },

    // Activities & Symbols
    { char: '🎮', name: 'Video Game', cat: 'symbols' },
    { char: '🎯', name: 'Bullseye', cat: 'symbols' },
    { char: '🎲', name: 'Game Die', cat: 'symbols' },
    { char: '⚡', name: 'High Voltage', cat: 'symbols' },
    { char: '☣', name: 'Biohazard', cat: 'symbols' },
    { char: '☢', name: 'Radioactive', cat: 'symbols' },
    { char: '⚠️', name: 'Warning', cat: 'symbols' },
    { char: '🧬', name: 'DNA', cat: 'symbols' },

    // Flags
    { char: '🇺🇸', name: 'United States', cat: 'flags' },
    { char: '🇬🇧', name: 'United Kingdom', cat: 'flags' },
    { char: '🇯🇵', name: 'Japan', cat: 'flags' },
    { char: '🇩🇪', name: 'Germany', cat: 'flags' },
    { char: '🇫🇷', name: 'France', cat: 'flags' },
    { char: '☠️', name: 'Pirate Flag', cat: 'flags' }
];

export default function EmojiDatabase() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('all');
    const [copiedId, setCopiedId] = useState(null);
    const [copiedType, setCopiedType] = useState(''); // 'char' or 'hex'

    const getHexCode = (char) => {
        return Array.from(char)
            .map(c => c.codePointAt(0).toString(16).toUpperCase())
            .join('-');
    };

    const copyToClipboard = (text, id, type) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setCopiedType(type);
        setTimeout(() => {
            setCopiedId(null);
            setCopiedType('');
        }, 1500);
    };

    const categories = [
        { id: 'all', label: 'All Vectors' },
        { id: 'smileys', label: 'Smileys' },
        { id: 'animals', label: 'Fauna' },
        { id: 'food', label: 'Nutrients' },
        { id: 'objects', label: 'Hardware' },
        { id: 'symbols', label: 'Identifiers' },
        { id: 'flags', label: 'Domains' }
    ];

    const filtered = EMOJI_DATA.filter(emoji => {
        const matchesSearch = emoji.name.toLowerCase().includes(search.toLowerCase()) || 
                              emoji.char.includes(search);
        const matchesCategory = activeCat === 'all' || emoji.cat === activeCat;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Area */}
            <div style={{ 
                padding: '10px 0', 
                borderBottom: '1px solid var(--border-color)', 
                marginBottom: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>EMOJI DECRYPTION SYSTEM</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        Linked to Vector Database: 302,481,902 emoticon constructs active.
                    </p>
                </div>
                
                <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search by vector name or icon..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '280px' }}
                />
            </div>

            {/* Categories Sub-nav */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px', 
                overflowX: 'auto', 
                paddingBottom: '5px' 
            }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        style={{
                            background: activeCat === cat.id ? 'rgba(176,0,255,0.15)' : 'rgba(0,0,0,0.3)',
                            border: `1px solid ${activeCat === cat.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            color: activeCat === cat.id ? 'var(--text-main)' : 'var(--text-muted)',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-small)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            if (activeCat !== cat.id) e.target.style.borderColor = 'rgba(176,0,255,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            if (activeCat !== cat.id) e.target.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Main scrollable grid */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '15px',
                paddingBottom: '20px',
                alignContent: 'start'
            }}>
                {filtered.map((emoji, idx) => {
                    const hex = getHexCode(emoji.char);
                    const isCopied = copiedId === idx;
                    
                    return (
                        <div 
                            key={idx} 
                            className="card animate-fade" 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '12px',
                                padding: '20px 15px',
                                position: 'relative'
                            }}
                        >
                            {/* Large Character */}
                            <div style={{ 
                                fontSize: '2.5rem', 
                                userSelect: 'none',
                                filter: 'drop-shadow(0 0 10px rgba(176, 0, 255, 0.2))' 
                            }}>
                                {emoji.char}
                            </div>
                            
                            {/* Metadata */}
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '0.8rem', 
                                    color: 'var(--text-main)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {emoji.name}
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    color: 'var(--accent-dark)', 
                                    fontFamily: 'monospace', 
                                    marginTop: '2px' 
                                }}>
                                    U+{hex}
                                </div>
                            </div>

                            {/* Dual Copy Buttons */}
                            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '5px' }}>
                                <button 
                                    onClick={() => copyToClipboard(emoji.char, idx, 'char')}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(176,0,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.7rem',
                                        padding: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(176,0,255,0.15)';
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(176,0,255,0.05)';
                                        e.target.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    CHAR
                                </button>
                                <button 
                                    onClick={() => copyToClipboard(`U+${hex}`, idx, 'hex')}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(176,0,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.7rem',
                                        padding: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(176,0,255,0.15)';
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(176,0,255,0.05)';
                                        e.target.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    HEX
                                </button>
                            </div>

                            {/* Floating Copied Indicator */}
                            {isCopied && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    boxShadow: '0 0 10px rgba(176,0,255,0.5)',
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {copiedType === 'char' ? 'CHARACTER COPIED' : 'HEX COPIED'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
