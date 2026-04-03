import { promises as fs } from 'fs'
type StoredTokens = {
  accessToken?: string
  accessTokenExpiresAt?: number
  refreshToken?: string
}

const tokenStorePath = process.env.OD_AUTH_TOKEN_PATH || '/app/data/onedrive-auth-tokens.json'
const tokenStoreDirectory =
  process.env.OD_AUTH_TOKEN_PATH?.replace(/\/[^/]+$/, '') || '/app/data'

async function readTokenFile(): Promise<StoredTokens> {
  try {
    const content = await fs.readFile(/* turbopackIgnore: true */ tokenStorePath, 'utf8')
    return JSON.parse(content) as StoredTokens
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return {}
    }

    throw error
  }
}

async function writeTokenFile(tokens: StoredTokens): Promise<void> {
  await fs.mkdir(/* turbopackIgnore: true */ tokenStoreDirectory, { recursive: true })
  await fs.writeFile(/* turbopackIgnore: true */ tokenStorePath, JSON.stringify(tokens, null, 2))
}

function getAccessTokenExpiry(accessTokenExpiry: number): number {
  const expiresInMs = Math.max(accessTokenExpiry - 60, 1) * 1000
  return Date.now() + expiresInMs
}

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const tokens = await readTokenFile()
  const accessToken =
    typeof tokens.accessToken === 'string' &&
    typeof tokens.accessTokenExpiresAt === 'number' &&
    tokens.accessTokenExpiresAt > Date.now()
      ? tokens.accessToken
      : null

  return {
    accessToken,
    refreshToken: tokens.refreshToken ?? null,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
}): Promise<void> {
  await writeTokenFile({
    accessToken,
    accessTokenExpiresAt: getAccessTokenExpiry(accessTokenExpiry),
    refreshToken,
  })
}
