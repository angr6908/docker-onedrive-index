import { useEffect, useState } from 'react'

const osPatterns = [
  ['Windows', 'windows'],
  ['Mac OS', 'mac'],
  ['Linux', 'linux'],
] as const

export default function useDeviceOS(): string {
  const [os, setOs] = useState('')

  useEffect(() => {
    setOs(osPatterns.find(([pattern]) => window.navigator.userAgent.includes(pattern))?.[1] ?? 'other')
  }, [])

  return os
}
