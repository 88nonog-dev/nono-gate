#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
function hexToBuf(hex){
  const h = String(hex||"").toLowerCase().trim();
  if(!/^[0-9a-f]{64}$/.test(h)) throw new Error("HEX32_INVALID");
  return Buffer.from(h,"hex");
}
function merkleRootFromEntryShas(entryShas){
  if(!entryShas.length) return "";
  let level = entryShas.map(h => {
    const b = hexToBuf(h);
    return crypto.createHash("sha256").update(Buffer.concat([Buffer.from([0x00]), b])).digest();
  });
  while(level.length > 1){
    const next = [];
    for(let i=0;i<level.length;i+=2){
      if(i+1 >= level.length) next.push(level[i]);
      else{
        const node = crypto.createHash("sha256").update(Buffer.concat([Buffer.from([0x01]), level[i], level[i+1]])).digest();
        next.push(node);
      }
    }
    level = next;
  }
  return Buffer.from(level[0]).toString("hex").toLowerCase();
}

function main(){
  const cwd = process.cwd();
  const lineageDir = path.join(cwd, ".nono", "lineage");
  const logPath = path.join(lineageDir, "LINEAGE.ndjson");
  const headPath = path.join(lineageDir, "HEAD.json");

  if(!fs.existsSync(logPath)) throw new Error("LINEAGE_LOG_MISSING");
  if(!fs.existsSync(headPath)) throw new Error("LINEAGE_HEAD_MISSING");

  const head = JSON.parse(fs.readFileSync(headPath, "utf8"));
  const lines = fs.readFileSync(logPath, "utf8").split(/\r?\n/).filter(Boolean);

  let prevLinear = "";
  let lastEntrySha = "";
  const entryShas = [];

  for(let i=0;i<lines.length;i++){
    const raw = lines[i];
    let obj;
    try{ obj = JSON.parse(raw); }catch{ throw new Error("LINEAGE_NDJSON_INVALID_AT:"+i); }

    const entry = obj.entry ? obj.entry : obj;
    const prevIn = String(entry.prev_root_sha256||"");
    const expectedPrev = (i===0) ? "" : prevLinear;
    if(prevIn !== expectedPrev){
      throw new Error("LINEAGE_PREV_MISMATCH_AT:"+i+":expected="+expectedPrev+":got="+prevIn);
    }

    const entryText = canonicalStringify(entry) + "\n";
    const entrySha = (obj.entry_sha256 && /^[0-9a-f]{64}$/i.test(obj.entry_sha256))
      ? String(obj.entry_sha256).toLowerCase()
      : sha256HexUtf8(entryText);

    const newLinear = sha256HexUtf8(expectedPrev + "|" + entrySha);

    prevLinear = newLinear;
    lastEntrySha = entrySha;
    entryShas.push(entrySha);
  }

  const computedMerkle = merkleRootFromEntryShas(entryShas);

  const expectedLinear = String(head.lineage_root_sha256 || "");
  if(expectedLinear && expectedLinear !== prevLinear){
    throw new Error("HEAD_LINEAR_MISMATCH:expected="+expectedLinear+":computed="+prevLinear);
  }

  const expectedMerkle = String(head.merkle_root_sha256 || "");
  if(expectedMerkle && expectedMerkle !== computedMerkle){
    throw new Error("HEAD_MERKLE_MISMATCH:expected="+expectedMerkle+":computed="+computedMerkle);
  }

  const receipt = {
    schema_id: "nono.lineage.replay.receipt.v2",
    ok: true,
    entries: lines.length,
    computed_linear_root_sha256: prevLinear,
    computed_merkle_root_sha256: computedMerkle,
    computed_last_entry_sha256: lastEntrySha,
    head_expected_linear_root_sha256: expectedLinear,
    head_expected_merkle_root_sha256: expectedMerkle
  };

  console.log(JSON.stringify(receipt, null, 2));
}

main();
