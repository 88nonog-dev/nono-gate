import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();

function walk(dir){
  const results=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name === "node_modules") continue;
    if(entry.name.startsWith(".nono")) continue;
    const full = path.join(dir,entry.name);
    if(entry.isDirectory()){
      results.push(...walk(full));
    }else{
      const rel = path.relative(ROOT,full).replace(/\\/g,"/");
      if(
        rel.startsWith("src/") ||
        rel === "bin/nono.js" ||
        rel === "package.json" ||
        rel === "package-lock.json" ||
        rel.startsWith("verifier/")
      ){
        results.push(rel);
      }
    }
  }
  return results;
}

function sha256File(p){
  const buf = fs.readFileSync(path.join(ROOT,p));
  return crypto.createHash("sha256").update(buf).digest("hex");
}

const files = walk(ROOT).sort();
const lines = [];
for(const f of files){
  lines.push(sha256File(f) + "  " + f);
}
const manifest = lines.join("\n") + "\n";
const fingerprint = crypto.createHash("sha256").update(manifest).digest("hex");

fs.writeFileSync("ENGINE_FINGERPRINT_MANIFEST.txt", manifest, {encoding:"utf8"});
fs.writeFileSync("ENGINE_FINGERPRINT_SHA256.txt", fingerprint + "\n", {encoding:"utf8"});

console.log("ENGINE_FILES_COUNT=" + files.length);
console.log("ENGINE_FINGERPRINT=" + fingerprint);
