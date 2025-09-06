import { S3Client } from '@aws-sdk/client-s3'
import { env } from '~/env'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLAUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLAUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLAUDFLARE_SECRET_ACCESS_KEY,
  },
})

export async function getConfigFile(){
  const result = await fetch(`${env.CLAUDFLARE_PUBLIC_URL}/config.json`)
  return result
}
