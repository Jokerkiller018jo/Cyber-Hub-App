import React, { useState, useEffect, useMemo } from 'react';

const REGIONS = ['All', 'Americas', 'Europe', 'Asia', 'Middle East', 'Africa', 'Oceania'];

const REGION_MAP = {
    USD: 'Americas', CAD: 'Americas', MXN: 'Americas', BRL: 'Americas', ARS: 'Americas', CLP: 'Americas', COP: 'Americas', PEN: 'Americas',
    EUR: 'Europe', GBP: 'Europe', CHF: 'Europe', SEK: 'Europe', NOK: 'Europe', DKK: 'Europe', PLN: 'Europe', CZK: 'Europe', HUF: 'Europe', RON: 'Europe', BGN: 'Europe', HRK: 'Europe', RSD: 'Europe', UAH: 'Europe', TRY: 'Europe',
    JPY: 'Asia', CNY: 'Asia', KRW: 'Asia', INR: 'Asia', SGD: 'Asia', HKD: 'Asia', TWD: 'Asia', THB: 'Asia', MYR: 'Asia', IDR: 'Asia', PHP: 'Asia', VND: 'Asia', PKR: 'Asia', BDT: 'Asia',
    SAR: 'Middle East', AED: 'Middle East', ILS: 'Middle East', QAR: 'Middle East', KWD: 'Middle East', BHD: 'Middle East', OMR: 'Middle East', JOD: 'Middle East', LBP: 'Middle East', EGP: 'Middle East', IRR: 'Middle East',
    ZAR: 'Africa', NGN: 'Africa', KES: 'Africa', GHS: 'Africa', TZS: 'Africa', ETB: 'Africa', MAD: 'Africa', TND: 'Africa', DZD: 'Africa',
    AUD: 'Oceania', NZD: 'Oceania',
};

const CURRENCY_NAMES = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen', CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar', CHF: 'Swiss Franc', CNY: 'Chinese Yuan', SEK: 'Swedish Krona', NZD: 'New Zealand Dollar',
    MXN: 'Mexican Peso', SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone', KRW: 'South Korean Won',
    TRY: 'Turkish Lira', INR: 'Indian Rupee', BRL: 'Brazilian Real', ZAR: 'South African Rand', SAR: 'Saudi Riyal',
    AED: 'UAE Dirham', PLN: 'Polish Zloty', DKK: 'Danish Krone', TWD: 'New Taiwan Dollar', THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit', ILS: 'Israeli Shekel', IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso', CZK: 'Czech Koruna',
    QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar', OMR: 'Omani Rial', JOD: 'Jordanian Dinar',
    HUF: 'Hungarian Forint', RON: 'Romanian Leu', BGN: 'Bulgarian Lev', HRK: 'Croatian Kuna', RSD: 'Serbian Dinar',
    LBP: 'Lebanese Pound', EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling', GHS: 'Ghanaian Cedi',
    TZS: 'Tanzanian Shilling', ETB: 'Ethiopian Birr', MAD: 'Moroccan Dirham', TND: 'Tunisian Dinar', DZD: 'Algerian Dinar',
    PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', VND: 'Vietnamese Dong', ARS: 'Argentine Peso', CLP: 'Chilean Peso',
    COP: 'Colombian Peso', PEN: 'Peruvian Sol', UAH: 'Ukrainian Hryvnia', IRR: 'Iranian Rial',
};

export default function CurrencyCenter() {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [convertFrom, setConvertFrom] = useState('USD');
    const [convertTo, setConvertTo] = useState('EUR');
    const [convertAmount, setConvertAmount] = useState('1');
    const [sortBy, setSortBy] = useState('code');
    const [sortDir, setSortDir] = useState('asc');

    const fetchRates = async () => {
        try {
            setError('');
            // Using open exchange rates (free tier) or frankfurter as fallback
            const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setRates({ [baseCurrency]: 1, ...data.rates });
        } catch (e) {
            setError('Could not load live rates. Showing estimates.');
            // Fallback static rates (USD base)
            setRates({
                USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53, CHF: 0.88,
                CNY: 7.24, SEK: 10.4, NOK: 10.6, DKK: 6.89, NZD: 1.63, SGD: 1.34,
                HKD: 7.82, KRW: 1335, INR: 83.2, BRL: 4.97, MXN: 17.2, SAR: 3.75,
                AED: 3.67, PLN: 3.97, TWD: 31.8, THB: 35.4, MYR: 4.67, ILS: 3.72,
                TRY: 32.1, ZAR: 18.9, IDR: 15750, PHP: 56.4, QAR: 3.64, KWD: 0.307,
                EGP: 30.9, LBP: 89500, NGN: 1480, PKR: 279, BDT: 110, VND: 24800
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRates(); }, [baseCurrency]);

    const currencies = useMemo(() => {
        return Object.entries(rates).map(([code, rate]) => ({
            code,
            rate,
            name: CURRENCY_NAMES[code] || code,
            region: REGION_MAP[code] || 'Other',
        }));
    }, [rates]);

    const filtered = useMemo(() => {
        let result = currencies;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
        }
        if (regionFilter !== 'All') result = result.filter(c => c.region === regionFilter);

        result.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'code') cmp = a.code.localeCompare(b.code);
            else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortBy === 'rate') cmp = a.rate - b.rate;
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [currencies, search, regionFilter, sortBy, sortDir]);

    const toggleSort = (field) => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const convertedAmount = useMemo(() => {
        const fromRate = rates[convertFrom] || 1;
        const toRate = rates[convertTo] || 1;
        const result = (parseFloat(convertAmount) || 0) * (toRate / fromRate);
        return result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }, [convertAmount, convertFrom, convertTo, rates]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '20px', paddingBottom: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>CURRENCY CENTER</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        Live exchange rates · {filtered.length} currencies
                    </p>
                </div>
                <button onClick={fetchRates} className="cyber-button" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>↺ REFRESH</button>
            </div>

            {error && <div style={{ color: '#ff9900', fontSize: '0.8rem', background: 'rgba(255,153,0,0.1)', padding: '8px 15px', borderRadius: 'var(--radius-small)', border: '1px solid #ff990040' }}>⚠ {error}</div>}

            {/* Converter */}
            <div className="card">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '15px', color: 'var(--accent-primary)', letterSpacing: '1px' }}>⇆ QUICK CONVERT</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="number"
                        className="input-field"
                        value={convertAmount}
                        onChange={e => setConvertAmount(e.target.value)}
                        style={{ width: '120px' }}
                    />
                    <select className="input-field" value={convertFrom} onChange={e => setConvertFrom(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                    </select>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.2rem' }}>→</div>
                    <select className="input-field" value={convertTo} onChange={e => setConvertTo(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                    </select>
                    <div style={{ minWidth: '150px', padding: '10px 15px', background: 'rgba(176,0,255,0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-small)', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', textAlign: 'right' }}>
                        {convertedAmount}
                    </div>
                </div>
            </div>

            {/* Base Currency + Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Base:</div>
                {['USD', 'EUR', 'GBP', 'JPY'].map(base => (
                    <button key={base} onClick={() => setBaseCurrency(base)} style={{
                        background: baseCurrency === base ? 'rgba(176,0,255,0.2)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${baseCurrency === base ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: baseCurrency === base ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '5px 14px', borderRadius: 'var(--radius-small)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700
                    }}>{base}</button>
                ))}
                <div style={{ flex: 1 }} />
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search currency..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '220px' }}
                />
            </div>

            {/* Region Filter */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {REGIONS.map(r => (
                    <button key={r} onClick={() => setRegionFilter(r)} style={{
                        background: regionFilter === r ? 'rgba(176,0,255,0.15)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${regionFilter === r ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        color: regionFilter === r ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '6px 14px', borderRadius: 'var(--radius-small)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap'
                    }}>{r}</button>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr 150px 120px',
                    padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    {[['code', 'CODE'], ['name', 'CURRENCY NAME'], ['rate', `RATE (per 1 ${baseCurrency})`], [null, 'REGION']].map(([field, label]) => (
                        <div
                            key={label}
                            onClick={field ? () => toggleSort(field) : undefined}
                            style={{ cursor: field ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {label}
                            {field && sortBy === field && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                        </div>
                    ))}
                </div>
                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading exchange rates...</div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filtered.map(c => (
                            <div key={c.code} style={{
                                display: 'grid', gridTemplateColumns: '80px 1fr 150px 120px',
                                padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                alignItems: 'center', transition: 'background 0.1s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ background: 'rgba(176,0,255,0.1)', border: '1px solid rgba(176,0,255,0.3)', color: 'var(--accent-primary)', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', display: 'inline-block', width: 'fit-content' }}>
                                    {c.code}
                                </div>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{c.name}</div>
                                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {c.rate >= 1000 ? c.rate.toLocaleString('en-US', { maximumFractionDigits: 0 })
                                        : c.rate >= 1 ? c.rate.toFixed(4)
                                        : c.rate.toFixed(6)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
                                    {c.region}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
