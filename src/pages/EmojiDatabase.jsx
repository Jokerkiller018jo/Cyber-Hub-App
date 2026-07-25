import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ─── Curated Single Emojis ───────────────────────────────────────────────────
const CURATED_EMOJIS = [
    { char: '😀', name: 'Grinning Face', cat: 'smileys' },
    { char: '😂', name: 'Face with Tears of Joy', cat: 'smileys' },
    { char: '😎', name: 'Smiling Face with Sunglasses', cat: 'smileys' },
    { char: '👽', name: 'Alien', cat: 'smileys' },
    { char: '👾', name: 'Alien Monster', cat: 'smileys' },
    { char: '🤖', name: 'Robot', cat: 'smileys' },
    { char: '🔥', name: 'Fire', cat: 'smileys' },
    { char: '✨', name: 'Sparkles', cat: 'smileys' },
    { char: '🐱', name: 'Cat Face', cat: 'animals' },
    { char: '🐶', name: 'Dog Face', cat: 'animals' },
    { char: '🦊', name: 'Fox', cat: 'animals' },
    { char: '🐉', name: 'Dragon', cat: 'animals' },
    { char: '🍎', name: 'Red Apple', cat: 'food' },
    { char: '🍕', name: 'Pizza', cat: 'food' },
    { char: '🍔', name: 'Hamburger', cat: 'food' },
    { char: '☕', name: 'Hot Beverage', cat: 'food' },
    { char: '💻', name: 'Laptop', cat: 'objects' },
    { char: '📱', name: 'Mobile Phone', cat: 'objects' },
    { char: '🔮', name: 'Crystal Ball', cat: 'objects' },
    { char: '🎮', name: 'Video Game', cat: 'symbols' },
    { char: '⚡', name: 'High Voltage', cat: 'symbols' },
    { char: '☣', name: 'Biohazard', cat: 'symbols' },
    { char: '🇺🇸', name: 'United States', cat: 'flags' },
    { char: '☠️', name: 'Pirate Flag', cat: 'flags' }
];

const CATEGORIES = [
    { id: 'all', label: 'Curated' },
    { id: 'smileys', label: 'Smileys' },
    { id: 'animals', label: 'Fauna' },
    { id: 'food', label: 'Nutrients' },
    { id: 'objects', label: 'Hardware' },
    { id: 'symbols', label: 'Identifiers' },
    { id: 'flags', label: 'Domains' },
    { id: 'millions', label: '2.9M+ Combinations' } // The huge local list
];

const getHexCode = (char) => {
    return Array.from(char)
        .map(c => c.codePointAt(0).toString(16).toUpperCase())
        .join('-');
};

// ─── Stream the massive emoji file ──────────────────────────────────────────
async function streamEmojiFile({ signal, onBatch, maxResults = 5000, searchTerm = '' }) {
    const res = await fetch('/all_emojis.txt', { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let found = 0;
    let batch = [];

    while (found < maxResults) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
            const char = line.trim();
            if (!char) continue;

            if (!searchTerm || char.includes(searchTerm)) {
                batch.push({ char, name: 'Generated Pair', cat: 'millions' });
                found++;
                if (batch.length >= 100) {
                    onBatch([...batch]);
                    batch = [];
                }
                if (found >= maxResults) break;
            }
        }
    }

    reader.cancel();
    if (batch.length > 0) onBatch([...batch]);
    return found;
}

export default function EmojiDatabase() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('all');
    const [copiedId, setCopiedId] = useState(null);
    const [copiedType, setCopiedType] = useState(''); // 'char' or 'hex'

    const [streamResults, setStreamResults] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamError, setStreamError] = useState('');
    const abortRef = useRef(null);

    const copyToClipboard = useCallback((text, id, type) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setCopiedType(type);
        setTimeout(() => {
            setCopiedId(null);
            setCopiedType('');
        }, 1500);
    }, []);

    // ── Trigger file stream for the massive combinations list ──────────────────
    useEffect(() => {
        if (abortRef.current) abortRef.current.abort();

        if (activeCat !== 'millions') {
            setStreamResults([]);
            setStreamError('');
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setIsStreaming(true);
        setStreamError('');
        setStreamResults([]);

        (async () => {
            try {
                await streamEmojiFile({
                    signal: controller.signal,
                    searchTerm: search.trim(),
                    maxResults: 2000, // Limit UI render to prevent lag
                    onBatch: (batch) => {
                        setStreamResults(prev => [...prev, ...batch]);
                    }
                });
            } catch (e) {
                if (e.name !== 'AbortError') {
                    setStreamError('Could not read emojis file: ' + e.message);
                }
            } finally {
                setIsStreaming(false);
            }
        })();

        return () => controller.abort();
    }, [activeCat, search]);

    // ── Render Items ──────────────────────────────────────────────────────────
    const displayItems = useMemo(() => {
        if (activeCat === 'millions') {
            return streamResults;
        }
        return CURATED_EMOJIS.filter(emoji => {
            const matchesSearch = emoji.name.toLowerCase().includes(search.toLowerCase()) || emoji.char.includes(search);
            const matchesCategory = activeCat === 'all' || emoji.cat === activeCat;
            return matchesSearch && matchesCategory;
        });
    }, [activeCat, search, streamResults]);

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
                        {activeCat === 'millions'
                            ? (isStreaming ? `⟳ Querying massive local vector file... ${displayItems.length} found` : `✓ Found ${displayItems.length} combinations`)
                            : `Linked to Curated Vector Database: ${displayItems.length} active.`}
                    </p>
                </div>

                <input
                    type="text"
                    className="input-field"
                    placeholder="Search emoji or hex..."
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
                {CATEGORIES.map(cat => (
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
                            boxShadow: activeCat === cat.id && cat.id === 'millions' ? '0 0 15px rgba(176,0,255,0.4)' : 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Main scrollable grid */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {streamError && (
                    <div style={{ padding: '20px', color: '#FF6B6B', textAlign: 'center' }}>
                        ⚠ {streamError}
                    </div>
                )}
                
                {displayItems.length === 0 && !isStreaming && !streamError && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤔</div>
                        <div>No vectors matched your search criteria.</div>
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '15px',
                    paddingBottom: '20px',
                    alignContent: 'start'
                }}>
                    {displayItems.map((emoji, idx) => {
                        const hex = getHexCode(emoji.char);
                        const isCopied = copiedId === idx;
                        const uID = emoji.char + idx;

                        return (
                            <div
                                key={uID}
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
                                    fontSize: activeCat === 'millions' ? '2rem' : '2.5rem',
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
                                            flex: 1, background: 'rgba(176,0,255,0.05)',
                                            border: '1px solid var(--border-color)', borderRadius: '6px',
                                            color: 'var(--text-main)', fontSize: '0.7rem', padding: '6px', cursor: 'pointer', fontWeight: '600'
                                        }}
                                    >
                                        CHAR
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(`U+${hex}`, idx, 'hex')}
                                        style={{
                                            flex: 1, background: 'rgba(176,0,255,0.05)',
                                            border: '1px solid var(--border-color)', borderRadius: '6px',
                                            color: 'var(--text-main)', fontSize: '0.7rem', padding: '6px', cursor: 'pointer', fontWeight: '600'
                                        }}
                                    >
                                        HEX
                                    </button>
                                </div>

                                {/* Floating Copied Indicator */}
                                {isCopied && (
                                    <div style={{
                                        position: 'absolute', top: '10px', background: 'var(--accent-primary)', color: '#fff',
                                        fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px',
                                        boxShadow: '0 0 10px rgba(176,0,255,0.5)', animation: 'fadeIn 0.2s ease-out'
                                    }}>
                                        {copiedType === 'char' ? 'CHARACTER COPIED' : 'HEX COPIED'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {isStreaming && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-medium)', minHeight: '120px', color: 'var(--text-muted)', fontSize: '0.8rem', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
                        Scanning database...
                    </div>
                )}
            </div>
        </div>
    );
}
