/* eslint-disable no-unused-vars */
const Service = require('./Service');
const exporter = require('../clients/impexp/exp');
const wms = require('../clients/geoserver/wms');
const uuid = require('uuid');
const fs = require('fs');
var convert = require('xml-js');
var BBox = require('bbox');
const axios = require('axios');
var dataValidator = require('./DataValidator');
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
const getBuildings = ({ f, bbox, codeInsee, limit, startIndex, texture }) => new Promise(
  async (resolve, reject) => {
    if (!!codeInsee & !!bbox){
      reject(Service.rejectResponse(
        {description: "Invalid input : <bbox> and <code insee> are mutully exclusive", code: 400},
        400,
      ));
      return;
    }
    if (!!bbox){
      dataValidator.isBBoxLessThan10km2ElseReject(bbox, reject);
    } else if (!!codeInsee){
      bbox = dataValidator.getBBoxFromCodeInseeElseReject(codeInsee, reject);
    } else {
      bbox = [1330000, 7203000, 1368000, 7246000];
    }
    try {
      let id = uuid.v4();
      let format = f === 'application/json' ? ".json" : ".citygml";
      exporter.exportData(id, format, bbox, null, limit, startIndex, texture).then((valeur) => {
        traitementRetourExporter(id, format, limit, startIndex, reject, resolve);
      }, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          {description: "Erreur lors de l'appel de l'exporteur", code: 500},
          500,
        ));
    });
    } catch (e) {
      console.log(e.message);
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de l'exporteur", code: 500},
        500,
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
    if (!!codeInsee & !!bbox){
        reject(Service.rejectResponse(
          {description: "Invalid input : <bbox> and <code insee> are mutully exclusive", code: 400},
          400,
        ));
        return;
    }
    if (!!bbox){
      dataValidator.isBBoxLessThan10km2ElseReject(bbox, reject);
    } else if (!!codeInsee){
      bbox = dataValidator.getBBoxFromCodeInseeElseReject(codeInsee, reject);
    } else {
      bbox = [1330000, 7203000, 1368000, 7246000];
    }
    try {
      let {height, width} = dataValidator.getBBoxHeightAndWidth(bbox);3948
      wms.exportRasterWMS(version='1.1.0', workspace='raster', layers='mnt2018', bbox, witdh=Math.floor(width*2), height=Math.floor(height*2), srs='EPSG%3A3948', format='image%2Fgeotiff')
        .then((result) => {
          resolve(Service.fileResponse(result, 200, "image/geotiff"));
        }, (raison) => {
          reject(Service.rejectResponse(
            {description: "Erreur lors de l'appel de Geoserver", code: 500},
            500,
          ));
        });
    } catch {
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de Geoserver", code: 500},
            500,
      ));
    }
  }
);
/**
* fetch a single building from his id
* Fetch the feature with id `featureId` in the feature collection with id `batiments`.  Use content negotiation to request HTML or GeoJSON.
*
* buildingID String local identifier of a building
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns Buildings
* */
const getbuildingById = ({ buildingID, f, texture }) => new Promise(
  async (resolve, reject) => {
    console.log(texture)
    try {
      let id = uuid.v4();
      let format = f === 'application/json' ? ".json" : ".citygml";
      exporter.exportData(id, format, null, buildingID, null,null, texture).then((valeur) => {
        traitementRetourExporter(id, format, null, null, reject, resolve);
      }, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          {description: "Erreur lors de l'appel de l'exporteur", code: 500},
          500,
        ));
    });
    } catch (e) {
      console.log(e.message);
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de l'exporteur", code: 500},
        500,
      ));
    }
  },
);

function traitementRetourExporter(id, format, limit, startIndex, reject, resolve) {
  let file = fs.readFileSync(process.env['EXPORTER_SAVE_PATH'] + id + format, 'utf8');
  fs.unlinkSync(process.env['EXPORTER_SAVE_PATH'] + id + format);
  if (format === '.json') {
    let json = JSON.parse(file);
    let size = Object.keys(json.CityObjects).length;
    if (size === 0) {
      reject(Service.rejectResponse(
        { description: 'Aucun résultat', code: 404},
        404
      ));
    }
    resolve(Service.successResponse(json));
  } else {
    if(!JSON.parse(convert.xml2json(file,{compact: true}))['CityModel']['cityObjectMember']){
      reject(Service.rejectResponse(
        { description: 'Aucun résultat', code: 404},
        404
      ));
    }
    resolve(Service.successResponse(file));
  }
}

module.exports = {
  getBuildings,
  getRaster,
  getbuildingById,
};