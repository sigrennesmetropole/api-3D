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


<!-- Matomo -->
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//app.sig.rennesmetropole.fr/matomo/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '8']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
<!-- End Matomo Code -->

launchServer().catch(e => logger.error(e));
