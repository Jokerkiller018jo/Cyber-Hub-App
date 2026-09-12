// ── CyberHub Color Picker — Precision Loupe (content.js) ───────────────────
// High-density 1:1 physical pixel loupe with zero pixel-skipping,
// small pixel cells for wide context, and 1-pixel arrow key nudging.

(function () {
    if (window.__CYBERHUB_LOUPE_INITIALIZED__) return;
    window.__CYBERHUB_LOUPE_INITIALIZED__ = true;

    let activeOverlay = null;
    let lastMouseX = Math.round(window.innerWidth / 2);
    let lastMouseY = Math.round(window.innerHeight / 2);

    window.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }, { passive: true });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'START_PRECISION_LOUPE') {
            startPrecisionLoupe(message.dataUrl, message.settings || {});
            sendResponse({ status: 'ok' });
        } else if (message.action === 'STOP_PRECISION_LOUPE') {
            cleanup();
            sendResponse({ status: 'ok' });
        }
        return true;
    });

    function cleanup() {
        if (activeOverlay) {
            activeOverlay.destroy();
            activeOverlay = null;
        }
    }

    function startPrecisionLoupe(dataUrl, settings) {
        cleanup();

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            activeOverlay = createLoupeOverlay(img, settings);
        };
        img.src = dataUrl;
    }

    function createLoupeOverlay(img, userSettings) {
        // Grid density configuration
        // Default 25x25 = 625 pixels with small 7px cells for maximum pixel visibility
        const gridSize = parseInt(userSettings.loupeGridSize) || 25; 
        const halfGrid = Math.floor(gridSize / 2);
        const cellSize = 7; // Small pixel cells so you can see many more surrounding pixels
        const loupeRadius = Math.round((gridSize * cellSize) / 2);

        // Prepare offscreen canvas for fast pixel data access
        const offscreen = document.createElement('canvas');
        offscreen.width = img.naturalWidth;
        offscreen.height = img.naturalHeight;
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        offCtx.drawImage(img, 0, 0);

        let imgData;
        try {
            imgData = offCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        } catch (e) {
            console.error('[CyberHub Loupe] Could not get image data', e);
            return null;
        }
        const pixels = imgData.data;
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        // Create fullscreen interactive overlay
        const canvas = document.createElement('canvas');
        canvas.id = 'cyberhub-precision-canvas';
        canvas.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            cursor: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            pointer-events: all !important;
        `;
        document.documentElement.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let viewW = window.innerWidth;
        let viewH = window.innerHeight;
        canvas.width = viewW;
        canvas.height = viewH;

        // Current coordinate state (starts directly at cursor position!)
        let clientX = lastMouseX;
        let clientY = lastMouseY;
        let targetX = Math.round(clientX * (imgW / viewW));
        let targetY = Math.round(clientY * (imgH / viewH));
        let currentHex = '#000000';
        let currentRgb = { r: 0, g: 0, b: 0 };
        let isPicked = false;

        function getPixel(px, py) {
            px = Math.max(0, Math.min(imgW - 1, px));
            py = Math.max(0, Math.min(imgH - 1, py));
            const idx = (py * imgW + px) * 4;
            return {
                r: pixels[idx],
                g: pixels[idx + 1],
                b: pixels[idx + 2],
                a: pixels[idx + 3]
            };
        }

        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        }

        function draw() {
            if (isPicked) return;

            // Handle window resize
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                viewW = window.innerWidth;
                viewH = window.innerHeight;
                canvas.width = viewW;
                canvas.height = viewH;
            }

            ctx.clearRect(0, 0, viewW, viewH);

            // Fetch center pixel color
            const centerPix = getPixel(targetX, targetY);
            currentRgb = centerPix;
            currentHex = rgbToHex(centerPix.r, centerPix.g, centerPix.b);

            ctx.save();

            // ── 1. Draw Circular Loupe Window ──
            ctx.save();
            ctx.beginPath();
            ctx.arc(clientX, clientY, loupeRadius, 0, Math.PI * 2);
            ctx.clip();

            // Background of lens
            ctx.fillStyle = '#09090b';
            ctx.fillRect(clientX - loupeRadius, clientY - loupeRadius, loupeRadius * 2, loupeRadius * 2);

            // Render individual pixel cells (small pixels, dense grid, no skipping)
            for (let dy = -halfGrid; dy <= halfGrid; dy++) {
                for (let dx = -halfGrid; dx <= halfGrid; dx++) {
                    const sampleX = targetX + dx;
                    const sampleY = targetY + dy;
                    const p = getPixel(sampleX, sampleY);

                    const cellX = Math.round(clientX + dx * cellSize - cellSize / 2);
                    const cellY = Math.round(clientY + dy * cellSize - cellSize / 2);

                    ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);

                    // Crisp subtle grid border
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(cellX, cellY, cellSize, cellSize);
                }
            }

            // Draw center target pixel reticle (electric cyan outline)
            const targetCellX = Math.round(clientX - cellSize / 2);
            const targetCellY = Math.round(clientY - cellSize / 2);

            // Center target box
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(targetCellX - 0.5, targetCellY - 0.5, cellSize + 1, cellSize + 1);

            // Inner contrast ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(targetCellX - 1.5, targetCellY - 1.5, cellSize + 3, cellSize + 3);

            // Subtle crosshair tick marks
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
            ctx.lineWidth = 1;
            // Left tick
            ctx.beginPath();
            ctx.moveTo(clientX - loupeRadius + 6, clientY);
            ctx.lineTo(targetCellX - 4, clientY);
            ctx.stroke();
            // Right tick
            ctx.beginPath();
            ctx.moveTo(targetCellX + cellSize + 4, clientY);
            ctx.lineTo(clientX + loupeRadius - 6, clientY);
            ctx.stroke();
            // Top tick
            ctx.beginPath();
            ctx.moveTo(clientX, clientY - loupeRadius + 6);
            ctx.lineTo(clientX, targetCellY - 4);
            ctx.stroke();
            // Bottom tick
            ctx.beginPath();
            ctx.moveTo(clientX, targetCellY + cellSize + 4);
            ctx.lineTo(clientX, clientY + loupeRadius - 6);
            ctx.stroke();

            ctx.restore(); // end clip

            // ── 2. Outer Lens Bezel with Cyber Cyan Glow ──
            ctx.save();
            ctx.beginPath();
            ctx.arc(clientX, clientY, loupeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.restore();

            // ── 3. Information HUD Badge ──
            const hudW = 210;
            const hudH = 64;
            // Position HUD below or above loupe depending on vertical space
            let hudX = clientX - hudW / 2;
            let hudY = clientY + loupeRadius + 14;

            if (hudY + hudH > viewH - 12) {
                hudY = clientY - loupeRadius - hudH - 14;
            }
            if (hudX < 12) hudX = 12;
            if (hudX + hudW > viewW - 12) hudX = viewW - hudW - 12;

            // HUD container
            ctx.save();
            ctx.fillStyle = 'rgba(9, 9, 11, 0.92)';
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.lineWidth = 1;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 16;
            roundRect(ctx, hudX, hudY, hudW, hudH, 10);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Color Swatch inside HUD
            const swatchSize = 34;
            const swatchX = hudX + 12;
            const swatchY = hudY + 10;
            ctx.save();
            ctx.fillStyle = currentHex;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            roundRect(ctx, swatchX, swatchY, swatchSize, swatchSize, 6);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // HEX Text
            ctx.save();
            ctx.font = '700 14px "JetBrains Mono", monospace';
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(currentHex, swatchX + swatchSize + 12, swatchY + 16);

            // RGB Text
            ctx.font = '500 10px "Inter", sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`, swatchX + swatchSize + 12, swatchY + 31);

            // Bottom controls hint
            ctx.font = '600 8.5px "Inter", sans-serif';
            ctx.fillStyle = '#06b6d4';
            ctx.fillText('CLICK to copy  •  [Arrows] 1px nudge  •  [Esc]', hudX + 12, hudY + hudH - 8);
            ctx.restore();

            ctx.restore();
        }

        function roundRect(context, x, y, width, height, radius) {
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
        }

        function selectColor() {
            if (isPicked) return;
            isPicked = true;

            const hex = currentHex;
            const { r, g, b } = currentRgb;

            // Auto-copy to clipboard
            navigator.clipboard.writeText(hex).catch(() => {});

            // Save to shared history in storage
            const upperHex = hex.toUpperCase();
            chrome.storage.local.get(['cyberhub_color_history', 'cyberhub_settings'], (res) => {
                let h = res.cyberhub_color_history || [];
                const s = res.cyberhub_settings || {};
                const max = parseInt(s.maxHistory) || 10;
                h = h.filter(c => c.toUpperCase() !== upperHex);
                h.unshift(upperHex);
                if (h.length > max) h = h.slice(0, max);
                chrome.storage.local.set({ cyberhub_color_history: h });
            });

            // Draw "COPIED!" celebration badge
            ctx.save();
            ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 18;
            roundRect(ctx, clientX - 65, clientY - 20, 130, 40, 999);
            ctx.fill();
            ctx.stroke();

            ctx.font = '800 13px "Inter", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText(`COPIED  ${hex}`, clientX, clientY);
            ctx.restore();

            // Notify popup if open
            chrome.runtime.sendMessage({ action: 'COLOR_PICKED', hex, r, g, b }).catch(() => {});

            setTimeout(() => {
                destroy();
            }, 450);
        }

        // ── Mouse Listeners (Continuous 1:1 Pixel Mapping) ──
        function onMouseMove(e) {
            clientX = e.clientX;
            clientY = e.clientY;
            // 1:1 screen pixel resolution without skipping
            targetX = Math.round(clientX * (imgW / viewW));
            targetY = Math.round(clientY * (imgH / viewH));
            draw();
        }

        function onClick(e) {
            e.preventDefault();
            e.stopPropagation();
            selectColor();
        }

        // ── Keyboard Listeners (1-Pixel Nudging!) ──
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                destroy();
                return;
            }

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                selectColor();
                return;
            }

            const step = e.shiftKey ? 5 : 1; // Shift = 5px fast step, Normal = exactly 1 physical pixel!
            let handled = false;

            if (e.key === 'ArrowLeft') {
                targetX = Math.max(0, targetX - step);
                clientX = Math.round(targetX / (imgW / viewW));
                handled = true;
            } else if (e.key === 'ArrowRight') {
                targetX = Math.min(imgW - 1, targetX + step);
                clientX = Math.round(targetX / (imgW / viewW));
                handled = true;
            } else if (e.key === 'ArrowUp') {
                targetY = Math.max(0, targetY - step);
                clientY = Math.round(targetY / (imgH / viewH));
                handled = true;
            } else if (e.key === 'ArrowDown') {
                targetY = Math.min(imgH - 1, targetY + step);
                clientY = Math.round(targetY / (imgH / viewH));
                handled = true;
            }

            if (handled) {
                e.preventDefault();
                draw();
            }
        }

        window.addEventListener('mousemove', onMouseMove, { capture: true });
        window.addEventListener('click', onClick, { capture: true });
        window.addEventListener('keydown', onKeyDown, { capture: true });

        // Initial draw
        draw();

        function destroy() {
            window.removeEventListener('mousemove', onMouseMove, { capture: true });
            window.removeEventListener('click', onClick, { capture: true });
            window.removeEventListener('keydown', onKeyDown, { capture: true });
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            activeOverlay = null;
        }

        return { destroy };
    }
})();
