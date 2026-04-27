const parseJsonEnv = (key, fallback) => {
  try { return process.env[key] ? JSON.parse(process.env[key]) : fallback }
  catch { return fallback }
}

const parseNumberEnv = (key, fallback) => {
  const parsed = Number(process.env[key])
  return Number.isFinite(parsed) && process.env[key] ? parsed : fallback
}

module.exports = {
  icon: process.env.NEXT_PUBLIC_SITE_ICON || '/icons/128.png',
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Spencer's OneDrive",
  baseDirectory: process.env.OD_BASE_DIRECTORY || '/',
  maxItems: parseNumberEnv('OD_MAX_ITEMS', 100),
  googleFontSans: process.env.NEXT_PUBLIC_GOOGLE_FONT_SANS || 'Inter',
  googleFontMono: process.env.NEXT_PUBLIC_GOOGLE_FONT_MONO || 'Fira Mono',
  googleFontLinks: parseJsonEnv('NEXT_PUBLIC_GOOGLE_FONT_LINKS', [
    'https://fonts.googleapis.com/css2?family=Fira+Mono&family=Inter:wght@400;500;700&display=swap',
  ]),
  footer:
    process.env.NEXT_PUBLIC_SITE_FOOTER ||
    'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>. Made with ❤ by SpencerWoo.',
  protectedRoutes: parseJsonEnv('OD_PROTECTED_ROUTES', [
    '/🌞 Private folder/u-need-a-password',
    '/🥟 Some test files/Protected route',
  ]),
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'mailto:spencer.wushangbo@gmail.com',
  links: parseJsonEnv('NEXT_PUBLIC_SITE_LINKS', [
    { name: 'GitHub', link: 'https://github.com/spencerwooo/onedrive-vercel-index' },
  ]),
  datetimeFormat: process.env.NEXT_PUBLIC_DATETIME_FORMAT || 'YYYY-MM-DD HH:mm:ss',
}
