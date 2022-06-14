/* eslint-disable no-unused-vars */
const Service = require('./Service');
const exporter = require('../clients/impexp/exp');
const uuid = require('uuid');
const fs = require('fs');
/**
* fetch buildings
* Fetch features of the feature collection with id `buildings`.  Every feature in a dataset belongs to a collection. A dataset may consist of multiple feature collections. A feature collection is often a collection of features of a similar type, based on a common schema.  Use content negotiation to request HTML or GeoJSON.
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* bbox List  (optional)
* limit Integer  (optional)
* startIndex Integer  (optional)
* returns Buildings
* */
const getBuildings = ({ f, bbox, limit, startIndex }) => new Promise(
  async (resolve, reject) => {
    try {
      let format = f === 'application/json' ? ".json" : ".citygml";
      let id = uuid.v4();
      exporter.exportData(id,format,bbox,null,limit,startIndex).then((valeur) => {
        let result;
        if (format === '.json'){
          result = JSON.parse(fs.readFileSync(__dirname+"/../../"+id+format, 'utf8'));
        }else {
          result = fs.readFileSync(__dirname+"/../../"+id+format, 'utf8');
        }
        resolve(Service.successResponse(result));
      }, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          e.message || 'Invalid input',
          e.status || 405,
        ));
    });
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* fetch raster tile from bbox or insee code
* Fetch raster tile from bbox or insee code.
*
* bbox List  (optional)
* codeInsee String  (optional)
* returns File
* */
const getRaster = ({ bbox, codeInsee }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        bbox,
        codeInsee,
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
* fetch a single building from his id
* Fetch the feature with id `featureId` in the feature collection with id `batiments`.  Use content negotiation to request HTML or GeoJSON.
*
* buildingID String local identifier of a building
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns Buildings
* */
const getbuildingById = ({ buildingID, f }) => new Promise(
  async (resolve, reject) => {
    try {
      let format = f === 'application/json' ? ".json" : ".citygml";
      let id = uuid.v4();
      exporter.exportData(id,format,null, buildingID, null,null).then((valeur) => {
        let result;
        if (format === '.json'){
          result = JSON.parse(fs.readFileSync(__dirname+"/../../"+id+format, 'utf8'));
        }else {
          result = fs.readFileSync(__dirname+"/../../"+id+format, 'utf8');
        }
        resolve(Service.successResponse(result));
      }, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          e.message || 'Invalid input',
          e.status || 405,
        ));
    });
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  getBuildings,
  getRaster,
  getbuildingById,
};
