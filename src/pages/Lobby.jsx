import React, { useState, useEffect } from 'react';

const TICKERS = [
    { id: 'bitcoin', symbol: 'BTC', color: '#f7931a' },
    { id: 'ethereum', symbol: 'ETH', color: '#627eea' },
    { id: 'solana', symbol: 'SOL', color: '#9945ff' },
    { id: 'binancecoin', symbol: 'BNB', color: '#f3ba2f' },
];

function StatCard({ label, value, sub, color = 'var(--accent-primary)', icon }) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>{label}</span>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
        </div>
    );
}

function CryptoTicker({ coin }) {
    const isUp = coin.change >= 0;
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px' }}>
            <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: `${coin.color}22`, border: `2px solid ${coin.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '0.7rem', color: coin.color
            }}>
                {coin.symbol}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{coin.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{coin.symbol}/USD</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                    ${coin.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                </div>
                <div style={{ fontSize: '0.8rem', color: isUp ? '#00ff88' : '#ff4444', fontWeight: 600 }}>
                    {isUp ? '▲' : '▼'} {Math.abs(coin.change)?.toFixed(2)}%
                </div>
            </div>
        </div>
    );
}

export default function Lobby() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const [dominance, setDominance] = useState(null);

    const fetchData = async () => {
        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin&order=market_cap_desc&sparkline=false`
            );
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setCoins(data.map(c => ({
                id: c.id,
                name: c.name,
                symbol: c.symbol?.toUpperCase(),
                price: c.current_price,
                change: c.price_change_percentage_24h,
                cap: c.market_cap,
                color: TICKERS.find(t => t.id === c.id)?.color || '#b000ff',
            })));

            // Global data
            const gRes = await fetch('https://api.coingecko.com/api/v3/global');
            if (gRes.ok) {
                const gData = await gRes.json();
                setDominance(gData.data?.market_cap_percentage?.btc?.toFixed(1));
            }
        } catch (e) {
            // Keep showing cached/default data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(clockInterval); };
    }, []);

    const totalMarketCap = coins.reduce((acc, c) => acc + (c.cap || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '25px', paddingBottom: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>COMMAND CENTER</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                        Real-time market intelligence — Node synced
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                        {time.toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                <StatCard
                    label="BTC DOMINANCE"
                    value={dominance ? `${dominance}%` : '---'}
                    sub="Bitcoin market share"
                    color="#f7931a"
                    icon="₿"
                />
                <StatCard
                    label="TOTAL MARKET CAP"
                    value={loading ? '---' : `$${(totalMarketCap / 1e9).toFixed(1)}B`}
                    sub="Top 4 coins combined"
                    color="var(--accent-primary)"
                    icon="📊"
                />
                <StatCard
                    label="ACTIVE ASSETS"
                    value={coins.length || '---'}
                    sub="Tracked live positions"
                    color="#00ff88"
                    icon="⚡"
                />
                <StatCard
                    label="NODE STATUS"
                    value="ONLINE"
                    sub="All systems operational"
                    color="#00ff88"
                    icon="🛡"
                />
            </div>

            {/* Live Crypto Tickers */}
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 8px #00ff88', animation: 'pulse 2s infinite' }}></span>
                    LIVE CRYPTO FEED
                </div>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', padding: '30px', textAlign: 'center', fontSize: '0.85rem' }}>
                        Syncing market data...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {coins.map(coin => <CryptoTicker key={coin.id} coin={coin} />)}
                    </div>
                )}
            </div>

            {/* System Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                    { label: 'Data Source', value: 'CoinGecko API', icon: '🔗' },
                    { label: 'Refresh Rate', value: '60 seconds', icon: '🔄' },
                    { label: 'Protocol', value: 'HTTPS / REST', icon: '🔒' },
                    { label: 'Session', value: 'Secure Active', icon: '✅' },
                ].map(item => (
                    <div key={item.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px' }}>{item.label}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
