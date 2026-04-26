/**
 * Make path readable but still valid in URL (means the whole URL is still recognized as a URL)
 * @param path Path. May be used as URL path or query value.
 * @returns Readable but still valid path
 */
export function getReadablePath(path: string) {
  return path
    .split('/')
    .map(s => decodeURIComponent(s))
    .map(s =>
      Array.from(s)
        .map(c => (isSafeChar(c) ? c : encodeURIComponent(c)))
        .join(''),
    )
    .join('/')
}

// Check if the character is safe (means no need of percent-encoding)
function isSafeChar(c: string) {
  if (c.charCodeAt(0) < 0x80) {
    return /^[a-zA-Z0-9\-._~]$/.test(c) || /^[*:@,!]$/.test(c)
  }

  return !/\s|\u180e/.test(c)
}
