#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

function fail(code, message) {
  console.error("VERIFY_FAIL|" + code + "|" + message);
  process.exit(1);
}

function ok() {
  console.log("VERIFY_OK");
  process.exit(0);
}

function okLedger(root) {
  console.log("LEDGER_OK|" + root);
  process.exit(0);
}

function sha256File(p) {
  const data = fs.readFileSync(p);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function sha256Text(txt) {
  return crypto.createHash('sha256').update(txt).digest('hex');
}

function requireFile(p) {
  if (!fs.existsSync(p)) {
    fail("MISSING_FILE", p);
  }
}

function parseSums(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(l => l.trim().length > 0);
  const map = {};
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) fail("INVALID_SHA256SUMS_FORMAT", line);
    const hash = parts[0].toLowerCase();
    const file = parts.slice(1).join(" ");
    map[file] = hash;
  }
  return map;
}

function verifyLedger(ledgerDir) {
  const ledgerPath = path.join(ledgerDir, "ledger.jsonl");
  const rootPath = path.join(ledgerDir, "LEDGER_ROOT_SHA256.txt");

  requireFile(ledgerPath);
  requireFile(rootPath);

  const lines = fs.readFileSync(ledgerPath, 'utf8')
    .split(/\r?\n/)
    .filter(l => l.trim().length > 0);

  let prev = "0".repeat(64);

  for (const line of lines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      fail("LEDGER_INVALID_JSON", line);
    }

    if (!obj.entry_hash || !obj.prev_entry_hash || !obj.bundle_root_sha256) {
      fail("LEDGER_INVALID_ENTRY", line);
    }

    if (obj.prev_entry_hash.toLowerCase() !== prev) {
      fail("LEDGER_CHAIN_BROKEN", obj.entry_hash);
    }

    const material = obj.prev_entry_hash + "|" +
                     obj.bundle_root_sha256 + "|" +
                     obj.decision_result + "|" +
                     obj.policy_fingerprint;

    const recalculated = sha256Text(material).toLowerCase();
    if (recalculated !== obj.entry_hash.toLowerCase()) {
      fail("LEDGER_HASH_MISMATCH", obj.entry_hash);
    }

    prev = obj.entry_hash.toLowerCase();
  }

  const expectedRoot = fs.readFileSync(rootPath, 'utf8').trim().toLowerCase();
  const actualRoot = sha256File(ledgerPath);
  if (expectedRoot !== actualRoot) {
    fail("LEDGER_ROOT_MISMATCH", actualRoot);
  }

  okLedger(actualRoot);
}

function verifyBundle(evidenceDir) {
  const contractPath = path.join(evidenceDir, "CONTRACT.json");
  requireFile(contractPath);
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  if (!contract.required_files || !Array.isArray(contract.required_files)) {
    fail("INVALID_CONTRACT", "required_files missing");
  }

  for (const file of contract.required_files) {
    requireFile(path.join(evidenceDir, file));
  }

  const sumsPath = path.join(evidenceDir, "SHA256SUMS.txt");
  const sums = parseSums(sumsPath);

  for (const file in sums) {
    const full = path.join(evidenceDir, file);
    requireFile(full);
    const actual = sha256File(full);
    if (actual !== sums[file]) {
      fail("HASH_MISMATCH", file);
    }
  }

  const rootFile = path.join(evidenceDir, "BUNDLE_ROOT_SHA256.txt");
  const sigFile = path.join(evidenceDir, "BUNDLE_ROOT_SHA256.txt.minisig");

  const rootExpected = fs.readFileSync(rootFile, 'utf8').trim().toLowerCase();
  const rootActual = sha256File(sumsPath);
  if (rootExpected !== rootActual) {
    fail("ROOT_MISMATCH", "BUNDLE_ROOT_SHA256");
  }

  const pubPath = fs.existsSync(path.join(evidenceDir, "minisign.pub"))
    ? path.join(evidenceDir, "minisign.pub")
    : path.resolve(".nono/keys/minisign.pub");

  requireFile(pubPath);
  requireFile(sigFile);

  try {
    execFileSync("minisign", [
      "-Vm",
      rootFile,
      "-p",
      pubPath,
      "-x",
      sigFile
    ], { stdio: 'ignore' });
  } catch {
    fail("SIGNATURE_INVALID", "minisign verification failed");
  }

  ok();
}

function main() {
  if (process.argv.length < 3) {
    fail("USAGE", "nono-verify <evidence_directory>|--verify-ledger <ledger_directory>");
  }

  if (process.argv[2] === "--verify-ledger") {
    if (process.argv.length < 4) {
      fail("USAGE", "--verify-ledger <ledger_directory>");
    }
    const ledgerDir = path.resolve(process.argv[3]);
    if (!fs.existsSync(ledgerDir)) {
      fail("LEDGER_DIR_NOT_FOUND", ledgerDir);
    }
    verifyLedger(ledgerDir);
  } else {
    const evidenceDir = path.resolve(process.argv[2]);
    if (!fs.existsSync(evidenceDir)) {
      fail("EVIDENCE_NOT_FOUND", evidenceDir);
    }
    verifyBundle(evidenceDir);
  }
}

main();