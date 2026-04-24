import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class LicenseGenerator {
    constructor() {
        this.license_dir = 'C:\\Root_entity\\02_DATA\\licenses';
        if (!fs.existsSync(this.license_dir)) fs.mkdirSync(this.license_dir, { recursive: true });
    }

    generateCLO(dataset_id, signals_count) {
        console.log(`[LICENSE] Generating Commercial License Object (CLO) for ${dataset_id}...`);
        
        const clo = {
            clo_id: `CLO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            dataset_id: dataset_id,
            witness_node: 'VAL-WITNESS-001',
            canon_version: '7.0.8',
            rights: 'EXCLUSIVE_NON_DEGRADABLE_HISTORY',
            provenance_hash: crypto.createHash('sha256').update(dataset_id + signals_count).digest('hex'),
            sealed_at: new Date().toISOString()
        };

        const filePath = path.join(this.license_dir, `${clo.clo_id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(clo, null, 2));
        console.log(`[LICENSE] CLO generated: ${clo.clo_id}`);
        return clo;
    }
}

const gen = new LicenseGenerator();
gen.generateCLO('RA-LIVE-SIGNAL-20260424-1241', 234);
