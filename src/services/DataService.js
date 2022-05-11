/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Maquette blanche en accès direct (cityJSON, cityGML) sur id de batiment
* TODO Description
*
* id String 
* texture Boolean 
* format String  (optional)
* returns exception
* */
const batimentsBatimentIdGET = ({ id, texture, format }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
        texture,
        format,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Maquette blanche en accès direct (cityJSON, cityGML) sur code insee
* TODO Description
*
* codeUnderscoreinsee String 
* texture Boolean 
* format String  (optional)
* returns exception
* */
const batimentsCommuneCodeInseeGET = ({ codeUnderscoreinsee, texture, format }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        codeUnderscoreinsee,
        texture,
        format,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Maquette blanche en accès direct (cityJSON, cityGML) sur Bbox
* TODO Description
*
* texture Boolean 
* bbox List  (optional)
* format String  (optional)
* returns exception
* */
const batimentsGET = ({ texture, bbox, format }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        texture,
        bbox,
        format,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Terrain en raster d'élévation non texturé
* TODO Description
*
* bbox List  (optional)
* returns File
* */
const rasterElevationBboxGET = ({ bbox }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        bbox,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Terrain en raster d'élévation non texturé
* TODO Description
*
* codeUnderscoreinsee String 
* returns File
* */
const rasterElevationCommuneCodeInseeGET = ({ codeUnderscoreinsee }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        codeUnderscoreinsee,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  batimentsBatimentIdGET,
  batimentsCommuneCodeInseeGET,
  batimentsGET,
  rasterElevationBboxGET,
  rasterElevationCommuneCodeInseeGET,
};
