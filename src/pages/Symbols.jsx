import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { EMOJI_CATEGORIES } from './EmojiCategories';
import Colors from './Colors';

// ─── Unicode ranges with category + group info ────────────────────────────────
const UNICODE_RANGES = [
    // Basic / Common
    { id: 'ascii',        label: 'ASCII Printable',      start: 0x0020, end: 0x007E, group: 'Basic', icon: '🔤' },
    { id: 'latin1',       label: 'Latin-1 Supplement',   start: 0x00A0, end: 0x00FF, group: 'Basic', icon: '🅰️' },
    { id: 'latinext',     label: 'Latin Extended',        start: 0x0100, end: 0x024F, group: 'Basic', icon: '🔡' },
    { id: 'ipaext',       label: 'IPA / Phonetic',        start: 0x0250, end: 0x02FF, group: 'Basic', icon: '🗣️' },
    { id: 'combining',    label: 'Combining Diacritics',  start: 0x0300, end: 0x036F, group: 'Basic', icon: '◌' },
    // Scripts
    { id: 'greek',        label: 'Greek & Coptic',        start: 0x0370, end: 0x03FF, group: 'Scripts', icon: 'Ω' },
    { id: 'cyrillic',     label: 'Cyrillic',              start: 0x0400, end: 0x04FF, group: 'Scripts', icon: 'Я' },
    { id: 'cyrillic2',    label: 'Cyrillic Supplement',   start: 0x0500, end: 0x052F, group: 'Scripts', icon: 'Ԑ' },
    { id: 'armenian',     label: 'Armenian',              start: 0x0530, end: 0x058F, group: 'Scripts', icon: 'Ա' },
    { id: 'hebrew',       label: 'Hebrew',                start: 0x0590, end: 0x05FF, group: 'Scripts', icon: 'א' },
    { id: 'arabic',       label: 'Arabic',                start: 0x0600, end: 0x06FF, group: 'Scripts', icon: 'ع' },
    { id: 'syriac',       label: 'Syriac',                start: 0x0700, end: 0x074F, group: 'Scripts', icon: 'ܐ' },
    { id: 'devanagari',   label: 'Devanagari',            start: 0x0900, end: 0x097F, group: 'Scripts', icon: 'अ' },
    { id: 'bengali',      label: 'Bengali',               start: 0x0980, end: 0x09FF, group: 'Scripts', icon: 'অ' },
    { id: 'gurmukhi',     label: 'Gurmukhi',              start: 0x0A00, end: 0x0A7F, group: 'Scripts', icon: 'ਅ' },
    { id: 'gujarati',     label: 'Gujarati',              start: 0x0A80, end: 0x0AFF, group: 'Scripts', icon: 'અ' },
    { id: 'tamil',        label: 'Tamil',                 start: 0x0B80, end: 0x0BFF, group: 'Scripts', icon: 'அ' },
    { id: 'telugu',       label: 'Telugu',                start: 0x0C00, end: 0x0C7F, group: 'Scripts', icon: 'అ' },
    { id: 'kannada',      label: 'Kannada',               start: 0x0C80, end: 0x0CFF, group: 'Scripts', icon: 'ಅ' },
    { id: 'malayalam',    label: 'Malayalam',             start: 0x0D00, end: 0x0D7F, group: 'Scripts', icon: 'അ' },
    { id: 'thai',         label: 'Thai',                  start: 0x0E00, end: 0x0E7F, group: 'Scripts', icon: 'ก' },
    { id: 'lao',          label: 'Lao',                   start: 0x0E80, end: 0x0EFF, group: 'Scripts', icon: 'ກ' },
    { id: 'tibetan',      label: 'Tibetan',               start: 0x0F00, end: 0x0FFF, group: 'Scripts', icon: '༁' },
    { id: 'myanmar',      label: 'Myanmar',               start: 0x1000, end: 0x109F, group: 'Scripts', icon: 'က' },
    { id: 'georgian',     label: 'Georgian',              start: 0x10A0, end: 0x10FF, group: 'Scripts', icon: 'Ⴀ' },
    { id: 'ethiopic',     label: 'Ethiopic',              start: 0x1200, end: 0x137F, group: 'Scripts', icon: 'አ' },
    { id: 'cherokee',     label: 'Cherokee',              start: 0x13A0, end: 0x13FF, group: 'Scripts', icon: 'Ꭰ' },
    { id: 'khmer',        label: 'Khmer',                 start: 0x1780, end: 0x17FF, group: 'Scripts', icon: 'ក' },
    { id: 'mongolian',    label: 'Mongolian',             start: 0x1800, end: 0x18AF, group: 'Scripts', icon: 'ᠠ' },
    { id: 'runic',        label: 'Runic',                 start: 0x16A0, end: 0x16FF, group: 'Scripts', icon: 'ᚠ' },
    { id: 'ogham',        label: 'Ogham',                 start: 0x1680, end: 0x169F, group: 'Scripts', icon: 'ᚁ' },
    // Symbols & Punctuation
    { id: 'genpunct',     label: 'General Punctuation',   start: 0x2000, end: 0x206F, group: 'Symbols & Punctuation', icon: '…' },
    { id: 'currency',     label: 'Currency Symbols',      start: 0x20A0, end: 0x20CF, group: 'Symbols & Punctuation', icon: '€' },
    { id: 'letterlike',   label: 'Letterlike Symbols',    start: 0x2100, end: 0x214F, group: 'Symbols & Punctuation', icon: '℃' },
    { id: 'numforms',     label: 'Number Forms',          start: 0x2150, end: 0x218F, group: 'Symbols & Punctuation', icon: '½' },
    { id: 'arrows',       label: 'Arrows',                start: 0x2190, end: 0x21FF, group: 'Symbols & Punctuation', icon: '→' },
    { id: 'mathops',      label: 'Math Operators',        start: 0x2200, end: 0x22FF, group: 'Symbols & Punctuation', icon: '∑' },
    { id: 'misc_tech',    label: 'Misc Technical',        start: 0x2300, end: 0x23FF, group: 'Symbols & Punctuation', icon: '⌨' },
    { id: 'enclosed',     label: 'Enclosed Alphanumerics',start: 0x2460, end: 0x24FF, group: 'Symbols & Punctuation', icon: '①' },
    { id: 'box',          label: 'Box Drawing',           start: 0x2500, end: 0x257F, group: 'Symbols & Punctuation', icon: '┼' },
    { id: 'block',        label: 'Block Elements',        start: 0x2580, end: 0x259F, group: 'Symbols & Punctuation', icon: '▓' },
    { id: 'geom',         label: 'Geometric Shapes',      start: 0x25A0, end: 0x25FF, group: 'Symbols & Punctuation', icon: '◆' },
    { id: 'misc_sym',     label: 'Miscellaneous Symbols', start: 0x2600, end: 0x26FF, group: 'Symbols & Punctuation', icon: '☯' },
    { id: 'dingbats',     label: 'Dingbats',              start: 0x2700, end: 0x27BF, group: 'Symbols & Punctuation', icon: '✦' },
    { id: 'braille',      label: 'Braille Patterns',      start: 0x2800, end: 0x28FF, group: 'Symbols & Punctuation', icon: '⠿' },
    { id: 'supp_math',    label: 'Supplemental Math',     start: 0x2A00, end: 0x2AFF, group: 'Symbols & Punctuation', icon: '⨀' },
    { id: 'misc_sym2',    label: 'Misc Symbols & Arrows', start: 0x2B00, end: 0x2BFF, group: 'Symbols & Punctuation', icon: '⬡' },
    { id: 'supers',       label: 'Superscripts & Sub',    start: 0x2070, end: 0x209F, group: 'Symbols & Punctuation', icon: '²' },
    // CJK
    { id: 'cjk_sym',      label: 'CJK Symbols & Punct',  start: 0x3000, end: 0x303F, group: 'CJK', icon: '〒' },
    { id: 'hiragana',     label: 'Hiragana',              start: 0x3040, end: 0x309F, group: 'CJK', icon: 'あ' },
    { id: 'katakana',     label: 'Katakana',              start: 0x30A0, end: 0x30FF, group: 'CJK', icon: 'ア' },
    { id: 'bopomofo',     label: 'Bopomofo',              start: 0x3100, end: 0x312F, group: 'CJK', icon: 'ㄅ' },
    { id: 'hangul_comp',  label: 'Hangul Compatibility',  start: 0x3130, end: 0x318F, group: 'CJK', icon: 'ㄱ' },
    { id: 'enclosed_cjk', label: 'Enclosed CJK',         start: 0x3200, end: 0x32FF, group: 'CJK', icon: '㊀' },
    { id: 'cjk_compat',   label: 'CJK Compatibility',    start: 0x3300, end: 0x33FF, group: 'CJK', icon: '㎜' },
    { id: 'cjk_unified',  label: 'CJK Unified (Part 1)', start: 0x4E00, end: 0x6FFF, group: 'CJK', icon: '字' },
    { id: 'cjk_unified2', label: 'CJK Unified (Part 2)', start: 0x7000, end: 0x9FFF, group: 'CJK', icon: '語' },
    { id: 'cjk_rad',      label: 'CJK Radicals',         start: 0x2E80, end: 0x2EFF, group: 'CJK', icon: '⺀' },
    { id: 'kangxi',       label: 'Kangxi Radicals',      start: 0x2F00, end: 0x2FDF, group: 'CJK', icon: '⼀' },
    { id: 'hangul',       label: 'Hangul Syllables',     start: 0xAC00, end: 0xD7AF, group: 'CJK', icon: '가' },
    { id: 'yi',           label: 'Yi Syllables',         start: 0xA000, end: 0xA48F, group: 'CJK', icon: 'ꀀ' },
    // High Planes
    { id: 'linear_b',     label: 'Linear B',             start: 0x10000, end: 0x1007F, group: 'High Planes', icon: '𐀀' },
    { id: 'old_italic',   label: 'Old Italic',           start: 0x10300, end: 0x1032F, group: 'High Planes', icon: '𐌀' },
    { id: 'gothic',       label: 'Gothic',               start: 0x10330, end: 0x1034F, group: 'High Planes', icon: '𐌰' },
    { id: 'old_persian',  label: 'Old Persian',          start: 0x103A0, end: 0x103DF, group: 'High Planes', icon: '𐎠' },
    { id: 'byzantine_music', label: 'Byzantine Music',   start: 0x1D000, end: 0x1D0FF, group: 'High Planes', icon: '𝀀' },
    { id: 'music',        label: 'Music Notation',       start: 0x1D100, end: 0x1D1FF, group: 'High Planes', icon: '𝄞' },
    { id: 'math_alpha',   label: 'Math Alphanumerics',   start: 0x1D400, end: 0x1D7FF, group: 'High Planes', icon: '𝕬' },
    { id: 'emoji_misc',   label: 'Misc Pictograms',      start: 0x1F300, end: 0x1F5FF, group: 'High Planes', icon: '🌍' },
    { id: 'emoji_dingbat',label: 'Emoticons & Dingbats', start: 0x1F600, end: 0x1F64F, group: 'High Planes', icon: '😀' },
    { id: 'emoji_transport', label: 'Transport & Map',   start: 0x1F680, end: 0x1F6FF, group: 'High Planes', icon: '🚀' },
    { id: 'emoji_supp',   label: 'Supplemental Symbols', start: 0x1F900, end: 0x1F9FF, group: 'High Planes', icon: '🤖' },
    { id: 'cjk_ext_b',    label: 'CJK Ext-B (70k+)',    start: 0x20000, end: 0x2A6DF, group: 'High Planes', icon: '𠀀' },
    // Design & Utilities
    { id: 'colors_db',    label: 'Color Center',        start: 0, end: 0, group: 'Design & Utilities', icon: '🎨', isCustom: true },
    ...EMOJI_CATEGORIES.map(cat => ({ ...cat, isCustom: true, start: 0, end: 0 }))
];

// Group color accents
const GROUP_COLORS = {
    'Basic':                  { accent: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.3)' },
    'Scripts':                { accent: '#b000ff', bg: 'rgba(176,0,255,0.08)',   border: 'rgba(176,0,255,0.3)' },
    'Symbols & Punctuation':  { accent: '#ff6b35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.3)' },
    'CJK':                    { accent: '#ff2d78', bg: 'rgba(255,45,120,0.08)', border: 'rgba(255,45,120,0.3)' },
    'High Planes':            { accent: '#00ff88', bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.3)' },
    'Design & Utilities':     { accent: '#ffdd00', bg: 'rgba(255,221,0,0.08)',  border: 'rgba(255,221,0,0.3)' },
    'Emojis':                 { accent: '#ff8800', bg: 'rgba(255,136,0,0.08)',  border: 'rgba(255,136,0,0.3)' },
    'Favorites':              { accent: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.3)' },
};

const TOTAL = UNICODE_RANGES.reduce((acc, r) => acc + (r.end - r.start + 1), 0);
const PAGE_SIZE = 200;

function toHex(cp) { return cp.toString(16).toUpperCase().padStart(4, '0'); }
function renderChar(cp) { try { return String.fromCodePoint(cp); } catch { return '?'; } }

export default function Symbols() {
    const [search, setSearch]       = useState('');
    const [category, setCategory]   = useState(null); // null = lobby view
    const [page, setPage]           = useState(0);
    const [copied, setCopied]       = useState(null);
    const [copyType, setCopyType]   = useState('');
    const [jumpInput, setJumpInput] = useState('');
    const [jumpResult, setJumpResult] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cyberhub_favorites') || '[]'); } catch { return []; }
    });
    const gridRef = useRef(null);

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('cyberhub_favorites', JSON.stringify(next));
            return next;
        });
    };

    const activeRanges = useMemo(() => {
        if (!category) return UNICODE_RANGES;
        return UNICODE_RANGES.filter(r => r.id === category);
    }, [category]);

    const activeTotal = useMemo(() =>
        activeRanges.reduce((acc, r) => acc + (r.isCustom ? 40 : (r.end - r.start + 1)), 0),
        [activeRanges]);

    const activeRange = category ? UNICODE_RANGES.find(r => r.id === category) : null;

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        const q = search.trim().toLowerCase();
        const results = [];
        const MAX = 500;
        const rangesToSearch = category ? activeRanges : UNICODE_RANGES;

        for (const r of rangesToSearch) {
            if (r.isCustom) continue;
            for (let cp = r.start; cp <= r.end && results.length < MAX; cp++) {
                const hex = toHex(cp);
                const code = `U+${hex}`;
                const char = renderChar(cp);
                const isHexMatch = hex.toLowerCase().startsWith(q.replace('u+', '').replace('0x', ''));
                const isCodeMatch = code.toLowerCase().includes(q);
                const isCharMatch = char === q;
                const isDecMatch = String(cp) === q;
                if (isHexMatch || isCodeMatch || isCharMatch || isDecMatch) {
                    results.push({ cp, char, code, name: r.label, cat: r.id });
                }
            }
            if (results.length >= MAX) break;
        }
        return results;
    }, [search, activeRanges, category]);

    const totalPages = Math.ceil(activeTotal / PAGE_SIZE);

    const pageSymbols = useMemo(() => {
        if (searchResults || !category) return null;
        const start = page * PAGE_SIZE;
        const items = [];
        let rem = start;
        let started = false;
        for (const r of activeRanges) {
            const size = r.isCustom ? 40 : r.end - r.start + 1;
            if (!started) { if (rem >= size) { rem -= size; continue; } started = true; }
            if (r.isCustom) {
                // Placeholder emojis
                const placeholders = ['😀','😂','🔥','✨','🚀','🌟','🍔','🍎','🐶','🐱','😎','🎉','💻','📱','🎵','❤️','💎','🏆','🌍','⚡'];
                for (let i = rem; i < 40 && items.length < PAGE_SIZE; i++) {
                    const char = placeholders[i % placeholders.length];
                    const code = `EMOJI-${i}`;
                    items.push({ cp: code, char, code, name: `${r.label} Item ${i+1}`, cat: r.id });
                }
            } else {
                for (let cp = r.start + rem; cp <= r.end && items.length < PAGE_SIZE; cp++) {
                    items.push({ cp, char: renderChar(cp), code: `U+${toHex(cp)}`, name: r.label, cat: r.id });
                }
            }
            rem = 0;
            if (items.length >= PAGE_SIZE) break;
        }
        return items;
    }, [page, activeRanges, searchResults, category]);

    const displaySymbols = searchResults || pageSymbols || [];

    const handleJump = useCallback(() => {
        const raw = jumpInput.trim().toUpperCase().replace(/^U\+|^0X/, '');
        const cp = parseInt(raw, 16);
        if (isNaN(cp) || cp < 0 || cp > 0x10FFFF) { setJumpResult({ error: 'Invalid code point' }); return; }
        const char = renderChar(cp);
        const code = `U+${toHex(cp)}`;
        const range = UNICODE_RANGES.find(r => cp >= r.start && cp <= r.end);
        setJumpResult({ cp, char, code, name: range ? range.label : 'Unknown Block', cat: range?.id || '' });
    }, [jumpInput]);

    const copy = useCallback((text, id, type) => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(id); setCopyType(type);
        setTimeout(() => { setCopied(null); setCopyType(''); }, 1500);
    }, []);

    const handleCategorySelect = (id) => {
        setCategory(id);
        setPage(0);
        setSearch('');
        setJumpResult(null);
    };

    const handleBack = () => {
        setCategory(null);
        setPage(0);
        setSearch('');
        setJumpResult(null);
    };

    useEffect(() => { setPage(0); }, [search]);

    const formatNumber = (n) => n.toLocaleString();

    // Group ranges by their group
    const grouped = useMemo(() => {
        const map = {};
        for (const r of UNICODE_RANGES) {
            if (!map[r.group]) map[r.group] = [];
            map[r.group].push(r);
        }
        return map;
    }, []);

    // Filtered categories for lobby search
    const matchingGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return grouped;
        const map = {};
        for (const r of UNICODE_RANGES) {
            if (r.label.toLowerCase().includes(q) || r.group.toLowerCase().includes(q)) {
                if (!map[r.group]) map[r.group] = [];
                map[r.group].push(r);
            }
        }
        return map;
    }, [search, grouped]);

    const groupOrder = ['Favorites', 'Design & Utilities', 'Emojis', 'Basic', 'Scripts', 'Symbols & Punctuation', 'CJK', 'High Planes'];

    // Inject Favorites group into matchingGroups if any
    const groupsWithFavorites = useMemo(() => {
        const mg = { ...matchingGroups };
        if (favorites.length > 0) {
            mg['Favorites'] = UNICODE_RANGES.filter(r => favorites.includes(r.id));
        }
        return mg;
    }, [matchingGroups, favorites]);

    // ── LOBBY VIEW ──────────────────────────────────────────────────────────────
    if (!category) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '28px', paddingBottom: '24px' }}>

                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem', letterSpacing: '0.05em' }}>
                                UNICODE SYMBOLS
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '6px 0 0 0' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>{formatNumber(TOTAL)}</span>
                                &nbsp;code points across {UNICODE_RANGES.length} Unicode blocks — select a category to browse
                            </p>
                        </div>
                        {/* Global search */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Jump to U+…"
                                    value={jumpInput}
                                    onChange={e => setJumpInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJump()}
                                    style={{ width: '120px', fontSize: '0.78rem' }}
                                />
                                <button onClick={handleJump} style={{
                                    background: 'rgba(176,0,255,0.15)', border: '1px solid var(--accent-primary)',
                                    color: 'var(--text-main)', padding: '7px 12px', borderRadius: 'var(--radius-small)',
                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                                }}>GO</button>
                            </div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search categories, hex, or char…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', maxWidth: '350px' }}
                            />
                        </div>
                    </div>

                    {/* Jump Result */}
                    {jumpResult && (
                        <div style={{
                            marginTop: '12px', padding: '12px 16px', background: 'rgba(176,0,255,0.08)',
                            border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-small)',
                            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
                        }}>
                            {jumpResult.error ? (
                                <span style={{ color: '#ff4466', fontSize: '0.82rem' }}>{jumpResult.error}</span>
                            ) : (
                                <>
                                    <span style={{ fontSize: '2.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 10px rgba(176,0,255,0.6))' }}>{jumpResult.char}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{jumpResult.code} — {jumpResult.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                                            Decimal: {jumpResult.cp} · Octal: {jumpResult.cp.toString(8)} · Binary: {jumpResult.cp.toString(2)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => copy(jumpResult.char, 'jump-char', 'char')} style={copyBtn}>COPY CHAR</button>
                                        <button onClick={() => copy(jumpResult.code, 'jump-code', 'code')} style={copyBtn}>COPY CODE</button>
                                        <button onClick={() => setJumpResult(null)} style={{ ...copyBtn, background: 'transparent' }}>✕</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Global search results inline */}
                {search.trim() && searchResults !== null && (
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-primary)' }}></span>
                            SEARCH RESULTS — <span style={{ color: 'var(--accent-primary)' }}>{searchResults.length}</span>&nbsp;match{searchResults.length !== 1 ? 'es' : ''}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                            {searchResults.map((sym, idx) => (
                                <SymbolCard key={`${sym.cp}-${idx}`} sym={sym} copied={copied} copyType={copyType} copy={copy} />
                            ))}
                            {searchResults.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: '0.85rem' }}>
                                    No symbols found for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Groups */}
                {groupOrder.map(groupName => {
                    const ranges = groupsWithFavorites[groupName] || [];
                    if (ranges.length === 0) return null;
                    const colors = GROUP_COLORS[groupName] || GROUP_COLORS['Basic'];
                    const groupTotal = ranges.reduce((acc, r) => acc + (r.isCustom ? 40 : r.end - r.start + 1), 0);
                    return (
                        <div key={groupName}>
                            {/* Group heading */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                {groupName === 'Favorites' ? (
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(0, 212, 255)', display: 'inline-block', boxShadow: 'rgb(0, 212, 255) 0px 0px 10px' }}></span>
                                ) : (
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent, display: 'inline-block', boxShadow: `0 0 10px ${colors.accent}` }}></span>
                                )}
                                <span style={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px' }}>{groupName.toUpperCase()}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                    — {ranges.length} block{ranges.length !== 1 ? 's' : ''} {groupName !== 'Favorites' ? `· ${formatNumber(groupTotal)} items` : ''}
                                </span>
                            </div>
                            {/* Cards grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px' }}>
                                {ranges.map(r => {
                                    const size = r.end - r.start + 1;
                                    return (
                                        <div
                                            key={r.id}
                                            className="card"
                                            onClick={() => handleCategorySelect(r.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '14px', cursor: 'pointer', position: 'relative',
                                                transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                                                borderColor: colors.border,
                                                background: colors.bg,
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = `0 8px 24px ${colors.bg.replace('0.08', '0.35')}`;
                                                e.currentTarget.style.background = colors.bg.replace('0.08', '0.14');
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '';
                                                e.currentTarget.style.background = colors.bg;
                                            }}
                                        >
                                            {/* Favorite Star */}
                                            <div 
                                                onClick={(e) => toggleFavorite(e, r.id)}
                                                style={{
                                                    position: 'absolute', top: '8px', right: '8px', 
                                                    fontSize: '1rem', cursor: 'pointer', zIndex: 5,
                                                    color: favorites.includes(r.id) ? '#ffdd00' : 'rgba(255,255,255,0.1)',
                                                    transition: 'color 0.2s', filter: favorites.includes(r.id) ? 'drop-shadow(0 0 5px #ffdd00)' : 'none'
                                                }}
                                            >
                                                {favorites.includes(r.id) ? '★' : '☆'}
                                            </div>

                                            {/* Icon */}
                                            <div style={{
                                                width: '38px', height: '38px', flexShrink: 0,
                                                borderRadius: '8px', background: colors.bg.replace('0.08', '0.18'),
                                                border: `1px solid ${colors.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.3rem', lineHeight: 1, color: colors.accent,
                                                fontFamily: 'monospace',
                                            }}>
                                                {r.icon}
                                            </div>
                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.label}
                                                </div>
                                                <div style={{ color: colors.accent, fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>
                                                    {r.isCustom ? (r.group === 'Emojis' ? 'Emojis' : 'Tool') : `${formatNumber(size)} chars`}
                                                </div>
                                                {!r.isCustom && (
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem', fontFamily: 'monospace', marginTop: '1px' }}>
                                                        U+{toHex(r.start)}…{toHex(r.end)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (category === 'colors_db') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '14px', display: 'flex', alignItems: 'center' }}>
                    <button onClick={handleBack} style={{
                        background: 'rgba(176,0,255,0.1)', border: '1px solid var(--border-color)',
                        color: 'var(--text-main)', padding: '8px 14px', borderRadius: 'var(--radius-small)',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
                    }}>← LOBBY</button>
                    <div style={{ marginLeft: '15px', color: GROUP_COLORS['Design & Utilities'].accent, fontWeight: 900, letterSpacing: '1px' }}>COLOR CENTER</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <Colors />
                </div>
            </div>
        );
    }

    // ── SYMBOL BROWSER VIEW ──────────────────────────────────────────────────────
    const rangeColors = GROUP_COLORS[activeRange?.group] || GROUP_COLORS['Basic'];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Back button */}
                        <button onClick={handleBack} style={{
                            background: 'rgba(176,0,255,0.1)', border: '1px solid var(--border-color)',
                            color: 'var(--text-main)', padding: '8px 14px', borderRadius: 'var(--radius-small)',
                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.15s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(176,0,255,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(176,0,255,0.1)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                            ← ALL BLOCKS
                        </button>
                        <div>
                            <h2 style={{ color: rangeColors.accent, margin: 0, fontSize: '1.4rem', letterSpacing: '0.05em' }}>
                                {activeRange?.icon} {activeRange?.label?.toUpperCase()}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                                <span style={{ color: rangeColors.accent, fontWeight: 900 }}>{formatNumber(activeTotal)}</span>
                                &nbsp;items {activeRange?.isCustom ? '' : `· U+${toHex(activeRange?.start)} → U+${toHex(activeRange?.end)}`}
                                &nbsp;·&nbsp;<span style={{ color: 'var(--text-muted)' }}>{activeRange?.group}</span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Jump */}
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Jump to U+…"
                                value={jumpInput}
                                onChange={e => setJumpInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleJump()}
                                style={{ width: '120px', fontSize: '0.78rem' }}
                            />
                            <button onClick={handleJump} style={{
                                background: `${rangeColors.bg}`, border: `1px solid ${rangeColors.accent}`,
                                color: 'var(--text-main)', padding: '7px 12px', borderRadius: 'var(--radius-small)',
                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                            }}>GO</button>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search hex, char, or decimal…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '230px' }}
                        />
                    </div>
                </div>

                {/* Jump Result */}
                {jumpResult && (
                    <div style={{
                        marginTop: '12px', padding: '12px 16px', background: rangeColors.bg,
                        border: `1px solid ${rangeColors.accent}`, borderRadius: 'var(--radius-small)',
                        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
                    }}>
                        {jumpResult.error ? (
                            <span style={{ color: '#ff4466', fontSize: '0.82rem' }}>{jumpResult.error}</span>
                        ) : (
                            <>
                                <span style={{ fontSize: '2.5rem', lineHeight: 1, filter: `drop-shadow(0 0 10px ${rangeColors.accent}88)` }}>{jumpResult.char}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{jumpResult.code} — {jumpResult.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                                        Decimal: {jumpResult.cp} · Octal: {jumpResult.cp.toString(8)} · Binary: {jumpResult.cp.toString(2)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => copy(jumpResult.char, 'jump-char', 'char')} style={copyBtn}>COPY CHAR</button>
                                    <button onClick={() => copy(jumpResult.code, 'jump-code', 'code')} style={copyBtn}>COPY CODE</button>
                                    <button onClick={() => setJumpResult(null)} style={{ ...copyBtn, background: 'transparent' }}>✕</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Status bar + pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {searchResults
                        ? <span><span style={{ color: rangeColors.accent, fontWeight: 700 }}>{searchResults.length}</span> match{searchResults.length !== 1 ? 'es' : ''} for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"</span>
                        : <span>Showing <span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(page * PAGE_SIZE + 1)}</span>–<span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(Math.min((page + 1) * PAGE_SIZE, activeTotal))}</span> of <span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(activeTotal)}</span></span>
                    }
                </div>
                {!searchResults && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => setPage(0)} disabled={page === 0} style={{ ...navBtn, opacity: page === 0 ? 0.35 : 1 }}>«</button>
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ ...navBtn, opacity: page === 0 ? 0.35 : 1 }}>‹</button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', minWidth: '80px', textAlign: 'center' }}>
                            {formatNumber(page + 1)} / {formatNumber(totalPages)}
                        </span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ ...navBtn, opacity: page >= totalPages - 1 ? 0.35 : 1 }}>›</button>
                        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={{ ...navBtn, opacity: page >= totalPages - 1 ? 0.35 : 1 }}>»</button>
                        <input
                            type="number" min={1} max={totalPages} placeholder="Page #"
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    const v = parseInt(e.target.value, 10);
                                    if (!isNaN(v)) setPage(Math.max(0, Math.min(totalPages - 1, v - 1)));
                                }
                            }}
                            style={{
                                width: '70px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)',
                                borderRadius: '5px', color: 'var(--text-main)', padding: '5px 8px',
                                fontSize: '0.72rem', outline: 'none'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Symbol Grid */}
            <div ref={gridRef} style={{
                flex: 1, overflowY: 'auto', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px', alignContent: 'start', paddingBottom: '20px'
            }}>
                {displaySymbols.map((sym, idx) => (
                    <SymbolCard key={`${sym.cp}-${idx}`} sym={sym} copied={copied} copyType={copyType} copy={copy} accentColor={rangeColors.accent} />
                ))}
                {displaySymbols.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '60px 20px', fontSize: '0.85rem' }}>
                        No symbols found for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Shared Symbol Card ────────────────────────────────────────────────────────
function SymbolCard({ sym, copied, copyType, copy, accentColor = 'var(--accent-primary)' }) {
    return (
        <div className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '8px', padding: '14px 10px', position: 'relative',
            transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'default'
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}33`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div style={{
                fontSize: '2rem', userSelect: 'none', lineHeight: 1,
                filter: `drop-shadow(0 0 6px ${accentColor}44)`,
                minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {sym.char}
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: accentColor, fontWeight: 700, marginBottom: '2px' }}>
                    {sym.code}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sym.name}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button onClick={() => copy(sym.char, sym.cp, 'char')} style={copyBtn}
                    onMouseEnter={e => { e.target.style.background = `${accentColor}33`; e.target.style.borderColor = accentColor; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                >CHAR</button>
                <button onClick={() => copy(sym.code, `${sym.cp}-code`, 'code')} style={copyBtn}
                    onMouseEnter={e => { e.target.style.background = `${accentColor}33`; e.target.style.borderColor = accentColor; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                >CODE</button>
            </div>
            {(copied === sym.cp || copied === `${sym.cp}-code`) && (
                <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: accentColor, color: '#fff',
                    fontSize: '0.58rem', fontWeight: 'bold', padding: '3px 6px',
                    borderRadius: '4px', boxShadow: `0 0 8px ${accentColor}99`
                }}>
                    {copyType === 'char' ? '✓ CHAR' : '✓ CODE'}
                </div>
            )}
        </div>
    );
}

const navBtn = {
    background: 'rgba(176,0,255,0.08)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', padding: '5px 10px', borderRadius: '5px',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s',
};

const copyBtn = {
    flex: 1, background: 'rgba(176,0,255,0.05)', border: '1px solid var(--border-color)',
    borderRadius: '5px', color: 'var(--text-main)', fontSize: '0.62rem',
    padding: '5px 3px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s',
};
