module.exports = {
  trailingSlash: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  outputFileTracingExcludes: {
    'next-server': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
  },
}
