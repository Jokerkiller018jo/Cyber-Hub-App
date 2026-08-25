import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { EMOJI_CATEGORIES } from './EmojiCategories';
import Colors from './Colors';
import Icon from '../components/ui/Icon';
import SearchBar from '../components/ui/SearchBar';
import CustomItemModal from '../components/vault/CustomItemModal';
import { 
    loadUserSettings, 
    saveUserSettings, 
    subscribeCustomVaultItems, 
    saveCustomVaultItem, 
    deleteCustomVaultItem 
} from '../services/firebase';

// ─── Base Unicode ranges with category + group info ───────────────────────────
const BASE_UNICODE_RANGES = [
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
    { id: 'kannada',      label: 'Kannada',               start: 0x0C80, end: 0x0CFF, group: 'Scripts', icon: 'అ' },
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
    // High Planes (Pure Historical & Technical Scripts)
    { id: 'linear_b',     label: 'Linear B',             start: 0x10000, end: 0x1007F, group: 'High Planes', icon: '𐀀' },
    { id: 'old_italic',   label: 'Old Italic',           start: 0x10300, end: 0x1032F, group: 'High Planes', icon: '𐌀' },
    { id: 'gothic',       label: 'Gothic',               start: 0x10330, end: 0x1034F, group: 'High Planes', icon: '𐌰' },
    { id: 'old_persian',  label: 'Old Persian',          start: 0x103A0, end: 0x103DF, group: 'High Planes', icon: '𐎠' },
    { id: 'byzantine_music', label: 'Byzantine Music',   start: 0x1D000, end: 0x1D0FF, group: 'High Planes', icon: '𝀀' },
    { id: 'music',        label: 'Music Notation',       start: 0x1D100, end: 0x1D1FF, group: 'High Planes', icon: '𝄞' },
    { id: 'math_alpha',   label: 'Math Alphanumerics',   start: 0x1D400, end: 0x1D7FF, group: 'High Planes', icon: '𝕬' },
    { id: 'cjk_ext_b',    label: 'CJK Ext-B (70k+)',    start: 0x20000, end: 0x2A6DF, group: 'High Planes', icon: '𠀀' },
    // Design & Utilities
    { id: 'colors_db',    label: 'Color Center',        start: 0, end: 0, group: 'Design & Utilities', icon: '🎨', isCustom: true },
    // Curated & Standardized Emojis
    ...EMOJI_CATEGORIES
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

const PAGE_SIZE = 200;

// Map each group to the SVG icon name shown in block cards
const GROUP_ICONS = {
    'Basic':                  'text',
    'Scripts':                'text',
    'Symbols & Punctuation':  'type',
    'CJK':                   'grid',
    'High Planes':            'globe',
    'Design & Utilities':    'wrench',
    'Emojis':                'face',
    'Favorites':             'star',
};

// Per-block icon overrides
const BLOCK_ICONS = {
    'ascii':          'code',
    'music':          'music',
    'math_alpha':     'math',
    'colors_db':      'palette',
    'arrows':         'arrows',
    'currency':       'currency',
    'braille':        'braille',
    'runic':          'runic',
    'custom_symbols': 'plus',
    'custom_emojis':  'plus',
};

function toHex(cp) { 
    if (typeof cp === 'number') {
        return cp.toString(16).toUpperCase().padStart(4, '0');
    }
    return String(cp);
}
function renderChar(cp) { 
    try { 
        return typeof cp === 'number' ? String.fromCodePoint(cp) : String(cp); 
    } catch { 
        return '?'; 
    } 
}

export default function Symbols({ user }) {
    const isGuest = !user?.uid || !user?.email;

    const [search, setSearch]             = useState('');
    const [category, setCategory]         = useState(null); // null = lobby view
    const [page, setPage]                 = useState(0);
    const [copied, setCopied]             = useState(null);
    const [copyType, setCopyType]         = useState('');
    const [jumpInput, setJumpInput]       = useState('');
    const [jumpResult, setJumpResult]     = useState(null);
    const [customVaultItems, setCustomVaultItems] = useState([]);
    
    // Custom Creator Modal State
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [modalInitialType, setModalInitialType]   = useState('symbol');
    const [droppedFile, setDroppedFile]             = useState(null);

    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cyberhub_favorites') || '[]'); } catch { return []; }
    });

    // Cloud Sync Favorites on Mount
    useEffect(() => {
        if (user?.uid) {
            loadUserSettings(user.uid).then(data => {
                if (data && data.favorites && Array.isArray(data.favorites)) {
                    setFavorites(data.favorites);
                    localStorage.setItem('cyberhub_favorites', JSON.stringify(data.favorites));
                }
            });
        }
    }, [user?.uid]);

    // Real-time Firestore Cloud Subscription for Custom Vault Items
    useEffect(() => {
        if (isGuest) {
            setCustomVaultItems([]);
            return;
        }
        const unsubscribe = subscribeCustomVaultItems((items) => {
            setCustomVaultItems(items || []);
        });
        return () => unsubscribe();
    }, [isGuest, user?.uid]);
    
    // Helper to sync favorites to cloud
    const syncFavs = (newFavs) => {
        if (user?.uid) {
            saveUserSettings(user.uid, { favorites: newFavs }).catch(e => console.error('Fav sync error', e));
        }
    };

    // Save custom item to Firestore
    const handleSaveCustomItem = async (item) => {
        const res = await saveCustomVaultItem(item);
        if (!res.ok) throw new Error(res.error);
    };

    // Delete custom item from Firestore
    const handleDeleteCustomItem = async (e, itemId) => {
        e.stopPropagation();
        if (window.confirm('Delete this custom item from Vault Cloud?')) {
            await deleteCustomVaultItem(itemId);
        }
    };

    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    const handleDragStart = (e, id) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };
    const handleDragOver = (e, id) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== id) setDragOverItem(id);
    };
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== targetId) {
            const newFavs = [...favorites];
            const draggedIdx = newFavs.indexOf(draggedItem);
            const targetIdx = newFavs.indexOf(targetId);
            newFavs.splice(draggedIdx, 1);
            newFavs.splice(targetIdx, 0, draggedItem);
            setFavorites(newFavs);
            localStorage.setItem('cyberhub_favorites', JSON.stringify(newFavs));
            syncFavs(newFavs);
        }
        setDraggedItem(null);
        setDragOverItem(null);
    };
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('cyberhub_favorites', JSON.stringify(next));
            syncFavs(next);
            return next;
        });
    };

    // ── Build Dynamic UNICODE_RANGES (Inject Custom Tabs for Signed-in Users) ──
    const UNICODE_RANGES = useMemo(() => {
        if (isGuest) return BASE_UNICODE_RANGES;

        // Filter custom symbols and emojis (public or owned by user)
        const customSymbolsList = customVaultItems
            .filter(item => item.type === 'symbol' && (item.isPublic || item.creatorUid === user?.uid))
            .map(item => ({
                cp: item.id,
                char: item.char,
                code: item.code || ':custom_sym:',
                name: item.name,
                isImage: !!item.isImage,
                isPublic: !!item.isPublic,
                creatorUid: item.creatorUid,
                creatorName: item.creatorName,
                isUserCustom: true
            }));

        const customEmojisList = customVaultItems
            .filter(item => item.type === 'emoji' && (item.isPublic || item.creatorUid === user?.uid))
            .map(item => ({
                cp: item.id,
                char: item.char,
                code: item.code || ':custom_emoji:',
                name: item.name,
                isImage: !!item.isImage,
                isPublic: !!item.isPublic,
                creatorUid: item.creatorUid,
                creatorName: item.creatorName,
                isUserCustom: true
            }));

        const ranges = [];

        for (const r of BASE_UNICODE_RANGES) {
            // Place Custom Symbols at the top of Symbols & Punctuation
            if (r.id === 'genpunct') {
                ranges.push({
                    id: 'custom_symbols',
                    label: 'Custom Symbols',
                    group: 'Symbols & Punctuation',
                    icon: 'plus',
                    isCustom: true,
                    isUserCustom: true,
                    symbols: customSymbolsList
                });
            }

            // Place Custom Emojis at the top of Emojis group
            if (r.id === EMOJI_CATEGORIES[0]?.id) {
                ranges.push({
                    id: 'custom_emojis',
                    label: 'Custom Emojis',
                    group: 'Emojis',
                    icon: 'plus',
                    isCustom: true,
                    isUserCustom: true,
                    symbols: customEmojisList
                });
            }

            ranges.push(r);
        }

        return ranges;
    }, [isGuest, customVaultItems, user?.uid]);

    const activeRanges = useMemo(() => {
        if (!category) return UNICODE_RANGES;
        return UNICODE_RANGES.filter(r => r.id === category);
    }, [category, UNICODE_RANGES]);

    const activeTotal = useMemo(() =>
        activeRanges.reduce((acc, r) => acc + (r.isCustom ? (r.symbols ? r.symbols.length : 0) : (r.end - r.start + 1)), 0),
        [activeRanges]);

    const activeRange = category ? UNICODE_RANGES.find(r => r.id === category) : null;

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        const q = search.trim().toLowerCase();
        const results = [];
        const MAX = 500;
        const rangesToSearch = category ? activeRanges : UNICODE_RANGES;

        for (const r of rangesToSearch) {
            if (r.isCustom) {
                const items = r.symbols || [];
                for (const item of items) {
                    if (results.length >= MAX) break;
                    const charMatch = item.char === search.trim();
                    const nameMatch = item.name?.toLowerCase().includes(q);
                    const codeMatch = item.code?.toLowerCase().includes(q);
                    if (charMatch || nameMatch || codeMatch) {
                        results.push({
                            cp: item.cp || item.code,
                            char: item.char,
                            code: item.code,
                            name: item.name,
                            isImage: item.isImage,
                            isPublic: item.isPublic,
                            creatorUid: item.creatorUid,
                            creatorName: item.creatorName,
                            isUserCustom: item.isUserCustom,
                            cat: r.id,
                            subCatLabel: item.subCatLabel
                        });
                    }
                }
                continue;
            }
            for (let cp = r.start; cp <= r.end && results.length < MAX; cp++) {
                const hex = toHex(cp);
                const code = `U+${hex}`;
                const char = renderChar(cp);
                const isHexMatch = hex.toLowerCase().startsWith(q.replace('u+', '').replace('0x', ''));
                const isCodeMatch = code.toLowerCase().includes(q);
                const isCharMatch = char === q;
                const isDecMatch = String(cp) === q;

                if (isHexMatch || isCodeMatch || isCharMatch || isDecMatch) {
                    results.push({ cp, char, code, name: `${r.label} #${cp - r.start + 1}`, cat: r.id });
                }
            }
        }
        return results;
    }, [search, category, activeRanges, UNICODE_RANGES]);

    const copy = useCallback((text, id, type) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(id);
            setCopyType(type);
            setTimeout(() => setCopied(null), 1500);
        });
    }, []);

    const handleJump = () => {
        const cleaned = jumpInput.trim().toUpperCase().replace(/^U\+/, '').replace(/^0X/, '');
        const cp = parseInt(cleaned, 16);
        if (isNaN(cp) || cp < 0 || cp > 0x10FFFF) {
            setJumpResult({ error: `Invalid code point: "${jumpInput}". Must be 0x0000–0x10FFFF.` });
            return;
        }
        const range = UNICODE_RANGES.find(r => !r.isCustom && cp >= r.start && cp <= r.end);
        const hex = cp.toString(16).toUpperCase().padStart(4, '0');
        setJumpResult({
            cp,
            hex,
            char: renderChar(cp),
            code: `U+${hex}`,
            name: range ? range.label : 'Unicode Character',
            range,
            error: null
        });
    };

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

    const openCreateModal = (type = 'symbol', file = null) => {
        setModalInitialType(type);
        setDroppedFile(file);
        setIsCustomModalOpen(true);
    };

    // Grouping
    const groups = useMemo(() => {
        const map = {};
        for (const r of UNICODE_RANGES) {
            if (!map[r.group]) map[r.group] = [];
            map[r.group].push(r);
        }
        return map;
    }, [UNICODE_RANGES]);

    const groupsWithFavorites = useMemo(() => {
        const map = { ...groups };
        const favRanges = UNICODE_RANGES.filter(r => favorites.includes(r.id));
        favRanges.sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));

        if (favRanges.length > 0) {
            map['Favorites'] = favRanges;
        }
        return map;
    }, [groups, favorites, UNICODE_RANGES]);

    const groupOrder = useMemo(() => {
        const order = ['Basic', 'Scripts', 'Symbols & Punctuation', 'CJK', 'High Planes', 'Design & Utilities', 'Emojis'];
        if (favorites.length > 0) {
            return ['Favorites', ...order];
        }
        return order;
    }, [favorites]);

    const totalPages = Math.ceil(activeTotal / PAGE_SIZE);

    const formatNumber = (n) => n.toLocaleString();

    // ── LOBBY VIEW ───────────────────────────────────────────────────────────────
    if (!category) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '24px', paddingBottom: '30px' }}>
                {/* Custom Creator Modal */}
                <CustomItemModal
                    isOpen={isCustomModalOpen}
                    onClose={() => { setIsCustomModalOpen(false); setDroppedFile(null); }}
                    onSave={handleSaveCustomItem}
                    initialType={modalInitialType}
                    initialFile={droppedFile}
                    user={user}
                />

                {/* Hero Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '10px',
                                    background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#06b6d4'
                                }}>
                                    <Icon name="cube" size={22} />
                                </div>
                                <h1 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.8rem', letterSpacing: '0.08em', fontWeight: 900 }}>
                                    THE VAULT
                                </h1>
                            </div>
                            <p style={{ color: 'var(--text-muted)', margin: '6px 0 0 0', fontSize: '0.82rem' }}>
                                Unicode glyphs, standard emojis, and community custom symbols synchronized across the Nexus.
                            </p>
                        </div>

                        {/* Search & Jump Tools */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <SearchBar
                                    value={jumpInput}
                                    onChange={e => setJumpInput(e.target.value)}
                                    onClear={() => setJumpInput('')}
                                    placeholder="Jump to U+…"
                                    style={{ width: '130px' }}
                                    id="symbols-jump"
                                />
                                <button onClick={handleJump} style={{
                                    background: 'rgba(6,182,212,0.15)', border: '1px solid var(--accent-primary)',
                                    color: 'var(--text-main)', padding: '7px 12px', borderRadius: 'var(--radius-small)',
                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                                }}>GO</button>
                            </div>
                            <SearchBar
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClear={() => setSearch('')}
                                placeholder="Search categories, hex, or char…"
                                style={{ width: '100%', maxWidth: '320px' }}
                                id="symbols-search"
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
                                <SymbolCard 
                                    key={`${sym.cp}-${idx}`} 
                                    sym={sym} 
                                    copied={copied} 
                                    copyType={copyType} 
                                    copy={copy} 
                                    user={user}
                                    onDelete={handleDeleteCustomItem}
                                />
                            ))}
                            {searchResults.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: '0.85rem' }}>
                                    No symbols found for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Groups Grid */}
                {groupOrder.map(groupName => {
                    const ranges = groupsWithFavorites[groupName] || [];
                    if (ranges.length === 0) return null;
                    const colors = GROUP_COLORS[groupName] || GROUP_COLORS['Basic'];
                    const groupTotal = ranges.reduce((acc, r) => acc + (r.isCustom ? (r.symbols ? r.symbols.length : 0) : r.end - r.start + 1), 0);
                    
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                                {ranges.map(r => {
                                    const size = r.isCustom ? (r.symbols ? r.symbols.length : 0) : (r.end - r.start + 1);
                                    const isFavGroup = groupName === 'Favorites';
                                    const isCustomBlock = r.isUserCustom;

                                    return (
                                        <div
                                            key={r.id}
                                            className="card"
                                            onClick={() => handleCategorySelect(r.id)}
                                            draggable={isFavGroup}
                                            onDragStart={isFavGroup ? (e) => handleDragStart(e, r.id) : undefined}
                                            onDragOver={isFavGroup ? (e) => handleDragOver(e, r.id) : undefined}
                                            onDrop={isFavGroup ? (e) => handleDrop(e, r.id) : undefined}
                                            onDragEnd={isFavGroup ? handleDragEnd : undefined}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '14px', cursor: isFavGroup ? (draggedItem === r.id ? 'grabbing' : 'grab') : 'pointer', position: 'relative',
                                                userSelect: isFavGroup ? 'none' : 'auto',
                                                transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                                                borderColor: dragOverItem === r.id ? 'var(--accent-primary)' : colors.border,
                                                borderStyle: dragOverItem === r.id ? 'dashed' : 'solid',
                                                borderWidth: dragOverItem === r.id ? '2px' : '1px',
                                                background: isCustomBlock ? 'rgba(6, 182, 212, 0.08)' : colors.bg,
                                                opacity: draggedItem === r.id ? 0.4 : 1,
                                                transform: dragOverItem === r.id ? 'scale(1.02)' : 'none'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = `0 8px 24px ${colors.bg.replace('0.08', '0.35')}`;
                                                e.currentTarget.style.background = colors.bg.replace('0.08', '0.14');
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '';
                                                e.currentTarget.style.background = isCustomBlock ? 'rgba(6, 182, 212, 0.08)' : colors.bg;
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

                                            {/* Icon — SVG per group/block */}
                                            <div style={{
                                                width: '38px', height: '38px', flexShrink: 0,
                                                borderRadius: '8px', background: colors.bg.replace('0.08', '0.18'),
                                                border: `1px solid ${colors.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: isCustomBlock ? '#06b6d4' : colors.accent,
                                            }}>
                                                <Icon name={BLOCK_ICONS[r.id] || GROUP_ICONS[r.group] || 'symbol'} size={20} />
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.label}
                                                </div>
                                                <div style={{ color: isCustomBlock ? '#06b6d4' : colors.accent, fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>
                                                    {isCustomBlock 
                                                        ? `${size} Cloud Item${size !== 1 ? 's' : ''}` 
                                                        : (r.isCustom ? (r.group === 'Emojis' ? 'Emojis' : 'Tool') : `${formatNumber(size)} chars`)}
                                                </div>
                                                {!r.isCustom && (
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem', fontFamily: 'monospace', marginTop: '1px' }}>
                                                        U+{toHex(r.start)}…{toHex(r.end)}
                                                    </div>
                                                )}
                                                {isCustomBlock && (
                                                    <div style={{ color: '#00ff88', fontSize: '0.6rem', fontWeight: 600, marginTop: '1px' }}>
                                                        ● Cloud Synced
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

    // ── COLOR CENTER VIEW ────────────────────────────────────────────────────────
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

    // ── SYMBOL / EMOJI BROWSER VIEW ──────────────────────────────────────────────
    const rangeColors = GROUP_COLORS[activeRange?.group] || GROUP_COLORS['Basic'];
    const isCustomCategory = activeRange?.isUserCustom;

    return (
        <div 
            style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}
            onDragOver={(e) => {
                if (isCustomCategory) e.preventDefault();
            }}
            onDrop={(e) => {
                if (isCustomCategory && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    e.preventDefault();
                    openCreateModal(activeRange?.id === 'custom_emojis' ? 'emoji' : 'symbol', e.dataTransfer.files[0]);
                }
            }}
        >
            {/* Custom Creator Modal */}
            <CustomItemModal
                isOpen={isCustomModalOpen}
                onClose={() => { setIsCustomModalOpen(false); setDroppedFile(null); }}
                onSave={handleSaveCustomItem}
                initialType={modalInitialType}
                initialFile={droppedFile}
                user={user}
            />

            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Back button */}
                        <button onClick={handleBack} style={{
                            background: 'rgba(6,182,212,0.1)', border: '1px solid var(--border-color)',
                            color: 'var(--text-main)', padding: '8px 14px', borderRadius: 'var(--radius-small)',
                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.15s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                            ← ALL BLOCKS
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ color: rangeColors.accent, margin: 0, fontSize: '1.4rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Icon name={BLOCK_ICONS[activeRange?.id] || GROUP_ICONS[activeRange?.group] || 'symbol'} size={24} />
                                    {activeRange?.label?.toUpperCase()}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                                    <span style={{ color: rangeColors.accent, fontWeight: 900 }}>{formatNumber(activeTotal)}</span>
                                    &nbsp;items {activeRange?.isCustom ? '' : `· U+${toHex(activeRange?.start)} → U+${toHex(activeRange?.end)}`}
                                    &nbsp;·&nbsp;<span style={{ color: 'var(--text-muted)' }}>{activeRange?.group}</span>
                                    {isCustomCategory && <span style={{ color: '#00ff88', marginLeft: '8px' }}>● Cloud Synced</span>}
                                </p>
                            </div>

                            {/* Add Custom Button in Header if Custom Category */}
                            {isCustomCategory && (
                                <button
                                    onClick={() => openCreateModal(activeRange?.id === 'custom_emojis' ? 'emoji' : 'symbol')}
                                    className="cyber-button"
                                    style={{
                                        padding: '7px 16px',
                                        fontSize: '0.78rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    <Icon name="plus" size={16} />
                                    ADD {activeRange?.id === 'custom_emojis' ? 'EMOJI' : 'SYMBOL'}
                                </button>
                            )}

                            {/* Pagination Controls Beside Title */}
                            {!searchResults && totalPages > 1 && (
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    background: rangeColors.bg, padding: '4px 12px', 
                                    borderRadius: '20px', border: `1px solid ${rangeColors.border}` 
                                }}>
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ 
                                        background: 'transparent', border: 'none', color: rangeColors.accent, 
                                        cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.35 : 1,
                                        fontSize: '1.1rem', display: 'flex', alignItems: 'center', padding: '0 4px',
                                        transition: 'opacity 0.2s'
                                    }}>
                                        <Icon name="chevron-left" size={18} />
                                    </button>
                                    <span style={{ color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, minWidth: '45px', textAlign: 'center' }}>
                                        {page + 1} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalPages}</span>
                                    </span>
                                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ 
                                        background: 'transparent', border: 'none', color: rangeColors.accent, 
                                        cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.35 : 1,
                                        fontSize: '1.1rem', display: 'flex', alignItems: 'center', padding: '0 4px',
                                        transition: 'opacity 0.2s'
                                    }}>
                                        <Icon name="chevron-right" size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Jump (only for unicode range blocks) */}
                        {!activeRange?.isCustom && (
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <SearchBar
                                    value={jumpInput}
                                    onChange={e => setJumpInput(e.target.value)}
                                    onClear={() => setJumpInput('')}
                                    placeholder="Jump to U+…"
                                    style={{ width: '130px' }}
                                    id="category-jump"
                                />
                                <button onClick={handleJump} style={{
                                    background: `${rangeColors.bg}`, border: `1px solid ${rangeColors.accent}`,
                                    color: 'var(--text-main)', padding: '7px 12px', borderRadius: 'var(--radius-small)',
                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                                }}>GO</button>
                            </div>
                        )}
                        <SearchBar
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onClear={() => setSearch('')}
                            placeholder="Search in this category…"
                            style={{ width: '250px' }}
                            id="category-search"
                        />
                    </div>
                </div>

                {/* Sub-Navigation Tabs for related categories in the same group */}
                {activeRange && (
                    <div style={{
                        display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto',
                        paddingBottom: '8px', scrollbarWidth: 'thin'
                    }}>
                        {UNICODE_RANGES.filter(r => r.group === activeRange.group).map(r => (
                            <button
                                key={r.id}
                                onClick={() => handleCategorySelect(r.id)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    padding: '6px 14px',
                                    borderRadius: '16px',
                                    border: `1px solid ${r.id === activeRange.id ? rangeColors.accent : 'var(--border-color)'}`,
                                    background: r.id === activeRange.id ? rangeColors.bg : 'rgba(0,0,0,0.3)',
                                    color: r.id === activeRange.id ? 'var(--text-main)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: r.id === activeRange.id ? 700 : 500,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Icon name={BLOCK_ICONS[r.id] || GROUP_ICONS[r.group] || 'symbol'} size={14} />
                                {r.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {searchResults
                        ? <span><span style={{ color: rangeColors.accent, fontWeight: 700 }}>{searchResults.length}</span> match{searchResults.length !== 1 ? 'es' : ''} for "<span style={{ color: 'var(--text-main)' }}>{search}</span>"</span>
                        : (activeTotal === 0 
                            ? <span>No custom items created yet. Click "+ ADD" to create your first!</span> 
                            : <span>Showing <span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(page * PAGE_SIZE + 1)}</span>–<span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(Math.min((page + 1) * PAGE_SIZE, activeTotal))}</span> of <span style={{ color: rangeColors.accent, fontWeight: 700 }}>{formatNumber(activeTotal)}</span></span>)
                    }
                </div>
            </div>

            {/* Grid display */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                {searchResults ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                        {searchResults.map((sym, idx) => (
                            <SymbolCard 
                                key={`${sym.cp}-${idx}`} 
                                sym={sym} 
                                copied={copied} 
                                copyType={copyType} 
                                copy={copy} 
                                accentColor={rangeColors.accent} 
                                user={user}
                                onDelete={handleDeleteCustomItem}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                        {/* If in Custom Category: Render [+ ADD NEW] Card at top */}
                        {isCustomCategory && page === 0 && (
                            <div
                                className="card"
                                onClick={() => openCreateModal(activeRange?.id === 'custom_emojis' ? 'emoji' : 'symbol')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '24px 12px',
                                    border: '2px dashed rgba(6, 182, 212, 0.45)',
                                    background: 'rgba(6, 182, 212, 0.05)',
                                    borderRadius: 'var(--radius-medium, 10px)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '130px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#06b6d4';
                                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.45)';
                                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    background: 'rgba(6, 182, 212, 0.2)',
                                    border: '1px solid #06b6d4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#06b6d4'
                                }}>
                                    <Icon name="plus" size={20} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 800 }}>
                                        + ADD {activeRange?.id === 'custom_emojis' ? 'EMOJI' : 'SYMBOL'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>
                                        Drag & drop image or click
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Render items */}
                        {(() => {
                            if (activeRange?.isCustom) {
                                const symbols = activeRange?.symbols || [];
                                const pageSymbols = symbols.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
                                return pageSymbols.map((sym, idx) => (
                                    <SymbolCard 
                                        key={`${sym.cp}-${idx}`} 
                                        sym={sym} 
                                        copied={copied} 
                                        copyType={copyType} 
                                        copy={copy} 
                                        accentColor={rangeColors.accent}
                                        user={user}
                                        onDelete={handleDeleteCustomItem}
                                    />
                                ));
                            }

                            // Standard unicode codepoint generation
                            const start = activeRange?.start + page * PAGE_SIZE;
                            const end = Math.min(start + PAGE_SIZE - 1, activeRange?.end);
                            const items = [];
                            for (let cp = start; cp <= end; cp++) {
                                const hex = toHex(cp);
                                items.push({
                                    cp,
                                    char: renderChar(cp),
                                    code: `U+${hex}`,
                                    name: `${activeRange?.label} #${cp - activeRange?.start + 1}`,
                                    cat: activeRange?.id
                                });
                            }
                            return items.map((sym, idx) => (
                                <SymbolCard 
                                    key={`${sym.cp}-${idx}`} 
                                    sym={sym} 
                                    copied={copied} 
                                    copyType={copyType} 
                                    copy={copy} 
                                    accentColor={rangeColors.accent}
                                    user={user}
                                    onDelete={handleDeleteCustomItem}
                                />
                            ));
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Shared Symbol / Emoji Card with Image and Cloud Sync Support ────────────
function SymbolCard({ sym, copied, copyType, copy, accentColor = 'var(--accent-primary)', user, onDelete }) {
    const isOwner = user?.uid && (sym.creatorUid === user.uid || !sym.creatorUid);
    const isCustom = sym.isUserCustom;

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
            {/* Delete button for user's custom items */}
            {isCustom && isOwner && (
                <button
                    onClick={(e) => onDelete(e, sym.cp)}
                    title="Delete custom item from cloud"
                    style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'rgba(255, 68, 68, 0.15)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: '#ff6666',
                        fontSize: '0.65rem',
                        padding: '1px 4px',
                        cursor: 'pointer',
                        lineHeight: 1,
                        zIndex: 2
                    }}
                >
                    ✕
                </button>
            )}

            {/* Public/Private Badge for custom items */}
            {isCustom && (
                <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '0.52rem',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: sym.isPublic ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                    color: sym.isPublic ? '#00ff88' : '#cbd5e1',
                    border: `1px solid ${sym.isPublic ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                    lineHeight: 1
                }}>
                    {sym.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </div>
            )}

            {/* Glyph / Image Rendering */}
            <div style={{
                fontSize: '2rem', userSelect: 'none', lineHeight: 1,
                filter: `drop-shadow(0 0 6px ${accentColor}44)`,
                minHeight: '2.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: isCustom ? '6px' : '0'
            }}>
                {sym.isImage ? (
                    <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={sym.char} 
                            alt={sym.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                    </div>
                ) : (
                    sym.char
                )}
            </div>

            {/* Metadata */}
            <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: accentColor, fontWeight: 700, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sym.code}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sym.name}
                </div>
            </div>

            {/* Copy Action Buttons */}
            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button 
                    onClick={() => copy(sym.char, sym.cp, 'char')} 
                    style={copyBtn}
                    onMouseEnter={e => { e.target.style.background = `${accentColor}33`; e.target.style.borderColor = accentColor; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                >
                    {sym.isImage ? 'COPY' : 'CHAR'}
                </button>
                <button 
                    onClick={() => copy(sym.code, `${sym.cp}-code`, 'code')} 
                    style={copyBtn}
                    onMouseEnter={e => { e.target.style.background = `${accentColor}33`; e.target.style.borderColor = accentColor; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                >
                    {sym.isImage ? 'TAG' : 'CODE'}
                </button>
            </div>

            {/* Copy Toast Badge */}
            {(copied === sym.cp || copied === `${sym.cp}-code`) && (
                <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: accentColor, color: '#fff',
                    fontSize: '0.58rem', fontWeight: 'bold', padding: '3px 6px',
                    borderRadius: '4px', boxShadow: `0 0 8px ${accentColor}99`,
                    zIndex: 10
                }}>
                    {copyType === 'char' ? '✓ COPIED' : '✓ TAG COPIED'}
                </div>
            )}
        </div>
    );
}

const copyBtn = {
    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
    borderRadius: '5px', color: 'var(--text-main)', fontSize: '0.62rem',
    padding: '5px 3px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s',
};
