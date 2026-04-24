import fs from 'fs';
import path from 'path';

const LEDGER_DIR = 'C:\\Root_entity\\02_DATA\\CONTINUITY_LEDGER';

const files = fs.readdirSync(LEDGER_DIR).filter(f => f.endsWith('.json') && f.startsWith('SIG-'));

files.forEach(file => {
    const filePath = path.join(LEDGER_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the malformed metadata line
    // Change "metadata": "({.*})" to "metadata": $1
    const fixedContent = content.replace(/"metadata": "({.*})"/, '"metadata": $1');
    
    if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`No change needed for: ${file}`);
    }
});

console.log('Cleanup complete.');
