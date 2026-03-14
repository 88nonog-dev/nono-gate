import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizeSarif } from './normalize.js';
function sha256(text){ return crypto.createHash('sha256').update(text).digest('hex'); }
function writeBaseline(baselinePath,issues){ const json=JSON.stringify(issues,null,2); fs.writeFileSync(baselinePath,json); const h=sha256(json); fs.writeFileSync(path.join(path.dirname(baselinePath),'baseline.sha256'),h+'\n'); return h; }
export function baselineInit(sarifPath){ const issues=normalizeSarif(sarifPath); const baseDir='.nono'; const baselinePath=path.join(baseDir,'baseline.json'); if(!fs.existsSync(baseDir)){ fs.mkdirSync(baseDir,{recursive:true}); } const h=writeBaseline(baselinePath,issues); console.log('BASELINE_CREATED='+baselinePath); console.log('BASELINE_SHA256='+h); }
export function baselineUpdate(sarifPath,baselinePath){ if(!fs.existsSync(baselinePath)){ throw new Error('BASELINE_NOT_FOUND'); } const issues=normalizeSarif(sarifPath); const h=writeBaseline(baselinePath,issues); console.log('BASELINE_UPDATED='+baselinePath); console.log('BASELINE_SHA256='+h); }
export function verifyBaselineSha(baselinePath){ const raw=fs.readFileSync(baselinePath,'utf-8'); const shaPath=path.join(path.dirname(baselinePath),'baseline.sha256'); if(!fs.existsSync(shaPath)){ throw new Error('BASELINE_SHA_FILE_MISSING'); } const expected=fs.readFileSync(shaPath,'utf-8').trim(); const actual=sha256(raw); if(actual!==expected){ throw new Error('BASELINE_SHA_MISMATCH'); } return actual; }
