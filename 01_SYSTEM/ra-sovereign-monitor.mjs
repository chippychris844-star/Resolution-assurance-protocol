import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

const SUPERVISOR_SCRIPT = 'ra-ai-supervisor.mjs';
const LOG_FILE = 'C:\\Root_entity\\02_DATA\\monitor.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(entry.trim());
}

function checkSupervisor() {
    exec('tasklist /v /fo csv | findstr /i "node"', (err, stdout, stderr) => {
        // This is a simplistic check. In production, we'd use process IDs or a lock file.
        if (stdout.toLowerCase().includes(SUPERVISOR_SCRIPT)) {
            log('Supervisor process found. Status: OK');
        } else {
            log('Supervisor process NOT found. Attempting Self-Repair / Restart...');
            restartSupervisor();
        }
    });
}

function restartSupervisor() {
    const scriptPath = path.join('C:\\Root_entity\\01_SYSTEM', SUPERVISOR_SCRIPT);
    const child = exec(`node ${scriptPath}`, { detached: true, stdio: 'ignore' });
    child.unref();
    log(`Supervisor restarted at PID ${child.pid}`);
}

log('--- [RA] Sovereign Monitor Active ---');
setInterval(checkSupervisor, 60000); // Check every minute
checkSupervisor();
