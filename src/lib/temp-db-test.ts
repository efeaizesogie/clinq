import * as fs from 'fs';
import * as path from 'path';

async function main() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.log('No .env.local file found');
            return;
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const keys = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split('=')[0].trim());
        console.log('Keys in .env.local:', keys);
    } catch (err: any) {
        console.error('Error reading env:', err.message);
    }
}

main();
