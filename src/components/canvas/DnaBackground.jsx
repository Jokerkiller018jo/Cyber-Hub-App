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
            
            // Background is transparent because App background handles color
            // DNA overall opacity
            ctx.globalAlpha = 0.25;

            const centerY = canvas.height / 2;
            const amplitude = 100;
            const frequency = 0.02;
            // Slower animation speed
            time += 0.015;

            for (let x = 0; x < canvas.width; x += 30) {
                const y1 = centerY + Math.sin(x * frequency + time) * amplitude;
                const y2 = centerY + Math.sin(x * frequency + time + Math.PI) * amplitude;

                // Base Strands
                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.strokeStyle = 'rgba(176, 0, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Secondary glow effect on connecting lines
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(106, 13, 173, 0.4)';

                // Highlight Nodes
                const drawNode = (ny) => {
                    ctx.beginPath();
                    ctx.arc(x, ny, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#D500F9';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#D500F9';
                    ctx.fill();
                };

                drawNode(y1);
                drawNode(y2);
                
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
