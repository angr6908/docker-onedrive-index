export type PublicSiteLink = {
  name: string
  link: string
}

export type PublicRuntimeConfig = {
  icon: string
  title: string
  baseDirectory: string
  maxItems: number
  googleFontSans: string
  googleFontMono: string
  googleFontLinks: string[]
  footer: string
  protectedRoutes: string[]
  email: string
  links: PublicSiteLink[]
  datetimeFormat: string
}

const defaultConfig: PublicRuntimeConfig = {
  icon: '/icons/128.png',
  title: "Spencer's OneDrive",
  baseDirectory: '/',
  maxItems: 100,
  googleFontSans: 'Inter',
  googleFontMono: 'Fira Mono',
  googleFontLinks: ['https://fonts.googleapis.com/css2?family=Fira+Mono&family=Inter:wght@400;500;700&display=swap'],
  footer:
    'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>. Made with ❤ by SpencerWoo.',
  protectedRoutes: [],
  email: '',
  links: [],
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
}

function parseJsonEnv<T>(key: string, fallback: T): T {
  const value = process.env[key]

  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function parseNumberEnv(key: string, fallback: number): number {
  const value = process.env[key]

  if (!value) return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function readPublicRuntimeConfig(): PublicRuntimeConfig {
  return {
    icon: process.env.NEXT_PUBLIC_SITE_ICON || defaultConfig.icon,
    title: process.env.NEXT_PUBLIC_SITE_TITLE || defaultConfig.title,
    baseDirectory: process.env.OD_BASE_DIRECTORY || defaultConfig.baseDirectory,
    maxItems: parseNumberEnv('OD_MAX_ITEMS', defaultConfig.maxItems),
    googleFontSans: process.env.NEXT_PUBLIC_GOOGLE_FONT_SANS || defaultConfig.googleFontSans,
    googleFontMono: process.env.NEXT_PUBLIC_GOOGLE_FONT_MONO || defaultConfig.googleFontMono,
    googleFontLinks: parseJsonEnv('NEXT_PUBLIC_GOOGLE_FONT_LINKS', defaultConfig.googleFontLinks),
    footer: process.env.NEXT_PUBLIC_SITE_FOOTER || defaultConfig.footer,
    protectedRoutes: parseJsonEnv('OD_PROTECTED_ROUTES', defaultConfig.protectedRoutes),
    email: process.env.NEXT_PUBLIC_SITE_EMAIL || defaultConfig.email,
    links: parseJsonEnv('NEXT_PUBLIC_SITE_LINKS', defaultConfig.links),
    datetimeFormat: process.env.NEXT_PUBLIC_DATETIME_FORMAT || defaultConfig.datetimeFormat,
  }
}

declare global {
  interface Window {
    __ONEDRIVE_INDEX_PUBLIC_CONFIG__?: PublicRuntimeConfig
  }
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  if (typeof window !== 'undefined' && window.__ONEDRIVE_INDEX_PUBLIC_CONFIG__) {
    return window.__ONEDRIVE_INDEX_PUBLIC_CONFIG__
  }

  return readPublicRuntimeConfig()
}

export function serializePublicRuntimeConfig(): string {
  return JSON.stringify(readPublicRuntimeConfig()).replace(/</g, '\\u003c')
}
