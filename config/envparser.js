const DotEnv = require('dotenv')

module.exports = function (isDevelopment) {

  const parsedEnv = DotEnv.config({ path: isDevelopment ? '.env.development' : '.env.production'}).parsed
  // Let's stringify our variables
  for (key in parsedEnv) {
    if (typeof parsedEnv[key] === 'string') {
      parsedEnv[key] = JSON.stringify(parsedEnv[key])
    }
  }
  return parsedEnv
}