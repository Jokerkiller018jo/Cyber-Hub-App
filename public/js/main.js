// Main Entry Point - Cyber-Hub v0.0.2
import { observeAuth, handleLogout as doLogout, loginWithGoogle, registerUser, linkAccount } from "./modules/auth-handler.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth as firebaseAuth, googleProvider } from "./modules/firebase-init.js";
import { startLiveTicker } from "./modules/market-dashboard.js";
import { playSound, showToast } from "./modules/ui-manager.js";
import { CURRENCY_DATA, SYMBOL_DATA, COLOR_DATA, renderGrid, renderColorGrid } from "./modules/data-generator.js";
import { sendMessage, observeMessages, findUserByPhone, addContact } from "./modules/chat-logic.js";
import { dataStore } from "./modules/data-store.js";
import { exportToCSV, parseCSV, downloadCSV } from "./modules/csv-engine.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Global API State
let aiMessagesEl;

function simulateTyping(fullText, role, id = Date.now()) {
    let i = 0;
    const msgEl = renderAiMessage("", role, id);
    let buffer = "";
    
    const streamInterval = setInterval(() => {
        if (i < fullText.length) {
            buffer += fullText.charAt(i);
            if(typeof marked !== 'undefined' && role === 'ai') {
                msgEl.innerHTML = marked.parse(buffer);
            } else {
                msgEl.innerText = buffer;
            }
            aiMessagesEl.scrollTop = aiMessagesEl.scrollHeight;
            i++;
        } else {
            clearInterval(streamInterval);
        }
    }, 15); // Streaming speed
}

/**
 * Triggers Demo Mode / Guest Access
 */
export function enterDemoMode() {
    useMockAuth = true;
    showToast("DEMO MODE ACTIVE: Neural Link Simulated");
    setAuthenticatedView("Guest Operative");
}

// Bind to window for HTML calls
window.enterDemoMode = enterDemoMode;
window.showToast = showToast;

// DOM Elements
const appView = document.getElementById('app-view');
const loginView = document.getElementById('login-view');
const authForm = document.getElementById('auth-form');
const googleBtn = document.getElementById('google-login');
const authSwitch = document.getElementById('auth-switch');
const navItems = document.querySelectorAll('.nav-item');
const appPages = document.querySelectorAll('.app-page');

let isRegistering = false;
let marketChart = null;
let useMockAuth = false;

// Initial State
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Safety Timeout for Loader (Ensures UI shows even if Firebase config is missing)
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            showToast("Running in Offline/Demo mode. Please check Firebase config.");
        }
    }, 5000);

    // 2. Observe Authentication State
    const isConfigMissing = !firebaseAuth;
    
    if (isConfigMissing) {
        useMockAuth = true;
        console.warn("NEXUS ALERT: Firebase Configuration Missing. Enabling Guest Mode.");
        // Force hide loader
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    }

    try {
        if (firebaseAuth) {
            observeAuth((user) => {
                const loader = document.getElementById('loader');
                if (loader) loader.classList.add('hidden');

                if (user) {
                    setAuthenticatedView(user.displayName, user.photoURL);
                } else if (!useMockAuth) {
                    console.log("Unauthenticated.");
                    appView.classList.remove('active');
                    loginView.classList.add('active');
                }
            });
        }
    } catch (e) {
        console.error("Firebase Auth initialization failed:", e);
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        showToast("Access Denied: Check Neural Configuration (Firebase)");
    }

    // 2. Global Event Listeners
    setupNavigation();
    setupAuthUI();
    setupChatAndGrids();
}

function setupAuthUI() {
    authSwitch.addEventListener('click', () => {
        isRegistering = !isRegistering;
        authSwitch.innerText = isRegistering ? "Back to Secure Login" : "Sign up for a new Node Access";
        document.querySelector('.auth-card h1').innerText = isRegistering ? "CREATE NODE" : "CYBER-HUB";
        document.querySelector('.auth-btn').innerText = isRegistering ? "REGISTER" : "AUTHORIZE";
        
        // Toggle visibility
        document.getElementById('username').style.display = isRegistering ? 'block' : 'none';
        document.getElementById('phone').style.display = isRegistering ? 'block' : 'none';
    });

    googleBtn.addEventListener('click', async () => {
        try {
            await loginWithGoogle();
        } catch (e) {
            showToast("Google Auth Failed: " + e.message);
        }
    });

    const mockSocials = [
        { id: 'microsoft-login', name: 'Microsoft' },
        { id: 'github-login', name: 'GitHub' },
        { id: 'discord-login', name: 'Discord' },
        { id: 'x-login', name: 'X (Twitter)' },
        { id: 'xbox-login', name: 'Xbox' },
        { id: 'whatsapp-login', name: 'WhatsApp' }
    ];

    mockSocials.forEach(provider => {
        const btn = document.getElementById(provider.id);
        if (btn) {
            btn.addEventListener('click', () => {
                alert(`${provider.name} Auth Not Configured`);
            });
        }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        const phone = document.getElementById('phone').value;

        try {
            if (isRegistering) {
                if (!phone) return showToast("Phone Link Required");
                if (useMockAuth) {
                    showToast("Node Created (GUEST MODE)");
                    setAuthenticatedView(username || "Guest Operative");
                } else {
                    await registerUser(email, password, username || email.split('@')[0], phone);
                    showToast("Node Created Successfully");
                }
            } else {
                if (useMockAuth) {
                    showToast("Authorized (GUEST MODE)");
                    setAuthenticatedView("Guest Operative");
                } else {
                    await signInWithEmailAndPassword(firebaseAuth, email, password);
                    showToast("Access Granted");
                }
            }
        } catch (e) {
            showToast("Auth Error: " + e.message);
        }
    });
}

function setAuthenticatedView(displayName, photoURL = null) {
    loginView.classList.remove('active');
    appView.classList.add('active');
    
    // Set User Info in Sidebar
    document.querySelector('.user-info').innerHTML = `${displayName}<br><small style="color:#00ff88">Active Node</small>`;
    if (photoURL) document.querySelector('.avatar').style.backgroundImage = `url(${photoURL})`;
    
    startCoreServices();
    initAiNexus();
}

function startCoreServices() {
    initMarketChart();

    // Start Live Market Feed
    startLiveTicker(["BTCUSDT", "ETHUSDT", "SOLUSDT"], (updates) => {
        // Update Market DOM (if on lobby or market page)
        for(let symbol in updates) {
            const lowSym = symbol.toLowerCase().replace('usdt', '');
            const elLobby = document.getElementById(`m-${lowSym}`);
            const elPage = document.getElementById(`market-page-${lowSym}`);
            const newPrice = updates[symbol];
            const formatted = `$${newPrice.toLocaleString(undefined, {minimumFractionDigits:2})}`;
            
            if(elLobby) elLobby.innerText = formatted;
            if(elPage) elPage.innerText = formatted;

            // Update Chart
            if (symbol === "BTCUSDT" && marketChart) {
                marketChart.data.labels.push(new Date().toLocaleTimeString());
                marketChart.data.datasets[0].data.push(newPrice);
                if (marketChart.data.labels.length > 20) {
                    marketChart.data.labels.shift();
                    marketChart.data.datasets[0].data.shift();
                }
                marketChart.update();
            }
        }
    });
}

function initMarketChart() {
    const ctx = document.getElementById('marketChart')?.getContext('2d');
    if (!ctx || marketChart) return;

    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'BITCOIN NEXUS FEED',
                data: [],
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                x: { display: false }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            if (pageId) switchPage(pageId);
        });
    });

    // AI Form Logic
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-input');
    const aiMessages = document.getElementById('ai-messages');
    aiMessagesEl = document.getElementById('ai-messages'); // Ensure aiMessagesEl is set here too

    aiInput.addEventListener('input', () => playSound("typing"));

    aiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = aiInput.value.trim();
        if(!text) return;

        // Add user message to UI
        renderAiMessage(text, 'user');
        
        aiInput.value = '';

        // Call our Vercel API function
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            simulateTyping(data.reply, 'ai');
        } catch (error) {
            simulateTyping("Error connecting to Nexus Core.", 'ai');
        }
    });

    // Handle 'Summarize' and 'Prompt Gen' buttons
    document.getElementById('ai-summarize-btn')?.addEventListener('click', async () => {
        const text = "Summarize the current conversation.";
        renderAiMessage(text, 'user');
        try {
            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await response.json();
            simulateTyping(data.reply, 'ai');
        } catch (e) { simulateTyping("Error connecting to Nexus.", 'ai'); }
    });
    
    document.getElementById('ai-promptgen-btn')?.addEventListener('click', async () => {
        const text = "Generate a creative prompt based on our discussion.";
        renderAiMessage(text, 'user');
        try {
            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await response.json();
            simulateTyping(data.reply, 'ai');
        } catch (e) { simulateTyping("Error connecting to Nexus.", 'ai'); }
    });

    document.getElementById('ai-grammar-btn')?.addEventListener('click', async () => {
        const text = "Please correct the grammar and spelling of the last message.";
        renderAiMessage(text, 'user');
        try {
            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await response.json();
            simulateTyping(data.reply, 'ai');
        } catch (e) { simulateTyping("Error connecting to Nexus.", 'ai'); }
    });
}

function initAiNexus() {
    aiMessagesEl = document.getElementById('ai-messages');
    
    // Send a welcome message when initialized
    setTimeout(() => {
        const welcome = "Greetings, Operative. I am the **Cyber-Hub AI Nexus**. I can assist with system engineering, decoding logs, or answering general database queries.\n\n*How may I assist you today?*";
        simulateTyping(welcome, "ai");
    }, 800);
}

function renderAiMessage(text, role, id = Date.now()) {
    const div = document.createElement('div');
    const isUser = role === 'user';
    div.className = `msg ${role} glass`;
    div.id = isUser ? `user-msg-${id}` : `ai-msg-${id}`;
    
    div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    div.style.background = isUser ? 'var(--cyan)' : 'rgba(20,20,20,0.8)';
    div.style.color = isUser ? '#000' : '#fff';
    div.style.padding = '12px 20px';
    div.style.borderRadius = '15px';
    div.style.maxWidth = '80%';
    div.style.marginBottom = '15px';
    div.style.borderLeft = isUser ? 'none' : '4px solid var(--magenta)';
    
    if(isUser) {
        div.innerText = text;
    } else {
        div.innerHTML = (typeof marked !== 'undefined') ? marked.parse(text) : text;
    }
    
    aiMessagesEl.appendChild(div);
    aiMessagesEl.scrollTop = aiMessagesEl.scrollHeight;
    return div;
}

function setupChatAndGrids() {
    // Social Chat Logic
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const contactSearch = document.querySelector('#chat-page .auth-input');
    // const contactsList = document.getElementById('contacts-list');

    let activeChatId = "global_sector"; // Placeholder

    contactSearch?.addEventListener('keypress', async (e) => {
        if(e.key === 'Enter') {
            const phone = e.target.value.trim();
            const foundUser = await findUserByPhone(phone);
            if(foundUser) {
                showToast(`Found: ${foundUser.username}`);
                await addContact(foundUser.uid);
            } else {
                showToast("No Node found with that Link.");
            }
        }
    });

    chatInput?.addEventListener('input', () => playSound("typing"));

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if(!text) return;

        try {
            await sendMessage(activeChatId, text);
            chatInput.value = '';
            playSound("blip");
        } catch (e) {
            showToast("Message Failed: " + e.message);
        }
    });

    observeMessages(activeChatId, (messages) => {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        messages.forEach(m => {
            const div = document.createElement('div');
            const isMe = m.senderId === firebaseAuth.currentUser?.uid;
            div.className = `msg ${isMe ? 'user' : 'ai'}`;
            div.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
            div.style.background = isMe ? 'var(--cyan)' : 'rgba(255,255,255,0.05)';
            div.style.color = isMe ? '#000' : '#fff';
            div.style.padding = '8px 12px';
            div.style.borderRadius = '10px';
            div.style.marginBottom = '8px';
            div.style.maxWidth = '70%';
            div.innerHTML = `<small style="font-size:0.6rem; opacity:0.6; display:block;">${m.senderName}</small>${m.text}`;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Settings & Advanced Logic
    const setUsername = document.getElementById('set-username');
    const setStatus = document.getElementById('set-status');
    const exportBtn = document.getElementById('export-csv-btn');
    const importBtn = document.getElementById('import-csv-btn');
    const importFile = document.getElementById('import-csv-file');
    const wipeBtn = document.getElementById('wipe-data-btn');

    setUsername?.addEventListener('change', async (e) => {
        if (!firebaseAuth.currentUser) return;
        const newName = e.target.value;
        await updateProfile(firebaseAuth.currentUser, { displayName: newName });
        dataStore.setUser(firebaseAuth.currentUser.uid, { username: newName });
        showToast("Codename Synchronized");
        // Update Sidebar
        document.querySelector('.user-info').innerHTML = `${newName}<br><small style="color:#00ff88">Active Node</small>`;
    });

    setStatus?.addEventListener('change', (e) => {
        if (!firebaseAuth.currentUser) return;
        dataStore.setUser(firebaseAuth.currentUser.uid, { status: e.target.value });
        showToast("Neural Status Broadcasted Locally");
        document.getElementById('user-status-text').innerText = e.target.value;
    });

    // CSV Engines
    exportBtn?.addEventListener('click', () => {
        const allData = {
            users: dataStore.getAllUsers().reduce((acc, u) => ({ ...acc, [u.uid]: u }), {}),
            chats: dataStore.getAllChats().reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
            messages: dataStore.getAllMessages()
        };
        const csv = exportToCSV(allData);
        downloadCSV(`cyberhub_backup_${Date.now()}.csv`, csv);
        showToast("Dataset Exported Successfully");
    });

    importBtn?.addEventListener('click', () => {
        const file = importFile.files[0];
        if (!file) return showToast("No Source File Selected");

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const newState = parseCSV(e.target.result);
                dataStore.importData(newState);
                showToast("Neural Link Restored from CSV");
                setTimeout(() => location.reload(), 1500); // Reload to refresh all observers
            } catch (err) {
                showToast("Import Corruption: Invalid CSV");
            }
        };
        reader.readAsText(file);
    });

    wipeBtn?.addEventListener('click', () => {
        if (confirm("PURGE ALL LOCAL TELEMETRY? This cannot be undone.")) {
            dataStore.clearAll();
            showToast("Local Cache Purged");
            setTimeout(() => location.reload(), 1000);
        }
    });

    const mockConnectBtns = document.querySelectorAll('.mock-connect');
    mockConnectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.target.parentElement.querySelector('span').innerText;
            
            // Reverted back to pure visual mockup so the UI works without needing Firebase API Keys configured
            showToast(`Connecting to ${platform} API...`);
            
            setTimeout(() => {
                showToast(`${platform} Account Linked Successfully!`);
                e.target.innerText = "Linked";
                e.target.style.background = e.target.style.color;
                e.target.style.color = "#fff";
                e.target.style.border = "none";
            }, 1000);
        });
    });

    // Data Grids Logic
    const currSearch = document.querySelector('#currency-page .auth-input');
    const symSearch = document.getElementById('sym-search') || document.querySelector('#symbol-page .auth-input');
    let currentSymCategory = "ALL";

    const symCatBtns = document.querySelectorAll('.sym-cat-btn');
    symCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            symCatBtns.forEach(b => {
                b.style.border = 'none';
                b.style.background = 'rgba(0,0,0,0.5)';
            });
            btn.style.border = '1px solid #ffaa00';
            btn.style.background = 'transparent';
            currentSymCategory = btn.getAttribute('data-cat');
            renderGrid('grid-sym', SYMBOL_DATA, symSearch.value, currentSymCategory);
        });
    });

    currSearch?.addEventListener('input', (e) => renderGrid('grid-curr', CURRENCY_DATA, e.target.value));
    symSearch?.addEventListener('input', (e) => renderGrid('grid-sym', SYMBOL_DATA, e.target.value, currentSymCategory));
    
    const colorSearch = document.getElementById('color-search');
    colorSearch?.addEventListener('input', (e) => renderColorGrid('grid-color', COLOR_DATA, e.target.value));
}

export function switchPage(pageId) {
    playSound("blip");
    appPages.forEach(page => {
        page.classList.remove('active-page');
        if (page.id === pageId) page.classList.add('active-page');
    });
    
    navItems.forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('data-page') === pageId) nav.classList.add('active');
    });

    // Lazy render grids
    if (pageId === 'currency-page') renderGrid('grid-curr', CURRENCY_DATA);
    if (pageId === 'symbol-page') {
        const symSearch = document.getElementById('sym-search') || document.querySelector('#symbol-page .auth-input');
        const activeCatBtn = document.querySelector('.sym-cat-btn[style*="border: 1px solid"]');
        const currentCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : "ALL";
        renderGrid('grid-sym', SYMBOL_DATA, symSearch?.value || "", currentCat);
    }
    if (pageId === 'color-page') {
        const colorSearch = document.getElementById('color-search');
        renderColorGrid('grid-color', COLOR_DATA, colorSearch?.value || "");
    }
}

// Global Exports for HTML
window.switchPage = switchPage;
window.handleLogout = async () => {
    try {
        await doLogout();
        showToast("Logged Out Successfully");
    } catch(e) {
        showToast("Logout Failed: " + e.message);
    }
};
