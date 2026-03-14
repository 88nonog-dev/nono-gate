import crypto from "crypto";

function sha256Buf(buf) {
  return crypto.createHash("sha256").update(buf).digest();
}

function toHexLower(buf) {
  return Buffer.from(buf).toString("hex").toLowerCase();
}

function fromHex32(hex) {
  if (typeof hex !== "string") throw new Error("HEX_EXPECTED");
  const h = hex.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(h)) throw new Error("HEX32_INVALID");
  return Buffer.from(h, "hex");
}

/**
 * Leaf hash: H(0x00 || entry_bytes)
 * Returns 64-char lowercase hex.
 */
export function leafHashHex(entryBytes) {
  const b = Buffer.isBuffer(entryBytes) ? entryBytes : Buffer.from(entryBytes);
  const out = sha256Buf(Buffer.concat([Buffer.from([0x00]), b]));
  return toHexLower(out);
}

/**
 * Node hash: H(0x01 || left32 || right32)
 * Inputs are 32-byte buffers.
 */
export function nodeHashHex(left32, right32) {
  if (!Buffer.isBuffer(left32) || left32.length !== 32) throw new Error("LEFT32_INVALID");
  if (!Buffer.isBuffer(right32) || right32.length !== 32) throw new Error("RIGHT32_INVALID");
  const out = sha256Buf(Buffer.concat([Buffer.from([0x01]), left32, right32]));
  return toHexLower(out);
}

/**
 * Deterministic Merkle root over leaves (append order).
 * Carry rule (v1): if odd node count at a level, last node is promoted unchanged.
 *
 * @param {string[]} leafHexes - array of 64-char hex leaf hashes (lower/upper accepted)
 * @returns {{ tree_size:number, root_hex:string, levels:number }}
 */
export function merkleRoot(leafHexes) {
  const leaves = Array.isArray(leafHexes) ? leafHexes : [];
  const n = leaves.length;
  if (n === 0) return { tree_size: 0, root_hex: "", levels: 0 };

  let level = leaves.map(fromHex32);
  let levels = 1;

  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = (i + 1 < level.length) ? level[i + 1] : null;

      if (!right) {
        // carry rule
        next.push(left);
      } else {
        const h = sha256Buf(Buffer.concat([Buffer.from([0x01]), left, right]));
        next.push(h);
      }
    }
    level = next;
    levels++;
  }

  return { tree_size: n, root_hex: toHexLower(level[0]), levels };
}

/**
 * Build inclusion proof for leaf at index using carry rule.
 * Proof element:
 *  - side: "L" if sibling is on the left, "R" if sibling is on the right
 *  - hash: sibling hash hex
 *
 * @param {string[]} leafHexes
 * @param {number} index
 * @returns {{ proof: Array<{side:"L"|"R",hash:string}>, leaf_hex:string, root_hex:string, tree_size:number }}
 */
export function inclusionProof(leafHexes, index) {
  const leaves = Array.isArray(leafHexes) ? leafHexes : [];
  const n = leaves.length;
  if (n === 0) throw new Error("TREE_EMPTY");
  if (!Number.isInteger(index) || index < 0 || index >= n) throw new Error("INDEX_OUT_OF_RANGE");

  let idx = index;
  let level = leaves.map(fromHex32);
  const proof = [];

  while (level.length > 1) {
    const isRight = (idx % 2 === 1);
    const siblingIndex = isRight ? (idx - 1) : (idx + 1);

    if (siblingIndex < level.length) {
      // sibling exists
      const sib = level[siblingIndex];
      proof.push({ side: isRight ? "L" : "R", hash: toHexLower(sib) });
    } else {
      // carry: no sibling, no proof element
    }

    // move up one level: build next level with carry rule
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = (i + 1 < level.length) ? level[i + 1] : null;
      if (!right) next.push(left);
      else next.push(sha256Buf(Buffer.concat([Buffer.from([0x01]), left, right])));
    }

    idx = Math.floor(idx / 2);
    level = next;
  }

  const root_hex = toHexLower(level[0]);
  const leaf_hex = leaves[index].trim().toLowerCase();
  return { proof, leaf_hex, root_hex, tree_size: n };
}

/**
 * Recompute Merkle root from a leaf hash hex and proof list.
 * Proof uses domain-separated node hashing with carry rule already embedded by proof construction.
 *
 * @param {string} leafHex
 * @param {Array<{side:"L"|"R",hash:string}>} proof
 * @returns {string} root hex
 */
export function rootFromProof(leafHex, proof) {
  let cur = fromHex32(leafHex);
  const arr = Array.isArray(proof) ? proof : [];
  for (const step of arr) {
    if (!step || (step.side !== "L" && step.side !== "R")) throw new Error("PROOF_STEP_INVALID");
    const sib = fromHex32(step.hash);
    if (step.side === "L") {
      cur = sha256Buf(Buffer.concat([Buffer.from([0x01]), sib, cur]));
    } else {
      cur = sha256Buf(Buffer.concat([Buffer.from([0x01]), cur, sib]));
    }
  }
  return toHexLower(cur);
}