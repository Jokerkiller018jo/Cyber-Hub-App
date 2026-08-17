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
            // Fetch current theme color dynamically
            const computedStyle = getComputedStyle(document.documentElement);
            const rawAccent = computedStyle.getPropertyValue('--accent-primary').trim() || '#06b6d4';
            
            // Add a semi-transparent black layer to create the fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = rawAccent;
            ctx.font = `${fontSize}px monospace`;
            
            ctx.shadowBlur = 8;
            ctx.shadowColor = rawAccent;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                // Draw the character
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Reset drop to top randomly to create staggered falling effect
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                // Move drop down
                drops[i]++;
            }
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            animationFrameId = requestAnimationFrame(drawMatrix);
        };

        drawMatrix();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
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
