import { S3Client } from '@aws-sdk/client-s3'
import { app } from 'electron'
import { mkdir, rename } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'

import path from 'node:path'
import { Writable } from 'node:stream'
import type { StoreType } from 'shared/types'
import { env } from '~/env'
import { getUserDataDir } from '../ipc'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLAUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLAUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLAUDFLARE_SECRET_ACCESS_KEY,
  },
})

export async function getConfigFile(): Promise<StoreType> {
  const result = await fetch(`${env.CLAUDFLARE_PUBLIC_URL}/config.json`)
  return result.json()
}
export async function updateCsvFile(equipment: string, branch: string): Promise<any> {
  const destDir = path.join(getUserDataDir(), equipment)
  const finalPath = path.join(destDir, `mapa_${branch}.csv`)
  const tmpPath = `${finalPath}.tmp`

  await mkdir(destDir, { recursive: true })
  const result = await fetch(`${env.CLAUDFLARE_PUBLIC_URL}/${equipment}/mapa_v${branch}.csv`)

  const body = result.body

  if (!result.body) {
    return
  }

  const nodeFile = createWriteStream(tmpPath)
  await result.body.pipeTo(Writable.toWeb(nodeFile) as WritableStream<Uint8Array>)

  await rename(tmpPath, finalPath)
  return { path: finalPath }
}
