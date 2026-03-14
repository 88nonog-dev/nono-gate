import fs from "fs";
import path from "path";
import crypto from "crypto";

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
function sha256HexUtf8(t){ return crypto.createHash("sha256").update(Buffer.from(t,"utf8")).digest("hex").toLowerCase(); }
function sha256FileHex(p){ return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").toLowerCase(); }

function parseAttestation(txt){
  const out={};
  for(const raw of txt.split(/\r?\n/)){
    const line = raw.trim();
    if(!line) continue;
    const i = line.indexOf("=");
    if(i>0){
      const k=line.slice(0,i).trim();
      const v=line.slice(i+1).trim();
      out[k]=v;
    }
  }
  return out;
}

function main(){
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const zip = process.argv[3] ? path.resolve(process.argv[3]) : "";
  const attPath = process.argv[4] ? path.resolve(process.argv[4]) : "";
  if(!fs.existsSync(root)) throw new Error("ROOT_NOT_FOUND");
  if(!fs.existsSync(zip)) throw new Error("ZIP_NOT_FOUND");
  if(!fs.existsSync(attPath)) throw new Error("ATTESTATION_NOT_FOUND");

  const pkgPath = path.join(root,"package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath,"utf8")) : {};
  const version = String(pkg.version || "0.0.0");

  const cpPath = path.join(root,".nono","ledger","CHECKPOINT.json");
  if(!fs.existsSync(cpPath)) throw new Error("CHECKPOINT_JSON_NOT_FOUND");
  const cp = JSON.parse(fs.readFileSync(cpPath,"utf8"));

  const att = parseAttestation(fs.readFileSync(attPath,"utf8"));

  const snapshot = {
    schema_id: "nono.governance.snapshot.v1",
    schema_version: "1.0.0",
    governance_version: version,

    repo_root: att.repo_root || root,
    git_head: att.git_head || "",
    git_tag: att.git_tag || "NONE",

    ledger: {
      checkpoint_sha256: String(cp.checkpoint_sha256||"").toLowerCase(),
      root_hash_sha256: String(cp.root_hash_sha256||"").toLowerCase(),
      tree_size: Number(cp.tree_size||0),
      created_utc: (cp.created_utc===undefined || cp.created_utc===null) ? "" : String(cp.created_utc)
    },

    audit_pack: {
      dir: att.audit_pack_dir || "",
      fingerprint_sha256: String(att.audit_pack_fingerprint_sha256||"").toLowerCase()
    },

    signed_zip: {
      path: zip,
      sha256: sha256FileHex(zip),
      minisign: zip + ".minisig"
    },

    attestation: {
      path: attPath,
      sha256: sha256FileHex(attPath)
    }
  };

  const canon = cjson(snapshot);
  const snapshot_sha256 = sha256HexUtf8(canon);

  // “Seal” = hash-of-hashes (stable, readable, audit-friendly)
  const seal_payload = {
    schema_id: "nono.governance.seal.v1",
    schema_version: "1.0.0",
    snapshot_sha256,
    git_head: snapshot.git_head,
    ledger_checkpoint_sha256: snapshot.ledger.checkpoint_sha256,
    audit_pack_fingerprint_sha256: snapshot.audit_pack.fingerprint_sha256,
    signed_zip_sha256: snapshot.signed_zip.sha256
  };
  const seal_canon = cjson(seal_payload);
  const seal_sha256 = sha256HexUtf8(seal_canon);

  const outSnap = path.join(root,"GOVERNANCE_SNAPSHOT.json");
  const outSnapSha = path.join(root,"GOVERNANCE_SNAPSHOT.sha256.txt");
  const outSeal = path.join(root,"GOVERNANCE_SEAL.txt");
  const outSealSha = path.join(root,"GOVERNANCE_SEAL.sha256.txt");

  fs.writeFileSync(outSnap, JSON.stringify(snapshot,null,2) + "\n", "utf8");
  fs.writeFileSync(outSnapSha, snapshot_sha256 + "\n", "utf8");

  fs.writeFileSync(outSeal, JSON.stringify({ seal: seal_payload, seal_sha256 }, null, 2) + "\n", "utf8");
  fs.writeFileSync(outSealSha, seal_sha256 + "\n", "utf8");

  process.stdout.write("SNAPSHOT_CREATED="+outSnap+"\n");
  process.stdout.write("SNAPSHOT_SHA256="+snapshot_sha256+"\n");
  process.stdout.write("SEAL_CREATED="+outSeal+"\n");
  process.stdout.write("SEAL_SHA256="+seal_sha256+"\n");
}
main();
