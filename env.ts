import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  CLAUDFLARE_ACCOUNT_ID: z.string(),
  CLAUDFLARE_ACCESS_KEY_ID: z.string(),
  CLAUDFLARE_SECRET_ACCESS_KEY: z
    .string(),
  CLAUDFLARE_BUCKET: z.string(),
  CLAUDFLARE_PUBLIC_URL: z.url(),
})

export const env = envSchema.parse(process.env)
