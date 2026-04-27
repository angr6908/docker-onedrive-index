const getEnv = (key, fallback) => process.env[key] || fallback

module.exports = {
  clientId: getEnv('OD_CLIENT_ID', ''),
  clientSecret: getEnv('OD_CLIENT_SECRET', ''),
  obfuscatedClientSecret: getEnv('OD_OBFUSCATED_CLIENT_SECRET', ''),
  redirectUri: getEnv('OD_REDIRECT_URI', 'http://localhost:3000'),
  authApi: getEnv('OD_AUTH_API', 'https://login.microsoftonline.com/common/oauth2/v2.0/token'),
  driveApi: getEnv('OD_DRIVE_API', 'https://graph.microsoft.com/v1.0/me/drive'),
  scope: getEnv('OD_SCOPE', 'user.read files.read.all offline_access'),
  cacheControlHeader: getEnv('OD_CACHE_CONTROL_HEADER', 'max-age=0, s-maxage=60, stale-while-revalidate'),
}
