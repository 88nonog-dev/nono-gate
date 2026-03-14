import fs from "fs";
import path from "path";
import crypto from "crypto";

function sha256HexBytes(buf){
  return crypto.createHash("sha256").update(buf).digest("hex").toLowerCase();
}
function sha256HexUtf8(s){
  return crypto.createHash("sha256").update(Buffer.from(String(s),"utf8")).digest("hex").toLowerCase();
}
function canonicalize(v){
  if(v === null) return null;
  const t = typeof v;
  if(t === "string" || t === "number" || t === "boolean") return v;
  if(Array.isArray(v)) return v.map(canonicalize);
  if(t === "object"){
    const o = {};
    for(const k of Object.keys(v).sort()) o[k] = canonicalize(v[k]);
    return o;
  }
  return v;
}
function canonicalStringify(v){
  return JSON.stringify(canonicalize(v));
}
function ensureDir(p){
  fs.mkdirSync(p,{recursive:true});
}
function readJsonIfExists(p){
  if(!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p,"utf8");
  const clean = raw && raw.length && raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  return clean ? JSON.parse(clean) : null;
}
function writeUtf8NoBom(p, text){
  const enc = new TextEncoder();
  const bytes = enc.encode(String(text));
  fs.writeFileSync(p, Buffer.from(bytes));
}
function hexToBuf(hex){
  const h = String(hex||"").toLowerCase().trim();
  if(!/^[0-9a-f]{64}$/.test(h)) throw new Error("HEX32_INVALID");
  return Buffer.from(h,"hex");
}

// Merkle: domain-separated; carry rule; deterministic
// leaf = sha256(0x00 || entry_sha256_bytes)
// node = sha256(0x01 || left32 || right32)
function merkleRootFromEntryShas(entryShas){
  if(!entryShas.length) return "";
  let level = entryShas.map(h => {
    const b = hexToBuf(h);
    return crypto.createHash("sha256").update(Buffer.concat([Buffer.from([0x00]), b])).digest();
  });

  while(level.length > 1){
    const next = [];
    for(let i=0;i<level.length;i+=2){
      if(i+1 >= level.length){
        next.push(level[i]); // carry
      }else{
        const left = level[i];
        const right = level[i+1];
        const node = crypto.createHash("sha256").update(Buffer.concat([Buffer.from([0x01]), left, right])).digest();
        next.push(node);
      }
    }
    level = next;
  }
  return Buffer.from(level[0]).toString("hex").toLowerCase();
}

export function appendLineageEntry(cwd, payload){
  const base = path.join(cwd, ".nono", "lineage");
  ensureDir(base);

  const logPath = path.join(base, "LINEAGE.ndjson");
  const headPath = path.join(base, "HEAD.json");

  const headPrev = readJsonIfExists(headPath) || {};
  const prevLinear = String(headPrev.lineage_root_sha256 || "");
  const prevMerkle = String(headPrev.merkle_root_sha256 || ""); // informational, recomputed anyway

  const entry = canonicalize({
    schema_id: "nono.lineage.entry.v1",
    version: "1.0.0",
    prev_root_sha256: prevLinear,
    run_id: String(payload.run_id||""),
    bundle_root_sha256: String(payload.bundle_root_sha256||""),
    bundle_fingerprint_sha256: String(payload.bundle_fingerprint_sha256||""),
    contract_sha256: String(payload.contract_sha256||""),
    architecture_sha256: String(payload.architecture_sha256||"")
  });

  const entryText = canonicalStringify(entry) + "\n";
  const entrySha = sha256HexUtf8(entryText);

  // Linear root (existing behavior)
  const newLinear = sha256HexUtf8(prevLinear + "|" + entrySha);

  // Append to NDJSON (store both entry object and entry_sha256 for stable replay)
  const lineObj = canonicalize({ entry, entry_sha256: entrySha });
  const lineText = canonicalStringify(lineObj) + "\n";
  fs.appendFileSync(logPath, lineText, { encoding:"utf8" });

  // Recompute Merkle root from all entries (deterministic; O(n), acceptable)
  const lines = fs.readFileSync(logPath,"utf8").split(/\r?\n/).filter(Boolean);
  const entryShas = [];
  for(let i=0;i<lines.length;i++){
    const obj = JSON.parse(lines[i]);
    if(obj && typeof obj.entry_sha256 === "string" && /^[0-9a-f]{64}$/i.test(obj.entry_sha256)){
      entryShas.push(String(obj.entry_sha256).toLowerCase());
    }else{
      // fallback: compute from entry if legacy line
      const e = (obj && obj.entry) ? obj.entry : obj;
      const t = canonicalStringify(canonicalize(e)) + "\n";
      entryShas.push(sha256HexUtf8(t));
    }
  }
  const newMerkle = merkleRootFromEntryShas(entryShas);

  const head = canonicalize({
    schema_id: "nono.lineage.head.v1",
    version: "1.0.0",
    // Primary lineage root for compatibility (linear chain)
    lineage_root_sha256: newLinear,
    // Merkle root for audit-grade history commitment
    merkle_root_sha256: newMerkle,
    height: entryShas.length
  });
  writeUtf8NoBom(headPath, canonicalStringify(head) + "\n");

  return { entry_sha256: entrySha, lineage_root_sha256: newLinear, merkle_root_sha256: newMerkle, height: entryShas.length, prev_merkle_root_sha256: prevMerkle };
}
