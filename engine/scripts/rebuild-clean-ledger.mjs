import fs from "fs";
import path from "path";
import crypto from "crypto";

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const ledgerDir = path.join(root, ".nono", "ledger");
const entriesPath = path.join(ledgerDir, "entries.ndjson");
const checkpointsPath = path.join(ledgerDir, "checkpoints.ndjson");
const latestPath = path.join(ledgerDir, "latest.checkpoint.json");
const checkpointJsonPath = path.join(ledgerDir, "CHECKPOINT.json");

if(!fs.existsSync(entriesPath)) throw new Error("ENTRIES_NOT_FOUND");

const lines = fs.readFileSync(entriesPath,"utf8").split(/\r?\n/).filter(Boolean);

function sha256(buf){ return crypto.createHash("sha256").update(buf).digest(); }
function hex(buf){ return Buffer.from(buf).toString("hex").toLowerCase(); }
function canonicalize(v){
  if(v===null) return null;
  const t=typeof v;
  if(t==="number"||t==="boolean"||t==="string") return v;
  if(Array.isArray(v)) return v.map(canonicalize);
  if(t==="object"){
    const o={};
    for(const k of Object.keys(v).sort()) o[k]=canonicalize(v[k]);
    return o;
  }
  return v;
}
function cjson(o){ return JSON.stringify(canonicalize(o)); }

function leafHashHex(bytes){
  const b = Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
  return hex(sha256(Buffer.concat([Buffer.from([0x00]),b])));
}
function nodeHash(l,r){
  return sha256(Buffer.concat([Buffer.from([0x01]),l,r]));
}

const entries=[];
for(const ln of lines){
  const e=JSON.parse(ln);
  entries.push(e);
}

const leaves = entries.map(e=>{
  const payload = {
    schema_id:String(e.schema_id||""),
    ledger_version:String(e.ledger_version||""),
    run_id:String(e.run_id||""),
    engine_version:String(e.engine_version||""),
    bundle_fingerprint_sha256:String(e.bundle_fingerprint_sha256||""),
    root_anchor_sha256:String(e.root_anchor_sha256||""),
    contract_sha256:String(e.contract_sha256||""),
    architecture_sha256:String(e.architecture_sha256||""),
    decision_sha256:String(e.decision_sha256||"")
  };
  return Buffer.from(leafHashHex(cjson(payload)),"hex");
});

if(leaves.length===0) throw new Error("NO_ENTRIES");

let level = leaves;
while(level.length>1){
  const next=[];
  for(let i=0;i<level.length;i+=2){
    if(i+1<level.length) next.push(nodeHash(level[i],level[i+1]));
    else next.push(level[i]);
  }
  level=next;
}

const rootHex = hex(level[0]);

const cp = {
  schema_id:"nono.transparency.checkpoint.v1",
  ledger_version:"1.0.0",
  tree_size:entries.length,
  root_hash_sha256:rootHex,
  prev_checkpoint_sha256:""
};

cp.checkpoint_sha256 = crypto.createHash("sha256")
  .update(Buffer.from(cjson({
    schema_id:cp.schema_id,
    ledger_version:cp.ledger_version,
    tree_size:cp.tree_size,
    root_hash_sha256:cp.root_hash_sha256,
    prev_checkpoint_sha256:cp.prev_checkpoint_sha256
  }),"utf8"))
  .digest("hex")
  .toLowerCase();

fs.writeFileSync(checkpointsPath, cjson(cp)+"\n");
fs.writeFileSync(latestPath, JSON.stringify(cp,null,2)+"\n");
fs.writeFileSync(checkpointJsonPath, JSON.stringify(cp,null,2)+"\n");

console.log("LEDGER_REBUILT");
console.log("ENTRIES="+entries.length);
console.log("ROOT="+rootHex);
console.log("CHECKPOINT_SHA256="+cp.checkpoint_sha256);
