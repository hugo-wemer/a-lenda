import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  CLAUDFLARE_ACCOUNT_ID: z.string().default('25aec5ac23a7645b0919922abdb7fb78'),
  CLAUDFLARE_ACCESS_KEY_ID: z.string().default('9d28de83c01504e69200ed82ceba5122'),
  CLAUDFLARE_SECRET_ACCESS_KEY: z
    .string()
    .default('d31309ef69aa174cadd8f2e0ea770f386914c114b26aea0367eac23e0cbb3cc1'),
  CLAUDFLARE_BUCKET: z.string().default('a-lenda'),
  CLAUDFLARE_PUBLIC_URL: z.url().default('https://pub-733f1d008877491884285a3df7f7632c.r2.dev'),
})

export const env = envSchema.parse(process.env)
