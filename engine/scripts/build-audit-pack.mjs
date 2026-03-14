import fs from "fs";
import path from "path";
import crypto from "crypto";

function sha256FileHex(p){
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex").toLowerCase();
}
function sha256TextHexUtf8(t){
  return crypto.createHash("sha256").update(Buffer.from(t,"utf8")).digest("hex").toLowerCase();
}
function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function writeUtf8NoBom(p, txt){ fs.writeFileSync(p, Buffer.from(new TextEncoder().encode(txt))); }
function copyFile(src,dst){
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src,dst);
}
function listFilesRecursive(dir){
  const out=[];
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const st=fs.statSync(p);
    if(st.isDirectory()) out.push(...listFilesRecursive(p));
    else if(st.isFile()) out.push(p);
  }
  return out;
}
function relPosix(base, p){
  const rel = path.relative(base,p);
  return rel.split(path.sep).join("/");
}

function buildVerifyOfflineMjs(){
  // Node-based offline verify: SHA256SUMS + checkpoint chain integrity.
  return `import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packRoot = path.resolve(path.join(__dirname, ".."));

function sha256FileHex(p){
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex").toLowerCase();
}
function sha256HexUtf8(t){
  return crypto.createHash("sha256").update(Buffer.from(t,"utf8")).digest("hex").toLowerCase();
}
function canonicalize(v){
  if(v===null) return null;
  const t=typeof v;
  if(t==="number"||t==="boolean"||t==="string") return v;
  if(Array.isArray(v)) return v.map(canonicalize);
  if(t==="object"){
    const out={};
    for(const k of Object.keys(v).sort()) out[k]=canonicalize(v[k]);
    return out;
  }
  return v;
}
function canonicalStringify(o){ return JSON.stringify(canonicalize(o)); }

function main(){
  const manifestDir = path.join(packRoot,"MANIFEST");
  const ledgerDir = path.join(packRoot,"LEDGER");

  const sumsPath = path.join(manifestDir,"SHA256SUMS.txt");
  if(!fs.existsSync(sumsPath)) throw new Error("SHA256SUMS_NOT_FOUND");
  const lines = fs.readFileSync(sumsPath,"utf8").split(/\\r?\\n/).filter(Boolean);
  for(const ln of lines){
    const m = ln.match(/^([0-9a-f]{64})\\s\\s(.+)$/);
    if(!m) throw new Error("SHA256SUMS_LINE_INVALID:"+ln);
    const expect = m[1];
    const rel = m[2];
    const abs = path.join(packRoot, rel.split("/").join(path.sep));
    if(!fs.existsSync(abs)) throw new Error("FILE_MISSING:"+rel);
    const got = sha256FileHex(abs);
    if(got!==expect) throw new Error("SHA256_MISMATCH:"+rel);
  }
  console.log("SHA256SUMS_OK");

  const cpPath = path.join(ledgerDir,"checkpoints.ndjson");
  if(!fs.existsSync(cpPath)) throw new Error("CHECKPOINTS_NDJSON_NOT_FOUND");
  const cpLines = fs.readFileSync(cpPath,"utf8").split(/\\r?\\n/).filter(Boolean);

  let prev="";
  for(let i=0;i<cpLines.length;i++){
    const cp = JSON.parse(cpLines[i]);
    const payload = {
      schema_id: String(cp.schema_id||""),
      ledger_version: String(cp.ledger_version||""),
      tree_size: Number(cp.tree_size||0),
      root_hash_sha256: String(cp.root_hash_sha256||""),
      prev_checkpoint_sha256: String(cp.prev_checkpoint_sha256||"")
    };
    const recomputed = sha256HexUtf8(canonicalStringify(payload));
    if(recomputed!==String(cp.checkpoint_sha256||"")){
      throw new Error("CHECKPOINT_SHA256_MISMATCH@index="+i);
    }
    if(i>0){
      if(String(cp.prev_checkpoint_sha256||"")!==prev){
        throw new Error("CHECKPOINT_CHAIN_BROKEN@index="+i);
      }
    }
    prev = String(cp.checkpoint_sha256||"");
  }
  console.log("CHECKPOINT_CHAIN_OK");
  console.log("AUDIT_PACK_VERIFY=PASS");
}

main();
`;
}

function buildRunVerifyPs1(){
  // Wrapper only. No JSON parsing in PowerShell.
  return [
'$ErrorActionPreference="Stop"',
'$here = Split-Path -Parent $MyInvocation.MyCommand.Path',
'$mjs = Join-Path $here "VERIFY_OFFLINE.mjs"',
'if(!(Test-Path -LiteralPath $mjs)){ throw "VERIFY_OFFLINE_MJS_NOT_FOUND" }',
'node $mjs'
  ].join("\n") + "\n";
}

function main(){
  const args = process.argv.slice(2);
  const root = args[0] ? path.resolve(args[0]) : process.cwd();
  const outBase = args[1] ? path.resolve(args[1]) : path.resolve("C:\\Users\\hp\\Desktop\\150");
  if(!fs.existsSync(root)) throw new Error("ROOT_NOT_FOUND");
  const ledgerDir = path.join(root, ".nono", "ledger");
  if(!fs.existsSync(ledgerDir)) throw new Error("LEDGER_NOT_FOUND");

  const stamp = new Date().toISOString().replace(/[-:]/g,"").replace(/\..+$/,"").replace("T","_");
  const outDir = path.join(outBase, `AUDIT_PACK_${stamp}`);
  const packDir = path.join(outDir, "AUDIT_PACK");
  const ledgerOut = path.join(packDir, "LEDGER");
  const manifestOut = path.join(packDir, "MANIFEST");
  const verifyOut = path.join(packDir, "VERIFY");

  ensureDir(ledgerOut);
  ensureDir(manifestOut);
  ensureDir(verifyOut);

  for(const name of ["entries.ndjson","checkpoints.ndjson","latest.checkpoint.json"]){
    const src = path.join(ledgerDir, name);
    if(!fs.existsSync(src)) throw new Error("LEDGER_FILE_MISSING:"+name);
    copyFile(src, path.join(ledgerOut, name));
  }
  copyFile(path.join(ledgerOut, "latest.checkpoint.json"), path.join(ledgerOut, "CHECKPOINT.json"));

  // Node verifier + PS wrapper
  writeUtf8NoBom(path.join(verifyOut, "VERIFY_OFFLINE.mjs"), buildVerifyOfflineMjs());
  writeUtf8NoBom(path.join(verifyOut, "RUN_VERIFY.ps1"), buildRunVerifyPs1());

  const scope = {
    schema_id: "nono.audit_pack.v1",
    pack_type: "ledger-only",
    guarantees: ["sha256 manifest verification", "checkpoint chain integrity verification"],
    excludes: ["scanner correctness", "detection accuracy", "vulnerability completeness", "runtime enforcement"]
  };
  writeUtf8NoBom(path.join(packDir, "SCOPE.json"), JSON.stringify(scope, null, 2) + "\n");

  const readme =
`# NONO-GATE AUDIT PACK (v1)\n\n## Offline Verify (Windows)\n\nFrom: AUDIT_PACK\\\\VERIFY\n\n- Run:\n  powershell -NoProfile -ExecutionPolicy Bypass -File .\\\\RUN_VERIFY.ps1\n\nExpected:\n- SHA256SUMS_OK\n- CHECKPOINT_CHAIN_OK\n- AUDIT_PACK_VERIFY=PASS\n\n## Notes\n- This pack is ledger-only export.\n- It proves decision integrity artifacts (ledger/checkpoints) and file integrity via SHA256.\n- Verification uses Node for canonical JSON hashing (PowerShell wrapper only).\n`;
  writeUtf8NoBom(path.join(packDir, "README_AUDIT.md"), readme);

  // Build manifest over all files under AUDIT_PACK (excluding MANIFEST outputs until after)
  const files = listFilesRecursive(packDir)
    .filter(p => !p.endsWith(path.join("MANIFEST","SHA256SUMS.txt")) && !p.endsWith(path.join("MANIFEST","FILE_LIST.txt")) && !p.endsWith(path.join("MANIFEST","PACK_FINGERPRINT_SHA256.txt")));

  const rels = files.map(p => relPosix(packDir,p)).sort((a,b)=>a.localeCompare(b));
  writeUtf8NoBom(path.join(manifestOut, "FILE_LIST.txt"), rels.join("\n") + "\n");

  const sumsLines = [];
  for(const rel of rels){
    const abs = path.join(packDir, rel.split("/").join(path.sep));
    const h = sha256FileHex(abs);
    sumsLines.push(`${h}  ${rel}`);
  }
  const sumsPath = path.join(manifestOut, "SHA256SUMS.txt");
  writeUtf8NoBom(sumsPath, sumsLines.join("\n") + "\n");

  const packFp = sha256TextHexUtf8(fs.readFileSync(sumsPath,"utf8"));
  writeUtf8NoBom(path.join(manifestOut, "PACK_FINGERPRINT_SHA256.txt"), packFp + "\n");

  process.stdout.write(`AUDIT_PACK_CREATED=${outDir}\nPACK_FINGERPRINT_SHA256=${packFp}\n`);
}

main();
