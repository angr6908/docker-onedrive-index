import axios from 'axios'
import CryptoJS from 'crypto-js'

// Just a disguise to obfuscate required tokens (including but not limited to client secret,
// access tokens, and refresh tokens), used along with the following two functions
const AES_SECRET_KEY = 'onedrive-vercel-index'
export function obfuscateToken(token: string): string {
  return CryptoJS.AES.encrypt(token, AES_SECRET_KEY).toString()
}
export function revealObfuscatedToken(obfuscated: string): string {
  const decrypted = CryptoJS.AES.decrypt(obfuscated, AES_SECRET_KEY)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

function getApiConfig() {
  return require('../../config/api.config')
}

export function getClientSecret(): string {
  const apiConfig = getApiConfig()
  return apiConfig.clientSecret || revealObfuscatedToken(apiConfig.obfuscatedClientSecret)
}

// Generate the Microsoft OAuth 2.0 authorization URL, used for requesting the authorisation code
export function generateAuthorisationUrl({
  clientId,
  redirectUri,
  authApi,
  scope,
}: {
  clientId: string
  redirectUri: string
  authApi: string
  scope: string
}): string {
  const authUrl = authApi.replace('/token', '/authorize')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    response_mode: 'query',
  })

  return `${authUrl}?${params.toString()}`
}

// The code returned from the Microsoft OAuth 2.0 authorization URL is a request URL with hostname
// http://localhost and URL parameter code. This function extracts the code from the request URL
export function extractAuthCodeFromRedirected(url: string, redirectUri: string): string {
  if (!url.startsWith(redirectUri)) return ''

  const params = new URLSearchParams(url.split('?')[1])
  return params.get('code') ?? ''
}

// After a successful authorisation, the code returned from the Microsoft OAuth 2.0 authorization URL
// will be used to request an access token. This function requests the access token with the authorisation code
// and returns the access token and refresh token on success.
export async function requestTokenWithAuthCode(
  code: string,
): Promise<
  | { expiryTime: string; accessToken: string; refreshToken: string }
  | { error: string; errorDescription: string; errorUri: string }
> {
  const apiConfig = getApiConfig()
  const { clientId, redirectUri, authApi } = apiConfig
  const clientSecret = getClientSecret()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
  })

  return axios
    .post(authApi, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(resp => {
      const { expires_in, access_token, refresh_token } = resp.data
      return { expiryTime: expires_in, accessToken: access_token, refreshToken: refresh_token }
    })
    .catch(err => {
      const { error, error_description, error_uri } = err.response.data
      return { error, errorDescription: error_description, errorUri: error_uri }
    })
}

export async function sendTokenToServer(accessToken: string, refreshToken: string, expiryTime: string | number) {
  return axios.post(
    '/api',
    {
      obfuscatedAccessToken: obfuscateToken(accessToken),
      accessTokenExpiry: Number(expiryTime),
      obfuscatedRefreshToken: obfuscateToken(refreshToken),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
