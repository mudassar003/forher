// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeDetection: true,
  },
  // This is needed if you're using the middleware approach
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};