import type { NextApiRequest, NextApiResponse } from 'next'
import type { OutgoingHttpHeaders } from 'http'
import axios from 'axios'

import { driveApi, cacheControlHeader } from '../../../config/api.config'
import {
  graphHeaders,
  normalisePathQuery,
  requireAccessToken,
  sendDriveError,
  verifyProtectedPath,
} from '../../utils/apiRoute'
import { encodePath, runCorsMiddleware } from '../../utils/onedriveApi'

const shouldProxyFile = (proxy: NextApiRequest['query'][string]) => proxy === 'true' || proxy === '1'
const toOutgoingHeaders = (
  headers: Record<string, unknown>,
  cacheControl: ReturnType<NextApiResponse['getHeader']>,
) => {
  const outgoingHeaders: OutgoingHttpHeaders = {}

  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'number' || typeof value === 'string' || Array.isArray(value)) {
      outgoingHeaders[key] = value
    }
  })

  outgoingHeaders['Cache-Control'] = cacheControl
  return outgoingHeaders
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  const { path = '/', odpt = '', proxy } = req.query

  const pathQuery = normalisePathQuery(path)
  if ('error' in pathQuery) {
    res.status(400).json({ error: pathQuery.error })
    return
  }

  // Handle protected routes authentication
  const odTokenHeader = (req.headers['od-protected-token'] as string) ?? odpt
  const hasAccess = await verifyProtectedPath(res, pathQuery.path, accessToken, odTokenHeader as string)
  if (!hasAccess) return
  const responseCacheControl = res.getHeader('Cache-Control') ?? cacheControlHeader

  await runCorsMiddleware(req, res)
  try {
    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(pathQuery.path)}`
    const { data } = await axios.get(requestUrl, {
      headers: graphHeaders(accessToken),
      params: {
        // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
        select: 'id,size,@microsoft.graph.downloadUrl',
      },
    })

    const downloadUrl = data['@microsoft.graph.downloadUrl']
    if (!downloadUrl) {
      res.status(404).json({ error: 'No download url found.' })
      return
    }

    // Only proxy raw file content response for files up to 4MB
    if (shouldProxyFile(proxy) && 'size' in data && data.size < 4194304) {
      const { headers, data: stream } = await axios.get(downloadUrl as string, { responseType: 'stream' })
      res.writeHead(200, toOutgoingHeaders(headers, responseCacheControl))
      stream.pipe(res)
      return
    }

    res.setHeader('Cache-Control', responseCacheControl)
    res.redirect(downloadUrl)
    return
  } catch (error: any) {
    sendDriveError(res, error)
    return
  }
}
