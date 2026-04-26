import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { graphHeaders, sendDriveError } from '../../utils/apiRoute'
import { encodePath, getAccessToken } from '../../utils/onedriveApi'
import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  return encodeURIComponent(
    query.replace(/'/g, "''").replace('<', ' &lt; ').replace('>', ' &gt; ').replace('?', ' ').replace('/', ' '),
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await getAccessToken()
  const { q: searchQuery = '' } = req.query

  // Set edge function caching for faster load times, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (typeof searchQuery !== 'string') {
    res.status(200).json([])
    return
  }

  // Construct Microsoft Graph Search API URL, and perform search only under the base directory
  const searchRootPath = encodePath('/')
  const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'
  const searchApi = `${apiConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`

  try {
    const { data } = await axios.get(searchApi, {
      headers: graphHeaders(accessToken),
      params: {
        select: 'id,name,file,folder,parentReference',
        top: siteConfig.maxItems,
      },
    })
    res.status(200).json(data.value)
  } catch (error: any) {
    sendDriveError(res, error)
  }
  return
}
