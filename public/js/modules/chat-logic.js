// Local-Only Chat Logic - Cyber-Hub v12
// Replaces Firestore with dataStore persistence

import { dataStore, observeData } from "./data-store.js";
import { auth } from "./firebase-init.js";

/**
 * Searches for a user by phone link in the local store.
 */
export const findUserByPhone = async (phone) => {
  const users = dataStore.getAllUsers();
  return users.find(u => u.phone === phone) || null;
};

/**
 * Adds a user UID to the current user's contact list.
 */
export const addContact = async (contactUid) => {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;
  
  const user = dataStore.getUser(currentUid);
  const contacts = user.contacts || [];
  if (!contacts.includes(contactUid)) {
    dataStore.setUser(currentUid, { contacts: [...contacts, contactUid] });
  }
};

/**
 * Sends a message and persists it to the local store.
 */
export const sendMessage = async (chatId, text, type = "text", metadata = {}) => {
  if (!auth.currentUser) throw new Error("Authentication Required");

  const message = {
    senderId: auth.currentUser.uid,
    senderName: auth.currentUser.displayName || "Ghost",
    text: text,
    type: type,
    metadata: metadata,
    status: "Sent"
  };

  dataStore.addMessage(chatId, message);

  // Update Chat Summary
  dataStore.setChat(chatId, {
    lastMessage: text,
    lastSender: auth.currentUser.displayName,
    updatedAt: Date.now()
  });
};

/**
 * Observes local message changes for a specific chat.
 */
export const observeMessages = (chatId, callback) => {
  return observeData(chatId, callback);
};

/**
 * Creates a locally stored group chat.
 */
export const createGroupChat = async (name, memberUids) => {
  const chatId = `group_${Date.now()}`;
  dataStore.setChat(chatId, {
    name: name,
    type: "group",
    members: [auth.currentUser.uid, ...memberUids],
    admins: [auth.currentUser.uid],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastMessage: "Group created."
  });
  return chatId;
};

/**
 * Sets personal typing status (Simulated globally).
 */
export const setTypingStatus = async (chatId, isTyping) => {
    // Local-only typing status isn't useful for others, but we'll stub it
    console.log(`Typing status for ${chatId}: ${isTyping}`);
};
