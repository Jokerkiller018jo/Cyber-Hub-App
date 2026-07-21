import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function MarketDashboard() {
    const chartRef = useRef(null);
    const [price, setPrice] = useState(64250.00);
    const [history, setHistory] = useState(Array(30).fill(64250.00).map((v, i) => v + (Math.random() * 1000 - 500)));

    useEffect(() => {
        const interval = setInterval(() => {
            const change = (Math.random() * 400) - 200;
            const newPrice = price + change;
            setPrice(newPrice);
            setHistory(prev => [...prev.slice(1), newPrice]);
        }, 3000);
        return () => clearInterval(interval);
    }, [price]);

    const data = {
        labels: Array(30).fill(''),
        datasets: [
            {
                label: 'NEXUS COIN',
                data: history,
                borderColor: '#B000FF',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, "rgba(176,0,255,.35)");
                    gradient.addColorStop(1, "rgba(176,0,255,0)");
                    return gradient;
                }
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            x: { display: false },
            y: { display: false, min: Math.min(...history) - 500, max: Math.max(...history) + 500 }
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>MARKET DASHBOARD</h2>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>NEXUS/USD</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>${price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={{ background: 'rgba(176,0,255,0.1)', color: 'var(--accent-primary)', padding: '10px 20px', borderRadius: 'var(--radius-small)', fontWeight: 'bold' }}>
                    + {((history[29] - history[0]) / history[0] * 100).toFixed(2)}%
                </div>
            </div>

            <div className="card" style={{ flex: 1, position: 'relative' }}>
                <LineChart ref={chartRef} data={data} options={options} />
            </div>
        </div>
    );
}
