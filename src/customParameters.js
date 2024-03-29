// Ajout de paramètres personnalisés
const MatomoTracker = require('matomo-tracker');

const matomoCustomDimension = ['f', 'bbox', 'codeInsee', 'buildingID', 'texture'];

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
      url: process.env.MATOMO_ACTION_URL + request.route.path.substring(1),
      action_name: request.route.path
    };
    for (const i in requestParams) {
      if (matomoCustomDimension.indexOf(i) >= 0) {
        matomoParams[`dimension${matomoCustomDimension.indexOf(i) + 1}`] = requestParams[i];
      }
    }
    matomotracker.track(matomoParams);
  }
}

module.exports = { init, customAPICallActions, getCustomProp };
