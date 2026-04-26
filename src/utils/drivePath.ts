import type { ParsedUrlQuery } from 'querystring'

export function queryToPath(query?: ParsedUrlQuery): string {
  if (!query?.path) return '/'

  const { path } = query
  return typeof path === 'string' ? `/${encodeURIComponent(path)}` : `/${path.map(encodeURIComponent).join('/')}`
}

export function getItemPath(path: string, name: string): string {
  return `${path === '/' ? '' : path}/${encodeURIComponent(name)}`
}
