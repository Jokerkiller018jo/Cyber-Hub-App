const fs = require('fs');
const cats = JSON.parse(fs.readFileSync('temp_emojis.json', 'utf8'));

const CATEGORIES_META = [
    { id: 'smileys', label: 'Smileys & Emotion' },
    { id: 'people', label: 'People & Body' },
    { id: 'animals', label: 'Animals & Nature' },
    { id: 'food', label: 'Food & Drink' },
    { id: 'travel', label: 'Travel & Places' },
    { id: 'activities', label: 'Activities' },
    { id: 'objects', label: 'Objects' },
    { id: 'symbols', label: 'Symbols' },
    { id: 'flags', label: 'Flags' }
];

let curatedArray = [];
for (const [catName, emojis] of Object.entries(cats)) {
    const meta = CATEGORIES_META.find(c => c.label === catName);
    if (!meta) continue;
    for (const e of emojis) {
        if (!e.char) continue;
        curatedArray.push({ char: e.char, name: e.name.toUpperCase(), cat: meta.id });
    }
}

const fileContent = `export const CURATED_EMOJIS = ${JSON.stringify(curatedArray, null, 2)};
export const CATEGORIES_META = ${JSON.stringify(CATEGORIES_META, null, 2)};
`;

fs.writeFileSync('src/pages/EmojiCategories.js', fileContent);
console.log('Successfully wrote to src/pages/EmojiCategories.js. Total curated:', curatedArray.length);
