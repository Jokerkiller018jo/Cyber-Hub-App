import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// Unicode ranges with category info
const UNICODE_RANGES = [
    // Basic / Common
    { id: 'ascii',        label: 'ASCII Printable',      start: 0x0020, end: 0x007E },
    { id: 'latin1',       label: 'Latin-1 Supplement',   start: 0x00A0, end: 0x00FF },
    { id: 'latinext',     label: 'Latin Extended',        start: 0x0100, end: 0x024F },
    { id: 'ipaext',       label: 'IPA / Phonetic',        start: 0x0250, end: 0x02FF },
    { id: 'spacing',      label: 'Spacing Modifiers',     start: 0x02B0, end: 0x02FF },
    { id: 'combining',    label: 'Combining Diacritics',  start: 0x0300, end: 0x036F },
    // Scripts
    { id: 'greek',        label: 'Greek & Coptic',        start: 0x0370, end: 0x03FF },
    { id: 'cyrillic',     label: 'Cyrillic',              start: 0x0400, end: 0x04FF },
    { id: 'cyrillic2',    label: 'Cyrillic Supplement',   start: 0x0500, end: 0x052F },
    { id: 'armenian',     label: 'Armenian',              start: 0x0530, end: 0x058F },
    { id: 'hebrew',       label: 'Hebrew',                start: 0x0590, end: 0x05FF },
    { id: 'arabic',       label: 'Arabic',                start: 0x0600, end: 0x06FF },
    { id: 'syriac',       label: 'Syriac',                start: 0x0700, end: 0x074F },
    { id: 'thaana',       label: 'Thaana',                start: 0x0780, end: 0x07BF },
    { id: 'devanagari',   label: 'Devanagari',            start: 0x0900, end: 0x097F },
    { id: 'bengali',      label: 'Bengali',               start: 0x0980, end: 0x09FF },
    { id: 'gurmukhi',     label: 'Gurmukhi',              start: 0x0A00, end: 0x0A7F },
    { id: 'gujarati',     label: 'Gujarati',              start: 0x0A80, end: 0x0AFF },
    { id: 'oriya',        label: 'Oriya',                 start: 0x0B00, end: 0x0B7F },
    { id: 'tamil',        label: 'Tamil',                 start: 0x0B80, end: 0x0BFF },
    { id: 'telugu',       label: 'Telugu',                start: 0x0C00, end: 0x0C7F },
    { id: 'kannada',      label: 'Kannada',               start: 0x0C80, end: 0x0CFF },
    { id: 'malayalam',    label: 'Malayalam',             start: 0x0D00, end: 0x0D7F },
    { id: 'sinhala',      label: 'Sinhala',               start: 0x0D80, end: 0x0DFF },
    { id: 'thai',         label: 'Thai',                  start: 0x0E00, end: 0x0E7F },
    { id: 'lao',          label: 'Lao',                   start: 0x0E80, end: 0x0EFF },
    { id: 'tibetan',      label: 'Tibetan',               start: 0x0F00, end: 0x0FFF },
    { id: 'myanmar',      label: 'Myanmar',               start: 0x1000, end: 0x109F },
    { id: 'georgian',     label: 'Georgian',              start: 0x10A0, end: 0x10FF },
    { id: 'hangul_jamo',  label: 'Hangul Jamo',           start: 0x1100, end: 0x11FF },
    { id: 'ethiopic',     label: 'Ethiopic',              start: 0x1200, end: 0x137F },
    { id: 'cherokee',     label: 'Cherokee',              start: 0x13A0, end: 0x13FF },
    { id: 'ucas',         label: 'Unified Canadian Aboriginal', start: 0x1400, end: 0x167F },
    { id: 'ogham',        label: 'Ogham',                 start: 0x1680, end: 0x169F },
    { id: 'runic',        label: 'Runic',                 start: 0x16A0, end: 0x16FF },
    { id: 'tagalog',      label: 'Tagalog',               start: 0x1700, end: 0x171F },
    { id: 'hanunoo',      label: "Hanun\u00F3\u02BCo",   start: 0x1720, end: 0x173F },
    { id: 'khmer',        label: 'Khmer',                 start: 0x1780, end: 0x17FF },
    { id: 'mongolian',    label: 'Mongolian',             start: 0x1800, end: 0x18AF },
    // Symbols & Punctuation
    { id: 'genpunct',     label: 'General Punctuation',   start: 0x2000, end: 0x206F },
    { id: 'supers',       label: 'Superscripts & Sub',    start: 0x2070, end: 0x209F },
    { id: 'currency',     label: 'Currency Symbols',      start: 0x20A0, end: 0x20CF },
    { id: 'combmark',     label: 'Combining Marks',       start: 0x20D0, end: 0x20FF },
    { id: 'letterlike',   label: 'Letterlike Symbols',    start: 0x2100, end: 0x214F },
    { id: 'numforms',     label: 'Number Forms',          start: 0x2150, end: 0x218F },
    { id: 'arrows',       label: 'Arrows',                start: 0x2190, end: 0x21FF },
    { id: 'mathops',      label: 'Mathematical Operators',start: 0x2200, end: 0x22FF },
    { id: 'misc_tech',    label: 'Miscellaneous Technical',start: 0x2300, end: 0x23FF },
    { id: 'control_pic',  label: 'Control Pictures',      start: 0x2400, end: 0x243F },
    { id: 'ocr',          label: 'OCR Characters',        start: 0x2440, end: 0x245F },
    { id: 'enclosed',     label: 'Enclosed Alphanumerics',start: 0x2460, end: 0x24FF },
    { id: 'box',          label: 'Box Drawing',           start: 0x2500, end: 0x257F },
    { id: 'block',        label: 'Block Elements',        start: 0x2580, end: 0x259F },
    { id: 'geom',         label: 'Geometric Shapes',      start: 0x25A0, end: 0x25FF },
    { id: 'misc_sym',     label: 'Miscellaneous Symbols', start: 0x2600, end: 0x26FF },
    { id: 'dingbats',     label: 'Dingbats',              start: 0x2700, end: 0x27BF },
    { id: 'misc_math_a',  label: 'Misc Math Symbols-A',  start: 0x27C0, end: 0x27EF },
    { id: 'supp_arrows_a',label: 'Supplemental Arrows-A', start: 0x27F0, end: 0x27FF },
    { id: 'braille',      label: 'Braille Patterns',      start: 0x2800, end: 0x28FF },
    { id: 'supp_arrows_b',label: 'Supplemental Arrows-B', start: 0x2900, end: 0x297F },
    { id: 'misc_math_b',  label: 'Misc Math Symbols-B',  start: 0x2980, end: 0x29FF },
    { id: 'supp_math',    label: 'Supplemental Math Ops', start: 0x2A00, end: 0x2AFF },
    { id: 'misc_sym2',    label: 'Misc Symbols & Arrows', start: 0x2B00, end: 0x2BFF },
    // CJK
    { id: 'cjk_rad',      label: 'CJK Radicals',          start: 0x2E80, end: 0x2EFF },
    { id: 'kangxi',       label: 'Kangxi Radicals',       start: 0x2F00, end: 0x2FDF },
    { id: 'cjk_sym',      label: 'CJK Symbols & Punct',  start: 0x3000, end: 0x303F },
    { id: 'hiragana',     label: 'Hiragana',              start: 0x3040, end: 0x309F },
    { id: 'katakana',     label: 'Katakana',              start: 0x30A0, end: 0x30FF },
    { id: 'bopomofo',     label: 'Bopomofo',              start: 0x3100, end: 0x312F },
    { id: 'hangul_comp',  label: 'Hangul Compatibility',  start: 0x3130, end: 0x318F },
    { id: 'kanbun',       label: 'Kanbun',                start: 0x3190, end: 0x319F },
    { id: 'bopomofo2',    label: 'Bopomofo Extended',     start: 0x31A0, end: 0x31BF },
    { id: 'enclosed_cjk', label: 'Enclosed CJK',         start: 0x3200, end: 0x32FF },
    { id: 'cjk_compat',   label: 'CJK Compatibility',    start: 0x3300, end: 0x33FF },
    { id: 'cjk_unified',  label: 'CJK Unified (Part 1)', start: 0x4E00, end: 0x6FFF },
    { id: 'cjk_unified2', label: 'CJK Unified (Part 2)', start: 0x7000, end: 0x9FFF },
    { id: 'yi',           label: 'Yi Syllables',          start: 0xA000, end: 0xA48F },
    { id: 'hangul',       label: 'Hangul Syllables',      start: 0xAC00, end: 0xD7AF },
    // High Planes (via surrogate pairs / fromCodePoint)
    { id: 'linear_b',     label: 'Linear B',              start: 0x10000, end: 0x1007F },
    { id: 'aegean',       label: 'Aegean Numbers',        start: 0x10100, end: 0x1013F },
    { id: 'ancient_greek_num', label: 'Ancient Greek Num',start: 0x10140, end: 0x1018F },
    { id: 'old_italic',   label: 'Old Italic',            start: 0x10300, end: 0x1032F },
    { id: 'gothic',       label: 'Gothic',                start: 0x10330, end: 0x1034F },
    { id: 'ugaritic',     label: 'Ugaritic',              start: 0x10380, end: 0x1039F },
    { id: 'old_persian',  label: 'Old Persian',           start: 0x103A0, end: 0x103DF },
    { id: 'deseret',      label: 'Deseret',               start: 0x10400, end: 0x1044F },
    { id: 'shavian',      label: 'Shavian',               start: 0x10450, end: 0x1047F },
    { id: 'osmanya',      label: 'Osmanya',               start: 0x10480, end: 0x104AF },
    { id: 'cypriot',      label: 'Cypriot',               start: 0x10800, end: 0x1083F },
    { id: 'byzantine_music', label: 'Byzantine Music',    start: 0x1D000, end: 0x1D0FF },
    { id: 'music',        label: 'Music Notation',        start: 0x1D100, end: 0x1D1FF },
    { id: 'math_alpha',   label: 'Math Alphanumerics',    start: 0x1D400, end: 0x1D7FF },
    { id: 'emoji_misc',   label: 'Misc Symbols & Pictograms', start: 0x1F300, end: 0x1F5FF },
    { id: 'emoji_dingbat',label: 'Emoticons & Dingbats',  start: 0x1F600, end: 0x1F64F },
    { id: 'emoji_transport', label: 'Transport & Map',    start: 0x1F680, end: 0x1F6FF },
    { id: 'emoji_supp',   label: 'Supplemental Symbols & Pictograms', start: 0x1F900, end: 0x1F9FF },
    { id: 'emoji_supp2',  label: 'Symbols & Pictograms Extended', start: 0x1FA00, end: 0x1FA6F },
    { id: 'emoji_supp3',  label: 'Symbols Extended-A',   start: 0x1FA70, end: 0x1FAFF },
    // CJK Extension planes
    { id: 'cjk_ext_b',    label: 'CJK Ext-B (70k chars)',start: 0x20000, end: 0x2A6DF },
    { id: 'cjk_ext_c',    label: 'CJK Ext-C',            start: 0x2A700, end: 0x2B73F },
    { id: 'cjk_ext_d',    label: 'CJK Ext-D',            start: 0x2B740, end: 0x2B81F },
    { id: 'cjk_ext_e',    label: 'CJK Ext-E',            start: 0x2B820, end: 0x2CEAF },
    { id: 'cjk_ext_f',    label: 'CJK Ext-F',            start: 0x2CEB0, end: 0x2EBEF },
    { id: 'cjk_compat2',  label: 'CJK Compat. Ideographs Supp', start: 0x2F800, end: 0x2FA1F },
    { id: 'tags',         label: 'Tags Plane',            start: 0xE0000, end: 0xE007F },
];

// Compute total symbol count
const TOTAL = UNICODE_RANGES.reduce((acc, r) => acc + (r.end - r.start + 1), 0);

const PAGE_SIZE = 200;

function toHex(cp) {
    return cp.toString(16).toUpperCase().padStart(4, '0');
}

function renderChar(cp) {
    try {
        return String.fromCodePoint(cp);
    } catch {
        return '?';
    }
}

// Prebuilt quick-lookup: given a flat index, which range + offset?
function getSymbolAt(flatIdx, ranges) {
    let rem = flatIdx;
    for (const r of ranges) {
        const size = r.end - r.start + 1;
        if (rem < size) {
            const cp = r.start + rem;
            return { cp, char: renderChar(cp), code: `U+${toHex(cp)}`, name: r.label, cat: r.id };
        }
        rem -= size;
    }
    return null;
}

export default function Symbols() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(0);
    const [copied, setCopied] = useState(null);
    const [copyType, setCopyType] = useState('');
    const [jumpInput, setJumpInput] = useState('');
    const [jumpResult, setJumpResult] = useState(null);
    const gridRef = useRef(null);

    // Active ranges based on category filter
    const activeRanges = useMemo(() => {
        if (category === 'all') return UNICODE_RANGES;
        return UNICODE_RANGES.filter(r => r.id === category);
    }, [category]);

    const activeTotal = useMemo(() =>
        activeRanges.reduce((acc, r) => acc + (r.end - r.start + 1), 0),
        [activeRanges]);

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        const q = search.trim().toLowerCase();
        const results = [];
        const MAX = 500;
        const isCurrencySearch = q === 'currency' || q === 'currencies';
        const extraCurrencyCPs = [0x0024, 0x00A2, 0x00A3, 0x00A4, 0x00A5, 0x0192, 0x0E3F, 0x20AC];

        for (const r of activeRanges) {
            for (let cp = r.start; cp <= r.end && results.length < MAX; cp++) {
                const hex = toHex(cp);
                const code = `U+${hex}`;
                const char = renderChar(cp);
                const isHexMatch = hex.toLowerCase().startsWith(q.replace('u+', '').replace('0x', ''));
                const isCodeMatch = code.toLowerCase().includes(q);
                const isCharMatch = char === q;
                const isDecMatch = String(cp) === q;
                
                let isMatch = isHexMatch || isCodeMatch || isCharMatch || isDecMatch;
                if (isCurrencySearch) {
                    if (r.id === 'currency' || extraCurrencyCPs.includes(cp)) {
                        isMatch = true;
                    }
                }

                if (isMatch) {
                    results.push({ cp, char, code, name: r.label, cat: r.id });
                }
            }
            if (results.length >= MAX) break;
        }
        return results;
    }, [search, activeRanges]);

    const totalPages = Math.ceil(activeTotal / PAGE_SIZE);

    // Page of symbols (no search)
    const pageSymbols = useMemo(() => {
        if (searchResults) return null;
        const start = page * PAGE_SIZE;
        const items = [];
        // Find starting position in activeRanges
        let rem = start;
        let started = false;
        for (const r of activeRanges) {
            const size = r.end - r.start + 1;
            if (!started) {
                if (rem >= size) { rem -= size; continue; }
                started = true;
            }
            for (let cp = r.start + rem; cp <= r.end && items.length < PAGE_SIZE; cp++) {
                items.push({ cp, char: renderChar(cp), code: `U+${toHex(cp)}`, name: r.label, cat: r.id });
            }
            rem = 0;
            if (items.length >= PAGE_SIZE) break;
        }
        return items;
    }, [page, activeRanges, searchResults]);

    const displaySymbols = searchResults || pageSymbols || [];

    // Jump to code point
    const handleJump = useCallback(() => {
        const raw = jumpInput.trim().toUpperCase().replace(/^U\+|^0X/, '');
        const cp = parseInt(raw, 16);
        if (isNaN(cp) || cp < 0 || cp > 0x10FFFF) {
            setJumpResult({ error: 'Invalid code point' });
            return;
        }
        const char = renderChar(cp);
        const code = `U+${toHex(cp)}`;
        const range = UNICODE_RANGES.find(r => cp >= r.start && cp <= r.end);
        setJumpResult({ cp, char, code, name: range ? range.label : 'Unknown Block', cat: range?.id || '' });
    }, [jumpInput]);

    const copy = useCallback((text, id, type) => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(id);
        setCopyType(type);
        setTimeout(() => { setCopied(null); setCopyType(''); }, 1500);
    }, []);

    const handleCategoryChange = (id) => {
        setCategory(id);
        setPage(0);
        setSearch('');
    };

    // Reset page when search changes
    useEffect(() => { setPage(0); }, [search]);

    const formatNumber = (n) => n.toLocaleString();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem', letterSpacing: '0.05em' }}>
                            UNICODE SYMBOLS
                        </h2>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '8px 0 0 0', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>{formatNumber(TOTAL)}</span>
                            &nbsp;code points across {UNICODE_RANGES.length} Unicode blocks
                            {category !== 'all' && (
                                <span> · Block: <span style={{ color: 'var(--accent-primary)' }}>{formatNumber(activeTotal)}</span> symbols</span>
                            )}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Jump to code point */}
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
                        marginTop: '12px', padding: '12px 16px', background: 'rgba(176,0,255,0.08)',
                        border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-small)',
                        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
                    }}>
                        {jumpResult.error ? (
                            <span style={{ color: '#ff4466', fontSize: '0.82rem' }}>{jumpResult.error}</span>
                        ) : (
                            <>
                                <span style={{ fontSize: '2.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 10px rgba(176,0,255,0.6))' }}>
                                    {jumpResult.char}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                        {jumpResult.code} — {jumpResult.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                                        Decimal: {jumpResult.cp} · Octal: {jumpResult.cp.toString(8)} · Binary: {jumpResult.cp.toString(2)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => copy(jumpResult.char, 'jump-char', 'char')} style={{
                                        background: 'rgba(176,0,255,0.1)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-main)', padding: '6px 12px', borderRadius: '5px',
                                        cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                                    }}>COPY CHAR</button>
                                    <button onClick={() => copy(jumpResult.code, 'jump-code', 'code')} style={{
                                        background: 'rgba(176,0,255,0.1)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-main)', padding: '6px 12px', borderRadius: '5px',
                                        cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                                    }}>COPY CODE</button>
                                    <button onClick={() => setJumpResult(null)} style={{
                                        background: 'transparent', border: '1px solid var(--border-color)',
                                        color: 'var(--text-muted)', padding: '6px 10px', borderRadius: '5px',
                                        cursor: 'pointer', fontSize: '0.72rem'
                                    }}>✕</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '6px', flexShrink: 0 }}>
                <button onClick={() => handleCategoryChange('all')} style={{
                    background: category === 'all' ? 'rgba(176,0,255,0.18)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${category === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    color: category === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                    padding: '6px 14px', borderRadius: 'var(--radius-small)', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}>
                    All ({formatNumber(TOTAL)})
                </button>
                {UNICODE_RANGES.map(r => (
                    <button key={r.id} onClick={() => handleCategoryChange(r.id)} style={{
                        background: category === r.id ? 'rgba(176,0,255,0.18)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${category === r.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: category === r.id ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '6px 14px', borderRadius: 'var(--radius-small)', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s'
                    }}>
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {searchResults
                        ? <span><span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{searchResults.length}</span> match{searchResults.length !== 1 ? 'es' : ''} for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"</span>
                        : <span>Showing <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatNumber(page * PAGE_SIZE + 1)}</span>–<span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatNumber(Math.min((page + 1) * PAGE_SIZE, activeTotal))}</span> of <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatNumber(activeTotal)}</span>
                        </span>
                    }
                </div>
                {!searchResults && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            style={{ ...navBtn, opacity: page === 0 ? 0.35 : 1 }}
                        >«</button>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{ ...navBtn, opacity: page === 0 ? 0.35 : 1 }}
                        >‹</button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', minWidth: '80px', textAlign: 'center' }}>
                            {formatNumber(page + 1)} / {formatNumber(totalPages)}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            style={{ ...navBtn, opacity: page >= totalPages - 1 ? 0.35 : 1 }}
                        >›</button>
                        <button
                            onClick={() => setPage(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                            style={{ ...navBtn, opacity: page >= totalPages - 1 ? 0.35 : 1 }}
                        >»</button>
                        {/* Page jump */}
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            placeholder="Page #"
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
                    <div key={`${sym.cp}-${idx}`} className="card" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '8px', padding: '14px 10px', position: 'relative',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'default'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(176,0,255,0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        {/* Char display */}
                        <div style={{
                            fontSize: '2rem', userSelect: 'none', lineHeight: 1,
                            filter: 'drop-shadow(0 0 6px rgba(176,0,255,0.25))',
                            minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {sym.char}
                        </div>
                        {/* Info */}
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{
                                fontFamily: 'monospace', fontSize: '0.72rem',
                                color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '2px'
                            }}>
                                {sym.code}
                            </div>
                            <div style={{
                                fontSize: '0.6rem', color: 'var(--text-muted)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {sym.name}
                            </div>
                        </div>
                        {/* Copy Buttons */}
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                            <button onClick={() => copy(sym.char, sym.cp, 'char')} style={copyBtn}
                                onMouseEnter={e => { e.target.style.background = 'rgba(176,0,255,0.2)'; e.target.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                            >CHAR</button>
                            <button onClick={() => copy(sym.code, `${sym.cp}-code`, 'code')} style={copyBtn}
                                onMouseEnter={e => { e.target.style.background = 'rgba(176,0,255,0.2)'; e.target.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                            >CODE</button>
                        </div>
                        {/* Copied badge */}
                        {(copied === sym.cp || copied === `${sym.cp}-code`) && (
                            <div style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'var(--accent-primary)', color: '#fff',
                                fontSize: '0.58rem', fontWeight: 'bold', padding: '3px 6px',
                                borderRadius: '4px', boxShadow: '0 0 8px rgba(176,0,255,0.6)'
                            }}>
                                {copyType === 'char' ? '✓ CHAR' : '✓ CODE'}
                            </div>
                        )}
                    </div>
                ))}
                {displaySymbols.length === 0 && (
                    <div style={{
                        gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)',
                        padding: '60px 20px', fontSize: '0.85rem'
                    }}>
                        No symbols found for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"
                    </div>
                )}
            </div>
        </div>
    );
}

const navBtn = {
    background: 'rgba(176,0,255,0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
    transition: 'all 0.15s',
};

const copyBtn = {
    flex: 1,
    background: 'rgba(176,0,255,0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    color: 'var(--text-main)',
    fontSize: '0.62rem',
    padding: '5px 3px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.15s',
};
