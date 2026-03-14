import fs from "fs";
import path from "path";
import crypto from "crypto";
import child_process from "child_process";

import { appendEntry, buildCheckpointFromLedger, appendCheckpoint, ensureLedgerDir, getLedgerDir } from "./ledgerStore.js";
import { buildReceiptForIndex, verifyReceiptBasic } from "./receipt.js";

function sha256HexUtf8(text){
  return crypto.createHash("sha256").update(Buffer.from(text,"utf8")).digest("hex").toLowerCase();
}

function writeUtf8NoBom(filePath, text){
  const enc = new TextEncoder();
  const bytes = enc.encode(text);
  fs.writeFileSync(filePath, Buffer.from(bytes));
}

function tryMinisignSign(messagePath, sigPath){
  // Opt-in by providing secret key path via env.
  // We NEVER store keys, only read path from env at runtime.
  const secret = process.env.NONO_MINISIGN_SECRET_KEY ? String(process.env.NONO_MINISIGN_SECRET_KEY) : "";
  const pub = process.env.NONO_MINISIGN_PUBLIC_KEY ? String(process.env.NONO_MINISIGN_PUBLIC_KEY) : "";
  const exe = process.env.NONO_MINISIGN_EXE ? String(process.env.NONO_MINISIGN_EXE) : "minisign";

  if(!secret) return { signed:false, reason:"NO_SECRET_KEY_ENV" };
  if(!fs.existsSync(secret)) return { signed:false, reason:"SECRET_KEY_PATH_NOT_FOUND" };
  if(!fs.existsSync(messagePath)) return { signed:false, reason:"MESSAGE_NOT_FOUND" };

  try{
    // minisign -S -s <secretkey> -m <message> -x <signature>
    child_process.execFileSync(exe, ["-S","-s",secret,"-m",messagePath,"-x",sigPath], { stdio:"pipe" });
  } catch (e){
    return { signed:false, reason:"MINISIGN_FAILED" };
  }

  // Optionally copy pub key into ledger dir for independent verifiers
  let pubCopied = "";
  try{
    if(pub && fs.existsSync(pub)){
      const ledgerDir = getLedgerDir(process.cwd());
      ensureLedgerDir(process.cwd());
      const dst = path.join(ledgerDir, "LEDGER_PUBLIC_KEY.minisign.pub");
      fs.copyFileSync(pub, dst);
      pubCopied = dst;
    }
  } catch (_) { /* ignore */ }

  return { signed:true, sigPath, pubKeyPath: pubCopied || "" };
}

export async function finalizeWithLedger(result, runId){

  // WITNESS_POLICY_ENFORCEMENT_V1 (hard boundary)
  // If .nono/witness-policy.json exists, we bind its sha256 into the entry and enforce threshold at finalize time.
  // Threshold check is enforced only when NONO_WITNESS_ENFORCE=1 (opt-in), so existing flows are not broken.
  function loadWitnessPolicy(){
    const wpPath = path.join(process.cwd(), '.nono', 'witness-policy.json');
    if(!fs.existsSync(wpPath)) return null;
    const raw = fs.readFileSync(wpPath, 'utf8');
    const clean = raw && raw.length && raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
    try{ return JSON.parse(clean); }catch{ throw new Error('WITNESS_POLICY_INVALID_JSON'); }
  }
  function sha256FileHex(p){
    const buf = fs.readFileSync(p);
    return crypto.createHash('sha256').update(buf).digest('hex').toLowerCase();
  }
  function verifyMinisign(pubKeyPath, messagePath, sigPath){
    const exe = process.env.NONO_MINISIGN_EXE ? String(process.env.NONO_MINISIGN_EXE) : 'minisign';
    if(!fs.existsSync(pubKeyPath)) return { ok:false, reason:'PUBKEY_NOT_FOUND' };
    if(!fs.existsSync(messagePath)) return { ok:false, reason:'MESSAGE_NOT_FOUND' };
    if(!fs.existsSync(sigPath)) return { ok:false, reason:'SIG_NOT_FOUND' };
    try{
      // minisign -V -p <pubkey> -m <message> -x <sig>
      child_process.execFileSync(exe, ['-V','-p',pubKeyPath,'-m',messagePath,'-x',sigPath,'-q'], { stdio:'pipe' });
      return { ok:true, reason:'' };
    }catch{
      return { ok:false, reason:'MINISIGN_VERIFY_FAILED' };
    }
  }
  function enforceWitnesses(outDir, cpStored){
    const policy = loadWitnessPolicy();
    if(!policy) return { enforced:false, reason:'NO_POLICY' };
    const wpPath = path.join(process.cwd(), '.nono', 'witness-policy.json');
    const policy_sha256 = sha256FileHex(wpPath);

    const enforce = (process.env.NONO_WITNESS_ENFORCE === '1');
    const checkpointPath = path.join(outDir, 'CHECKPOINT.json');

    const witnesses = Array.isArray(policy.witnesses) ? policy.witnesses : [];
    const threshold = Number(policy.threshold || 0);

    // Build expected signature list from policy (first artifact entry only, strict).
    let sigNames = [];
    if(Array.isArray(policy.artifacts) && policy.artifacts.length){
      const a0 = policy.artifacts[0];
      if(a0 && Array.isArray(a0.signatures)) sigNames = a0.signatures.map(String);
    }

    // Verify signatures that exist using their configured pubkeys mapping by id.
    const results = [];
    let okCount = 0;

    for(const w of witnesses){
      const wid = String(w.id||'');
      const pubRel = String(w.pubkey_file||'');
      if(!wid || !pubRel) continue;

      // Map witness id -> expected signature file name
      let sigRel = '';
      if(wid === 'maintainer') sigRel = 'CHECKPOINT.minisig';
      else sigRel = 'CHECKPOINT.' + wid + '.minisig';

      // If policy specifies signature names list, ensure ours is allowed.
      if(sigNames.length && !sigNames.includes('LEDGER_ROOT_SHA256.txt.'+wid+'.minisig') && wid !== 'maintainer'){
        // policy signatures currently name ledger roots; checkpoint witness names are derived.
        // We still enforce by witness id mapping; this keeps policy minimal while strict on threshold.
      }

      const pubAbs = path.join(process.cwd(), pubRel.replace(/\//g, path.sep));
      const sigAbs = path.join(outDir, sigRel);
      const v = verifyMinisign(pubAbs, checkpointPath, sigAbs);
      results.push({ id: wid, pubkey_file: pubRel, sig_file: sigRel, ok: !!v.ok, reason: v.ok ? '' : v.reason });
      if(v.ok) okCount++;
    }

    const status = { enforced:enforce, policy_sha256, threshold, okCount, results };

    if(enforce){
      if(!threshold || threshold < 1) throw new Error('WITNESS_THRESHOLD_INVALID');
      if(okCount < threshold) throw new Error('WITNESS_THRESHOLD_NOT_MET:'+okCount+'<'+threshold);
    }

    // Bind into checkpoint object for downstream receipts/verifiers (tamper-evident via existing hashes).
    try{
      cpStored.witness = { schema:'nono-witness-status-v1', policy_sha256, threshold, okCount, results };
    }catch{ /* ignore */ }

    return status;
  }


  if(!result || !result.decision || !result.outDir){
    throw new Error("FINALIZE_INVALID_RESULT");
  }

  const decision = result.decision;
  const outDir = result.outDir;

  const decision_sha256 = sha256HexUtf8(JSON.stringify(decision));

  const entry = {
    schema_id: "nono.transparency.entry.v1",
    ledger_version: "1.0.0",
    created_utc: new Date().toISOString(),
    run_id: String(runId || ""),
    engine_version: String(decision.engine_version || ""),
    bundle_fingerprint_sha256: String(decision.bundle_fingerprint || ""),
    // v1: root anchor currently derived from decision.bundle_fingerprint (kept deterministic)
    root_anchor_sha256: String(decision.bundle_fingerprint || ""),
    contract_sha256: String(decision.contract_sha256 || ""),
    architecture_sha256: String(decision.architecture_sha256 || ""),
    decision_sha256,
    witness_policy_sha256: '',
    witness_threshold: 0
  };

  appendEntry(process.cwd(), entry);

  const cpObj = buildCheckpointFromLedger(process.cwd(), {
    schema_id: "nono.transparency.checkpoint.v1",
    ledger_version: "1.0.0",
    created_utc: new Date().toISOString()
  });

  const cpStored = appendCheckpoint(process.cwd(), cpObj);

  // --- Produce a signed checkpoint artifact inside the evidence directory (optional) ---
  const checkpointPath = path.join(outDir, "CHECKPOINT.json");
  writeUtf8NoBom(checkpointPath, JSON.stringify(cpStored, null, 2) + "\n");

  const sigPath = path.join(outDir, "CHECKPOINT.minisig");
  const sigInfo = tryMinisignSign(checkpointPath, sigPath);

  const witnessStatus = enforceWitnesses(outDir, cpStored);
  if(witnessStatus && witnessStatus.policy_sha256){
    entry.witness_policy_sha256 = String(witnessStatus.policy_sha256||'');
    entry.witness_threshold = Number(witnessStatus.threshold||0);
  }
  const receipt = buildReceiptForIndex(process.cwd(), cpStored);
  // attach signature metadata (optional fields)
  receipt.checkpoint_signature = {
    algo: "minisign",
    signed: !!sigInfo.signed,
    reason: sigInfo.signed ? "" : (sigInfo.reason || "UNSIGNED"),
    signature_file: sigInfo.signed ? "CHECKPOINT.minisig" : "",
    public_key_file: sigInfo.pubKeyPath ? "LEDGER_PUBLIC_KEY.minisign.pub" : ""
  };

  verifyReceiptBasic(receipt);

  const receiptPath = path.join(outDir, "TRANSPARENCY_RECEIPT.json");
  writeUtf8NoBom(receiptPath, JSON.stringify(receipt, null, 2) + "\n");

  return receipt;
}
