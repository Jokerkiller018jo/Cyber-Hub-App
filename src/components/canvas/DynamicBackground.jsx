import React, { useEffect, useRef, useState } from 'react';
import { loadLayoutConfig } from '../../services/layoutConfig';

export default function DynamicBackground() {
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

    // Support both legacy matrixBackground config and new background config
    const bgConfig = layout.background || layout.matrixBackground || {
        enabled: true,
        type: 'matrix-rain',
        speed: 50,
        opacity: 0.8
    };

    const isEnabled = bgConfig.enabled ?? true;
    const bgType = bgConfig.type || (bgConfig.enabled ? 'matrix-rain' : 'none');
    const speedVal = bgConfig.speed || 50;
    const opacityVal = bgConfig.opacity ?? 0.8;

    // Speed multiplier (speedVal 10..100 -> factor ~0.2..3.0 for dramatic, noticeable speed control)
    const speedFactor = Math.max(0.15, (speedVal / 50));
    const speedRef = useRef(speedFactor);
    useEffect(() => {
        speedRef.current = speedFactor;
    }, [speedFactor]);

    useEffect(() => {
        if (!isEnabled || bgType === 'none') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        let animationFrameId;
        let time = 0;
        let matrixStepAccumulator = 0;

        // Fetch active theme accent color
        const getAccent = () => {
            const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
            return raw || '#06b6d4';
        };

        /* ── Effect 1: Matrix Rain ────────────────────────────── */
        const matrixChars = '0123456789ABCDEFHIJKLMNOPQRSTUVWXYZ@#$%&*+=-<>[]';
        const fontSize = 16;
        let columns = Math.floor(width / fontSize);
        let drops = Array(columns).fill(1);

        /* ── Effect 2: Star Particles (Constellation) ─────────── */
        const particleCount = 75;
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            baseVx: (Math.random() - 0.5) * 1.5,
            baseVy: (Math.random() - 0.5) * 1.5,
            r: Math.random() * 2 + 1.2,
        }));

        /* ── Effect 3: Floating Color Orbs ────────────────────── */
        const orbs = Array.from({ length: 8 }, (_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            baseVx: (Math.random() - 0.5) * 2.0,
            baseVy: (Math.random() - 0.5) * 2.0,
            radius: Math.random() * 120 + 80,
            hueOffset: i * 45
        }));

        /* ── Effect 4: Falling Leaves ─────────────────────────── */
        const leafCount = 45;
        const leaves = Array.from({ length: leafCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 14 + 10,
            baseSpeedY: Math.random() * 1.5 + 0.8,
            baseSpeedX: Math.random() * 0.8 - 0.4,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            osc: Math.random() * Math.PI * 2
        }));

        /* ── Effect 5: Snow Flurries ──────────────────────────── */
        const snowflakeCount = 90;
        const flakes = Array.from({ length: snowflakeCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 3 + 1,
            baseSpeedY: Math.random() * 1.8 + 0.9,
            swing: Math.random() * 2,
            swingStep: Math.random() * 0.05
        }));

        /* ── Effect 6: Hyperspeed Space ───────────────────────── */
        const starCount = 200;
        const stars = Array.from({ length: starCount }, () => ({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width,
            pz: Math.random() * width
        }));

        /* ── Effect 7: Glowing Bokeh ──────────────────────────── */
        const bokehCount = 28;
        const bokehs = Array.from({ length: bokehCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 35 + 20,
            baseVx: (Math.random() - 0.5) * 0.8,
            baseVy: (Math.random() - 0.5) * 0.8,
            pulse: Math.random() * Math.PI * 2
        }));

        /* ── Effect 8: Digital Lines ──────────────────────────── */
        const lineTracers = Array.from({ length: 18 }, () => ({
            x: Math.floor(Math.random() * (width / 50)) * 50,
            y: Math.floor(Math.random() * (height / 50)) * 50,
            len: Math.random() * 120 + 60,
            dir: Math.random() > 0.5 ? 'h' : 'v',
            baseSpeed: Math.random() * 3.5 + 2.5
        }));

        /* ── Effect 9: Soft Clouds ────────────────────────────── */
        const clouds = Array.from({ length: 6 }, (_, i) => ({
            x: (i * (width / 5)),
            y: Math.random() * (height * 0.7),
            r: Math.random() * 200 + 150,
            baseSpeed: Math.random() * 0.6 + 0.3
        }));

        /* ── Main Render Loop ─────────────────────────────────── */
        const render = () => {
            const currentSpeed = speedRef.current;
            time += 0.02 * currentSpeed;
            const accent = getAccent();

            ctx.clearRect(0, 0, width, height);

            switch (bgType) {

                // ── 1. MOVING GRADIENT ──
                case 'moving-gradient': {
                    const gx1 = width * (0.5 + 0.45 * Math.sin(time * 0.6));
                    const gy1 = height * (0.5 + 0.45 * Math.cos(time * 0.8));
                    const gx2 = width * (0.5 + 0.45 * Math.cos(time * 0.7));
                    const gy2 = height * (0.5 + 0.45 * Math.sin(time * 0.5));

                    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
                    grad.addColorStop(0, '#09090b');
                    grad.addColorStop(0.35, `${accent}44`);
                    grad.addColorStop(0.7, '#1e1b4b');
                    grad.addColorStop(1, '#09090b');

                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, width, height);
                    break;
                }

                // ── 2. LIQUID GRADIENT ──
                case 'liquid-gradient': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    for (let i = 0; i < 4; i++) {
                        const cx = width * (0.5 + 0.38 * Math.sin(time * 0.9 + i * 1.5));
                        const cy = height * (0.5 + 0.38 * Math.cos(time * 0.7 + i * 2));
                        const rad = (width + height) * 0.28;

                        const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
                        radGrad.addColorStop(0, `${accent}60`);
                        radGrad.addColorStop(0.5, i % 2 === 0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(6, 182, 212, 0.3)');
                        radGrad.addColorStop(1, 'transparent');

                        ctx.fillStyle = radGrad;
                        ctx.fillRect(0, 0, width, height);
                    }
                    break;
                }

                // ── 3. FLOATING COLOR ORBS ──
                case 'floating-orbs': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    orbs.forEach(orb => {
                        orb.x += orb.baseVx * currentSpeed;
                        orb.y += orb.baseVy * currentSpeed;
                        if (orb.x < -orb.radius) orb.x = width + orb.radius;
                        if (orb.x > width + orb.radius) orb.x = -orb.radius;
                        if (orb.y < -orb.radius) orb.y = height + orb.radius;
                        if (orb.y > height + orb.radius) orb.y = -orb.radius;

                        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                        grad.addColorStop(0, `${accent}88`);
                        grad.addColorStop(0.6, `${accent}25`);
                        grad.addColorStop(1, 'transparent');

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    break;
                }

                // ── 4. SLIDING DIAGONALS ──
                case 'sliding-diagonals': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    const stripeWidth = 60;
                    const offset = (time * 80) % (stripeWidth * 2);

                    ctx.save();
                    ctx.strokeStyle = `${accent}28`;
                    ctx.lineWidth = 2;

                    for (let x = -height - offset; x < width + height; x += stripeWidth) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x + height, height);
                        ctx.stroke();

                        // Glowing accent line every 4th
                        if (Math.abs(Math.floor(x / stripeWidth)) % 4 === 0) {
                            ctx.strokeStyle = `${accent}66`;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = accent;
                            ctx.stroke();
                            ctx.strokeStyle = `${accent}28`;
                            ctx.shadowBlur = 0;
                        }
                    }
                    ctx.restore();
                    break;
                }

                // ── 5. ANIMATED WAVE ──
                case 'animated-wave': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    for (let layer = 0; layer < 4; layer++) {
                        ctx.beginPath();
                        ctx.moveTo(0, height);

                        const freq = 0.003 + layer * 0.001;
                        const amp = 45 + layer * 15;
                        const wavePhase = time * (1.2 + layer * 0.5);

                        for (let x = 0; x <= width; x += 15) {
                            const y = height * (0.65 - layer * 0.1) + Math.sin(x * freq + wavePhase) * amp + Math.cos(x * freq * 0.5 + wavePhase) * 20;
                            ctx.lineTo(x, y);
                        }

                        ctx.lineTo(width, height);
                        ctx.closePath();

                        ctx.fillStyle = layer === 0 ? `${accent}18` : layer === 1 ? `${accent}30` : `${accent}45`;
                        ctx.fill();
                    }
                    break;
                }

                // ── 6. SOFT CLOUDS ──
                case 'soft-clouds': {
                    ctx.fillStyle = '#0a0a10';
                    ctx.fillRect(0, 0, width, height);

                    clouds.forEach(cloud => {
                        cloud.x += cloud.baseSpeed * currentSpeed;
                        if (cloud.x - cloud.r > width) cloud.x = -cloud.r;

                        const grad = ctx.createRadialGradient(cloud.x, cloud.y, cloud.r * 0.1, cloud.x, cloud.y, cloud.r);
                        grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
                        grad.addColorStop(0.4, `${accent}18`);
                        grad.addColorStop(1, 'transparent');

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    break;
                }

                // ── 7. FALLING LEAVES ──
                case 'falling-leaves': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    leaves.forEach(leaf => {
                        leaf.y += leaf.baseSpeedY * currentSpeed;
                        leaf.osc += 0.03 * currentSpeed;
                        leaf.x += leaf.baseSpeedX * currentSpeed + Math.sin(leaf.osc) * 0.8;
                        leaf.angle += leaf.rotSpeed * currentSpeed;

                        if (leaf.y > height + 20) {
                            leaf.y = -20;
                            leaf.x = Math.random() * width;
                        }

                        ctx.save();
                        ctx.translate(leaf.x, leaf.y);
                        ctx.rotate(leaf.angle);

                        ctx.fillStyle = `${accent}99`;
                        ctx.beginPath();
                        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    });
                    break;
                }

                // ── 8. GENTLE RIPPLES ──
                case 'gentle-ripples': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    const rippleCenters = [
                        { x: width * 0.3, y: height * 0.4 },
                        { x: width * 0.7, y: height * 0.6 },
                        { x: width * 0.5, y: height * 0.25 },
                    ];

                    rippleCenters.forEach((center, idx) => {
                        for (let ring = 0; ring < 6; ring++) {
                            const radius = ((time * 50 + ring * 50 + idx * 80) % 350);
                            const alpha = Math.max(0, 1 - radius / 350) * 0.35;

                            ctx.beginPath();
                            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                            ctx.strokeStyle = `${accent}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                    break;
                }

                // ── 9. AURORA BOREALIS ──
                case 'aurora-borealis': {
                    ctx.fillStyle = '#06060c';
                    ctx.fillRect(0, 0, width, height);

                    for (let band = 0; band < 3; band++) {
                        ctx.beginPath();
                        ctx.moveTo(0, height * 0.5);

                        for (let x = 0; x <= width; x += 20) {
                            const y = height * (0.35 + band * 0.12) +
                                Math.sin(x * 0.004 + time * 1.0 + band) * 70 +
                                Math.cos(x * 0.008 - time * 0.6) * 30;
                            ctx.lineTo(x, y);
                        }

                        ctx.lineTo(width, 0);
                        ctx.lineTo(0, 0);
                        ctx.closePath();

                        const grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.7);
                        grad.addColorStop(0, 'transparent');
                        grad.addColorStop(0.5, band % 2 === 0 ? `${accent}40` : 'rgba(16, 185, 129, 0.3)');
                        grad.addColorStop(1, 'transparent');

                        ctx.fillStyle = grad;
                        ctx.fill();
                    }
                    break;
                }

                // ── 10. SNOW FLURRIES ──
                case 'snow-flurries': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    ctx.fillStyle = '#ffffff';
                    flakes.forEach(f => {
                        f.y += f.baseSpeedY * currentSpeed;
                        f.swing += f.swingStep * currentSpeed;
                        f.x += Math.sin(f.swing) * 0.6;

                        if (f.y > height + 5) {
                            f.y = -5;
                            f.x = Math.random() * width;
                        }

                        ctx.beginPath();
                        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${f.r > 2 ? 0.7 : 0.4})`;
                        ctx.fill();
                    });
                    break;
                }

                // ── 11. MATRIX RAIN ──
                case 'matrix-rain': {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.fillRect(0, 0, width, height);

                    ctx.fillStyle = accent;
                    ctx.font = `${fontSize}px monospace`;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = accent;

                    if (columns !== Math.floor(width / fontSize)) {
                        columns = Math.floor(width / fontSize);
                        drops = Array(columns).fill(1);
                    }

                    // Dynamically step drops according to motion speed factor
                    matrixStepAccumulator += currentSpeed;
                    const stepCount = Math.floor(matrixStepAccumulator);
                    if (stepCount >= 1) {
                        matrixStepAccumulator -= stepCount;
                        for (let i = 0; i < drops.length; i++) {
                            const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                                drops[i] = 0;
                            }
                            drops[i] += stepCount;
                        }
                    } else {
                        for (let i = 0; i < drops.length; i++) {
                            const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                        }
                    }
                    ctx.shadowBlur = 0;
                    break;
                }

                // ── 12. STAR PARTICLES (Constellation Web) ──
                case 'star-particles': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        p.x += p.baseVx * currentSpeed;
                        p.y += p.baseVy * currentSpeed;

                        if (p.x < 0 || p.x > width) p.baseVx *= -1;
                        if (p.y < 0 || p.y > height) p.baseVy *= -1;

                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = accent;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = accent;
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Connect lines
                        for (let j = i + 1; j < particles.length; j++) {
                            const p2 = particles[j];
                            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                            if (dist < 130) {
                                ctx.strokeStyle = `${accent}${Math.floor((1 - dist / 130) * 80).toString(16).padStart(2, '0')}`;
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
                        }
                    }
                    break;
                }

                // ── 13. DIGITAL LINES ──
                case 'digital-lines': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    // Grid
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.lineWidth = 1;
                    for (let x = 0; x < width; x += 50) {
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
                    }
                    for (let y = 0; y < height; y += 50) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
                    }

                    // Pulsing circuit tracers
                    lineTracers.forEach(tr => {
                        if (tr.dir === 'h') {
                            tr.x += tr.baseSpeed * currentSpeed;
                            if (tr.x > width + tr.len) tr.x = -tr.len;

                            const grad = ctx.createLinearGradient(tr.x - tr.len, tr.y, tr.x, tr.y);
                            grad.addColorStop(0, 'transparent');
                            grad.addColorStop(1, accent);

                            ctx.strokeStyle = grad;
                            ctx.lineWidth = 2;
                            ctx.shadowBlur = 8;
                            ctx.shadowColor = accent;
                            ctx.beginPath();
                            ctx.moveTo(tr.x - tr.len, tr.y);
                            ctx.lineTo(tr.x, tr.y);
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                        } else {
                            tr.y += tr.baseSpeed * currentSpeed;
                            if (tr.y > height + tr.len) tr.y = -tr.len;

                            const grad = ctx.createLinearGradient(tr.x, tr.y - tr.len, tr.x, tr.y);
                            grad.addColorStop(0, 'transparent');
                            grad.addColorStop(1, accent);

                            ctx.strokeStyle = grad;
                            ctx.lineWidth = 2;
                            ctx.shadowBlur = 8;
                            ctx.shadowColor = accent;
                            ctx.beginPath();
                            ctx.moveTo(tr.x, tr.y - tr.len);
                            ctx.lineTo(tr.x, tr.y);
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                        }
                    });
                    break;
                }

                // ── 14. HYPERSPEED SPACE ──
                case 'hyperspeed-space': {
                    ctx.fillStyle = 'rgba(9, 9, 11, 0.25)';
                    ctx.fillRect(0, 0, width, height);

                    const cx = width / 2;
                    const cy = height / 2;

                    stars.forEach(s => {
                        s.pz = s.z;
                        s.z -= 10 * currentSpeed;

                        if (s.z <= 0) {
                            s.z = width;
                            s.pz = width;
                            s.x = (Math.random() - 0.5) * width;
                            s.y = (Math.random() - 0.5) * height;
                        }

                        const k = 128 / s.z;
                        const px = s.x * k + cx;
                        const py = s.y * k + cy;

                        const pk = 128 / s.pz;
                        const prevX = s.x * pk + cx;
                        const prevY = s.y * pk + cy;

                        if (px >= 0 && px <= width && py >= 0 && py <= height) {
                            ctx.beginPath();
                            ctx.moveTo(prevX, prevY);
                            ctx.lineTo(px, py);
                            ctx.strokeStyle = accent;
                            ctx.lineWidth = Math.min(3, (1 - s.z / width) * 3.5);
                            ctx.stroke();
                        }
                    });
                    break;
                }

                // ── 15. GLOWING BOKEH ──
                case 'glowing-bokeh': {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);

                    bokehs.forEach(b => {
                        b.x += b.baseVx * currentSpeed;
                        b.y += b.baseVy * currentSpeed;
                        b.pulse += 0.025 * currentSpeed;

                        if (b.x < -b.r) b.x = width + b.r;
                        if (b.x > width + b.r) b.x = -b.r;
                        if (b.y < -b.r) b.y = height + b.r;
                        if (b.y > height + b.r) b.y = -b.r;

                        const currentRadius = b.r * (1 + 0.15 * Math.sin(b.pulse));

                        const grad = ctx.createRadialGradient(b.x, b.y, currentRadius * 0.2, b.x, b.y, currentRadius);
                        grad.addColorStop(0, `${accent}40`);
                        grad.addColorStop(0.7, `${accent}15`);
                        grad.addColorStop(1, 'transparent');

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
                        ctx.fill();

                        // Ring border
                        ctx.strokeStyle = `${accent}50`;
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    });
                    break;
                }

                // ── 16. LIQUID METAL ──
                case 'liquid-metal': {
                    ctx.fillStyle = '#07070a';
                    ctx.fillRect(0, 0, width, height);

                    for (let m = 0; m < 5; m++) {
                        ctx.beginPath();
                        ctx.moveTo(0, height);

                        for (let x = 0; x <= width; x += 20) {
                            const y = height * (0.5 + m * 0.08) +
                                Math.sin(x * 0.005 + time * 1.5 + m) * 60 +
                                Math.cos(x * 0.003 - time * 1.0) * 40;
                            ctx.lineTo(x, y);
                        }

                        ctx.lineTo(width, height);
                        ctx.closePath();

                        const chromeGrad = ctx.createLinearGradient(0, height * 0.4, width, height);
                        chromeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
                        chromeGrad.addColorStop(0.3, `${accent}35`);
                        chromeGrad.addColorStop(0.6, 'rgba(20, 20, 30, 0.8)');
                        chromeGrad.addColorStop(1, `${accent}20`);

                        ctx.fillStyle = chromeGrad;
                        ctx.fill();
                    }
                    break;
                }

                default:
                    break;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isEnabled, bgType]);

    if (!isEnabled || bgType === 'none') return null;

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
                opacity: opacityVal,
                transition: 'opacity 0.3s ease',
            }}
        />
    );
}
