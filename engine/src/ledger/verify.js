import fs from "fs";
import path from "path";
import crypto from "crypto";
import child_process from "child_process";

import { rootFromProof } from "./merkle.js";
import { readCheckpoints } from "./ledgerStore.js";

function sha256HexUtf8(text){
  return crypto.createHash("sha256").update(Buffer.from(text,"utf8")).digest("hex").toLowerCase();
}

function canonicalize(v){
  if(v === null) return null;
  const t = typeof v;
  if(t === "number" || t === "boolean" || t === "string") return v;
  if(Array.isArray(v)) return v.map(canonicalize);
  if(t === "object"){
    const out = {};
    for(const k of Object.keys(v).sort()){
      out[k] = canonicalize(v[k]);
    }
    return out;
  }
  return v;
}

function canonicalStringify(obj){
  return JSON.stringify(canonicalize(obj));
}

function verifyCheckpointIntegrity(checkpoint){
  const payload = {
    schema_id: checkpoint.schema_id,
    ledger_version: checkpoint.ledger_version,
    tree_size: checkpoint.tree_size,
    root_hash_sha256: checkpoint.root_hash_sha256,
    prev_checkpoint_sha256: checkpoint.prev_checkpoint_sha256
  };

  const recomputed = sha256HexUtf8(canonicalStringify(payload));
  if(recomputed !== checkpoint.checkpoint_sha256){
    throw new Error("CHECKPOINT_SHA256_MISMATCH");
  }
}

function verifyCheckpointChain(ledgerRoot){
  const cps = readCheckpoints(ledgerRoot);
  for(let i=0;i<cps.length;i++){
    verifyCheckpointIntegrity(cps[i]);
    if(i>0){
      if(cps[i].prev_checkpoint_sha256 !== cps[i-1].checkpoint_sha256){
        throw new Error("CHECKPOINT_CHAIN_BROKEN");
      }
    }
  }
}

function verifyMinisign(checkpointPath){
  const sigPath = checkpointPath.replace(/\.json$/,".minisig");
  if(!fs.existsSync(sigPath)) return { signed:false };

  const exe = process.env.NONO_MINISIGN_EXE || "minisign";
  try{
    child_process.execFileSync(exe, ["-Vm", checkpointPath, "-x", sigPath], { stdio:"pipe" });
    return { signed:true };
  } catch {
    throw new Error("MINISIGN_VERIFICATION_FAILED");
  }
}

export function verifyReceiptFull(receiptPath){

  if(!fs.existsSync(receiptPath)){
    throw new Error("RECEIPT_NOT_FOUND");
  }

  const receipt = JSON.parse(fs.readFileSync(receiptPath,"utf8"));

  const leaf = receipt.entry_leaf_sha256;
  const proof = receipt.inclusion_proof;
  const recomputedRoot = rootFromProof(leaf, proof);

  if(recomputedRoot !== receipt.checkpoint.root_hash_sha256){
    throw new Error("MERKLE_PROOF_INVALID");
  }

  verifyCheckpointIntegrity(receipt.checkpoint);
  verifyCheckpointChain(process.cwd());

  const checkpointPath = path.join(path.dirname(receiptPath),"CHECKPOINT.json");
  const sigInfo = verifyMinisign(checkpointPath);

  return {
    ok:true,
    merkle_valid:true,
    chain_valid:true,
    signature_valid: sigInfo.signed
  };
}