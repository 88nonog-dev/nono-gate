import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function verifyBundle(bundleDir){
  const manifestPath = path.join(bundleDir,'manifest.json');
  const sumsPath = path.join(bundleDir,'SHA256SUMS.txt');

  if(!fs.existsSync(manifestPath)) throw new Error('MANIFEST_MISSING');
  if(!fs.existsSync(sumsPath)) throw new Error('SUMS_MISSING');

  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf-8'));
  const sumLines = fs.readFileSync(sumsPath,'utf-8')
    .split(/\r?\n/)
    .map(l=>l.trim())
    .filter(Boolean);

  const sumMap = new Map();

  for(const line of sumLines){
    const m = line.match(/^([a-f0-9]{64})\s+(.+)$/i);
    if(!m) throw new Error('SUM_LINE_INVALID:'+line);
    const hash = m[1].toLowerCase();
    const name = m[2].trim();
    sumMap.set(name,hash);
  }

  for(const f of manifest.files){
    if(!sumMap.has(f)) throw new Error('HASH_MISSING:'+f);
    const fp = path.join(bundleDir,f);
    if(!fs.existsSync(fp)) throw new Error('FILE_MISSING:'+f);
    const raw = fs.readFileSync(fp);
    const h = crypto.createHash('sha256').update(raw).digest('hex');
    if(h !== sumMap.get(f)) throw new Error('HASH_MISMATCH:'+f);
  }

  console.log('EVIDENCE_VERIFY_PASS');
}
