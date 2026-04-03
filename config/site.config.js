const parseJsonEnv = (key, fallback) => {
  const value = process.env[key]

  if (!value) return fallback

  try {
    return JSON.parse(value)
  } catch {
    console.warn(`[site.config] Invalid JSON in ${key}, using fallback.`)
    return fallback
  }
}

const parseNumberEnv = (key, fallback) => {
  const value = process.env[key]

  if (!value) return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * This file contains the configuration used for customising the website, such as the folder to share,
 * the title, used Google fonts, site icons, contact info, etc.
 */
module.exports = {
  // [OPTIONAL] This is the website icon to the left of the title inside the navigation bar. It should be placed under the
  // /public directory of your GitHub project (not your OneDrive folder!), and referenced here by its relative path to /public.
  icon: process.env.NEXT_PUBLIC_SITE_ICON || '/icons/128.png',

  // The name of your website. Present alongside your icon.
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Spencer's OneDrive",

  // The folder that you are to share publicly with onedrive-vercel-index. Use '/' if you want to share your root folder.
  baseDirectory: process.env.OD_BASE_DIRECTORY || '/',

  // [OPTIONAL] This represents the maximum number of items that one directory lists, pagination supported.
  // Do note that this is limited up to 200 items by the upstream OneDrive API.
  maxItems: parseNumberEnv('OD_MAX_ITEMS', 100),

  // [OPTIONAL] We use Google Fonts natively for font customisations.
  // You can check and generate the required links and names at https://fonts.google.com.
  // googleFontSans - the sans serif font used in onedrive-vercel-index.
  googleFontSans: process.env.NEXT_PUBLIC_GOOGLE_FONT_SANS || 'Inter',
  // googleFontMono - the monospace font used in onedrive-vercel-index.
  googleFontMono: process.env.NEXT_PUBLIC_GOOGLE_FONT_MONO || 'Fira Mono',
  // googleFontLinks -  an array of links for referencing the google font assets.
  googleFontLinks: parseJsonEnv('NEXT_PUBLIC_GOOGLE_FONT_LINKS', [
    'https://fonts.googleapis.com/css2?family=Fira+Mono&family=Inter:wght@400;500;700&display=swap',
  ]),

  // [OPTIONAL] The footer component of your website. You can write HTML here, but you need to escape double
  // quotes - changing " to \". You can write anything here, and if you like badges, generate some with https://shields.io
  footer: process.env.NEXT_PUBLIC_SITE_FOOTER
    || 'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>. Made with ❤ by SpencerWoo.',

  // [OPTIONAL] This is where you specify the folders that are password protected. It is an array of paths pointing to all
  // the directories in which you have .password set. Check the documentation for details.
  protectedRoutes: parseJsonEnv('OD_PROTECTED_ROUTES', ['/🌞 Private folder/u-need-a-password', '/🥟 Some test files/Protected route']),

  // [OPTIONAL] Use "" here if you want to remove this email address from the nav bar.
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'mailto:spencer.wushangbo@gmail.com',

  // [OPTIONAL] This is an array of names and links for setting your social information and links.
  // In the latest update, all brand icons inside font awesome is supported and the icon to render is based on the name
  // you provide. See the documentation for details.
  links: parseJsonEnv('NEXT_PUBLIC_SITE_LINKS', [
    {
      name: 'GitHub',
      link: 'https://github.com/spencerwooo/onedrive-vercel-index',
    },
  ]),

  // This is a day.js-style datetime format string to format datetimes in the app. Ref to
  // https://day.js.org/docs/en/display/format for detailed specification. The default value is ISO 8601 full datetime
  // without timezone and replacing T with space.
  datetimeFormat: process.env.NEXT_PUBLIC_DATETIME_FORMAT || 'YYYY-MM-DD HH:mm:ss',
}
