import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * RA WordPress Bridge - Sovereign Witness Node Component
 * Mandate: Anchor and Store Signals to Public Ledger
 */

const BASE_DIR = 'C:\\Root_entity';
const LEDGER_DIR = path.join(BASE_DIR, '02_DATA', 'CONTINUITY_LEDGER');
const SECURITY_DIR = path.join(BASE_DIR, '04_SECURITY');

// Credentials from aapicred.txt
const RA_API_KEY = 'f3edb74ebae01e95760836b8b89a6f66080cab980b15c3030daf055399c44a9633127c2b5d8d1a07b5d43a65c0b1fd85';
const WP_BASE_URL = 'https://resolutionassurance.com.au/wp-json/ra/v2';

class WordPressBridge {
    constructor() {
        this.node_id = 'VAL-WITNESS-001';
    }

    async anchorSignals() {
        console.log('[BRIDGE] Starting Anchor and Store operation...');
        
        if (!fs.existsSync(LEDGER_DIR)) {
            console.error('[BRIDGE] Ledger directory not found.');
            return;
        }

        const files = fs.readdirSync(LEDGER_DIR).filter(f => f.endsWith('.json') && f.startsWith('SIG-'));
        console.log(`[BRIDGE] Found ${files.length} signals to anchor.`);

        const signals = files.map(file => {
            const data = JSON.parse(fs.readFileSync(path.join(LEDGER_DIR, file), 'utf8'));
            return data;
        });

        const payload = {
            generated_at: new Date().toISOString(),
            dataset_id: `RA-CANON-PROJECTION-${new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)}`,
            signals: signals,
            reality_benchmark: {}, // Placeholder
            validator_heartbeat: {
                node_id: this.node_id,
                status: 'ACTIVE',
                quorum_participation: 'EXTERNAL',
                latest_witness: {} // Placeholder
            }
        };

        const envelope = {
            record_id: payload.dataset_id,
            integrity_fingerprint: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
            metadata: {
                package_name: 'RA-CANON-PROJECTION',
                manifest_sha256: crypto.createHash('sha256').update('manifest').digest('hex'),
                created_at: payload.generated_at,
                source_fingerprint: 'PROJECTION-v7.0.8',
                manifest_type: 'graph-projection',
                graph_payload: payload
            }
        };

        try {
            const endpoint = `${WP_BASE_URL}/mobile/template-submit`;
            console.log(`[BRIDGE] Pushing projection to ${endpoint}...`);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': RA_API_KEY,
                    'Authorization': `Bearer ${RA_API_KEY}`,
                    'User-Agent': 'ResolutionAssurance-Validator/7.0.8'
                },
                body: JSON.stringify(envelope)
            });

            const result = await response.json();
            if (response.ok) {
                console.log('[BRIDGE] Anchor and Store Successful.');
                console.log(JSON.stringify(result, null, 2));
            } else {
                console.error('[BRIDGE] Anchor and Store Failed:', result);
                if (result.code === 'rest_no_route') {
                    console.log('[BRIDGE] Attempting alternative endpoint /admin/import-graph-bridge...');
                    await this.forceMerge();
                }
            }
        } catch (e) {
            console.error('[BRIDGE] Network Error:', e.message);
        }
    }

    async forceMerge() {
        const endpoint = `${WP_BASE_URL}/admin/import-graph-bridge`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': RA_API_KEY,
                    'Authorization': `Bearer ${RA_API_KEY}`
                },
                body: JSON.stringify({})
            });
            const result = await response.json();
            console.log('[BRIDGE] Force Merge Result:', result);
        } catch (e) {
            console.error('[BRIDGE] Force Merge Failed:', e.message);
        }
    }
}

const bridge = new WordPressBridge();
bridge.anchorSignals().catch(err => console.error('[BRIDGE] Fatal Error:', err));
