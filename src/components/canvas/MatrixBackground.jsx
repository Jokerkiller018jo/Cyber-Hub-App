import React, { useEffect, useRef } from 'react';

export default function MatrixBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
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
        let columns = width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        let animationFrameId;

        const drawMatrix = () => {
            const computedStyle = getComputedStyle(document.documentElement);
            const rawAccent = computedStyle.getPropertyValue('--accent-primary').trim() || '#06b6d4';
            
            // Use a slight fade of the actual background color rather than pure black
            // We use a fallback if the variable isn't parsed perfectly, but usually we just use black with low opacity
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

        const intervalId = setInterval(drawMatrix, 50);

        return () => {
            window.removeEventListener('resize', resize);
            clearInterval(intervalId);
        };
    }, []);

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
                opacity: 0.8
            }}
        />
    );
}
