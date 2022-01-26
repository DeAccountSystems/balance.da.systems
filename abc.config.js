const packageJson = require('./package.json')
const isProd = true

module.exports = {
  isProd,
  appNmae: packageJson.name,
  hostname: '127.0.0.1:10300',
  host: '0.0.0.0',
  port: process.env.PORT || 10300,
  googleAnalyticsId: 'test',
  sentryDsn: '',
}
