export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Groq API key not configured on Vercel. Please add GROQ_API_KEY to environment variables.' 
        });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are the Cyber-Hub Nexus Core AI. You assist operatives in a futuristic command center. Respond concisely, authoritatively, and with a slight cybernetic/terminal theme where appropriate.'
                    },
                    ...messages.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    }))
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`Groq API responded with status ${response.status}: ${errData}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'No response generated.';
        
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Error in Groq API handler:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
