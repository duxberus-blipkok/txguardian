import { Keypair, Transaction, SystemProgram } from "@solana/web3.js"

// Generate keypairs untuk testing
const fromKeypair = Keypair.generate()
const toPublicKey = Keypair.generate().publicKey

// Buat transaksi transfer SOL sederhana
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    toPubkey: toPublicKey,
    lamports: 1000000, // 0.001 SOL
  })
)

// Set dummy blockhash (akan di-replace otomatis saat simulasi)
tx.recentBlockhash = "5T1gC82sH7C1zT2yW4T7C1zT2yW4T7C1zT2yW4T7C1zT"
tx.feePayer = fromKeypair.publicKey

// Serialize tanpa mewajibkan tanda tangan lengkap
const serialized = tx.serialize({
  requireAllSignatures: false,
  verifySignatures: false,
})
const base64Tx = serialized.toString("base64")

console.log("=== MOCK SOLANA TRANSACTION (BASE64) ===")
console.log(base64Tx)
console.log("=========================================")
console.log("Sender Wallet  : " + fromKeypair.publicKey.toBase58())
console.log("Receiver Wallet: " + toPublicKey.toBase58())
console.log("\nCopy string base64 di atas dan tempelkan ke form input TxGuardian.")
