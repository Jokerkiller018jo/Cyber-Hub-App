import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function Sparkline({ data, color }) {
    if (!data || data.length < 2) return <div style={{ width: 80, height: 30, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />;
    const chartData = {
        labels: data.map((_, i) => i),
        datasets: [{
            data,
            borderColor: color,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
            backgroundColor: `${color}22`,
        }]
    };
    const options = {
        responsive: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
    };
    return <LineChart data={chartData} options={options} width={80} height={30} />;
}

export default function MarketDashboard() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [timeRange, setTimeRange] = useState('7');
    const [error, setError] = useState('');

    const fetchCoins = async () => {
        try {
            setError('');
            const res = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h,7d'
            );
            if (!res.ok) throw new Error('Rate limited');
            const data = await res.json();
            setCoins(data);
            if (!selectedCoin && data.length > 0) setSelectedCoin(data[0]);
        } catch (e) {
            setError('Failed to load. Using cached data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchChart = async (coinId, days) => {
        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
            );
            if (!res.ok) return;
            const data = await res.json();
            setChartData(data.prices?.map(p => ({ x: p[0], y: p[1] })) || []);
        } catch (e) {}
    };

    useEffect(() => {
        fetchCoins();
        const interval = setInterval(fetchCoins, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedCoin) fetchChart(selectedCoin.id, timeRange);
    }, [selectedCoin, timeRange]);

    const filtered = coins.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (n) => {
        if (n == null) return '---';
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        if (n >= 1e3) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `$${n.toFixed(n < 1 ? 6 : 2)}`;
    };

    const mainChartData = chartData ? {
        labels: chartData.map(p => ''),
        datasets: [{
            label: selectedCoin?.name,
            data: chartData.map(p => p.y),
            borderColor: '#b000ff',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
            backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(176,0,255,0.35)');
                gradient.addColorStop(1, 'rgba(176,0,255,0)');
                return gradient;
            }
        }]
    } : null;

    const mainChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        scales: {
            x: { display: false },
            y: {
                display: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'var(--text-muted)', callback: v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(2)}` }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: { label: ctx => `$${ctx.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '20px', paddingBottom: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>CRYPTO MARKET</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        Top 50 cryptocurrencies by market cap — live data
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#00ff88', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }}></span>
                        LIVE
                    </span>
                    <button onClick={fetchCoins} className="cyber-button" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>↺ REFRESH</button>
                </div>
            </div>

            {error && <div style={{ color: '#ff4444', fontSize: '0.8rem', background: 'rgba(255,68,68,0.1)', padding: '8px 15px', borderRadius: 'var(--radius-small)', border: '1px solid #ff444440' }}>{error}</div>}

            {/* Selected Coin Chart */}
            {selectedCoin && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {selectedCoin.image && <img src={selectedCoin.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedCoin.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({selectedCoin.symbol?.toUpperCase()})</span></div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '4px' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                        {formatCurrency(selectedCoin.current_price)}
                                    </span>
                                    <span style={{ color: (selectedCoin.price_change_percentage_24h || 0) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 700 }}>
                                        {(selectedCoin.price_change_percentage_24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.price_change_percentage_24h || 0).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['1', '7', '30', '365'].map(d => (
                                <button key={d} onClick={() => setTimeRange(d)} style={{
                                    background: timeRange === d ? 'rgba(176,0,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    border: `1px solid ${timeRange === d ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    color: timeRange === d ? 'var(--text-main)' : 'var(--text-muted)',
                                    padding: '5px 12px', borderRadius: 'var(--radius-small)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                }}>
                                    {d === '1' ? '24H' : d === '7' ? '7D' : d === '30' ? '1M' : '1Y'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Market Cap', value: formatCurrency(selectedCoin.market_cap) },
                            { label: '24h Volume', value: formatCurrency(selectedCoin.total_volume) },
                            { label: 'ATH', value: formatCurrency(selectedCoin.ath) },
                            { label: 'Rank', value: `#${selectedCoin.market_cap_rank}` },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '3px' }}>{s.label}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ height: '200px', position: 'relative' }}>
                        {mainChartData && <LineChart data={mainChartData} options={mainChartOptions} />}
                    </div>
                </div>
            )}

            {/* Search */}
            <input
                type="text"
                className="input-field"
                placeholder="Search coins by name or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Coins Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 40px 1fr 120px 100px 100px 90px',
                    gap: '10px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <div>#</div>
                    <div></div>
                    <div>COIN</div>
                    <div style={{ textAlign: 'right' }}>PRICE</div>
                    <div style={{ textAlign: 'right' }}>24H</div>
                    <div style={{ textAlign: 'right' }}>MKT CAP</div>
                    <div style={{ textAlign: 'right' }}>7D CHART</div>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Fetching market data...
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filtered.map(coin => {
                            const isUp = (coin.price_change_percentage_24h || 0) >= 0;
                            const isSelected = selectedCoin?.id === coin.id;
                            return (
                                <div
                                    key={coin.id}
                                    onClick={() => setSelectedCoin(coin)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '40px 40px 1fr 120px 100px 100px 90px',
                                        gap: '10px',
                                        padding: '12px 20px',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(176,0,255,0.07)' : 'transparent',
                                        borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                        transition: 'all 0.15s ease',
                                        alignItems: 'center',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{coin.market_cap_rank}</div>
                                    <div>
                                        {coin.image && <img src={coin.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{coin.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{coin.symbol?.toUpperCase()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {formatCurrency(coin.current_price)}
                                    </div>
                                    <div style={{ textAlign: 'right', color: isUp ? '#00ff88' : '#ff4444', fontWeight: 700, fontSize: '0.85rem' }}>
                                        {isUp ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                    </div>
                                    <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {formatCurrency(coin.market_cap)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Sparkline
                                            data={coin.sparkline_in_7d?.price?.slice(-24) || []}
                                            color={isUp ? '#00ff88' : '#ff4444'}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
