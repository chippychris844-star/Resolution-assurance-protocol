import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * RA Early Warning Agent (EWS) - Sovereign Witness Node Component
 * Mandate: Proactive Signal Collection & Real-time Anomaly Detection
 * Version: 1.0.0 (Canon 7.0.8 Compliant)
 */

const BASE_DIR = 'C:\\Root_entity';
const SHANE_DIR = 'D:\\SHANE';
const REGISTRY_DIR = path.join(SHANE_DIR, 'resolution certificate registry');
const SNAPSHOTS_DIR = path.join(REGISTRY_DIR, 'ingestion-data', 'snapshots', 'continuous');
const SECRETS_DIR = path.join(REGISTRY_DIR, 'secrets');
const STAGING_DIR = path.join(BASE_DIR, '03_DOCUMENTS', 'INCOMING');

class EarlyWarningAgent {
    constructor() {
        this.node_id = 'VAL-WITNESS-001';
        this.risk_keywords = [
            'Geoengineering', 'NPU Shrouding', 'Grid Fracture', 
            'Solid-State Battery', 'Subsea Cable', 'Cascade Failure'
        ];
    }

    async run() {
        console.log('[EWS] Initiating Early Warning Cycle...');
        
        // 1. Harvest Signals via Agent (Bypassing Local Proxy)
        await this.harvestFixer();
        await this.harvestOpenMeteo();
        await this.harvestOilPrice();

        // 2. Scan Latest Signals for Anomalies
        const anomalies = await this.scanForAnomalies();
        
        if (anomalies.length > 0) {
            console.log(`[EWS] ${anomalies.length} Anomaly Signals Detected. Generating Flash Report...`);
            await this.generateFlashReport(anomalies);
        } else {
            console.log('[EWS] No immediate anomalies detected in current stream.');
        }

        console.log('[EWS] Early Warning Cycle Complete.');
    }

    async harvestFixer() {
        const secretPath = path.join(SECRETS_DIR, 'api_key_fixer.txt');
        if (!fs.existsSync(secretPath)) return;
        const apiKey = fs.readFileSync(secretPath, 'utf8').trim();
        const url = `https://data.fixer.io/api/latest?access_key=${apiKey}&symbols=AUD,CAD,CHF,EUR,GBP,JPY,NZD,USD`;
        
        console.log('[EWS] Harvesting Fixer FX Rates...');
        const result = await fetch(url).then(res => res.json()).catch(() => null);
        if (result && result.success) {
            this.saveSnapshot('Fixer_Rates', result);
        }
    }

    async harvestOpenMeteo() {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=-33.8688&longitude=151.2093&hourly=temperature_2m,relative_humidity_2m&current=temperature_2m&timezone=auto";
        console.log('[EWS] Harvesting Open-Meteo Weather...');
        const result = await fetch(url).then(res => res.json()).catch(() => null);
        if (result) {
            this.saveSnapshot('OpenMeteo_Forecast', result);
        }
    }

    async harvestOilPrice() {
        const secretPath = path.join(SECRETS_DIR, 'api_key_oilpriceapi.txt');
        if (!fs.existsSync(secretPath)) return;
        const apiKey = fs.readFileSync(secretPath, 'utf8').trim();
        const url = "https://api.oilpriceapi.com/v1/prices/latest";
        
        console.log('[EWS] Harvesting OilPriceAPI...');
        const result = await fetch(url, {
            headers: { 'Authorization': `Token ${apiKey}` }
        }).then(res => res.json()).catch(() => null);
        
        if (result && result.data) {
            this.saveSnapshot('OilPriceAPI_Latest', result);
        }
    }

    saveSnapshot(prefix, data) {
        const ts = new Date().toISOString().replace(/[-:T.]/g, '_').slice(0, 15);
        const folder = path.join(SNAPSHOTS_DIR, ts);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        
        const fileName = `${prefix}-${ts}.json`;
        fs.writeFileSync(path.join(folder, fileName), JSON.stringify(data, null, 2));
        
        // Simple manifest
        const manifest = {
            Timestamp: new Date().toISOString(),
            Source: prefix.toLowerCase().replace('_', '-'),
            CaptureId: `${prefix.toUpperCase()}-${ts}`,
            Files: [{ FileName: fileName, HashSha256: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex') }]
        };
        fs.writeFileSync(path.join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2));
    }

    async scanForAnomalies() {
        const anomalies = [];
        const latestFolders = fs.readdirSync(SNAPSHOTS_DIR).sort().reverse().slice(0, 5);
        
        for (const folder of latestFolders) {
            const folderPath = path.join(SNAPSHOTS_DIR, folder);
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json') && f !== 'manifest.json');
            
            for (const file of files) {
                const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
                const matches = this.risk_keywords.filter(kw => content.toLowerCase().includes(kw.toLowerCase()));
                
                if (matches.length > 0) {
                    anomalies.push({
                        file: file,
                        matches: matches,
                        timestamp: folder
                    });
                }
            }
        }
        return anomalies;
    }

    async generateFlashReport(anomalies) {
        const reportPath = path.join(REGISTRY_DIR, 'EARLY_WARNING_FLASH.md');
        let report = `# RA Early Warning Flash Report\n**Timestamp**: ${new Date().toISOString()}\n\n`;
        
        anomalies.forEach(a => {
            report += `### [ANOMALY] ${a.file}\n`;
            report += `- **Triggers**: ${a.matches.join(', ')}\n`;
            report += `- **Batch**: \`${a.timestamp}\`\n\n`;
            
            // Stage as high-priority signal
            const signalId = `FLASH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            const flashSignal = {
                source_id: 'SRC_AG_EWS',
                domain: 'early-warning',
                content: `Early warning detected in ${a.file} matching keywords: ${a.matches.join(', ')}`,
                metadata: { triggers: a.matches, risk_priority: 10 }
            };
            fs.writeFileSync(path.join(STAGING_DIR, `${signalId}.json`), JSON.stringify(flashSignal, null, 2));
        });
        
        fs.writeFileSync(reportPath, report);
        console.log(`[EWS] Flash Report written to ${reportPath}`);
    }
}

const agent = new EarlyWarningAgent();
agent.run().catch(err => console.error('[EWS] Fatal Error:', err));
