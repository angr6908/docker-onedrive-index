import { promises as fs } from 'fs'
import { dirname } from 'path'

type StoredTokens = {
  accessToken?: string
  accessTokenExpiresAt?: number
  refreshToken?: string
}

const tokenStorePath = process.env.OD_AUTH_TOKEN_PATH || '/app/data/onedrive-auth-tokens.json'

async function readTokenFile(): Promise<StoredTokens> {
  try {
    const content = await fs.readFile(/* turbopackIgnore: true */ tokenStorePath, 'utf8')
    return JSON.parse(content) as StoredTokens
  } catch (error: any) {
    if (error?.code === 'ENOENT') return {}
    if (error instanceof SyntaxError) {
      console.error(`[odAuthTokenStore] Ignoring invalid token store JSON at ${tokenStorePath}.`)
      return {}
    }
    throw error
  }
}

async function writeTokenFile(tokens: StoredTokens): Promise<void> {
  await fs.mkdir(/* turbopackIgnore: true */ dirname(tokenStorePath), { recursive: true })
  const tempPath = `${tokenStorePath}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ tempPath, JSON.stringify(tokens, null, 2))
  await fs.rename(/* turbopackIgnore: true */ tempPath, /* turbopackIgnore: true */ tokenStorePath)
}

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const tokens = await readTokenFile()
  const accessToken =
    typeof tokens.accessToken === 'string' &&
    typeof tokens.accessTokenExpiresAt === 'number' &&
    tokens.accessTokenExpiresAt > Date.now()
      ? tokens.accessToken
      : null
  return { accessToken, refreshToken: tokens.refreshToken ?? null }
}

export async function storeOdAuthTokens({ accessToken, accessTokenExpiry, refreshToken }: {
  accessToken: string; accessTokenExpiry: number; refreshToken: string
}): Promise<void> {
  await writeTokenFile({
    accessToken,
    accessTokenExpiresAt: Date.now() + Math.max(accessTokenExpiry - 60, 1) * 1000,
    refreshToken,
  })
}
