import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_DIR = 'C:\\Root_entity';

function run(cmd) {
    try {
        console.log(`Executing: ${cmd}`);
        const output = execSync(cmd, { cwd: BASE_DIR, encoding: 'utf8' });
        console.log(output);
        return output;
    } catch (e) {
        console.error(`Error: ${e.message}`);
        if (e.stdout) console.error(`STDOUT: ${e.stdout}`);
        if (e.stderr) console.error(`STDERR: ${e.stderr}`);
        return null;
    }
}

console.log('--- Git/GitHub Initialization ---');

// 1. Check if git is initialized
if (!fs.existsSync(path.join(BASE_DIR, '.git'))) {
    run('git init');
}

// 2. Configure user
run('git config user.name "Christopher Mark Beggs"');
run('git config user.email "chippychris84@yahoo.com.au"');

// 3. Check for gh CLI
const ghCheck = run('gh --version');
if (ghCheck) {
    console.log('gh CLI found.');
    // Try to create repo if it doesn't exist
    // Note: This might fail if already created or auth missing
    run('gh repo create Resolution-Assurance-Sovereign-Node --public --source=. --remote=origin || echo "Repo might already exist"');
} else {
    console.log('gh CLI NOT found. Will attempt to add remote manually if URL is known.');
}

// 4. Add files and commit
run('git add 01_SYSTEM/ 02_DATA/ 03_DOCUMENTS/ 04_SECURITY/');
run('git commit -m "feat: initial commit of Sovereign Witness Node (Canon 7.0.8)"');

// 5. Push
run('git branch -M main');
run('git push -u origin main');
