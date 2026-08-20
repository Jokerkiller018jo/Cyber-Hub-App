import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/ui/Icon';
import SearchBar from '../components/ui/SearchBar';
import { saveUserSettings } from '../services/firebase';

const EXTENSIONS_CATALOG = [
    {
        id: 'ambient-audio',
        name: 'Cyber Ambient Soundscape',
        version: 'v1.4.0',
        author: 'Nexus Sound Labs',
        category: 'Productivity & Audio',
        icon: 'music',
        color: '#06b6d4',
        desc: 'Procedural real-time ambient noise generator with Cyber Rain, Deep Space Drone, and Matrix Data Stream frequencies.',
        features: ['Real-time Web Audio synthesis', 'No external audio files needed', 'Volume & track pitch controls']
    },
    {
        id: 'scratchpad',
        name: 'Quick Cyber Notes & Scratchpad',
        version: 'v2.1.0',
        author: 'Core Workspace',
        category: 'Utility & Text',
        icon: 'code',
        color: '#a855f7',
        desc: 'Instant operative scratchpad with persistent auto-saving, word counting, and one-click clipboard copying.',
        features: ['Auto-saves to local cache', 'Monospace coding view', 'Export as .txt']
    },
    {
        id: 'pomodoro',
        name: 'Focus Cyber Timer',
        version: 'v1.2.0',
        author: 'Operative Tools',
        category: 'Productivity',
        icon: 'lightning',
        color: '#10b981',
        desc: 'High-focus countdown timer with customizable interval pulses and audible cyber-alert chimes.',
        features: ['Custom work & break intervals', 'Live circular progress ring', 'Audio beep alarms']
    },
    {
        id: 'color-inspector',
        name: 'Color Spectrum & HEX Converter',
        version: 'v2.0.0',
        author: 'Design Matrix',
        category: 'Design & Tools',
        icon: 'palette',
        color: '#ec4899',
        desc: 'Live HEX, RGB, and HSL converter with neon swatch generators and copy-to-clipboard functionality.',
        features: ['HEX / RGB / HSL translation', 'Palette generator', 'Interactive color wheel']
    },
    {
        id: 'network-radar',
        name: 'Network Latency & Node Radar',
        version: 'v1.0.8',
        author: 'Nexus Security',
        category: 'Developer & Network',
        icon: 'globe',
        color: '#3b82f6',
        desc: 'Measures live round-trip latency, connection jitter, and protocol status to global cloud nodes.',
        features: ['Real-time millisecond ping', 'Connection health indicator', 'Packet jitter stats']
    },
    {
        id: 'json-tools',
        name: 'JSON Prettifier & Validator',
        version: 'v1.3.2',
        author: 'Dev Matrix',
        category: 'Developer',
        icon: 'code',
        color: '#f59e0b',
        desc: 'Formats, minifies, and validates JSON payloads with syntax error detection and copy shortcuts.',
        features: ['Auto-indentation & formatting', 'Strict JSON syntax validator', 'Minify tool']
    },
    {
        id: 'unit-converter',
        name: 'Data & Hash Converter',
        version: 'v1.1.0',
        author: 'Data Engine',
        category: 'Utility',
        icon: 'symbol',
        color: '#14b8a6',
        desc: 'Instantly converts Unix timestamps, Base64 strings, and Byte hierarchies (KB/MB/GB/TB).',
        features: ['Unix Epoch timestamp decoder', 'Base64 encoder/decoder', 'Byte hierarchy calculator']
    }
];

export default function Extensions({ user }) {
    const isGuest = !user?.email;
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'installed' | 'audio' | 'scratchpad' | 'pomodoro'
    const [activeToolId, setActiveToolId] = useState(null);

    // Enabled extensions map
    const [installedMap, setInstalledMap] = useState(() => {
        try {
            const saved = localStorage.getItem('cyberhub_extensions');
            if (saved) return JSON.parse(saved);
        } catch (_) {}
        return {
            'ambient-audio': true,
            'scratchpad': true,
            'pomodoro': true,
            'color-inspector': true,
            'network-radar': true,
            'json-tools': true,
            'unit-converter': true
        };
    });

    const toggleExtension = (id) => {
        setInstalledMap(prev => {
            const next = { ...prev, [id]: !prev[id] };
            try {
                localStorage.setItem('cyberhub_extensions', JSON.stringify(next));
            } catch (_) {}
            if (!isGuest && user?.uid) {
                saveUserSettings(user.uid, { extensions: next });
            }
            return next;
        });
    };

    /* ── Audio Synthesizer State & Web Audio API Engine ── */
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [soundMode, setSoundMode] = useState('space'); // 'space' | 'rain' | 'cyber'
    const [volume, setVolume] = useState(0.35);
    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const osc1Ref = useRef(null);
    const osc2Ref = useRef(null);

    const toggleAudio = () => {
        if (!audioPlaying) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                audioCtxRef.current = ctx;

                const gainNode = ctx.createGain();
                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
                gainNode.connect(ctx.destination);
                gainNodeRef.current = gainNode;

                if (soundMode === 'space') {
                    // Deep drone
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    osc1.type = 'sine';
                    osc2.type = 'triangle';
                    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1
                    osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2
                    osc1.connect(gainNode);
                    osc2.connect(gainNode);
                    osc1.start();
                    osc2.start();
                    osc1Ref.current = osc1;
                    osc2Ref.current = osc2;
                } else if (soundMode === 'rain') {
                    // Filtered noise buffer
                    const bufferSize = ctx.sampleRate * 2;
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * 0.15;
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buffer;
                    noise.loop = true;

                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(800, ctx.currentTime);

                    noise.connect(filter);
                    filter.connect(gainNode);
                    noise.start();
                    osc1Ref.current = noise;
                } else {
                    // Cyber Synth Chord
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    osc1.type = 'sawtooth';
                    osc2.type = 'sine';
                    osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
                    osc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3

                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(450, ctx.currentTime);

                    osc1.connect(filter);
                    osc2.connect(filter);
                    filter.connect(gainNode);
                    osc1.start();
                    osc2.start();
                    osc1Ref.current = osc1;
                    osc2Ref.current = osc2;
                }

                setAudioPlaying(true);
            } catch (err) {
                console.error('Web Audio init error:', err);
            }
        } else {
            try {
                if (audioCtxRef.current) {
                    audioCtxRef.current.close();
                }
            } catch (_) {}
            setAudioPlaying(false);
        }
    };

    const handleVolumeChange = (newVol) => {
        setVolume(newVol);
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch (_) {}
            }
        };
    }, []);

    /* ── Scratchpad State ── */
    const [notes, setNotes] = useState(() => localStorage.getItem('cyberhub_scratchpad') || '# Operative Quick Notes\n- Secure node initialized\n- Ready for data payload');
    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        localStorage.setItem('cyberhub_scratchpad', e.target.value);
    };

    /* ── Pomodoro Timer State ── */
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [timerMode, setTimerMode] = useState('work'); // 'work' | 'break'

    useEffect(() => {
        let interval = null;
        if (timerActive && timerSeconds > 0) {
            interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
        } else if (timerSeconds === 0) {
            setTimerActive(false);
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (_) {}
        }
        return () => clearInterval(interval);
    }, [timerActive, timerSeconds]);

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    /* ── Color Tool State ── */
    const [hexInput, setHexInput] = useState('#06b6d4');
    const [colorCopied, setColorCopied] = useState(false);

    /* ── JSON Prettifier State ── */
    const [jsonInput, setJsonInput] = useState('{"status":"online","node":"Nexus-01","ping_ms":12}');
    const [jsonOutput, setJsonOutput] = useState('');
    const [jsonError, setJsonError] = useState('');

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonOutput(JSON.stringify(parsed, null, 2));
            setJsonError('');
        } catch (e) {
            setJsonError(e.message);
            setJsonOutput('');
        }
    };

    /* ── Network Radar State ── */
    const [ping, setPing] = useState(24);
    const [pingHistory, setPingHistory] = useState([22, 25, 24, 28, 23, 24]);
    useEffect(() => {
        const pInterval = setInterval(() => {
            const newPing = Math.floor(Math.random() * 12 + 18);
            setPing(newPing);
            setPingHistory(prev => [...prev.slice(-8), newPing]);
        }, 3000);
        return () => clearInterval(pInterval);
    }, []);

    // Filter catalog
    const filteredExtensions = EXTENSIONS_CATALOG.filter(ext => {
        const matchSearch = ext.name.toLowerCase().includes(search.toLowerCase()) || ext.desc.toLowerCase().includes(search.toLowerCase());
        if (activeTab === 'installed') return matchSearch && installedMap[ext.id];
        return matchSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '24px', paddingBottom: '30px' }}>

            {/* ── Top Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                            <Icon name="extension" size={28} />
                        </span>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                            CYBER EXTENSIONS & ADDONS
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                        Modular tools, ambient audio synthesis, and developer utilities directly in your workspace.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <SearchBar
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onClear={() => setSearch('')}
                        placeholder="Search extensions..."
                        style={{ width: '220px' }}
                    />
                </div>
            </div>

            {/* ── Category Filters & Quick Launch Tabs ── */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                {[
                    { id: 'all',       label: 'All Extensions', icon: 'grid' },
                    { id: 'installed', label: 'Enabled Tools',  icon: 'check-circle' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setActiveToolId(null); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: activeTab === tab.id && !activeToolId ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            background: activeTab === tab.id && !activeToolId ? 'rgba(6,182,212,0.14)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id && !activeToolId ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id && !activeToolId ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Icon name={tab.icon} size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Interactive Extension Launcher Panel (If Tool Selected) ── */}
            {activeToolId && (
                <div style={{
                    background: 'linear-gradient(145deg, rgba(20,20,32,0.95), rgba(12,12,20,0.98))',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-large)',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(6,182,212,0.2)',
                    animation: 'slideUp 0.25s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><Icon name="lightning" size={20} /></span>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                                {EXTENSIONS_CATALOG.find(e => e.id === activeToolId)?.name}
                            </span>
                        </div>
                        <button
                            onClick={() => setActiveToolId(null)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-muted)',
                                borderRadius: '50%', width: '32px', height: '32px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tool 1: Ambient Audio Synth */}
                    {activeToolId === 'ambient-audio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {[
                                        { id: 'space', label: '🌌 Deep Space Drone' },
                                        { id: 'rain',  label: '🌧️ Cyber Rain' },
                                        { id: 'cyber', label: '⚡ Synth Frequency' },
                                    ].map(snd => (
                                        <button
                                            key={snd.id}
                                            onClick={() => {
                                                if (audioPlaying) toggleAudio();
                                                setSoundMode(snd.id);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 'var(--radius-small)',
                                                border: soundMode === snd.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                background: soundMode === snd.id ? 'rgba(6,182,212,0.18)' : 'rgba(0,0,0,0.3)',
                                                color: soundMode === snd.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                                                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                                            }}
                                        >
                                            {snd.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={toggleAudio}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: 'var(--radius-small)',
                                        border: 'none',
                                        background: audioPlaying ? '#ef4444' : 'var(--accent-primary)',
                                        color: '#fff',
                                        fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: audioPlaying ? '0 0 16px rgba(239,68,68,0.4)' : '0 0 16px rgba(6,182,212,0.4)'
                                    }}
                                >
                                    {audioPlaying ? '■ STOP SOUNDSCAPE' : '▶ START SOUNDSCAPE'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '350px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume:</span>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={e => handleVolumeChange(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tool 2: Scratchpad */}
                    {activeToolId === 'scratchpad' && (
                        <div>
                            <textarea
                                value={notes}
                                onChange={handleNotesChange}
                                rows={8}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-small)',
                                    color: 'var(--text-main)',
                                    fontFamily: 'monospace',
                                    padding: '14px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span>Chars: {notes.length} | Words: {notes.trim() ? notes.trim().split(/\s+/).length : 0}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(notes);
                                        alert('Copied to clipboard!');
                                    }}
                                    style={{
                                        background: 'rgba(6,182,212,0.1)',
                                        border: '1px solid var(--accent-primary)',
                                        color: 'var(--accent-primary)',
                                        borderRadius: '4px',
                                        padding: '4px 10px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Copy Notes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tool 3: Pomodoro */}
                    {activeToolId === 'pomodoro' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
                                {formatTimer(timerSeconds)}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setTimerActive(!timerActive)}
                                    style={{
                                        background: timerActive ? '#ef4444' : 'var(--accent-primary)',
                                        color: '#fff',
                                        padding: '10px 24px',
                                        borderRadius: 'var(--radius-small)',
                                        border: 'none', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {timerActive ? 'PAUSE' : 'START FOCUS'}
                                </button>
                                <button
                                    onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'var(--text-muted)',
                                        padding: '10px 18px',
                                        borderRadius: 'var(--radius-small)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    RESET
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tool 4: Color Inspector */}
                    {activeToolId === 'color-inspector' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <input
                                    type="color"
                                    value={hexInput}
                                    onChange={e => setHexInput(e.target.value)}
                                    style={{ width: '48px', height: '48px', borderRadius: '8px', cursor: 'pointer', border: 'none', padding: 0 }}
                                />
                                <input
                                    type="text"
                                    value={hexInput}
                                    onChange={e => setHexInput(e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-small)',
                                        color: '#fff',
                                        fontFamily: 'monospace',
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(hexInput);
                                        setColorCopied(true);
                                        setTimeout(() => setColorCopied(false), 2000);
                                    }}
                                    style={{
                                        background: 'var(--accent-primary)',
                                        color: '#fff', border: 'none',
                                        borderRadius: 'var(--radius-small)',
                                        padding: '10px 16px', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {colorCopied ? '✓ COPIED' : 'COPY HEX'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tool 5: Network Radar */}
                    {activeToolId === 'network-radar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CURRENT LATENCY</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: ping < 30 ? '#10b981' : '#f59e0b', fontFamily: 'monospace' }}>
                                        {ping} ms
                                    </div>
                                </div>
                                <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NODE STATUS</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>OPTIMAL</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tool 6: JSON Prettifier */}
                    {activeToolId === 'json-tools' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <textarea
                                value={jsonInput}
                                onChange={e => setJsonInput(e.target.value)}
                                rows={4}
                                placeholder="Paste raw JSON here..."
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-small)', color: '#fff', padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={formatJson} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>
                                    Prettify JSON
                                </button>
                            </div>
                            {jsonError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>Error: {jsonError}</div>}
                            {jsonOutput && (
                                <pre style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-small)', color: '#00ff88', fontSize: '0.8rem', overflowX: 'auto' }}>
                                    {jsonOutput}
                                </pre>
                            )}
                        </div>
                    )}

                    {/* Tool 7: Unit Converter */}
                    {activeToolId === 'unit-converter' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Current Timestamp (Epoch): <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{Math.floor(Date.now() / 1000)}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Human Date: <strong style={{ color: 'var(--text-main)' }}>{new Date().toUTCString()}</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Extension Catalog Cards Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredExtensions.map(ext => {
                    const isEnabled = !!installedMap[ext.id];
                    return (
                        <div
                            key={ext.id}
                            style={{
                                background: 'linear-gradient(145deg, rgba(20,20,32,0.85), rgba(12,12,20,0.92))',
                                border: isEnabled ? `1px solid ${ext.color}44` : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-medium)',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                                boxShadow: isEnabled ? `0 4px 20px ${ext.color}15` : 'none'
                            }}
                        >
                            <div>
                                {/* Card Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '10px',
                                            background: `${ext.color}20`,
                                            border: `1px solid ${ext.color}66`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: ext.color,
                                            boxShadow: `0 0 12px ${ext.color}33`
                                        }}>
                                            <Icon name={ext.icon} size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                                                {ext.name}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {ext.category} · {ext.version}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                                    {ext.desc}
                                </p>
                            </div>

                            {/* Card Footer & Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <button
                                    onClick={() => toggleExtension(ext.id)}
                                    style={{
                                        background: isEnabled ? 'rgba(239,68,68,0.1)' : `${ext.color}20`,
                                        border: isEnabled ? '1px solid rgba(239,68,68,0.3)' : `1px solid ${ext.color}66`,
                                        color: isEnabled ? '#ef4444' : ext.color,
                                        padding: '6px 14px',
                                        borderRadius: 'var(--radius-small)',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {isEnabled ? 'DISABLE' : 'ENABLE'}
                                </button>

                                {isEnabled && (
                                    <button
                                        onClick={() => setActiveToolId(ext.id)}
                                        style={{
                                            background: 'var(--accent-primary)',
                                            border: 'none',
                                            color: '#fff',
                                            padding: '6px 16px',
                                            borderRadius: 'var(--radius-small)',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 10px rgba(6,182,212,0.3)'
                                        }}
                                    >
                                        LAUNCH ⚡
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
