import axios from 'axios'
import useSWRInfinite from 'swr/infinite'

import type { OdAPIResponse } from '../types'

import { getStoredToken } from './protectedRouteHandler'

const immutableOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
}

// Common axios fetch function for use with useSWR
export async function fetcher([url, token]: [url: string, token?: string]): Promise<any> {
  try {
    const config = token ? { headers: { 'od-protected-token': token } } : undefined
    const { data } = await axios.get(url, config)
    return data
  } catch (err: any) {
    throw { status: err.response.status, message: err.response.data }
  }
}

/**
 * Paging with useSWRInfinite + protected token support
 * @param path Current query directory path
 * @returns useSWRInfinite API
 */
export function useProtectedSWRInfinite(path: string = '') {
  const hashedToken = getStoredToken(path)

  /**
   * Next page infinite loading for useSWR
   * @param pageIdx The index of this paging collection
   * @param prevPageData Previous page information
   * @param path Directory path
   * @returns API to the next page
   */
  function getNextKey(pageIndex: number, previousPageData: OdAPIResponse): (string | null)[] | null {
    if (previousPageData && !previousPageData.folder) return null
    if (pageIndex === 0) return [`/api/?path=${path}`, hashedToken]

    return [`/api/?path=${path}&next=${previousPageData.next}`, hashedToken]
  }

  return useSWRInfinite(getNextKey, fetcher, immutableOptions)
}
