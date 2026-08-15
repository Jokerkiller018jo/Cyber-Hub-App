/**
 * ai.js
 * Service for communicating with Groq API to fetch dynamic color palettes.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = `https://api.groq.com/openai/v1/chat/completions`;

export async function getColorsFromAI(searchTerm) {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key is missing. Please add VITE_GROQ_API_KEY to your .env.local file or Vercel environment.');
    }

    const prompt = `You are a color palette generator for a UI application.
The user searched for the word: "${searchTerm}".
Return exactly 3 to 5 colors associated with this word.
Output strictly as a JSON array of objects. Do not wrap in Markdown (no \`\`\`json).
Each object must have:
- "name": A creative string name for the color (e.g., "Apple Red").
- "hex": A string containing the exact hex code (e.g., "#FF0800").

Example output format:
[
  {"name": "Ocean Deep", "hex": "#00008B"},
  {"name": "Seafoam", "hex": "#71EEB8"}
]`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const textOutput = data?.choices?.[0]?.message?.content;

        if (!textOutput) {
            throw new Error('Empty response from AI.');
        }

        // Clean up markdown if the AI mistakenly wraps it
        const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const parsedColors = JSON.parse(cleanedText);

        if (!Array.isArray(parsedColors)) {
            throw new Error('AI did not return a valid JSON array.');
        }

        // Map them to match the structure the UI expects
        return parsedColors.map(color => {
            return {
                name: color.name || 'Unknown',
                hex: color.hex?.toUpperCase(),
                rgb: hexToRGB(color.hex),
                group: 'AI Generated'
            };
        });

    } catch (err) {
        console.error('Error fetching from Groq API:', err);
        throw err;
    }
}

// Utility to ensure we can parse hex to rgb for the AI results
function hexToRGB(hexStr) {
    const clean = hexStr.startsWith('#') ? hexStr : '#' + hexStr;
    if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
        const [,a,b,c] = clean;
        return [
            parseInt(a+a, 16),
            parseInt(b+b, 16),
            parseInt(c+c, 16)
        ];
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
        return [
            parseInt(clean.slice(1,3), 16),
            parseInt(clean.slice(3,5), 16),
            parseInt(clean.slice(5,7), 16)
        ];
    }
    return [0,0,0]; // fallback
}
