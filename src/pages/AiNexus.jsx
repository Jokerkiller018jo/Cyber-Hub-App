import React, { useState, useEffect, useRef } from 'react';

export default function AiNexus() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        // Initial greeting
        setMessages([
            { id: 1, sender: 'ai', text: 'Welcome to the Cyber-Hub Nexus. How can I assist you today, Operative?' }
        ]);
    }, []);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const lower = input.toLowerCase().trim();
        if (lower === 'clear') {
            setMessages([{ id: Date.now(), sender: 'ai', text: 'Terminal cleared.' }]);
            setInput('');
            return;
        }

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const groqKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!groqKey) throw new Error('No Groq API key found. Add VITE_GROQ_API_KEY to your .env.local file or Vercel environment.');

            const systemPrompt = 'You are the Cyber-Hub Nexus Core AI. You assist operatives in a futuristic command center. Respond concisely, authoritatively, and with a cybernetic/terminal theme. Use emojis and symbols (like ⚡️, 🛡️, 📡, 🤖, ⚠️) to explain the actions you are taking or making. If the user says "hi" or greets you, respond with a short, cool, emoji-filled greeting, rather than a long initializing protocol.';

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gemma2-9b-it',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...updatedMessages.map(msg => ({
                            role: msg.sender === 'user' ? 'user' : 'assistant',
                            content: msg.text
                        }))
                    ],
                    temperature: 1,
                    max_tokens: 2048,
                    top_p: 1,
                    stream: false
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || `API error ${res.status}`);

            const replyText = data.choices?.[0]?.message?.content || 'No response generated.';
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: `⚠️ NEXUS LINK ERROR: ${err.message}`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>AI NEXUS TERMINAL</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>Secure comms established.</p>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                paddingRight: '10px',
                marginBottom: '15px'
            }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            textAlign: msg.sender === 'user' ? 'right' : 'left'
                        }}>
                            {msg.sender === 'user' ? 'YOU' : 'NEXUS'}
                        </div>
                        <div style={{
                            background: msg.sender === 'user' ? 'rgba(176,0,255,0.15)' : 'rgba(0,0,0,0.5)',
                            border: `1px solid ${msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-medium)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-color)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-medium)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.9rem',
                        animation: 'fadeIn 0.3s forwards'
                    }}>
                        Processing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter command or message..." 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="cyber-button">
                    TRANSMIT
                </button>
            </form>
        </div>
    );
}
