import fs from 'fs';
import crypto from 'crypto';

export function ensureContract(path){
  if(fs.existsSync(path)) return;
  const contract = {
    schema_id: "nono-gate.contract.v1",
    version: "1.0.0",
    created_at: new Date().toISOString()
  };
  fs.writeFileSync(path, JSON.stringify(contract,null,2));
}

export function hashContract(path){
  const raw = fs.readFileSync(path);
  return crypto.createHash('sha256').update(raw).digest('hex');
}
