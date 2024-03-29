const config = require('./config');
const logger = require('./logger');
const ExpressServer = require('./expressServer');
const TempDwnldFilesManager = require('./tempDwnldFilesManager');
const dotenv = require('dotenv');
const launchServer = async () => {
  try {
    dotenv.config({ path: __dirname+'/.env' });
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    this.expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    this.expressServer.launch();
    this.tmpFileManager = new TempDwnldFilesManager();
    logger.info('Express server running');
  } catch (error) {
    logger.error('Express Server failure', error.message);
    await this.close();
  }
};

launchServer().catch(e => logger.error(e));
 