import React, { useEffect, useRef, useState } from 'react';
import { loadLayoutConfig } from '../../services/layoutConfig';

export default function MatrixBackground() {
    const canvasRef = useRef(null);
    const [layout, setLayout] = useState(() => loadLayoutConfig());

    useEffect(() => {
        const handleUpdate = () => setLayout(loadLayoutConfig());
        window.addEventListener('cyberhub_layout_change', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        return () => {
            window.removeEventListener('cyberhub_layout_change', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const matrixSpeed = layout.matrixBackground?.speed || 50;
    const matrixOpacity = layout.matrixBackground?.opacity ?? 0.8;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let width, height;
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Characters to use for the falling effect
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+=-{}[]|;:<>?,./';
        const fontSize = 16;
        const columns = Math.floor(width / fontSize);
        const drops = Array(columns).fill(1);

        const drawMatrix = () => {
            const computedStyle = getComputedStyle(document.documentElement);
            const rawAccent = computedStyle.getPropertyValue('--accent-primary').trim() || '#06b6d4';
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = rawAccent;
            ctx.font = `${fontSize}px monospace`;
            
            ctx.shadowBlur = 5;
            ctx.shadowColor = rawAccent;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                drops[i]++;
            }
            
            ctx.shadowBlur = 0;
        };

        const intervalId = setInterval(drawMatrix, matrixSpeed);

        return () => {
            window.removeEventListener('resize', resize);
            clearInterval(intervalId);
        };
    }, [matrixSpeed]);

    return (
        <canvas 
            ref={canvasRef} 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: matrixOpacity,
                transition: 'opacity 0.3s ease',
            }}
        />
    );
}
