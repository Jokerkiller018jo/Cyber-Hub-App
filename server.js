const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Enable JSON body parsing for API requests
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API route for AI Chatbot
app.post('/api/chat', (req, res) => {
    const data = req.body;
    console.log(`[CYBER-HUB] Request received: ${data.text}`);
    
    // Mock response
    const mockResponses = [
        "Analyzing deep architecture...\n\n",
        "Accessing the mainframe quantum node...\n",
        "Compiling data packets requested by your node.\n",
        "That query involves secure internal routing. Decoding...\n",
        "Here is the module you requested:\n```javascript\nfunction executeBypass() {\n  console.log('Bypass successful.');\n}\nexecuteBypass();\n```\n"
    ];
    
    const intro = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const fullResponse = `${intro}\nI have logged your request: **"${data.text}"**.\n\nIs there anything else you require for this operation?`;
    
    res.json({ reply: fullResponse });
});

// Fallback to index.html for SPA routing (if needed)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`[CYBER-HUB] Server initialized and listening on port ${PORT}`);
    console.log(`Access the terminal at: http://localhost:${PORT}`);
});

module.exports = app;
