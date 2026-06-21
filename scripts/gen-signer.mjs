// Generate keypair penanda receipt.
// Jalankan: node scripts/gen-signer.mjs
// Salin nilai RECEIPT_SIGNER_SECRET ke .env.local
import nacl from "tweetnacl"
import bs58 from "bs58"

const kp = nacl.sign.keyPair()
console.log("RECEIPT_SIGNER_SECRET=" + bs58.encode(kp.secretKey))
console.log("Public key (signer)   =" + bs58.encode(kp.publicKey))
