// ── CyberHub Color Picker — background.js (Service Worker) ────────────────────

const PICKER_WINDOW_URL = chrome.runtime.getURL('picker-window.html');
let pickerWindowId = null;

// ── Global Command Shortcut ──
// Instantly activates the Precision Loupe directly on screen with ZERO extra clicks!
chrome.commands.onCommand.addListener(async (command) => {
    if (command !== 'pick-color') return;

    try {
        const res = await launchPrecisionPen();
        if (res && res.error) {
            // If on a restricted page (like chrome://), open fallback window
            openFallbackWindow();
        }
    } catch (e) {
        openFallbackWindow();
    }
});

async function openFallbackWindow() {
    if (pickerWindowId !== null) {
        try {
            await chrome.windows.update(pickerWindowId, { focused: true });
            return;
        } catch {
            pickerWindowId = null;
        }
    }

    const win = await chrome.windows.create({
        url: PICKER_WINDOW_URL,
        type: 'popup',
        width: 360,
        height: 350,
        focused: true,
    });
    pickerWindowId = win.id;
}

chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === pickerWindowId) {
        pickerWindowId = null;
    }
});

// ── Precision Pen Launch Handler ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'LAUNCH_PRECISION_PEN') {
        launchPrecisionPen().then(sendResponse);
        return true;
    }
});

async function launchPrecisionPen() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
            return { error: 'No active tab found' };
        }

        // Capture visible tab screenshot at full lossless resolution
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        // Ensure content script is injected
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        } catch (e) {
            // Already injected or restricted page
        }

        const settingsRes = await chrome.storage.local.get(['cyberhub_settings']);
        const settings = settingsRes.cyberhub_settings || {};

        // Send screenshot to content script
        await chrome.tabs.sendMessage(tab.id, {
            action: 'START_PRECISION_LOUPE',
            dataUrl,
            settings
        });

        return { success: true };
    } catch (err) {
        console.error('[CyberHub Background] Failed to launch precision loupe:', err);
        return { error: err.message };
    }
}
