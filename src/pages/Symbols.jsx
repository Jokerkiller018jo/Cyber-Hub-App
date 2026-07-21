import React, { useState, useMemo } from 'react';

const SYMBOLS_DATA = [
    // Greek Letters
    { char: 'α', name: 'Alpha', code: 'U+03B1', cat: 'greek', hex: '03B1' },
    { char: 'β', name: 'Beta', code: 'U+03B2', cat: 'greek', hex: '03B2' },
    { char: 'γ', name: 'Gamma', code: 'U+03B3', cat: 'greek', hex: '03B3' },
    { char: 'δ', name: 'Delta', code: 'U+03B4', cat: 'greek', hex: '03B4' },
    { char: 'ε', name: 'Epsilon', code: 'U+03B5', cat: 'greek', hex: '03B5' },
    { char: 'ζ', name: 'Zeta', code: 'U+03B6', cat: 'greek', hex: '03B6' },
    { char: 'η', name: 'Eta', code: 'U+03B7', cat: 'greek', hex: '03B7' },
    { char: 'θ', name: 'Theta', code: 'U+03B8', cat: 'greek', hex: '03B8' },
    { char: 'ι', name: 'Iota', code: 'U+03B9', cat: 'greek', hex: '03B9' },
    { char: 'κ', name: 'Kappa', code: 'U+03BA', cat: 'greek', hex: '03BA' },
    { char: 'λ', name: 'Lambda', code: 'U+03BB', cat: 'greek', hex: '03BB' },
    { char: 'μ', name: 'Mu', code: 'U+03BC', cat: 'greek', hex: '03BC' },
    { char: 'ν', name: 'Nu', code: 'U+03BD', cat: 'greek', hex: '03BD' },
    { char: 'ξ', name: 'Xi', code: 'U+03BE', cat: 'greek', hex: '03BE' },
    { char: 'π', name: 'Pi', code: 'U+03C0', cat: 'greek', hex: '03C0' },
    { char: 'ρ', name: 'Rho', code: 'U+03C1', cat: 'greek', hex: '03C1' },
    { char: 'σ', name: 'Sigma', code: 'U+03C3', cat: 'greek', hex: '03C3' },
    { char: 'τ', name: 'Tau', code: 'U+03C4', cat: 'greek', hex: '03C4' },
    { char: 'φ', name: 'Phi', code: 'U+03C6', cat: 'greek', hex: '03C6' },
    { char: 'χ', name: 'Chi', code: 'U+03C7', cat: 'greek', hex: '03C7' },
    { char: 'ψ', name: 'Psi', code: 'U+03C8', cat: 'greek', hex: '03C8' },
    { char: 'ω', name: 'Omega', code: 'U+03C9', cat: 'greek', hex: '03C9' },
    { char: 'Α', name: 'Alpha (Upper)', code: 'U+0391', cat: 'greek', hex: '0391' },
    { char: 'Β', name: 'Beta (Upper)', code: 'U+0392', cat: 'greek', hex: '0392' },
    { char: 'Γ', name: 'Gamma (Upper)', code: 'U+0393', cat: 'greek', hex: '0393' },
    { char: 'Δ', name: 'Delta (Upper)', code: 'U+0394', cat: 'greek', hex: '0394' },
    { char: 'Λ', name: 'Lambda (Upper)', code: 'U+039B', cat: 'greek', hex: '039B' },
    { char: 'Π', name: 'Pi (Upper)', code: 'U+03A0', cat: 'greek', hex: '03A0' },
    { char: 'Σ', name: 'Sigma (Upper)', code: 'U+03A3', cat: 'greek', hex: '03A3' },
    { char: 'Ω', name: 'Omega (Upper)', code: 'U+03A9', cat: 'greek', hex: '03A9' },

    // Math Symbols
    { char: '∞', name: 'Infinity', code: 'U+221E', cat: 'math', hex: '221E' },
    { char: '∑', name: 'Sum', code: 'U+2211', cat: 'math', hex: '2211' },
    { char: '∏', name: 'Product', code: 'U+220F', cat: 'math', hex: '220F' },
    { char: '∫', name: 'Integral', code: 'U+222B', cat: 'math', hex: '222B' },
    { char: '√', name: 'Square Root', code: 'U+221A', cat: 'math', hex: '221A' },
    { char: '∂', name: 'Partial Derivative', code: 'U+2202', cat: 'math', hex: '2202' },
    { char: '≈', name: 'Approximately Equal', code: 'U+2248', cat: 'math', hex: '2248' },
    { char: '≠', name: 'Not Equal To', code: 'U+2260', cat: 'math', hex: '2260' },
    { char: '≤', name: 'Less Than or Equal', code: 'U+2264', cat: 'math', hex: '2264' },
    { char: '≥', name: 'Greater Than or Equal', code: 'U+2265', cat: 'math', hex: '2265' },
    { char: '±', name: 'Plus-Minus', code: 'U+00B1', cat: 'math', hex: '00B1' },
    { char: '×', name: 'Multiplication', code: 'U+00D7', cat: 'math', hex: '00D7' },
    { char: '÷', name: 'Division', code: 'U+00F7', cat: 'math', hex: '00F7' },
    { char: '∈', name: 'Element Of', code: 'U+2208', cat: 'math', hex: '2208' },
    { char: '∉', name: 'Not Element Of', code: 'U+2209', cat: 'math', hex: '2209' },
    { char: '∅', name: 'Empty Set', code: 'U+2205', cat: 'math', hex: '2205' },
    { char: '∪', name: 'Union', code: 'U+222A', cat: 'math', hex: '222A' },
    { char: '∩', name: 'Intersection', code: 'U+2229', cat: 'math', hex: '2229' },
    { char: '⊂', name: 'Subset', code: 'U+2282', cat: 'math', hex: '2282' },
    { char: '⊃', name: 'Superset', code: 'U+2283', cat: 'math', hex: '2283' },

    // Arrows
    { char: '→', name: 'Right Arrow', code: 'U+2192', cat: 'arrows', hex: '2192' },
    { char: '←', name: 'Left Arrow', code: 'U+2190', cat: 'arrows', hex: '2190' },
    { char: '↑', name: 'Up Arrow', code: 'U+2191', cat: 'arrows', hex: '2191' },
    { char: '↓', name: 'Down Arrow', code: 'U+2193', cat: 'arrows', hex: '2193' },
    { char: '↔', name: 'Left Right Arrow', code: 'U+2194', cat: 'arrows', hex: '2194' },
    { char: '⇒', name: 'Double Right Arrow', code: 'U+21D2', cat: 'arrows', hex: '21D2' },
    { char: '⇔', name: 'Double Left Right Arrow', code: 'U+21D4', cat: 'arrows', hex: '21D4' },
    { char: '⟶', name: 'Long Right Arrow', code: 'U+27F6', cat: 'arrows', hex: '27F6' },
    { char: '↗', name: 'Up-Right Arrow', code: 'U+2197', cat: 'arrows', hex: '2197' },
    { char: '↘', name: 'Down-Right Arrow', code: 'U+2198', cat: 'arrows', hex: '2198' },

    // Currency Symbols
    { char: '$', name: 'Dollar', code: 'U+0024', cat: 'currency', hex: '0024' },
    { char: '€', name: 'Euro', code: 'U+20AC', cat: 'currency', hex: '20AC' },
    { char: '£', name: 'Pound', code: 'U+00A3', cat: 'currency', hex: '00A3' },
    { char: '¥', name: 'Yen / Yuan', code: 'U+00A5', cat: 'currency', hex: '00A5' },
    { char: '₿', name: 'Bitcoin', code: 'U+20BF', cat: 'currency', hex: '20BF' },
    { char: '₹', name: 'Rupee', code: 'U+20B9', cat: 'currency', hex: '20B9' },
    { char: '₩', name: 'Won', code: 'U+20A9', cat: 'currency', hex: '20A9' },
    { char: '₪', name: 'Shekel', code: 'U+20AA', cat: 'currency', hex: '20AA' },
    { char: '₫', name: 'Dong', code: 'U+20AB', cat: 'currency', hex: '20AB' },
    { char: '₽', name: 'Ruble', code: 'U+20BD', cat: 'currency', hex: '20BD' },

    // Logic / Technical
    { char: '⊕', name: 'XOR / Direct Sum', code: 'U+2295', cat: 'logic', hex: '2295' },
    { char: '⊗', name: 'Tensor Product', code: 'U+2297', cat: 'logic', hex: '2297' },
    { char: '∧', name: 'Logical AND', code: 'U+2227', cat: 'logic', hex: '2227' },
    { char: '∨', name: 'Logical OR', code: 'U+2228', cat: 'logic', hex: '2228' },
    { char: '¬', name: 'NOT', code: 'U+00AC', cat: 'logic', hex: '00AC' },
    { char: '⊤', name: 'Tautology (True)', code: 'U+22A4', cat: 'logic', hex: '22A4' },
    { char: '⊥', name: 'Contradiction (False)', code: 'U+22A5', cat: 'logic', hex: '22A5' },
    { char: '∀', name: 'For All', code: 'U+2200', cat: 'logic', hex: '2200' },
    { char: '∃', name: 'There Exists', code: 'U+2203', cat: 'logic', hex: '2203' },
    { char: '∄', name: 'There Does Not Exist', code: 'U+2204', cat: 'logic', hex: '2204' },
];

const CATEGORIES = [
    { id: 'all', label: 'All Symbols' },
    { id: 'greek', label: 'Greek Letters' },
    { id: 'math', label: 'Mathematics' },
    { id: 'arrows', label: 'Arrows' },
    { id: 'currency', label: 'Currency' },
    { id: 'logic', label: 'Logic / CS' },
];

export default function Symbols() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [copied, setCopied] = useState(null);
    const [copyType, setCopyType] = useState('');

    const filtered = useMemo(() => {
        return SYMBOLS_DATA.filter(s => {
            const matchesCat = category === 'all' || s.cat === category;
            const matchesSearch = !search ||
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.char.includes(search) ||
                s.code.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [search, category]);

    const copy = (text, id, type) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setCopyType(type);
        setTimeout(() => { setCopied(null); setCopyType(''); }, 1500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>UNICODE SYMBOLS</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        {filtered.length} symbols · Click to copy char or code
                    </p>
                </div>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search by name, char, or code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '280px' }}
                />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                        background: category === cat.id ? 'rgba(176,0,255,0.15)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${category === cat.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: category === cat.id ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '7px 16px', borderRadius: 'var(--radius-small)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                    }}>{cat.label}</button>
                ))}
            </div>

            {/* Symbol Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', alignContent: 'start', paddingBottom: '20px' }}>
                {filtered.map((sym, idx) => (
                    <div key={idx} className="card animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '18px 12px', position: 'relative' }}>
                        {/* Symbol char */}
                        <div style={{ fontSize: '2.2rem', userSelect: 'none', filter: 'drop-shadow(0 0 8px rgba(176,0,255,0.3))', lineHeight: 1 }}>
                            {sym.char}
                        </div>
                        {/* Name */}
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sym.name}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--accent-dark)', fontFamily: 'monospace', marginTop: '2px' }}>
                                {sym.code}
                            </div>
                        </div>
                        {/* Copy Buttons */}
                        <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                            <button onClick={() => copy(sym.char, idx, 'char')} style={{
                                flex: 1, background: 'rgba(176,0,255,0.05)', border: '1px solid var(--border-color)',
                                borderRadius: '5px', color: 'var(--text-main)', fontSize: '0.67rem', padding: '5px',
                                cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s'
                            }}
                                onMouseEnter={e => { e.target.style.background = 'rgba(176,0,255,0.15)'; e.target.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                            >CHAR</button>
                            <button onClick={() => copy(sym.code, idx, 'code')} style={{
                                flex: 1, background: 'rgba(176,0,255,0.05)', border: '1px solid var(--border-color)',
                                borderRadius: '5px', color: 'var(--text-main)', fontSize: '0.67rem', padding: '5px',
                                cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s'
                            }}
                                onMouseEnter={e => { e.target.style.background = 'rgba(176,0,255,0.15)'; e.target.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(176,0,255,0.05)'; e.target.style.borderColor = 'var(--border-color)'; }}
                            >CODE</button>
                        </div>
                        {/* Copied Indicator */}
                        {copied === idx && (
                            <div style={{ position: 'absolute', top: '8px', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '3px 7px', borderRadius: '4px', boxShadow: '0 0 10px rgba(176,0,255,0.5)' }}>
                                {copyType === 'char' ? 'CHAR COPIED' : 'CODE COPIED'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
