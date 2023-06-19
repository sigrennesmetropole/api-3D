// Ajout de paramètres personnalisés
const MatomoTracker = require('matomo-tracker');
const config = require('./config');
const logger = require('./logger');

const matomoCustomDimension = ['f', 'bbox', 'codeInsee', 'buildingID', 'texture'];

logger.info('INITIALISATION VARIABLE MATOMO');
let customproperties;
let matomotracker;

const init = () => { // customize your init function
  if (process.env.MATOMO_INSTANCE != undefined && process.env.MATOMO_PAGE_IDSITE != undefined) {
    customproperties = {
      matomoinstance: process.env.MATOMO_INSTANCE,
      matomoidsite: process.env.MATOMO_PAGE_IDSITE,
    };
    matomotracker = new MatomoTracker(process.env.MATOMO_API_IDSITE, `${process.env.MATOMO_INSTANCE}matomo.php`);
  }
};

const customAPICallActions = (request, requestParams) => { // customize the actions you want to ignite on API Calls
  // customAPICallAction #1 = track the api call in Matomo
  trackAPICallMatomo(request, requestParams);
};

const getCustomProp = () => // customproperties that can be used with ejs files
  customproperties;
function trackAPICallMatomo(request, requestParams) {
  if (matomotracker != undefined) {
    const matomoParams = {
      url: config.FULL_PATH + request.route.path.substring(1),
      action_name: request.route.path,
    };
    logger.info('***************************************************************');
    logger.info(requestParams);
    logger.info('***************************************************************');
    for (const i in requestParams) {
      if (matomoCustomDimension.indexOf(i) >= 0) {
        matomoParams[`dimension${matomoCustomDimension.indexOf(i) + 1}`] = requestParams[i];
      }
    }
    logger.info(JSON.stringify(matomoParams));
    matomotracker.track(matomoParams);
  }
}

module.exports = { init, customAPICallActions, getCustomProp };
