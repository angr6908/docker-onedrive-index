import type { OdThumbnail } from '../../types'

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import {
  graphHeaders,
  normalisePathQuery,
  requireAccessToken,
  sendDriveError,
  verifyProtectedPath,
} from '../../utils/apiRoute'
import { encodePath } from '../../utils/onedriveApi'
import apiConfig from '../../../config/api.config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  // Get item thumbnails by its path since we will later check if it is protected
  const { path = '', size = 'medium', odpt = '' } = req.query

  // Set edge function caching for faster load times, if route is not protected, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  if (odpt === '') res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  // Check whether the size is valid - must be one of 'large', 'medium', or 'small'
  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    res.status(400).json({ error: 'Invalid size' })
    return
  }
  const pathQuery = normalisePathQuery(path)
  if ('error' in pathQuery) {
    res.status(400).json({ error: pathQuery.error })
    return
  }

  const hasAccess = await verifyProtectedPath(res, pathQuery.path, accessToken, odpt as string)
  if (!hasAccess) return

  const requestPath = encodePath(pathQuery.path)
  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''

  try {
    const { data } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/thumbnails`, {
      headers: graphHeaders(accessToken),
    })

    const thumbnailUrl = data.value && data.value.length > 0 ? (data.value[0] as OdThumbnail)[size].url : null
    if (thumbnailUrl) {
      res.redirect(thumbnailUrl)
    } else {
      res.status(400).json({ error: "The item doesn't have a valid thumbnail." })
    }
  } catch (error: any) {
    sendDriveError(res, error)
  }
  return
}
