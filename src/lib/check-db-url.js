const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
console.log("=== env keys and prefixes ===");
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    console.log(key, ":", val.substring(0, 15) + (val.length > 15 ? "..." : ""));
});
