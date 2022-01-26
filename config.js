const packageJson = require('./package.json')
const isProdData = window.location.host === '127.0.0.1:10300'
const hostname = isProdData ? '127.0.0.1:10300' : '127.0.0.1:10300'

module.exports = {
  isProdData,
  appNmae: packageJson.name,
  description: packageJson.description,
  hostname,
  domain: `https://${hostname}/`,
  servicesApi: isProdData ? '' : '',
  identiconServer: '',
  appDaSystems: isProdData ? 'https://app.da.systems' : 'https://app.da.systems',
  ckbNode: isProdData ? '' : ''
}
