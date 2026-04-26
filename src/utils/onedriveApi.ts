import { posix as pathPosix } from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import Cors from 'cors'

import apiConfig from '../../config/api.config'
import siteConfig from '../../config/site.config'
import { getClientSecret } from './oAuthHandler'
import { getOdAuthTokens, storeOdAuthTokens } from './odAuthTokenStore'
import { compareHashedToken } from './protectedRouteHandler'

const basePath = pathPosix.resolve('/', siteConfig.baseDirectory)
const clientSecret = getClientSecret()
const corsMiddleware = Cors({ methods: ['GET', 'HEAD'] })
let refreshAccessTokenPromise: Promise<string> | null = null

export function encodePath(path: string): string {
  const encodedPath = pathPosix.join(basePath, path).replace(/\/$/, '')
  return encodedPath === '/' || encodedPath === '' ? '' : `:${encodeURIComponent(encodedPath)}`
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: apiConfig.clientId,
    redirect_uri: apiConfig.redirectUri,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const resp = await axios.post(apiConfig.authApi, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  })

  if ('access_token' in resp.data && 'refresh_token' in resp.data) {
    const { expires_in, access_token, refresh_token } = resp.data
    await storeOdAuthTokens({
      accessToken: access_token,
      accessTokenExpiry: parseInt(expires_in),
      refreshToken: refresh_token,
    })
    console.log('Fetch new access token with stored refresh token.')
    return access_token
  }

  return ''
}

function logTokenRefreshError(error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error('[onedriveApi] Failed to refresh access token.', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    return
  }

  console.error('[onedriveApi] Failed to refresh access token.', error)
}

export async function getAccessToken(): Promise<string> {
  const { accessToken, refreshToken } = await getOdAuthTokens().catch(error => {
    console.error('[onedriveApi] Failed to read auth tokens.', error)
    return { accessToken: null, refreshToken: null }
  })

  if (typeof accessToken === 'string') {
    console.log('Fetch access token from storage.')
    return accessToken
  }

  if (typeof refreshToken !== 'string') {
    console.log('No refresh token, return empty access token.')
    return ''
  }

  refreshAccessTokenPromise ??= refreshAccessToken(refreshToken).finally(() => {
    refreshAccessTokenPromise = null
  })

  try {
    return await refreshAccessTokenPromise
  } catch (error) {
    logTokenRefreshError(error)
    return ''
  }
}

export function getAuthTokenPath(path: string) {
  const cleanPath = `${path.toLowerCase()}/`
  const route = (siteConfig.protectedRoutes as string[])
    .filter(route => typeof route === 'string')
    .map(route => `${route.toLowerCase().replace(/\/$/, '')}/`)
    .find(route => cleanPath.startsWith(route))

  return route ? `${route}.password` : ''
}

export async function checkAuthRoute(
  cleanPath: string,
  accessToken: string,
  odTokenHeader: string,
): Promise<{ code: 200 | 401 | 404 | 500; message: string }> {
  const authTokenPath = getAuthTokenPath(cleanPath)

  if (authTokenPath === '') {
    return { code: 200, message: '' }
  }

  try {
    const token = await axios.get(`${apiConfig.driveApi}/root${encodePath(authTokenPath)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,file',
      },
    })
    const odProtectedToken = await axios.get(token.data['@microsoft.graph.downloadUrl'])

    if (
      !compareHashedToken({
        odTokenHeader,
        dotPassword: odProtectedToken.data.toString(),
      })
    ) {
      return { code: 401, message: 'Password required.' }
    }
  } catch (error: any) {
    return error?.response?.status === 404
      ? { code: 404, message: "You didn't set a password." }
      : { code: 500, message: 'Internal server error.' }
  }

  return { code: 200, message: 'Authenticated.' }
}

export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, result => (result instanceof Error ? reject(result) : resolve(result)))
  })
}
