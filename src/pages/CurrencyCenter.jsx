import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from '../components/ui/CustomSelect';

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
            // Using open exchange rates (free tier)
            const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setRates(data.rates || { [baseCurrency]: 1 });
        } catch (e) {
            setError('Could not load live rates. Showing estimates.');
            // Fallback static rates (USD base)
            setRates({"USD":1,"AED":3.6725,"AFN":65.94,"ALL":82.17,"AMD":366.12,"ANG":1.79,"AOA":925.52,"ARS":1494.37,"AUD":1.43,"AWG":1.79,"AZN":1.70,"BAM":1.71,"BBD":2,"BDT":123.41,"BGN":1.71,"BHD":0.376,"BIF":2994.34,"BMD":1,"BND":1.29,"BOB":10.99,"BRL":5.07,"BSD":1,"BTN":96.61,"BWP":14.16,"BYN":2.87,"BZD":2,"CAD":1.40,"CDF":2269.5,"CHF":0.81,"CLF":0.02,"CLP":943.62,"CNH":6.77,"CNY":6.78,"COP":3213.04,"CRC":454.11,"CUP":24,"CVE":96.91,"CZK":21.22,"DJF":177.72,"DKK":6.56,"DOP":58.19,"DZD":133.28,"EGP":51.32,"ERN":15,"ETB":160.35,"EUR":0.87,"FJD":2.25,"FKP":0.75,"FOK":6.56,"GBP":0.75,"GEL":2.62,"GGP":0.75,"GHS":11.65,"GIP":0.75,"GMD":74.43,"GNF":8780.9,"GTQ":7.63,"GYD":209.17,"HKD":7.84,"HNL":26.80,"HRK":6.62,"HTG":130.76,"HUF":318.02,"IDR":17923.7,"ILS":3.05,"IMP":0.75,"INR":96.61,"IQD":1309.99,"IRR":1364235.06,"ISK":125.67,"JEP":0.75,"JMD":158.43,"JOD":0.709,"JPY":163.82,"KES":129.43,"KGS":87.44,"KHR":4046.91,"KID":1.43,"KMF":432.42,"KRW":1462.59,"KWD":0.309,"KYD":0.83,"KZT":470.12,"LAK":22371.22,"LBP":89500,"LKR":336.05,"LRD":181.12,"LSL":16.82,"LYD":6.41,"MAD":9.36,"MDL":17.59,"MGA":4301.61,"MKD":53.98,"MMK":2099.03,"MNT":3571.59,"MOP":8.07,"MRU":40.12,"MUR":47.35,"MVR":15.45,"MWK":1746.13,"MXN":17.48,"MYR":4.09,"MZN":63.44,"NAD":16.82,"NGN":1363.97,"NIO":36.82,"NOK":9.57,"NPR":154.58,"NZD":1.72,"OMR":0.384,"PAB":1,"PEN":3.40,"PGK":4.45,"PHP":61.82,"PKR":277.69,"PLN":3.79,"PYG":6054.57,"QAR":3.64,"RON":4.59,"RSD":103.12,"RUB":78.24,"RWF":1472.37,"SAR":3.75,"SBD":8.07,"SCR":14.47,"SDG":510.21,"SEK":9.71,"SGD":1.29,"SHP":0.75,"SLE":24.36,"SLL":24364.14,"SOS":571.31,"SRD":37.80,"SSP":4900.6,"STN":21.53,"SYP":121.97,"SZL":16.82,"THB":33.69,"TJS":9.23,"TMT":3.50,"TND":2.95,"TOP":2.36,"TRY":47.32,"TTD":6.78,"TVD":1.43,"TWD":32.35,"TZS":2629.26,"UAH":44.82,"UGX":3706.64,"UYU":40.17,"UZS":12102.96,"VES":742.22,"VND":26278.14,"VUV":118.28,"WST":2.71,"XAF":576.56,"XCD":2.7,"XCG":1.79,"XDR":0.73,"XOF":576.56,"XPF":104.88,"YER":238.4,"ZAR":16.82,"ZMW":18.54,"ZWG":26.65,"ZWL":26.65});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 60000);
        return () => clearInterval(interval);
    }, [baseCurrency]);

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
                    <CustomSelect 
                        value={convertFrom} 
                        onChange={val => setConvertFrom(val)} 
                        options={currencies.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                        style={{ flex: 1 }} 
                    />
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.2rem' }}>→</div>
                    <CustomSelect 
                        value={convertTo} 
                        onChange={val => setConvertTo(val)} 
                        options={currencies.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                        style={{ flex: 1 }} 
                    />
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
