import React, { useEffect, useRef } from 'react';

export default function DnaBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let time = 0;
        let animationFrameId;

        const drawDNA = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Fetch current theme color dynamically
            const computedStyle = getComputedStyle(document.documentElement);
            const rawAccent = computedStyle.getPropertyValue('--accent-primary').trim() || '#06b6d4';
            
            // DNA overall opacity
            ctx.globalAlpha = 0.25;

            const centerX = canvas.width / 2;
            const amplitude = 120;
            const frequency = 0.02;
            // Faster animation speed
            time += 0.035;

            for (let y = 0; y < canvas.height; y += 30) {
                const x1 = centerX + Math.sin(y * frequency + time) * amplitude;
                const x2 = centerX + Math.sin(y * frequency + time + Math.PI) * amplitude;

                // Base Strands
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.strokeStyle = rawAccent;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Secondary glow effect on connecting lines
                ctx.shadowBlur = 15;
                ctx.shadowColor = rawAccent;

                // Highlight Nodes
                const drawNode = (nx) => {
                    ctx.beginPath();
                    ctx.arc(nx, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = rawAccent;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = rawAccent;
                    ctx.fill();
                };

                drawNode(x1);
                drawNode(x2);
                
                // Reset shadow for next iteration
                ctx.shadowBlur = 0;
            }
            
            ctx.globalAlpha = 1.0;
            animationFrameId = requestAnimationFrame(drawDNA);
        };

        drawDNA();

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
                pointerEvents: 'none'
            }}
        />
    );
}
