import { z } from "zod"

/** Body untuk POST /api/analyze */
export const AnalyzeRequestSchema = z.object({
  /** Serialized transaction dalam base64 */
  transactionBase64: z
    .string()
    .min(1, "transactionBase64 is required")
    .max(8192, "transaction is too large")
    .refine((v) => /^[A-Za-z0-9+/]+={0,2}$/.test(v), "invalid base64 format"),
  /** Alamat wallet pengguna (opsional, hanya konteks) */
  walletPubkey: z.string().optional(),
})

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>
