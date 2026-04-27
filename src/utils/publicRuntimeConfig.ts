export type PublicSiteLink = { name: string; link: string }

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

const defaults: PublicRuntimeConfig = {
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

const parseJson = <T>(key: string, fallback: T): T => {
  try {
    return process.env[key] ? (JSON.parse(process.env[key]!) as T) : fallback
  } catch {
    return fallback
  }
}

const parseNumber = (key: string, fallback: number): number => {
  const parsed = Number(process.env[key])
  return Number.isFinite(parsed) && process.env[key] ? parsed : fallback
}

export function readPublicRuntimeConfig(): PublicRuntimeConfig {
  return {
    icon: process.env.NEXT_PUBLIC_SITE_ICON || defaults.icon,
    title: process.env.NEXT_PUBLIC_SITE_TITLE || defaults.title,
    baseDirectory: process.env.OD_BASE_DIRECTORY || defaults.baseDirectory,
    maxItems: parseNumber('OD_MAX_ITEMS', defaults.maxItems),
    googleFontSans: process.env.NEXT_PUBLIC_GOOGLE_FONT_SANS || defaults.googleFontSans,
    googleFontMono: process.env.NEXT_PUBLIC_GOOGLE_FONT_MONO || defaults.googleFontMono,
    googleFontLinks: parseJson('NEXT_PUBLIC_GOOGLE_FONT_LINKS', defaults.googleFontLinks),
    footer: process.env.NEXT_PUBLIC_SITE_FOOTER || defaults.footer,
    protectedRoutes: parseJson('OD_PROTECTED_ROUTES', defaults.protectedRoutes),
    email: process.env.NEXT_PUBLIC_SITE_EMAIL || defaults.email,
    links: parseJson('NEXT_PUBLIC_SITE_LINKS', defaults.links),
    datetimeFormat: process.env.NEXT_PUBLIC_DATETIME_FORMAT || defaults.datetimeFormat,
  }
}

declare global {
  interface Window {
    __ONEDRIVE_INDEX_PUBLIC_CONFIG__?: PublicRuntimeConfig
  }
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  return typeof window !== 'undefined' && window.__ONEDRIVE_INDEX_PUBLIC_CONFIG__
    ? window.__ONEDRIVE_INDEX_PUBLIC_CONFIG__
    : readPublicRuntimeConfig()
}

export function serializePublicRuntimeConfig(): string {
  return JSON.stringify(readPublicRuntimeConfig()).replace(/</g, '\\u003c')
}

export function getServerSidePublicConfigProps() {
  return { props: { publicConfig: readPublicRuntimeConfig() } }
}
