const fs = require('fs');
const path = require('path');

// Unicode ranges for common emojis
const ranges = [
  [0x1F600, 0x1F64F], // Emoticons
  [0x1F300, 0x1F5FF], // Misc Symbols and Pictographs
  [0x1F680, 0x1F6FF], // Transport and Map
  [0x1F900, 0x1F9FF], // Supplemental Symbols and Pictographs
  [0x2600, 0x26FF],   // Misc symbols
  [0x2700, 0x27BF],   // Dingbats
  [0x1F1E6, 0x1F1FF], // Flags (regional indicator symbols)
];

let baseEmojis = [];
for (const [start, end] of ranges) {
  for (let i = start; i <= end; i++) {
    baseEmojis.push(String.fromCodePoint(i));
  }
}

// We want ~5 million combinations. Math.sqrt(5,000,000) is approx 2236.
// Let's take the first 2236 base emojis.
const count = 2236;
baseEmojis = baseEmojis.slice(0, count);

console.log(`Using ${baseEmojis.length} base emojis to generate ${baseEmojis.length * baseEmojis.length} combinations.`);

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outputPath = path.join(outDir, 'all_emojis.txt');
const stream = fs.createWriteStream(outputPath);

let total = 0;
// We'll write them in chunks to avoid memory issues
for (let i = 0; i < baseEmojis.length; i++) {
  let chunk = '';
  for (let j = 0; j < baseEmojis.length; j++) {
    // Write format: EMOJI1EMOJI2
    chunk += baseEmojis[i] + baseEmojis[j] + '\n';
    total++;
  }
  stream.write(chunk);
}

stream.end(() => {
  console.log(`Successfully generated ${total} emoji combinations to ${outputPath}`);
});
