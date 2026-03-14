import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sha256File } from './hash.js';

export function writeEvidence(outDir, files){
  fs.mkdirSync(outDir,{recursive:true});

  const primary = Object.keys(files).sort();

  // 1) write primary files
  for(const name of primary){
    const fp = path.join(outDir,name);
    const v = files[name];
    if(typeof v === 'string'){
      fs.writeFileSync(fp,v);
    }else{
      fs.writeFileSync(fp, JSON.stringify(v,null,2));
    }
  }

  // 2) write sums+manifest for primary (temporary, used to derive root)
  const sumsPrimary = [];
  for(const name of primary){
    const h = sha256File(path.join(outDir,name));
    sumsPrimary.push(h + '  ' + name);
  }
  const sumsPrimaryText = sumsPrimary.join('\n') + '\n';
  fs.writeFileSync(path.join(outDir,'SHA256SUMS.txt'), sumsPrimaryText);

  // 3) derive root only if not already provided by caller
  const rootName = 'BUNDLE_ROOT_SHA256.txt';
  if(!files[rootName]){
    const rootHash = crypto.createHash('sha256').update(sumsPrimaryText).digest('hex');
    fs.writeFileSync(path.join(outDir,rootName), rootHash + '\n');
  }

  // 4) final list includes root
  const all = Array.from(new Set(primary.concat([rootName]))).sort();

  // 5) final sums include root + final manifest includes root
  const sumsFinal = [];
  for(const name of all){
    const h = sha256File(path.join(outDir,name));
    sumsFinal.push(h + '  ' + name);
  }
  fs.writeFileSync(path.join(outDir,'SHA256SUMS.txt'), sumsFinal.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir,'manifest.json'), JSON.stringify({ files: all },null,2));
}

