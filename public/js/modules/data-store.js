// Local Data Store - Cyber-Hub v12
// Replaces Firestore for local-only persistence

const STORAGE_KEY = "cyber_hub_data_v12";

// Initial Empty State
let state = {
  users: {},    // map uid -> userData
  chats: {},    // map chatId -> chatMetadata
  messages: {}, // map chatId -> array of message objects
  currentUser: null
};

// Load from LocalStorage
const load = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.error("NEXUS ERROR: Failed to load local data store.", e);
  }
};

// Save to LocalStorage
const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("NEXUS ALERT: Local storage full. Data might not persist.");
  }
};

// Initialize
load();

export const dataStore = {
  // User Management
  setUser: (uid, data) => {
    state.users[uid] = { ...state.users[uid], ...data, uid };
    save();
  },
  getUser: (uid) => state.users[uid] || null,
  getAllUsers: () => Object.values(state.users),

  // Chat Metadata
  setChat: (chatId, data) => {
    state.chats[chatId] = { ...state.chats[chatId], ...data, id: chatId };
    save();
  },
  getChat: (chatId) => state.chats[chatId] || null,
  getAllChats: () => Object.values(state.chats),

  // Messaging
  addMessage: (chatId, message) => {
    if (!state.messages[chatId]) state.messages[chatId] = [];
    state.messages[chatId].push({ ...message, timestamp: Date.now() });
    save();
    // Notify observers
    notifyObservers(chatId, state.messages[chatId]);
  },
  getMessages: (chatId) => state.messages[chatId] || [],
  getAllMessages: () => state.messages,

  // Global State
  clearAll: () => {
    state = { users: {}, chats: {}, messages: {}, currentUser: null };
    localStorage.removeItem(STORAGE_KEY);
  },
  
  // Bulk Import (for CSV)
  importData: (newData) => {
    state = { ...state, ...newData };
    save();
  }
};

// Simple Observer System for Real-time UI updates
const observers = {};
export const observeData = (chatId, callback) => {
  if (!observers[chatId]) observers[chatId] = [];
  observers[chatId].push(callback);
  // Immediate initial callback
  callback(state.messages[chatId] || []);
  return () => {
    observers[chatId] = observers[chatId].filter(cb => cb !== callback);
  };
};

const notifyObservers = (chatId, data) => {
  if (observers[chatId]) {
    observers[chatId].forEach(cb => cb(data));
  }
};
