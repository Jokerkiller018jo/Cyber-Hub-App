import { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Establishing secure connection...');

    const statuses = [
        'Establishing secure connection...',
        'Loading encryption modules...',
        'Syncing neural networks...',
        'Calibrating nexus core...',
        'Initializing cyber protocols...',
        'System ready.',
    ];

    useEffect(() => {
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 18 + 4;
            if (p >= 100) { 
                p = 100; 
                clearInterval(interval);
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 400); // Give it a small pause at 100%
            }
            setProgress(Math.min(p, 100));
            const idx = Math.min(Math.floor((p / 100) * (statuses.length - 1)), statuses.length - 1);
            setStatusText(statuses[idx]);
        }, 220);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="ls-root">
            {/* Animated grid background */}
            <div className="ls-grid" />

            {/* Scanline overlay */}
            <div className="ls-scanlines" />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <div key={i} className="ls-particle" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    opacity: 0.3 + Math.random() * 0.5,
                }} />
            ))}

            {/* Center content */}
            <div className="ls-center">

                {/* Logo / icon */}
                <div className="ls-logo-wrap">
                    <div className="ls-hex-ring ls-ring-1" />
                    <div className="ls-hex-ring ls-ring-2" />
                    <div className="ls-hex-ring ls-ring-3" />
                    <div className="ls-icon-core" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src="/favicon.jpg"
                            alt="Cyber-Hub"
                            style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), 0 0 10px rgba(168, 85, 247, 0.4)'
                            }}
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="ls-title-wrap">
                    <h1 className="ls-title ls-glitch" data-text="CYBER HUB">CYBER HUB</h1>
                    <p className="ls-subtitle">N E X U S &nbsp; C O R E &nbsp; v 2 . 0</p>
                </div>

                {/* Progress bar */}
                <div className="ls-bar-wrap">
                    <div className="ls-bar-track">
                        <div className="ls-bar-fill" style={{ width: `${progress}%` }}>
                            <div className="ls-bar-shine" />
                        </div>
                    </div>
                    <div className="ls-bar-labels">
                        <span className="ls-status">{statusText}</span>
                        <span className="ls-pct">{Math.floor(progress)}%</span>
                    </div>
                </div>

                {/* Corner decorations */}
                <div className="ls-corner ls-tl" />
                <div className="ls-corner ls-tr" />
                <div className="ls-corner ls-bl" />
                <div className="ls-corner ls-br" />
            </div>
        </div>
    );
};

export default LoadingScreen;
