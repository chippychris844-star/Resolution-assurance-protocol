import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Paths
const BASE_DIR = 'C:\\Root_entity';
const INCOMING_DIR = path.join(BASE_DIR, '03_DOCUMENTS', 'INCOMING');
const LEDGER_DIR = path.join(BASE_DIR, '02_DATA', 'CONTINUITY_LEDGER');
const TEMPLATE_PATH = path.join(BASE_DIR, '01_SYSTEM', 'templates', 'sovereign_continuity_signal_v7.json');

class SignalRefinery {
    constructor() {
        this.template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
        this.node_id = 'VAL-WITNESS-001';
    }

    generateNarrative(signal) {
        // This is where the "Self-Teaching" agent adds value.
        // For now, we use a deterministic rule-based generator until deep LLM integration is active.
        const domain = signal.domain || 'general';
        const content = signal.content || '';
        
        let narrative = `This ${domain} signal indicates a structural shift in the resolution field. `;
        if (domain === 'infrastructure') {
            narrative += `The data suggests that grid stability is being maintained despite high compute loads, indicating the 'Inference Flip' is in a transition state.`;
        } else if (domain === 'technology') {
            narrative += `Latency metrics corroborate the transition of inference from cloud to edge hubs.`;
        } else {
            narrative += `Witnessing this state is critical for long-term provenance of the ${domain} domain.`;
        }
        
        return narrative;
    }

    calculateRiskPriority(signal) {
        const content = (signal.content || '').toLowerCase();
        const domain = (signal.domain || '').toLowerCase();
        
        // High Risk (Red Numbers 9-10)
        if (content.includes('geoengineering') || content.includes('shrouding')) return 10;
        if (content.includes('grid fracture') || content.includes('inference flip')) return 9;
        
        // Medium Risk (4-8)
        if (domain === 'infrastructure' || domain === 'orbital_resilience') return 7;
        if (domain === 'compute_sovereignty' || domain === 'geopolitics') return 6;
        if (domain === 'finance' || domain === 'medical') return 5;
        
        // Low Risk (1-3)
        return 3;
    }

    refine() {
        console.log('[REFINERY] Starting Signal Refinement...');
        const files = fs.readdirSync(INCOMING_DIR).filter(f => f.endsWith('.json'));
        
        files.forEach(file => {
            const rawData = JSON.parse(fs.readFileSync(path.join(INCOMING_DIR, file), 'utf8'));
            const signals = Array.isArray(rawData) ? rawData : [rawData];
            
            signals.forEach(s => {
                const signalId = `SIG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                const timestamp = new Date().toISOString();
                const hash = crypto.createHash('sha256').update(JSON.stringify(s)).digest('hex');
                const redNumber = this.calculateRiskPriority(s);
                
                let refined = this.template
                    .replace('{{TIMESTAMP}}', timestamp)
                    .replace('{{CYCLE_ID}}', `CYCLE-${timestamp.slice(0,10)}`)
                    .replace('{{SIGNAL_ID}}', signalId)
                    .replace('{{SOURCE_ID}}', s.source_id || 'UNKNOWN')
                    .replace('{{SOURCE_NAME}}', 'Ingested Authority')
                    .replace('{{PROVENANCE_URI}}', 'ra://provenance/' + (s.source_id || 'anon'))
                    .replace('{{DOMAIN}}', s.domain || 'general')
                    .replace('{{RAW_CONTENT}}', s.content || '')
                    .replace('{{METADATA_JSON}}', JSON.stringify(s.metadata || {}))
                    .replace('{{HUMAN_READABLE_NARRATIVE}}', this.generateNarrative(s))
                    .replace('{{CAUSAL_LINKS}}', 'Linked to Grid-Compute Nexus')
                    .replace('{{DRIFT_SCORE}}', '0.05')
                    .replace('{{RED_NUMBER}}', redNumber.toString())
                    .replace('{{CLO_ID}}', `CLO-${signalId}`)
                    .replace('{{HASH}}', hash)
                    .replace('{{REKOR_REF}}', 'rekor.sigstore.dev/lookup?hash=' + hash);

                const outPath = path.join(LEDGER_DIR, `${signalId}.json`);
                fs.writeFileSync(outPath, refined);
                console.log(`[REFINERY] Refined and Ledgered: ${signalId}`);
            });

            // Archive the raw signal
            const archivePath = path.join(BASE_DIR, '03_DOCUMENTS', 'ARCHIVE');
            if (!fs.existsSync(archivePath)) fs.mkdirSync(archivePath, { recursive: true });
            fs.renameSync(path.join(INCOMING_DIR, file), path.join(archivePath, file));
        });
        
        console.log('[REFINERY] Refinement cycle complete.');
    }
}

const refinery = new SignalRefinery();
refinery.refine();
