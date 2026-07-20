// AI Nexus Intelligence - v12
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from "./firebase-init.js";

// AI Configuration
const AI_SYSTEM_PROMPT = `You are Nexus Core, the advanced AI of Cyber-Hub. 
- Tone: Professional, slightly futuristic, helpful.
- Support: Coding, Crypto theory, Summaries, Grammar.
- Persona: Friendly, but efficient.`;

export const sendMessageToAI = async (text, mode = "general") => {
  // Store message in Firestore to persist history
  const historyRef = collection(db, "users", auth.currentUser.uid, "ai_history");
  await addDoc(historyRef, {
    role: "user",
    text: text,
    mode: mode,
    timestamp: serverTimestamp()
  });

  // Call the backend WebSocket or Function for the AI generation
  // Using the previously established socket.io system or a direct fetch if preferred.
  // We'll broadcast the stream via an event-emitter pattern.
};

export const getAIHistory = (callback) => {
  const q = query(
    collection(db, "users", auth.currentUser.uid, "ai_history"),
    orderBy("timestamp", "asc"),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data()));
  });
};

export const summarizeConversation = async (messages) => {
  // AI Logic for summarization (usually a specific prompt to the model)
  const textToSummarize = messages.map(m => `${m.role}: ${m.text}`).join("\n");
  // ... trigger AI call with "Please summarize this chat:" prefix
};

export const correctGrammar = async (text) => {
  // AI Logic for grammar correction
  // ... trigger AI call with "Fix grammar and spelling for:" prefix
};

export const generateImagePrompt = (topic) => {
  return `Highly detailed 8k cinematic render, cyberpunk style, neon lights, extremely detailed mechanical parts, topic: ${topic}`;
};
