import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'
import {
  graphHeaders,
  nextPageToken,
  normalisePathQuery,
  requireAccessToken,
  sendDriveError,
  verifyProtectedPath,
} from '../../utils/apiRoute'
import { revealObfuscatedToken } from '../../utils/oAuthHandler'
import { storeOdAuthTokens } from '../../utils/odAuthTokenStore'
import { encodePath, runCorsMiddleware } from '../../utils/onedriveApi'

const driveItemSelect = 'name,size,id,lastModifiedDateTime,folder,file,video,image'
const fileItemSelect = `${driveItemSelect},@microsoft.graph.downloadUrl`
const isLikelyFilePath = (path: string) => /\.[^/.]+$/.test(path.split('/').pop() ?? '')
const shouldFallbackToIdentity = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false
  return error.response?.status === 400 || error.response?.status === 404
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // If method is POST, then the API is called by the client to store acquired tokens
  if (req.method === 'POST') {
    const { obfuscatedAccessToken, accessTokenExpiry, obfuscatedRefreshToken } = req.body
    const accessToken = revealObfuscatedToken(obfuscatedAccessToken)
    const refreshToken = revealObfuscatedToken(obfuscatedRefreshToken)

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      res.status(400).send('Invalid request body')
      return
    }

    await storeOdAuthTokens({ accessToken, accessTokenExpiry, refreshToken })
    res.status(200).send('OK')
    return
  }

  // If method is GET, then the API is a normal request to the OneDrive API for files or folders
  const { path = '/', raw = false, next = '', sort = '' } = req.query

  // Set edge function caching for faster load times, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  const pathQuery = normalisePathQuery(path, { trimTrailingSlash: true })
  if ('error' in pathQuery) {
    res.status(400).json({ error: pathQuery.error })
    return
  }

  // Validate sort param
  if (typeof sort !== 'string') {
    res.status(400).json({ error: 'Sort query invalid.' })
    return
  }

  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  // Handle protected routes authentication
  const cleanPath = pathQuery.path
  const hasAccess = await verifyProtectedPath(res, cleanPath, accessToken, req.headers['od-protected-token'] as string)
  if (!hasAccess) return

  const requestPath = encodePath(cleanPath)
  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''
  const childrenUrl = `${requestUrl}${isRoot ? '' : ':'}/children`

  const fetchFolderData = async () => {
    const { data } = await axios.get(childrenUrl, {
      headers: graphHeaders(accessToken),
      params: {
        select: driveItemSelect,
        $top: siteConfig.maxItems,
        ...(next ? { $skipToken: next } : {}),
        ...(sort ? { $orderby: sort } : {}),
      },
    })

    return data
  }

  const sendFolderData = (folderData: any) => {
    const nextPage = nextPageToken(folderData['@odata.nextLink'])
    res.status(200).json({ folder: folderData, ...(nextPage ? { next: nextPage } : {}) })
  }

  // Go for file raw download link, add CORS headers, and redirect to @microsoft.graph.downloadUrl
  // (kept here for backwards compatibility, and cache headers will be reverted to no-cache)
  if (raw) {
    await runCorsMiddleware(req, res)
    res.setHeader('Cache-Control', 'no-cache')

    const { data } = await axios.get(requestUrl, {
      headers: graphHeaders(accessToken),
      params: {
        // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
        select: 'id,@microsoft.graph.downloadUrl',
      },
    })

    if ('@microsoft.graph.downloadUrl' in data) {
      res.redirect(data['@microsoft.graph.downloadUrl'])
    } else {
      res.status(404).json({ error: 'No download url found.' })
    }
    return
  }

  // Querying current path identity (file or folder) and follow up query childrens in folder
  try {
    if (next) {
      sendFolderData(await fetchFolderData())
      return
    }

    if (!isLikelyFilePath(cleanPath)) {
      try {
        sendFolderData(await fetchFolderData())
        return
      } catch (error) {
        if (!shouldFallbackToIdentity(error)) throw error
      }
    }

    const { data: identityData } = await axios.get(requestUrl, {
      headers: graphHeaders(accessToken),
      params: {
        select: fileItemSelect,
      },
    })

    if ('folder' in identityData) {
      sendFolderData(await fetchFolderData())
      return
    }
    res.status(200).json({ file: identityData })
    return
  } catch (error: any) {
    sendDriveError(res, error)
    return
  }
}
