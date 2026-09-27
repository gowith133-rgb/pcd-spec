/**
 * Real client-side cryptographic hashing & simulated Ed25519 signing for RFC-001
 */

// Compute real SHA-256 hex digest using browser WebCrypto
export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous fast hash for instantaneous UI renders (FNV-1a / Murmur inspired, hex-padded to 64 chars)
export function fastHexDigest(input: string, seed: string = 'pcd-2026'): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ 0xabcdef01) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h2 ^ 0x10203040) >>> 0).toString(16).padStart(8, '0');
  const part5 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  const part6 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part7 = ((h1 * 31) >>> 0).toString(16).padStart(8, '0');
  const part8 = ((h2 * 37) >>> 0).toString(16).padStart(8, '0');

  return (part1 + part2 + part3 + part4 + part5 + part6 + part7 + part8).toLowerCase();
}

// Generate deterministic Ed25519-like base64/hex signature
export function simulateEd25519Signature(payload: string, privateKeySeed: string = 'elder_key_01'): string {
  const hash = fastHexDigest(payload + privateKeySeed);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let sig = 'ed25519_sig_';
  for (let i = 0; i < 44; i += 2) {
    const byte = parseInt(hash.substr(i % (hash.length - 2), 2), 16);
    sig += chars[byte % chars.length];
  }
  return sig;
}

// Calculate Merkle tree root from array of execution state leaves
export function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) {
    return fastHexDigest('empty_state_root');
  }
  let currentLevel = leaves.map(l => fastHexDigest(l));
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(fastHexDigest(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(fastHexDigest(currentLevel[i] + currentLevel[i]));
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

// Format Unix timestamp to human ISO & relative
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}
