import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import SearchBar from '../components/ui/SearchBar';

// ─── Curated palettes (shown when no search is active) ────────────────────────
const PALETTES = [
    { name: 'Cyberpunk',    hex: '#B000FF', rgb: [176,0,255],   group: 'Neon' },
    { name: 'Neon Blue',    hex: '#00D4FF', rgb: [0,212,255],   group: 'Neon' },
    { name: 'Neon Green',   hex: '#00FF88', rgb: [0,255,136],   group: 'Neon' },
    { name: 'Neon Pink',    hex: '#FF006E', rgb: [255,0,110],   group: 'Neon' },
    { name: 'Neon Orange',  hex: '#FF6600', rgb: [255,102,0],   group: 'Neon' },
    { name: 'Neon Yellow',  hex: '#FFE600', rgb: [255,230,0],   group: 'Neon' },
    { name: 'Lavender',     hex: '#B5A0E8', rgb: [181,160,232], group: 'Pastel' },
    { name: 'Peach',        hex: '#FFCBA4', rgb: [255,203,164], group: 'Pastel' },
    { name: 'Mint',         hex: '#A8E6CF', rgb: [168,230,207], group: 'Pastel' },
    { name: 'Baby Blue',    hex: '#A8D8EA', rgb: [168,216,234], group: 'Pastel' },
    { name: 'Rose',         hex: '#FFB7B2', rgb: [255,183,178], group: 'Pastel' },
    { name: 'Lemon',        hex: '#FFEAA7', rgb: [255,234,167], group: 'Pastel' },
    { name: 'Void Black',   hex: '#0A0A0F', rgb: [10,10,15],    group: 'Dark' },
    { name: 'Deep Space',   hex: '#0D0D1A', rgb: [13,13,26],    group: 'Dark' },
    { name: 'Midnight',     hex: '#1A1A2E', rgb: [26,26,46],    group: 'Dark' },
    { name: 'Dark Slate',   hex: '#16213E', rgb: [22,33,62],    group: 'Dark' },
    { name: 'Carbon',       hex: '#2C2C2C', rgb: [44,44,44],    group: 'Dark' },
    { name: 'Charcoal',     hex: '#36454F', rgb: [54,69,79],    group: 'Dark' },
    { name: 'Red 500',      hex: '#F44336', rgb: [244,67,54],   group: 'Material' },
    { name: 'Pink 500',     hex: '#E91E63', rgb: [233,30,99],   group: 'Material' },
    { name: 'Purple 500',   hex: '#9C27B0', rgb: [156,39,176],  group: 'Material' },
    { name: 'Blue 500',     hex: '#2196F3', rgb: [33,150,243],  group: 'Material' },
    { name: 'Teal 500',     hex: '#009688', rgb: [0,150,136],   group: 'Material' },
    { name: 'Green 500',    hex: '#4CAF50', rgb: [76,175,80],   group: 'Material' },
    { name: 'Amber 500',    hex: '#FFC107', rgb: [255,193,7],   group: 'Material' },
    { name: 'Orange 500',   hex: '#FF9800', rgb: [255,152,0],   group: 'Material' },
    { name: 'Sunset Start', hex: '#FF6B6B', rgb: [255,107,107], group: 'Vibrant' },
    { name: 'Ocean Blue',   hex: '#0072FF', rgb: [0,114,255],   group: 'Vibrant' },
    { name: 'Aurora',       hex: '#00C9FF', rgb: [0,201,255],   group: 'Vibrant' },
    { name: 'Cosmic',       hex: '#8B00FF', rgb: [139,0,255],   group: 'Vibrant' },
    { name: 'Emerald',      hex: '#00B09B', rgb: [0,176,155],   group: 'Vibrant' },
    { name: 'Gold',         hex: '#F7971E', rgb: [247,151,30],  group: 'Vibrant' },
];

const GROUPS = ['All', '16M+ Generator'];

// ─── Color name → RGB filter function + file byte range hint ────────────────
// byteEnd: approximate upper bound in the file so we stop reading early
// Each line in the file is 8 bytes (#RRGGBB\n)
// File index of color #RRGGBB = (R*65536 + G*256 + B) * 8
const COLOR_DEFS = {
    black:    { test: (r,g,b) => r<=55  && g<=55  && b<=55,  byteEnd: (55*65536+55*256+55)*8 + 8 },
    white:    { test: (r,g,b) => r>=200 && g>=200 && b>=200, byteEnd: null },
    red:      { test: (r,g,b) => r>=150 && g<=80  && b<=80,  byteEnd: null },
    green:    { test: (r,g,b) => g>=120 && r<=80  && b<=80,  byteEnd: null },
    blue:     { test: (r,g,b) => b>=120 && r<=80  && g<=80,  byteEnd: null },
    yellow:   { test: (r,g,b) => r>=180 && g>=180 && b<=60,  byteEnd: null },
    cyan:     { test: (r,g,b) => g>=180 && b>=180 && r<=60,  byteEnd: null },
    magenta:  { test: (r,g,b) => r>=180 && b>=180 && g<=60,  byteEnd: null },
    orange:   { test: (r,g,b) => r>=200 && g>=80  && g<=165 && b<=60, byteEnd: null },
    purple:   { test: (r,g,b) => r>=80  && r<=200 && b>=80  && b<=200 && g<=80, byteEnd: null },
    pink:     { test: (r,g,b) => r>=200 && g>=100 && g<=200 && b>=150, byteEnd: null },
    brown:    { test: (r,g,b) => r>=80  && r<=180 && g>=30  && g<=110 && b<=70, byteEnd: null },
    gray:     { test: (r,g,b) => Math.abs(r-g)<=20 && Math.abs(g-b)<=20 && r>=60 && r<=200, byteEnd: null },
    grey:     { test: (r,g,b) => Math.abs(r-g)<=20 && Math.abs(g-b)<=20 && r>=60 && r<=200, byteEnd: null },
    silver:   { test: (r,g,b) => Math.abs(r-g)<=15 && Math.abs(g-b)<=15 && r>=150 && r<=220, byteEnd: null },
    navy:     { test: (r,g,b) => b>=80  && b<=180 && r<=40  && g<=40,  byteEnd: null },
    maroon:   { test: (r,g,b) => r>=80  && r<=180 && g<=40  && b<=40,  byteEnd: null },
    olive:    { test: (r,g,b) => r>=80  && r<=180 && g>=80  && g<=180 && b<=40, byteEnd: null },
    teal:     { test: (r,g,b) => g>=80  && g<=180 && b>=80  && b<=180 && r<=40, byteEnd: null },
    lime:     { test: (r,g,b) => g>=200 && r<=100 && b<=80,  byteEnd: null },
    gold:     { test: (r,g,b) => r>=180 && g>=140 && g<=215 && b<=30,  byteEnd: null },
    indigo:   { test: (r,g,b) => b>=80  && b<=200 && r>=30  && r<=120 && g<=60, byteEnd: null },
    violet:   { test: (r,g,b) => r>=150 && b>=150 && g>=50  && g<=150, byteEnd: null },
    crimson:  { test: (r,g,b) => r>=150 && r<=230 && g<=40  && b<=60,  byteEnd: null },
    coral:    { test: (r,g,b) => r>=200 && g>=80  && g<=160 && b>=60  && b<=130, byteEnd: null },
    salmon:   { test: (r,g,b) => r>=200 && g>=100 && g<=170 && b>=80  && b<=140, byteEnd: null },
    turquoise:{ test: (r,g,b) => g>=150 && b>=150 && r<=80,  byteEnd: null },
    tan:      { test: (r,g,b) => r>=180 && r<=230 && g>=140 && g<=190 && b>=80  && b<=140, byteEnd: null },
    beige:    { test: (r,g,b) => r>=220 && g>=200 && g<=245 && b>=150 && b<=220, byteEnd: null },
    ivory:    { test: (r,g,b) => r>=230 && g>=225 && b>=180 && b<=240, byteEnd: null },
    khaki:    { test: (r,g,b) => r>=180 && r<=240 && g>=170 && g<=220 && b>=70  && b<=140, byteEnd: null },
    azure:    { test: (r,g,b) => r>=180 && g>=210 && b>=220, byteEnd: null },
    lavender: { test: (r,g,b) => r>=160 && r<=240 && g>=140 && g<=220 && b>=200, byteEnd: null },
    rose:     { test: (r,g,b) => r>=220 && g>=100 && g<=180 && b>=120 && b<=200, byteEnd: null },
    mint:     { test: (r,g,b) => g>=210 && r>=100 && r<=200 && b>=140 && b<=220, byteEnd: null },
    charcoal: { test: (r,g,b) => r>=30  && r<=80  && g>=40  && g<=90  && b>=40  && b<=100, byteEnd: (80*65536+90*256+100)*8 + 8 },
    slate:    { test: (r,g,b) => r>=60  && r<=140 && g>=70  && g<=150 && b>=90  && b<=170, byteEnd: null },
};

// ─── Semantic Object Palettes ────────────────────────────────────────────────
const SEMANTIC_PALETTES = {
    apple: [
        { name: 'Apple Red', hex: '#FF0800', rgb: [255,8,0], group: 'Semantic' },
        { name: 'Apple Green', hex: '#8DB600', rgb: [141,182,0], group: 'Semantic' },
        { name: 'Apple Yellow', hex: '#E2B714', rgb: [226,183,20], group: 'Semantic' },
    ],
    banana: [
        { name: 'Banana Yellow', hex: '#FFE135', rgb: [255,225,53], group: 'Semantic' },
        { name: 'Banana Green', hex: '#9CB134', rgb: [156,177,52], group: 'Semantic' },
        { name: 'Banana Brown', hex: '#654321', rgb: [101,67,33], group: 'Semantic' },
    ],
    sky: [
        { name: 'Deep Sky', hex: '#00BFFF', rgb: [0,191,255], group: 'Semantic' },
        { name: 'Light Sky', hex: '#87CEFA', rgb: [135,206,250], group: 'Semantic' },
        { name: 'Sunset Orange', hex: '#FF4500', rgb: [255,69,0], group: 'Semantic' },
    ],
    ocean: [
        { name: 'Ocean Blue', hex: '#0077BE', rgb: [0,119,190], group: 'Semantic' },
        { name: 'Deep Sea', hex: '#00008B', rgb: [0,0,139], group: 'Semantic' },
        { name: 'Seafoam', hex: '#71EEB8', rgb: [113,238,184], group: 'Semantic' },
    ],
    fire: [
        { name: 'Flame Red', hex: '#E25822', rgb: [226,88,34], group: 'Semantic' },
        { name: 'Fire Orange', hex: '#FF4500', rgb: [255,69,0], group: 'Semantic' },
        { name: 'Blaze Yellow', hex: '#FFD700', rgb: [255,215,0], group: 'Semantic' },
    ],
    blood: [
        { name: 'Blood Red', hex: '#8A0303', rgb: [138,3,3], group: 'Semantic' },
        { name: 'Crimson', hex: '#DC143C', rgb: [220,20,60], group: 'Semantic' },
        { name: 'Dark Blood', hex: '#4A0404', rgb: [74,4,4], group: 'Semantic' },
    ],
    wood: [
        { name: 'Wood Brown', hex: '#966F33', rgb: [150,111,51], group: 'Semantic' },
        { name: 'Mahogany', hex: '#C04000', rgb: [192,64,0], group: 'Semantic' },
        { name: 'Oak', hex: '#A0522D', rgb: [160,82,45], group: 'Semantic' },
    ],
    sun: [
        { name: 'Sun Yellow', hex: '#FFD700', rgb: [255,215,0], group: 'Semantic' },
        { name: 'Sunburst', hex: '#FF8C00', rgb: [255,140,0], group: 'Semantic' },
        { name: 'Bright Sun', hex: '#FFFF00', rgb: [255,255,0], group: 'Semantic' },
    ],
    grass: [
        { name: 'Grass Green', hex: '#7CFC00', rgb: [124,252,0], group: 'Semantic' },
        { name: 'Lawn Green', hex: '#32CD32', rgb: [50,205,50], group: 'Semantic' },
        { name: 'Forest', hex: '#228B22', rgb: [34,139,34], group: 'Semantic' },
    ],
    water: [
        { name: 'Water Blue', hex: '#00FFFF', rgb: [0,255,255], group: 'Semantic' },
        { name: 'Aqua', hex: '#7FFFD4', rgb: [127,255,212], group: 'Semantic' },
        { name: 'Turquoise', hex: '#40E0D0', rgb: [64,224,208], group: 'Semantic' },
    ],
    earth: [
        { name: 'Earth Green', hex: '#4B5320', rgb: [75,83,32], group: 'Semantic' },
        { name: 'Earth Blue', hex: '#0000FF', rgb: [0,0,255], group: 'Semantic' },
        { name: 'Earth Brown', hex: '#8B4513', rgb: [139,69,19], group: 'Semantic' },
    ],
    cherry: [
        { name: 'Cherry Red', hex: '#D2042D', rgb: [210,4,45], group: 'Semantic' },
        { name: 'Stem Green', hex: '#556B2F', rgb: [85,107,47], group: 'Semantic' },
    ],
    coffee: [
        { name: 'Espresso', hex: '#362312', rgb: [54,35,18], group: 'Semantic' },
        { name: 'Latte', hex: '#C68E58', rgb: [198,142,88], group: 'Semantic' },
        { name: 'Caramel', hex: '#65350F', rgb: [101,53,15], group: 'Semantic' },
    ],
    night: [
        { name: 'Midnight Blue', hex: '#191970', rgb: [25,25,112], group: 'Semantic' },
        { name: 'Moonlight', hex: '#F6F1D5', rgb: [246,241,213], group: 'Semantic' },
        { name: 'Dark Navy', hex: '#000080', rgb: [0,0,128], group: 'Semantic' },
    ]
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function hexToRGB(hex) {
    return [
        parseInt(hex.slice(1,3), 16),
        parseInt(hex.slice(3,5), 16),
        parseInt(hex.slice(5,7), 16),
    ];
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
}

function hexToHSLObj(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max+min)/2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        switch(max) {
            case r: h = ((g-b)/d + (g<b?6:0))/6; break;
            case g: h = ((b-r)/d + 2)/6; break;
            case b: h = ((r-g)/d + 4)/6; break;
        }
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1-l) / 100;
    const f = n => {
        const k = (n + h/30) % 12;
        const color = l - a * Math.max(Math.min(k-3, 9-k, 1), -1);
        return Math.round(255*color).toString(16).padStart(2,'0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHSLStr(hex) {
    const { h, s, l } = hexToHSLObj(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function getLuminance(hex) {
    const [r,g,b] = hexToRGB(hex);
    return (0.299*r + 0.587*g + 0.114*b) / 255;
}

function parseHexSearch(s) {
    const clean = s.startsWith('#') ? s : '#' + s;
    if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
        const [,a,b,c] = clean;
        return `#${a}${a}${b}${b}${c}${c}`.toUpperCase();
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean.toUpperCase();
    return null;
}

// ─── Generate matching colors locally ──────────────────────────────────────────
async function generateColors({ colorDef, signal, onBatch, maxResults = 2500 }) {
    let found = 0;
    let batch = [];
    
    // We yield to the event loop occasionally so the UI doesn't freeze
    for (let r = 0; r < 256; r++) {
        for (let g = 0; g < 256; g++) {
            for (let b = 0; b < 256; b++) {
                if (signal.aborted) return found;
                
                if (colorDef.test(r, g, b)) {
                    const hex = rgbToHex(r, g, b);
                    batch.push({ name: hex, hex, rgb: [r, g, b], group: 'Search' });
                    found++;
                    
                    if (batch.length >= 200) {
                        onBatch([...batch]);
                        batch = [];
                        await new Promise(res => setTimeout(res, 0)); // yield
                    }
                    
                    if (found >= maxResults) {
                        if (batch.length > 0) onBatch([...batch]);
                        return found;
                    }
                }
            }
        }
    }
    
    if (batch.length > 0) onBatch([...batch]);
    return found;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Colors() {
    const [search, setSearch]       = useState('');
    const [group, setGroup]         = useState('All');
    const [copied, setCopied]       = useState(null);
    const [selected, setSelected]   = useState(null);
    const [streamResults, setStreamResults] = useState([]);
    const [isStreaming, setIsStreaming]      = useState(false);
    const [streamDone, setStreamDone]        = useState(false);
    const [streamError, setStreamError]      = useState('');
    const abortRef = useRef(null);

    // 16M+ Generator
    const [genRGB, setGenRGB] = useState({ r: 176, g: 0, b: 255 });
    const generatedHex = useMemo(() => rgbToHex(genRGB.r, genRGB.g, genRGB.b), [genRGB]);
    const generatedHSL = useMemo(() => hexToHSLObj(generatedHex), [generatedHex]);

    const handleRGBChange = (c, val) =>
        setGenRGB(prev => ({ ...prev, [c]: Math.min(255, Math.max(0, parseInt(val)||0)) }));

    const handleHSLChange = (h, s, l) => {
        const hex = hslToHex(h, s, l);
        const [r,g,b] = hexToRGB(hex);
        setGenRGB({ r, g, b });
    };

    const copy = useCallback((text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    }, []);

    // ── Trigger file stream whenever search term changes ──────────────────────
    useEffect(() => {
        // Cancel any previous stream
        if (abortRef.current) abortRef.current.abort();

        const s = search.trim().toLowerCase();

        // Reset stream state
        setStreamResults([]);
        setStreamDone(false);
        setStreamError('');

        if (!s || group === '16M+ Generator') return;

        // Direct hex code search
        const hexMatch = parseHexSearch(s);
        if (hexMatch) {
            const [r,g,b] = hexToRGB(hexMatch);
            setStreamResults([{ name: hexMatch, hex: hexMatch, rgb:[r,g,b], group:'Search' }]);
            setStreamDone(true);
            return;
        }

        // Semantic object matching
        let semanticMatches = [];
        for (const [key, colors] of Object.entries(SEMANTIC_PALETTES)) {
            if (key.includes(s) || s.includes(key)) {
                semanticMatches.push(...colors);
            }
        }
        if (semanticMatches.length > 0) {
            setStreamResults(semanticMatches);
            setStreamDone(true);
            return;
        }

        // Find matching color definitions
        const matchedDefs = Object.entries(COLOR_DEFS).filter(([name]) =>
            name.includes(s) || s.includes(name)
        );

        if (matchedDefs.length === 0) return;

        const controller = new AbortController();
        abortRef.current = controller;

        // Stream the actual file
        setIsStreaming(true);
        const seen = new Set();

        (async () => {
            try {
                for (const [, colorDef] of matchedDefs) {
                    await generateColors({
                        colorDef,
                        signal: controller.signal,
                        maxResults: 2000,
                        onBatch: (batch) => {
                            const fresh = batch.filter(c => !seen.has(c.hex));
                            fresh.forEach(c => seen.add(c.hex));
                            if (fresh.length > 0) {
                                setStreamResults(prev => [...prev, ...fresh]);
                            }
                        },
                    });
                }
                setStreamDone(true);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    setStreamError('Could not read hex file: ' + e.message);
                }
            } finally {
                setIsStreaming(false);
            }
        })();

        return () => controller.abort();
    }, [search, group]);

    // ── Curated palette (no search active) ───────────────────────────────────
    const curatedResults = useMemo(() => {
        if (group === '16M+ Generator' || search.trim()) return [];
        return group === 'All' ? PALETTES : PALETTES.filter(c => c.group === group);
    }, [search, group]);

    const activeResults = search.trim() ? streamResults : curatedResults;
    const isSearchMode  = Boolean(search.trim());

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

            {/* Header */}
            <div style={{ borderBottom:'1px solid var(--border-color)', marginBottom:'20px', paddingBottom:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px' }}>
                <div>
                    <h2 style={{ color:'var(--accent-primary)', margin:0, fontSize:'1.4rem' }}>COLOR SPECTRUM</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', margin:'5px 0 0 0' }}>
                        {group === '16M+ Generator'
                            ? 'Mix any of 16,777,216 colors'
                            : isSearchMode
                                ? isStreaming
                                    ? `⟳ Scanning color spectrum… ${activeResults.length.toLocaleString()} found so far`
                                    : streamError
                                        ? `⚠ ${streamError}`
                                        : `✓ ${activeResults.length.toLocaleString()} matching colors found`
                                : `${activeResults.length} curated colors`
                        }
                    </p>
                </div>
                {group !== '16M+ Generator' && (
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        {isStreaming && (
                            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent-primary)', animation:'pulse 1s infinite' }} />
                        )}
                        <SearchBar
                            id="colors-search"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelected(null); }}
                            onClear={() => { setSearch(''); setSelected(null); }}
                            placeholder="Type 'black', 'red', 'navy', '#FF00AA'…"
                            style={{ width: '290px' }}
                        />
                    </div>
                )}
            </div>

            {/* Group tabs */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto', paddingBottom:'5px' }}>
                {GROUPS.map(g => (
                    <button key={g} onClick={() => { setGroup(g); setSelected(null); setSearch(''); }} style={{
                        background: group===g ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${group===g ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: group===g ? 'var(--text-main)' : 'var(--text-muted)',
                        padding:'7px 16px', borderRadius:'var(--radius-small)', cursor:'pointer',
                        fontSize:'0.8rem', fontWeight:600, whiteSpace:'nowrap',
                        boxShadow: group===g && g==='16M+ Generator' ? '0 0 15px rgba(6,182,212,0.3)' : 'none',
                        transition: 'all 0.15s ease',
                    }}>{g}</button>
                ))}
            </div>

            {/* ── 16M+ GENERATOR ── */}
            {group === '16M+ Generator' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px', overflowY:'auto' }}>

                    {/* Top: color preview + format copy buttons */}
                    <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px', background:'rgba(0,0,0,0.4)' }}>
                        <div style={{ width:'160px', height:'160px', borderRadius:'50%', background:generatedHex, border:'4px solid rgba(255,255,255,0.1)', boxShadow:`0 0 80px ${generatedHex}80`, marginBottom:'20px', transition:'background 0.05s' }} />
                        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' }}>
                            {[
                                { label:'HEX', value:generatedHex },
                                { label:'RGB', value:`rgb(${genRGB.r}, ${genRGB.g}, ${genRGB.b})` },
                                { label:'HSL', value:`hsl(${generatedHSL.h}, ${generatedHSL.s}%, ${generatedHSL.l}%)` },
                            ].map(fmt => (
                                <button key={fmt.label} onClick={() => copy(fmt.value,'gen-'+fmt.label)} style={{ background:'rgba(0,0,0,0.5)', border:'1px solid var(--border-color)', color:'var(--text-main)', padding:'10px 20px', borderRadius:'var(--radius-medium)', cursor:'pointer', fontSize:'0.88rem', fontFamily:'monospace', fontWeight:600, transition:'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-primary)'; e.currentTarget.style.background='rgba(6,182,212,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.background='rgba(0,0,0,0.5)'; }}>
                                    {copied==='gen-'+fmt.label ? '✓ COPIED!' : `${fmt.label}: ${fmt.value}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle row: Canvas Color Wheel + RGB/HSL sliders */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px' }}>

                        {/* ── Canvas Wheel ── */}
                        <ColorWheelPicker genRGB={genRGB} setGenRGB={setGenRGB} hslToHex={hslToHex} hexToRGB={hexToRGB} hexToHSLObj={hexToHSLObj} generatedHex={generatedHex} generatedHSL={generatedHSL} />

                        {/* ── Right column: RGB + HSL ── */}
                        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                            <div className="card">
                                <h3 style={{ margin:'0 0 16px 0', color:'var(--text-main)', fontSize:'0.82rem', letterSpacing:'0.12em' }}>RGB MIXER</h3>
                                {[{k:'r',label:'Red',color:'#FF5555'},{k:'g',label:'Green',color:'#44FF88'},{k:'b',label:'Blue',color:'#5599FF'}].map(({k,label,color}) => (
                                    <div key={k} style={{ marginBottom:'14px' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                                            <span style={{ color, fontWeight:700, fontSize:'0.82rem' }}>{label}</span>
                                            <input
                                                type="number" min="0" max="255" value={genRGB[k]}
                                                onChange={e => handleRGBChange(k, e.target.value)}
                                                style={{ width:'52px', background:'rgba(0,0,0,0.4)', border:'1px solid var(--border-color)', borderRadius:'4px', color:'var(--text-main)', textAlign:'center', fontSize:'0.82rem', outline:'none', padding:'2px 4px' }}
                                            />
                                        </div>
                                        <input type="range" min="0" max="255" value={genRGB[k]} onChange={e => handleRGBChange(k,e.target.value)} style={{ width:'100%', cursor:'pointer', accentColor:color }} />
                                    </div>
                                ))}
                            </div>
                            <div className="card">
                                <h3 style={{ margin:'0 0 16px 0', color:'var(--text-main)', fontSize:'0.82rem', letterSpacing:'0.12em' }}>HSL ADJUSTER</h3>
                                {[{k:'h',label:'Hue',max:360,val:generatedHSL.h,unit:'°',color:'#a78bfa'},{k:'s',label:'Saturation',max:100,val:generatedHSL.s,unit:'%',color:'#06b6d4'},{k:'l',label:'Lightness',max:100,val:generatedHSL.l,unit:'%',color:'#fbbf24'}].map(({k,label,max,val,unit,color}) => (
                                    <div key={k} style={{ marginBottom:'14px' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                                            <span style={{ color, fontWeight:700, fontSize:'0.82rem' }}>{label}</span>
                                            <span style={{ fontFamily:'monospace', color:'var(--text-muted)', fontSize:'0.82rem' }}>{val}{unit}</span>
                                        </div>
                                        <input type="range" min="0" max={max} value={val} onChange={e => { const nH=k==='h'?+e.target.value:generatedHSL.h; const nS=k==='s'?+e.target.value:generatedHSL.s; const nL=k==='l'?+e.target.value:generatedHSL.l; handleHSLChange(nH,nS,nL); }} style={{ width:'100%', cursor:'pointer', accentColor:color }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── GRID ── */}
            {group !== '16M+ Generator' && (
                <>
                    {selected && (
                        <div className="card" style={{ marginBottom:'15px', display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' }}>
                            <div style={{ width:'80px', height:'80px', borderRadius:'var(--radius-medium)', background:selected.hex, border:'2px solid rgba(255,255,255,0.1)', boxShadow:`0 0 30px ${selected.hex}60`, flexShrink:0 }} />
                            <div style={{ flex:1 }}>
                                <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:'8px' }}>{selected.hex}</div>
                                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                                    {[{label:'HEX',value:selected.hex},{label:'RGB',value:`rgb(${selected.rgb.join(', ')})`},{label:'HSL',value:hexToHSLStr(selected.hex)}].map(fmt => (
                                        <button key={fmt.label} onClick={() => copy(fmt.value,'preview-'+fmt.label)} style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--border-color)', color:'var(--text-main)', padding:'6px 14px', borderRadius:'var(--radius-small)', cursor:'pointer', fontSize:'0.78rem', fontFamily:'monospace', fontWeight:600, transition:'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-primary)'; e.currentTarget.style.background='rgba(6,182,212,0.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.background='rgba(0,0,0,0.3)'; }}>
                                            {copied==='preview-'+fmt.label ? '✓ Copied!' : `${fmt.label}: ${fmt.value}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ flex:1, overflowY:'auto', paddingBottom:'20px' }}>
                        {/* Empty state */}
                        {activeResults.length === 0 && !isStreaming && (
                            <div style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)' }}>
                                <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🎨</div>
                                {isSearchMode && !streamError
                                    ? <div>No colors matched. Try <strong>black</strong>, <strong>red</strong>, <strong>navy</strong>, or <strong>#FF00AA</strong></div>
                                    : streamError
                                        ? <div style={{ color:'#FF6B6B' }}>{streamError}</div>
                                        : <div>Search for a color above</div>
                                }
                            </div>
                        )}

                        {/* Streaming skeleton tiles */}
                        {isStreaming && activeResults.length === 0 && (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:'10px' }}>
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} style={{ borderRadius:'var(--radius-medium)', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', animation:'pulse 1.5s infinite', animationDelay:`${i*0.05}s` }}>
                                        <div style={{ height:'72px', background:'rgba(255,255,255,0.04)' }} />
                                        <div style={{ padding:'10px 12px' }}>
                                            <div style={{ height:'10px', width:'70%', background:'rgba(255,255,255,0.06)', borderRadius:'4px', marginBottom:'6px' }} />
                                            <div style={{ height:'8px', width:'50%', background:'rgba(255,255,255,0.04)', borderRadius:'4px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Results grid */}
                        {activeResults.length > 0 && (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:'10px', alignContent:'start' }}>
                                {activeResults.map((color, idx) => {
                                    const isLight = getLuminance(color.hex) > 0.55;
                                    const txtClr  = isLight ? '#111' : '#fff';
                                    const isSel   = selected?.hex === color.hex;
                                    return (
                                        <div key={color.hex+idx}
                                            className="card animate-fade"
                                            onClick={() => setSelected(color)}
                                            style={{ padding:0, overflow:'hidden', cursor:'pointer', border: isSel?'2px solid var(--accent-primary)':'1px solid rgba(255,255,255,0.07)', boxShadow: isSel?`0 0 18px ${color.hex}50`:'none', transition:'all 0.18s' }}>
                                            <div style={{ height:'72px', background:color.hex, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                <span style={{ color:txtClr, fontWeight:800, fontSize:'0.78rem', fontFamily:'monospace', letterSpacing:'0.04em', textShadow: isLight?'none':'0 1px 4px rgba(0,0,0,0.6)' }}>{color.hex}</span>
                                            </div>
                                            <div style={{ padding:'8px 12px' }}>
                                                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{color.rgb.join(', ')}</div>
                                            </div>
                                            <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                                                {[['HEX',color.hex],['RGB',`rgb(${color.rgb.join(',')})`]].map(([fmt,val]) => (
                                                    <button key={fmt}
                                                        onClick={e => { e.stopPropagation(); copy(val,`${color.hex}-${fmt}`); }}
                                                        style={{ flex:1, background:'transparent', border:'none', borderRight: fmt==='HEX'?'1px solid rgba(255,255,255,0.05)':'none', color:'var(--text-muted)', fontSize:'0.68rem', padding:'6px', cursor:'pointer', fontWeight:700, transition:'all 0.12s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background='rgba(6,182,212,0.1)'; e.currentTarget.style.color='var(--text-main)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}>
                                                        {copied===`${color.hex}-${fmt}` ? '✓' : fmt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Live streaming indicator at the end */}
                                {isStreaming && (
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed var(--border-color)', borderRadius:'var(--radius-medium)', minHeight:'120px', color:'var(--text-muted)', fontSize:'0.8rem', gap:'8px' }}>
                                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent-primary)', animation:'pulse 1s infinite' }} />
                                        scanning…
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Canvas-based 2D Color Wheel + Hue strip ───────────────────────────────── */
function ColorWheelPicker({ genRGB, setGenRGB, hslToHex, hexToRGB, hexToHSLObj, generatedHex, generatedHSL }) {
    const wheelRef  = useRef(null);
    const stripRef  = useRef(null);
    const dragging  = useRef(null);
    const SIZE = 240;
    const STRIP_H = 20;

    /* Draw the SL square for current Hue */
    useEffect(() => {
        const canvas = wheelRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // White → current hue gradient (left–right)
        const hueHex = hslToHex(generatedHSL.h, 100, 50);
        const gH = ctx.createLinearGradient(0, 0, SIZE, 0);
        gH.addColorStop(0, '#fff');
        gH.addColorStop(1, hueHex);
        ctx.fillStyle = gH;
        ctx.fillRect(0, 0, SIZE, SIZE);
        // Transparent → black gradient (top–bottom)
        const gV = ctx.createLinearGradient(0, 0, 0, SIZE);
        gV.addColorStop(0, 'rgba(0,0,0,0)');
        gV.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gV;
        ctx.fillRect(0, 0, SIZE, SIZE);
    }, [generatedHSL.h]);

    /* Draw the rainbow hue strip */
    useEffect(() => {
        const canvas = stripRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, SIZE, 0);
        for (let i = 0; i <= 360; i += 30)
            g.addColorStop(i / 360, `hsl(${i},100%,50%)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SIZE, STRIP_H);
    }, []);

    /* Pointer on the SL square */
    const slX = (generatedHSL.s / 100) * SIZE;
    const slY = (1 - generatedHSL.l / 100) * SIZE;  // approximate

    function pickFromWheel(e) {
        const canvas = wheelRef.current;
        const rect = canvas.getBoundingClientRect();
        const cx = Math.max(0, Math.min(SIZE, (e.clientX - rect.left) * (SIZE / rect.width)));
        const cy = Math.max(0, Math.min(SIZE, (e.clientY - rect.top)  * (SIZE / rect.height)));
        const s  = Math.round((cx / SIZE) * 100);
        const l  = Math.round((1 - cy / SIZE) * 100);
        const hex = hslToHex(generatedHSL.h, s, l);
        const [r, g, b] = hexToRGB(hex);
        setGenRGB({ r, g, b });
    }

    function pickFromStrip(e) {
        const canvas = stripRef.current;
        const rect = canvas.getBoundingClientRect();
        const cx = Math.max(0, Math.min(SIZE, (e.clientX - rect.left) * (SIZE / rect.width)));
        const h  = Math.round((cx / SIZE) * 360);
        const hex = hslToHex(h, generatedHSL.s, generatedHSL.l);
        const [r, g, b] = hexToRGB(hex);
        setGenRGB({ r, g, b });
    }

    function onMouseDown(target, e) {
        dragging.current = target;
        if (target === 'wheel') pickFromWheel(e);
        else pickFromStrip(e);
    }

    useEffect(() => {
        function onMove(e) {
            if (!dragging.current) return;
            if (dragging.current === 'wheel') pickFromWheel(e);
            else pickFromStrip(e);
        }
        function onUp() { dragging.current = null; }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    });

    return (
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', userSelect:'none' }}>
            <h3 style={{ margin:'0 0 4px 0', color:'var(--text-main)', fontSize:'0.82rem', letterSpacing:'0.12em', alignSelf:'flex-start' }}>COLOR WHEEL</h3>

            {/* SL Square */}
            <div style={{ position:'relative', width:SIZE, height:SIZE, borderRadius:'var(--radius-small)', overflow:'hidden', cursor:'crosshair', boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}
                onMouseDown={e => onMouseDown('wheel', e)}>
                <canvas ref={wheelRef} width={SIZE} height={SIZE} style={{ display:'block', width:SIZE, height:SIZE }} />
                {/* Cursor */}
                <div style={{
                    position:'absolute',
                    left: `${slX}px`,
                    top:  `${slY}px`,
                    transform: 'translate(-50%,-50%)',
                    width: '14px', height: '14px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    background: generatedHex,
                }} />
            </div>

            {/* Hue Strip */}
            <div style={{ position:'relative', width:SIZE, height:STRIP_H, borderRadius:'4px', overflow:'hidden', cursor:'ew-resize', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}
                onMouseDown={e => onMouseDown('strip', e)}>
                <canvas ref={stripRef} width={SIZE} height={STRIP_H} style={{ display:'block', width:SIZE, height:STRIP_H }} />
                {/* Hue cursor */}
                <div style={{
                    position:'absolute',
                    left: `${(generatedHSL.h / 360) * SIZE}px`,
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    background: `hsl(${generatedHSL.h},100%,50%)`,
                }} />
            </div>

            {/* Hex direct input */}
            <div style={{ display:'flex', gap:'8px', alignItems:'center', width:'100%' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:700 }}>HEX</span>
                <input
                    type="text"
                    value={generatedHex}
                    onChange={e => {
                        const val = e.target.value.trim();
                        const clean = val.startsWith('#') ? val : '#' + val;
                        if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
                            const [r,g,b] = hexToRGB(clean.toUpperCase());
                            setGenRGB({ r, g, b });
                        }
                    }}
                    style={{
                        flex:1, background:'rgba(0,0,0,0.4)', border:'1px solid var(--border-color)',
                        borderRadius:'var(--radius-small)', color:'var(--text-main)',
                        fontFamily:'monospace', fontSize:'0.9rem', padding:'6px 10px', outline:'none',
                        letterSpacing:'0.05em',
                    }}
                    maxLength={7}
                />
                <div style={{ width:'32px', height:'32px', borderRadius:'var(--radius-small)', background:generatedHex, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }} />
            </div>
        </div>
    );
}
