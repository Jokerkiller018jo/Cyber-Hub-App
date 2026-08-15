import { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
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
            if (p >= 100) { p = 100; clearInterval(interval); }
            setProgress(Math.min(p, 100));
            const idx = Math.min(Math.floor((p / 100) * (statuses.length - 1)), statuses.length - 1);
            setStatusText(statuses[idx]);
        }, 220);
        return () => clearInterval(interval);
    }, []);

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
                    <div className="ls-icon-core">
                        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polygon
                                points="40,6 72,22 72,58 40,74 8,58 8,22"
                                stroke="url(#hexGrad)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <circle cx="40" cy="40" r="16" fill="url(#coreGrad)" />
                            <circle cx="40" cy="40" r="8" fill="url(#innerGrad)" />
                            <circle cx="40" cy="40" r="3" fill="white" />
                            <defs>
                                <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop stopColor="#a855f7" />
                                    <stop offset="1" stopColor="#06b6d4" />
                                </linearGradient>
                                <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
                                    <stop stopColor="#a855f7" stopOpacity="0.4" />
                                    <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
                                    <stop stopColor="#c084fc" stopOpacity="0.8" />
                                    <stop offset="1" stopColor="#7c3aed" stopOpacity="0.3" />
                                </radialGradient>
                            </defs>
                        </svg>
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
