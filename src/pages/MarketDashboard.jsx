import React, { useState, useEffect, useCallback, useRef } from 'react';
import CustomSelect from '../components/ui/CustomSelect';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ─── tiny helpers ─────────────────────────────────────────── */
const fmt = (n, opts = {}) => {
    if (n == null) return '---';
    const { prefix = '$', compact = true } = opts;
    if (compact) {
        if (Math.abs(n) >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T`;
        if (Math.abs(n) >= 1e9)  return `${prefix}${(n / 1e9).toFixed(2)}B`;
        if (Math.abs(n) >= 1e6)  return `${prefix}${(n / 1e6).toFixed(2)}M`;
        if (Math.abs(n) >= 1e3)  return `${prefix}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${prefix}${n.toFixed(n < 1 ? 6 : 2)}`;
};
const pct = (v) => {
    if (v == null) return '---';
    const up = v >= 0;
    return <span style={{ color: up ? '#00ff88' : '#ff4444', fontWeight: 700 }}>{up ? '▲' : '▼'} {Math.abs(v).toFixed(2)}%</span>;
};
const dateFmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '---';

/* ─── Sparkline ────────────────────────────────────────────── */
function Sparkline({ data, color, width = 80, height = 30 }) {
    if (!data || data.length < 2)
        return <div style={{ width, height, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />;
    const chartData = {
        labels: data.map((_, i) => i),
        datasets: [{ data, borderColor: color, borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4, backgroundColor: `${color}22` }]
    };
    return <LineChart data={chartData} options={{ responsive: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }} width={width} height={height} />;
}

/* ─── Toast ────────────────────────────────────────────────── */
function Toast({ toasts, remove }) {
    return (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    background: t.type === 'success' ? 'rgba(0,255,136,0.15)' : t.type === 'warning' ? 'rgba(255,200,0,0.15)' : 'rgba(176,0,255,0.15)',
                    border: `1px solid ${t.type === 'success' ? '#00ff88' : t.type === 'warning' ? '#ffc800' : '#b000ff'}`,
                    borderRadius: 10, padding: '10px 16px', color: '#f0f0f5', fontSize: '0.82rem', fontWeight: 600,
                    backdropFilter: 'blur(10px)', animation: 'slideUp 0.3s ease', maxWidth: 280, pointerEvents: 'all',
                    display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}>
                    <span>{t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : '🔔'}</span>
                    <span>{t.msg}</span>
                    <span onClick={() => remove(t.id)} style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.6, pointerEvents: 'all' }}>✕</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Main ─────────────────────────────────────────────────── */
export default function MarketDashboard() {
    /* data */
    const [coins, setCoins] = useState([]);
    const [globalData, setGlobalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    /* UI state */
    const [search, setSearch] = useState('');
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [timeRange, setTimeRange] = useState('7');
    const [sortKey, setSortKey] = useState('market_cap_rank');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState('all'); // all | watchlist | portfolio | compare

    /* watchlist */
    const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem('mkt_watchlist') || '[]'));

    /* portfolio */
    const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem('mkt_portfolio') || '[]'));
    const [portForm, setPortForm] = useState({ coinId: '', qty: '' });

    /* alerts */
    const [alerts, setAlerts] = useState(() => JSON.parse(localStorage.getItem('mkt_alerts') || '[]'));
    const [alertForm, setAlertForm] = useState({ coinId: '', price: '', dir: 'above' });
    const [showAlertModal, setShowAlertModal] = useState(false);

    /* compare */
    const [compareList, setCompareList] = useState([]);
    const [compareCharts, setCompareCharts] = useState({});

    /* toasts */
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);
    const addToast = useCallback((msg, type = 'info') => {
        const id = ++toastId.current;
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    }, []);

    /* ── fetch ── */
    const fetchCoins = useCallback(async (p = 1, append = false) => {
        try {
            setError('');
            const res = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${p}&sparkline=true&price_change_percentage=24h,7d`
            );
            if (!res.ok) throw new Error('Rate limited');
            const data = await res.json();
            setCoins(prev => append ? [...prev, ...data.filter(d => !prev.find(p => p.id === d.id))] : data);
            if (!selectedCoin && data.length > 0 && !append) setSelectedCoin(data[0]);
            setLastUpdated(new Date());
        } catch (e) {
            setError('Live data unavailable — showing last snapshot.');
        } finally {
            setLoading(false);
        }
    }, [selectedCoin]);

    const fetchGlobal = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/global');
            if (!res.ok) return;
            const d = await res.json();
            setGlobalData(d.data);
        } catch {}
    };

    const fetchChart = async (coinId, days, forCompare = false) => {
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
            if (!res.ok) return;
            const data = await res.json();
            const pts = data.prices?.map(p => ({ x: p[0], y: p[1] })) || [];
            if (forCompare) {
                setCompareCharts(prev => ({ ...prev, [coinId]: pts }));
            } else {
                setChartData(pts);
            }
        } catch {}
    };

    useEffect(() => { fetchCoins(1); fetchGlobal(); }, []);
    useEffect(() => { const i = setInterval(() => { fetchCoins(1); fetchGlobal(); }, 60000); return () => clearInterval(i); }, []);
    useEffect(() => { if (selectedCoin) fetchChart(selectedCoin.id, timeRange); }, [selectedCoin, timeRange]);
    useEffect(() => { localStorage.setItem('mkt_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
    useEffect(() => { localStorage.setItem('mkt_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
    useEffect(() => { localStorage.setItem('mkt_alerts', JSON.stringify(alerts)); }, [alerts]);

    /* compare mode fetch */
    useEffect(() => {
        if (tab === 'compare') {
            compareList.forEach(id => fetchChart(id, timeRange, true));
        }
    }, [compareList, tab, timeRange]);

    /* alert checker */
    useEffect(() => {
        if (!coins.length || !alerts.length) return;
        alerts.forEach(a => {
            const coin = coins.find(c => c.id === a.coinId);
            if (!coin) return;
            const triggered = a.dir === 'above' ? coin.current_price >= a.price : coin.current_price <= a.price;
            if (triggered) addToast(`🔔 ${coin.name} is ${a.dir} $${a.price}! Current: ${fmt(coin.current_price)}`, 'warning');
        });
    }, [coins]);

    /* ── filter + sort ── */
    const filtered = (() => {
        let list = tab === 'watchlist' ? coins.filter(c => watchlist.includes(c.id)) : coins;
        if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()));
        list = [...list].sort((a, b) => {
            const va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });
        return list;
    })();

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };
    const sortIcon = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    /* ── portfolio helpers ── */
    const portValue = portfolio.map(p => {
        const coin = coins.find(c => c.id === p.coinId);
        if (!coin) return { ...p, value: 0, pnl: 0, coin: null };
        return { ...p, coin, value: coin.current_price * p.qty, pnl: (coin.current_price - p.avgBuy) * p.qty };
    });
    const totalPortValue = portValue.reduce((s, p) => s + p.value, 0);
    const totalPnl = portValue.reduce((s, p) => s + p.pnl, 0);

    /* ── main chart config ── */
    const COLORS = ['#b000ff', '#00ff88', '#ff6b35', '#00b4ff', '#ff4488'];
    const mainChartData = chartData ? {
        labels: chartData.map(() => ''),
        datasets: [{
            label: selectedCoin?.name,
            data: chartData.map(p => p.y),
            borderColor: '#b000ff',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
            backgroundColor: (ctx) => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                g.addColorStop(0, 'rgba(176,0,255,0.35)');
                g.addColorStop(1, 'rgba(176,0,255,0)');
                return g;
            }
        }]
    } : null;

    const compareChartData = compareList.length > 0 && tab === 'compare' ? {
        labels: Array.from({ length: Math.max(...compareList.map(id => compareCharts[id]?.length || 0)) }, (_, i) => i),
        datasets: compareList.map((id, i) => {
            const pts = compareCharts[id] || [];
            const coin = coins.find(c => c.id === id);
            // Normalize to % from start
            const base = pts[0]?.y || 1;
            return {
                label: coin?.symbol?.toUpperCase() || id,
                data: pts.map(p => ((p.y - base) / base) * 100),
                borderColor: COLORS[i % COLORS.length],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4,
            };
        })
    } : null;

    const chartOptions = (isCompare = false) => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        scales: {
            x: { display: false },
            y: {
                display: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: 'var(--text-muted)',
                    callback: isCompare
                        ? v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
                        : v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(2)}`
                }
            }
        },
        plugins: {
            legend: { display: isCompare, labels: { color: '#f0f0f5', boxWidth: 12, padding: 16 } },
            tooltip: {
                callbacks: {
                    label: ctx => isCompare
                        ? `${ctx.dataset.label}: ${ctx.raw >= 0 ? '+' : ''}${ctx.raw.toFixed(2)}%`
                        : `$${ctx.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
            }
        }
    });

    /* ── styles helpers ── */
    const S = {
        section: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' },
        th: { color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
        statBox: { background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(176,0,255,0.15)' },
    };

    const COL = '50px 44px 1fr 130px 100px 100px 100px 90px 48px';

    /* ─── render ───────────────────────────────────────────── */
    return (
        <>
            <Toast toasts={toasts} remove={id => setToasts(t => t.filter(x => x.id !== id))} />

            {/* Alert Modal */}
            {showAlertModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
                    <div className="card" style={{ width: 380, animation: 'slideUp 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>🔔 Price Alert</h3>
                            <button onClick={() => setShowAlertModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <CustomSelect
                                value={alertForm.coinId}
                                onChange={val => setAlertForm(f => ({ ...f, coinId: val }))}
                                options={[{ value: '', label: '— Select coin —' }, ...coins.map(c => ({ value: c.id, label: `${c.name} (${c.symbol?.toUpperCase()})` }))]}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <CustomSelect
                                    value={alertForm.dir}
                                    onChange={val => setAlertForm(f => ({ ...f, dir: val }))}
                                    options={[{ value: 'above', label: 'Above' }, { value: 'below', label: 'Below' }]}
                                    style={{ width: 120 }}
                                />
                                <input className="input-field" type="number" placeholder="Target price (USD)" value={alertForm.price}
                                    onChange={e => setAlertForm(f => ({ ...f, price: e.target.value }))} />
                            </div>
                            <button className="cyber-button" style={{ width: '100%' }} onClick={() => {
                                if (!alertForm.coinId || !alertForm.price) return;
                                setAlerts(a => [...a, { ...alertForm, price: parseFloat(alertForm.price) }]);
                                addToast('Alert set!', 'success');
                                setShowAlertModal(false);
                                setAlertForm({ coinId: '', price: '', dir: 'above' });
                            }}>Set Alert</button>
                        </div>
                        {alerts.length > 0 && (
                            <div style={{ marginTop: 18 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>ACTIVE ALERTS</div>
                                {alerts.map((a, i) => {
                                    const coin = coins.find(c => c.id === a.coinId);
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem' }}>
                                            <span style={{ flex: 1 }}>{coin?.name || a.coinId} {a.dir} {fmt(a.price)}</span>
                                            <button onClick={() => setAlerts(al => al.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 14 }}>✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: 16, paddingBottom: 24 }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                    <div>
                        <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>CRYPTO MARKET</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'} · {coins.length} coins loaded
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ color: '#00ff88', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 6px #00ff88' }} />
                            LIVE
                        </span>
                        <button onClick={() => setShowAlertModal(true)} className="cyber-button" style={{ padding: '5px 12px', fontSize: '0.74rem' }}>🔔 Alerts{alerts.length > 0 ? ` (${alerts.length})` : ''}</button>
                        <button onClick={() => { fetchCoins(1); fetchGlobal(); addToast('Refreshed!', 'success'); }} className="cyber-button" style={{ padding: '5px 12px', fontSize: '0.74rem' }}>↺ Refresh</button>
                    </div>
                </div>

                {error && <div style={{ color: '#ff4444', fontSize: '0.8rem', background: 'rgba(255,68,68,0.1)', padding: '8px 14px', borderRadius: 8, border: '1px solid #ff444430' }}>{error}</div>}

                {/* ── Global Stats Bar ── */}
                {globalData && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                        {[
                            { label: 'Total Mkt Cap', value: fmt(globalData.total_market_cap?.usd) },
                            { label: '24h Volume', value: fmt(globalData.total_volume?.usd) },
                            { label: 'BTC Dominance', value: `${globalData.market_cap_percentage?.btc?.toFixed(1)}%` },
                            { label: 'ETH Dominance', value: `${globalData.market_cap_percentage?.eth?.toFixed(1)}%` },
                            { label: 'Active Coins', value: globalData.active_cryptocurrencies?.toLocaleString() },
                            { label: 'Markets', value: globalData.markets?.toLocaleString() },
                        ].map(s => (
                            <div key={s.label} style={S.statBox}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>{s.label}</div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', fontFamily: 'monospace' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Tab Switcher ── */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
                    {[
                        { key: 'all', label: '📊 Market' },
                        { key: 'watchlist', label: `⭐ Watchlist (${watchlist.length})` },
                        { key: 'portfolio', label: '💼 Portfolio' },
                        { key: 'compare', label: '⚖️ Compare' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: tab === t.key ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* ═══ PORTFOLIO TAB ═══ */}
                {tab === 'portfolio' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            <div style={S.statBox}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>TOTAL VALUE</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace' }}>{fmt(totalPortValue)}</div>
                            </div>
                            <div style={S.statBox}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>TOTAL P&L</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: totalPnl >= 0 ? '#00ff88' : '#ff4444' }}>{totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}</div>
                            </div>
                            <div style={S.statBox}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>POSITIONS</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{portfolio.length}</div>
                            </div>
                        </div>
                        {/* Add position */}
                        <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ flex: 2, minWidth: 140 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>COIN</div>
                                <CustomSelect
                                    value={portForm.coinId}
                                    onChange={val => setPortForm(f => ({ ...f, coinId: val }))}
                                    options={[{ value: '', label: '— Select —' }, ...coins.map(c => ({ value: c.id, label: c.name }))]}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 90 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>AMOUNT</div>
                                <input className="input-field" type="number" placeholder="0.00" value={portForm.qty} onChange={e => setPortForm(f => ({ ...f, qty: e.target.value }))} />
                            </div>
                            <div style={{ flex: 1, minWidth: 90 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>AVG BUY ($)</div>
                                <input className="input-field" type="number" placeholder="0.00" value={portForm.avgBuy || ''} onChange={e => setPortForm(f => ({ ...f, avgBuy: e.target.value }))} />
                            </div>
                            <button className="cyber-button" style={{ padding: '11px 20px' }} onClick={() => {
                                if (!portForm.coinId || !portForm.qty) return;
                                setPortfolio(p => {
                                    const existing = p.find(x => x.coinId === portForm.coinId);
                                    if (existing) return p.map(x => x.coinId === portForm.coinId ? { ...x, qty: x.qty + parseFloat(portForm.qty) } : x);
                                    return [...p, { coinId: portForm.coinId, qty: parseFloat(portForm.qty), avgBuy: parseFloat(portForm.avgBuy || 0) }];
                                });
                                setPortForm({ coinId: '', qty: '', avgBuy: '' });
                                addToast('Position added!', 'success');
                            }}>+ Add</button>
                        </div>
                        {/* Positions list */}
                        <div style={S.section}>
                            <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 110px 110px 110px 110px 40px', gap: 10, padding: '10px 18px', background: 'rgba(0,0,0,0.25)', color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1 }}>
                                <div />
                                <div>COIN</div>
                                <div style={{ textAlign: 'right' }}>PRICE</div>
                                <div style={{ textAlign: 'right' }}>AMOUNT</div>
                                <div style={{ textAlign: 'right' }}>VALUE</div>
                                <div style={{ textAlign: 'right' }}>P&L</div>
                                <div />
                            </div>
                            {portValue.length === 0 ? (
                                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No positions yet. Add your first!</div>
                            ) : portValue.map(p => p.coin && (
                                <div key={p.coinId} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 110px 110px 110px 110px 40px', gap: 10, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                                    <img src={p.coin.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.coin.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{p.coin.symbol?.toUpperCase()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem' }}>{fmt(p.coin.current_price)}</div>
                                    <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>{p.qty.toLocaleString('en-US', { maximumFractionDigits: 6 })}</div>
                                    <div style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{fmt(p.value)}</div>
                                    <div style={{ textAlign: 'right', color: p.pnl >= 0 ? '#00ff88' : '#ff4444', fontWeight: 700, fontSize: '0.85rem' }}>{p.pnl >= 0 ? '+' : ''}{fmt(p.pnl)}</div>
                                    <button onClick={() => { setPortfolio(pr => pr.filter(x => x.coinId !== p.coinId)); addToast('Removed', 'info'); }}
                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ COMPARE TAB ═══ */}
                {tab === 'compare' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Select up to 5 coins to compare performance:</div>
                            <CustomSelect
                                style={{ width: 220 }}
                                value=""
                                onChange={val => {
                                    if (!val || compareList.includes(val) || compareList.length >= 5) return;
                                    setCompareList(l => [...l, val]);
                                    fetchChart(val, timeRange, true);
                                }}
                                options={[
                                    { value: '', label: '+ Add coin' },
                                    ...coins.filter(c => !compareList.includes(c.id)).map(c => ({ value: c.id, label: c.name }))
                                ]}
                            />
                            {['1', '7', '30', '365'].map(d => (
                                <button key={d} onClick={() => setTimeRange(d)} style={{
                                    background: timeRange === d ? 'rgba(176,0,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    border: `1px solid ${timeRange === d ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    color: timeRange === d ? 'var(--text-main)' : 'var(--text-muted)',
                                    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                                }}>{d === '1' ? '24H' : d === '7' ? '7D' : d === '30' ? '1M' : '1Y'}</button>
                            ))}
                        </div>
                        {compareList.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {compareList.map((id, i) => {
                                    const coin = coins.find(c => c.id === id);
                                    return (
                                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, border: `1px solid ${COLORS[i % COLORS.length]}40`, background: `${COLORS[i % COLORS.length]}15` }}>
                                            {coin?.image && <img src={coin.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} />}
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: COLORS[i % COLORS.length] }}>{coin?.symbol?.toUpperCase() || id}</span>
                                            <button onClick={() => setCompareList(l => l.filter(x => x !== id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="card">
                            {compareList.length === 0 ? (
                                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add coins above to compare performance (%)</div>
                            ) : (
                                <div style={{ height: 280, position: 'relative' }}>
                                    {compareChartData && <LineChart data={compareChartData} options={chartOptions(true)} />}
                                </div>
                            )}
                        </div>
                        {compareList.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                {compareList.map((id, i) => {
                                    const coin = coins.find(c => c.id === id);
                                    if (!coin) return null;
                                    return (
                                        <div key={id} style={{ ...S.statBox, borderColor: `${COLORS[i % COLORS.length]}40` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                                <img src={coin.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: COLORS[i % COLORS.length] }}>{coin.name}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem' }}>
                                                <div><div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Price</div><div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{fmt(coin.current_price)}</div></div>
                                                <div><div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>24h</div><div>{pct(coin.price_change_percentage_24h)}</div></div>
                                                <div><div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Mkt Cap</div><div style={{ fontFamily: 'monospace' }}>{fmt(coin.market_cap)}</div></div>
                                                <div><div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Volume</div><div style={{ fontFamily: 'monospace' }}>{fmt(coin.total_volume)}</div></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ MARKET / WATCHLIST TAB ═══ */}
                {(tab === 'all' || tab === 'watchlist') && (
                    <>
                        {/* Selected coin detail */}
                        {selectedCoin && (
                            <div className="card" style={{ animation: 'slideUp 0.3s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        {selectedCoin.image && <img src={selectedCoin.image} alt="" style={{ width: 44, height: 44, borderRadius: '50%', boxShadow: '0 0 15px rgba(176,0,255,0.3)' }} />}
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {selectedCoin.name}
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({selectedCoin.symbol?.toUpperCase()})</span>
                                                <span style={{ background: 'rgba(176,0,255,0.15)', border: '1px solid rgba(176,0,255,0.4)', borderRadius: 6, fontSize: '0.68rem', padding: '2px 7px', fontWeight: 700, color: 'var(--accent-primary)' }}>#{selectedCoin.market_cap_rank}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 5 }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace' }}>{fmt(selectedCoin.current_price)}</span>
                                                <span>{pct(selectedCoin.price_change_percentage_24h)}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>7d: {pct(selectedCoin.price_change_percentage_7d_in_currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {['1', '7', '30', '365'].map(d => (
                                            <button key={d} onClick={() => setTimeRange(d)} style={{
                                                background: timeRange === d ? 'rgba(176,0,255,0.2)' : 'rgba(0,0,0,0.3)',
                                                border: `1px solid ${timeRange === d ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                                color: timeRange === d ? 'var(--text-main)' : 'var(--text-muted)',
                                                padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                                            }}>{d === '1' ? '24H' : d === '7' ? '7D' : d === '30' ? '1M' : '1Y'}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Extended stats grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
                                    {[
                                        { label: 'Market Cap', value: fmt(selectedCoin.market_cap) },
                                        { label: '24h Volume', value: fmt(selectedCoin.total_volume) },
                                        { label: 'ATH', value: fmt(selectedCoin.ath) },
                                        { label: 'ATH Date', value: dateFmt(selectedCoin.ath_date) },
                                        { label: 'ATL', value: fmt(selectedCoin.atl) },
                                        { label: 'ATL Date', value: dateFmt(selectedCoin.atl_date) },
                                        { label: 'Circ. Supply', value: selectedCoin.circulating_supply ? `${(selectedCoin.circulating_supply / 1e6).toFixed(2)}M` : '---' },
                                        { label: 'Max Supply', value: selectedCoin.max_supply ? `${(selectedCoin.max_supply / 1e6).toFixed(2)}M` : '∞' },
                                    ].map(s => (
                                        <div key={s.label} style={S.statBox}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Supply bar */}
                                {selectedCoin.circulating_supply && selectedCoin.max_supply && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                                            <span>Circulating Supply</span>
                                            <span>{((selectedCoin.circulating_supply / selectedCoin.max_supply) * 100).toFixed(1)}% of max</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min((selectedCoin.circulating_supply / selectedCoin.max_supply) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #00ff88)', borderRadius: 4 }} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ height: 200, position: 'relative' }}>
                                    {mainChartData && <LineChart data={mainChartData} options={chartOptions()} />}
                                </div>
                            </div>
                        )}

                        {/* Search + sort bar */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
                                <input type="text" className="input-field" placeholder="Search by name or symbol..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
                            </div>
                            <button onClick={() => handleSort('market_cap')} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: sortKey === 'market_cap' ? 'var(--accent-primary)' : 'var(--text-muted)', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                Mkt Cap{sortIcon('market_cap')}
                            </button>
                            <button onClick={() => handleSort('price_change_percentage_24h')} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: sortKey === 'price_change_percentage_24h' ? 'var(--accent-primary)' : 'var(--text-muted)', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                24h{sortIcon('price_change_percentage_24h')}
                            </button>
                        </div>

                        {/* Coin Table */}
                        <div style={S.section}>
                            {/* Header row */}
                            <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)' }}>
                                {[
                                    { label: '#', key: 'market_cap_rank', align: 'left' },
                                    { label: '', key: null },
                                    { label: 'COIN', key: 'name', align: 'left' },
                                    { label: 'PRICE', key: 'current_price', align: 'right' },
                                    { label: '24H', key: 'price_change_percentage_24h', align: 'right' },
                                    { label: '7D', key: 'price_change_percentage_7d_in_currency', align: 'right' },
                                    { label: 'MKT CAP', key: 'market_cap', align: 'right' },
                                    { label: '7D CHART', key: null, align: 'right' },
                                    { label: '⭐', key: null },
                                ].map((h, i) => (
                                    <div key={i} style={{ ...S.th, textAlign: h.align || 'center' }} onClick={() => h.key && handleSort(h.key)}>
                                        {h.label}{h.key ? sortIcon(h.key) : ''}
                                    </div>
                                ))}
                            </div>

                            {loading ? (
                                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <div style={{ marginBottom: 10, fontSize: 24 }}>⟳</div>
                                    Fetching market data...
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No coins match your search.</div>
                            ) : (
                                <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                                    {filtered.map(coin => {
                                        const isUp24 = (coin.price_change_percentage_24h || 0) >= 0;
                                        const isUp7d = (coin.price_change_percentage_7d_in_currency || 0) >= 0;
                                        const isSelected = selectedCoin?.id === coin.id;
                                        const isWatched = watchlist.includes(coin.id);
                                        return (
                                            <div key={coin.id}
                                                onClick={() => { setSelectedCoin(coin); setTab(t => t === 'portfolio' || t === 'compare' ? t : 'all'); }}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: COL,
                                                    gap: 10,
                                                    padding: '11px 18px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                    cursor: 'pointer',
                                                    background: isSelected ? 'rgba(176,0,255,0.07)' : 'transparent',
                                                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                                    transition: 'background 0.15s, border-color 0.15s',
                                                    alignItems: 'center',
                                                }}
                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{coin.market_cap_rank}</div>
                                                <div>{coin.image && <img src={coin.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{coin.name}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600 }}>{coin.symbol?.toUpperCase()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem' }}>
                                                    {fmt(coin.current_price)}
                                                </div>
                                                <div style={{ textAlign: 'right', color: isUp24 ? '#00ff88' : '#ff4444', fontWeight: 700, fontSize: '0.83rem' }}>
                                                    {isUp24 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                                </div>
                                                <div style={{ textAlign: 'right', color: isUp7d ? '#00ff88' : '#ff4444', fontWeight: 700, fontSize: '0.83rem' }}>
                                                    {isUp7d ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
                                                </div>
                                                <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    {fmt(coin.market_cap)}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Sparkline data={coin.sparkline_in_7d?.price?.slice(-24) || []} color={isUp24 ? '#00ff88' : '#ff4444'} />
                                                </div>
                                                <div onClick={e => {
                                                    e.stopPropagation();
                                                    setWatchlist(w => w.includes(coin.id) ? w.filter(x => x !== coin.id) : [...w, coin.id]);
                                                }} style={{ textAlign: 'center', fontSize: 16, color: isWatched ? '#ffc800' : 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                                                    {isWatched ? '★' : '☆'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Load more */}
                            {tab === 'all' && !search && coins.length < 250 && (
                                <div style={{ padding: '14px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                                    <button className="cyber-button" style={{ padding: '8px 28px', fontSize: '0.8rem' }} onClick={() => {
                                        const next = Math.floor(coins.length / 50) + 1;
                                        setPage(next);
                                        fetchCoins(next, true);
                                        addToast(`Loading page ${next}...`, 'info');
                                    }}>
                                        Load More Coins ({coins.length} / 250)
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </>
    );
}
