// ── CyberHub Color Picker — options.js ────────────────────────────────────────

const SETTINGS_KEY = 'cyberhub_settings';
const HISTORY_KEY  = 'cyberhub_color_history';

// ── Default Settings ──────────────────────────────────────────────────────────

const DEFAULTS = {
    autoCopy:      false,
    autoClose:     false,
    defaultFormat: 'hex',
    maxHistory:    10,
};

// ── Load / Save Settings ──────────────────────────────────────────────────────

function loadSettings() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch { return { ...DEFAULTS }; }
}

function saveSettings(patch) {
    const current = loadSettings();
    const updated = { ...current, ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
}

// ── Sidebar Navigation ────────────────────────────────────────────────────────

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const section = link.dataset.section;

        // Update active link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show target section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
    });
});

// Handle hash navigation on load
function navigateToHash() {
    const hash = location.hash.replace('#', '');
    if (hash) {
        const link = document.querySelector(`[data-section="${hash}"]`);
        if (link) link.click();
    }
}

// ── Shortcut Section ──────────────────────────────────────────────────────────

async function loadShortcut() {
    const display  = document.getElementById('shortcutDisplay');
    const hint     = document.getElementById('shortcutHint');

    try {
        const commands = await chrome.commands.getAll();
        const cmd = commands.find(c => c.name === 'pick-color');

        if (cmd && cmd.shortcut) {
            // Parse shortcut like "Ctrl+Shift+E" into individual key spans
            const keys = cmd.shortcut.split('+');
            display.innerHTML = keys.map(k => `<span class="key">${k}</span>`).join('<span class="key-plus">+</span>');
            hint.textContent = 'This shortcut triggers the color picker. Make sure "Global" is enabled in Chrome settings to use it outside the browser.';
        } else {
            display.innerHTML = '<span class="key">Not set</span>';
            hint.textContent = 'No shortcut assigned yet. Click "Change Shortcut in Chrome" to set one.';
        }
    } catch {
        // chrome.commands not available (e.g. options page opened as standalone HTML)
        display.innerHTML = '<span class="key">Ctrl</span><span class="key-plus">+</span><span class="key">Shift</span><span class="key-plus">+</span><span class="key">E</span>';
        hint.textContent = 'Default shortcut (customize in Chrome extension settings).';
    }
}

document.getElementById('changeShortcutBtn').addEventListener('click', async () => {
    const btn = document.getElementById('changeShortcutBtn');
    const url = 'chrome://extensions/shortcuts';
    try {
        await chrome.tabs.create({ url });
    } catch {
        // Chrome blocks programmatic navigation to chrome:// urls
        await navigator.clipboard.writeText(url).catch(() => {});
        const origText = btn.innerHTML;
        btn.innerHTML = `<span>Copied <b>chrome://extensions/shortcuts</b>! Paste into your browser address bar</span>`;
        setTimeout(() => { btn.innerHTML = origText; }, 4000);
    }
});

// ── Behavior Section ──────────────────────────────────────────────────────────

function loadBehaviorUI() {
    const s = loadSettings();
    document.getElementById('autoCopy').checked      = !!s.autoCopy;
    document.getElementById('autoClose').checked     = !!s.autoClose;
    document.getElementById('defaultFormat').value   = s.defaultFormat || 'hex';
    if (document.getElementById('loupeGridSize')) {
        document.getElementById('loupeGridSize').value = s.loupeGridSize || '25';
    }
}

document.getElementById('saveBehavior').addEventListener('click', () => {
    const updated = saveSettings({
        autoCopy:      document.getElementById('autoCopy').checked,
        autoClose:     document.getElementById('autoClose').checked,
        defaultFormat: document.getElementById('defaultFormat').value,
        loupeGridSize: document.getElementById('loupeGridSize') ? document.getElementById('loupeGridSize').value : '25',
    });

    const fb = document.getElementById('saveFeedback');
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 2200);
});

// ── History Section (chrome.storage.local) ───────────────────────────────────

function renderHistoryPreview() {
    const grid = document.getElementById('historyPreview');
    chrome.storage.local.get([HISTORY_KEY], (res) => {
        let colors = res[HISTORY_KEY];
        if (!Array.isArray(colors)) {
            try {
                const old = localStorage.getItem(HISTORY_KEY);
                colors = old ? JSON.parse(old) : [];
            } catch {
                colors = [];
            }
        }

        if (!colors || !colors.length) {
            grid.innerHTML = '<div class="history-empty-msg">No colors in history yet.</div>';
            return;
        }

        grid.innerHTML = colors.map(hex => `
            <div class="history-preview-swatch" style="background:${hex}" data-hex="${hex}" title="${hex}"></div>
        `).join('');
    });
}

function loadHistoryUI() {
    const s = loadSettings();
    document.getElementById('maxHistory').value = String(s.maxHistory || 10);
    renderHistoryPreview();
}

document.getElementById('saveHistory').addEventListener('click', () => {
    saveSettings({ maxHistory: parseInt(document.getElementById('maxHistory').value) || 10 });
    const fb = document.getElementById('saveHistoryFeedback');
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 2200);
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Clear all color history? This cannot be undone.')) {
        localStorage.removeItem(HISTORY_KEY);
        chrome.storage.local.remove([HISTORY_KEY], () => {
            renderHistoryPreview();
        });
    }
});

// Live update history preview if colors are picked in another tab
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[HISTORY_KEY]) {
        renderHistoryPreview();
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────

(function init() {
    loadShortcut();
    loadBehaviorUI();
    loadHistoryUI();
    navigateToHash();
})();
