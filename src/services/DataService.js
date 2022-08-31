/* eslint-disable no-unused-vars */
const Service = require('./Service');
const exporter = require('../clients/impexp/exp');
const wms = require('../clients/geoserver/wms');
const postgres = require('../clients/postgres/postgres');
const uuid = require('uuid');
const fs = require('fs');
var convert = require('xml-js');
var BBox = require('bbox');
const axios = require('axios');
var dataValidator = require('./DataValidator');
const JSZip = require("jszip");

/**
* fetch buildings
* Fetch features of the feature collection with id `buildings`.  Every feature in a dataset belongs to a collection. A dataset may consist of multiple feature collections. A feature collection is often a collection of features of a similar type, based on a common schema.  Use content negotiation to request HTML or GeoJSON.
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* bbox List  (optional)
* codeInsee String (optional)
* limit Integer  (optional)
* startIndex Integer  (optional)
* texture String (optional)
*
* The following parameters are used in order to fetch buildings that appears in a database view and comply with a date-based condition.
* dbView String (optional)
* date String (optional)
* returns Buildings
* */

const getBuildings = ({ f, bbox, codeInsee, limit, startIndex, texture, dbView, date }) => new Promise(
  async (resolve, reject) => {
    bbox = dataValidator.getBBoxFromAny(bbox, codeInsee, reject);
    let sqlSelect;
    if (!!dbView) { //dbView is set in DataController.js as an extra param
      console.trace()
      sqlSelect = makeQueryString(dbView, date);
      texture='non';
    };
    try {
      let id = uuid.v4();
      let format = f === 'application/json' ? ".cityjson" : ".citygml";
      exporter.exportData(id, format, bbox, null, limit, startIndex, texture, sqlSelect).then((valeur) => {
        traitementRetourExporter(id, format, limit, startIndex, texture, reject, resolve);
      }, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          {description: "Erreur lors de l'appel de l'exporteur", code: 500},
          500
        ));
    });
    } catch (e) {
      console.log(e.message);
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de l'exporteur", code: 500},
        500
      ));
    }
  },
);
/**
* Fetch raster tile from bbox or insee code.
*
* bbox List  (optional)
* codeInsee String  (optional)
* returns File
* */
const getRaster = ({ bbox, codeInsee }) => new Promise(
  async (resolve, reject) => {
    bbox = dataValidator.getBBoxFromAny(bbox, codeInsee, reject);
    try {
      let {height, width} = dataValidator.getBBoxHeightAndWidth(bbox);
      wms.exportRasterWMS(version='1.1.0', workspace='raster', layers='mnt2018', bbox, witdh=Math.floor(width*2), height=Math.floor(height*2), srs='EPSG%3A3948', format='image%2Fgeotiff')
        .then((result) => {
          resolve(Service.fileResponse(result, 200, "image/geotiff"));
        }, (raison) => {
          reject(Service.rejectResponse(
            {description: "Erreur lors de l'appel de Geoserver", code: 500},
            500
          ));
        });
    } catch {
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de Geoserver", code: 500},
            500
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
* texture String (optional) if 'oui', the return file will be zipped
* returns Buildings
* */
const getbuildingById = ({ buildingID, f, texture }) => new Promise(
  async (resolve, reject) => {
    try {
      let id = uuid.v4();
      let format = f === 'application/json' ? ".cityjson" : ".citygml";
      exporter.exportData(id, format, null, buildingID, null, null, texture).then((valeur) => {
        traitementRetourExporter(id, format, null, null, texture, reject, resolve);
      }, (raison) => {
        reject(Service.rejectResponse(
          {description: "Erreur lors de l'appel de l'exporteur", code: 500},
          500
        ));
    });
    } catch (e) {
      console.log(e.message);
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de l'exporteur", code: 500},
        500
      ));
    }
  },
);

/**
 * Fetch buildings that were deleted from a given date
 * Deleted building ID are stored in a specific schema (without geo attributes and textures)
 * 
 */
const getDeletedBuildings = ({ codeInsee, limit, startIndex, date }) => new Promise(
  async (resolve, reject) => {
    try {
      let query = `SELECT bati_id, TO_CHAR(date_ope, 'yyyy-mm-dd') AS date FROM ${process.env.DB_SCHEMA_EVOLUTION}.${process.env.DB_VIEW_DELETED_BUILDINGS}`
      if (!!date & !!codeInsee) {
        query = query + ` WHERE (LEFT(bati_id,5) LIKE '${codeInsee}') AND (date_ope BETWEEN '${date}' AND now())`
      } else if (!!codeInsee) {
        query = query + ` WHERE LEFT(bati_id,5) LIKE '${codeInsee}'`
      } else if (!!date) {
        query = query + date_ope ` WHERE date_ope BETWEEN '${date}' AND now()`
      }
      query = query + ' ORDER BY date_ope DESC'
      query = query + ` LIMIT ${!!limit?limit:process.env.PG_ROWS_LIMIT}`
      if (!!startIndex) query = query + ` OFFSET ${startIndex}`
      console.log(query)
      postgres.pgQuery(query).then((result) => {traitementRetourPG(result, id=0, limit, startIndex, reject, resolve)}, (raison) => {
        console.log(raison);
        reject(Service.rejectResponse(
          {description: "Erreur lors de l'appel de pg", code: 500},
          500
        ));
    })
    } catch (e) {
      console.log(e.message);
      reject(Service.rejectResponse(
        {description: "Erreur lors de l'appel de pg", code: 500},
        500
      ));
    }
  },
);

const makeQueryString = (dbView, date) => {
  subQuery = `SELECT bati_id FROM ${process.env.DB_SCHEMA_EVOLUTION}.${dbView}`;
  if (!!date) subQuery = subQuery + ` WHERE date_ope BETWEEN '${date}' AND now()`;
  return `"SELECT cityobject_id FROM cityobject_genericattrib WHERE gmlid in (${subQuery})"`; //les quotes sont chelou là
};

async function traitementRetourPG(result, id, limit, startIndex, reject, resolve) {
  try{
    if(!result.rowCount){
      reject(Service.rejectResponse(
          { description: 'Aucun résultat', code: 404},
          404
      ));
    }
    json = JSON.parse(JSON.stringify(result.rows))
    resolve(Service.successResponse(json));
  } catch {
    reject(Service.rejectResponse(
      {description: "Erreur lors de l'appel de pg", code: 500},
      500
    ));
  }
}

async function traitementRetourExporter(id, format, limit, startIndex, texture, reject, resolve) {
  try{
    let fileExtention = texture === 'oui' ? '.zip' : format;
    let data = await new JSZip.external.Promise(function (resolve, reject) {
      fs.readFile(process.env['EXPORTER_SAVE_PATH'] + id + fileExtention, function(err, data) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
    });
    if (texture === 'oui') {
      let zip = await JSZip.loadAsync(data);
      let file = await zip.file(id + `.${format.slice(5)}`).async("string");
      if (format === '.cityjson') {
        let parsed = await JSON.parse(file);
        let size = Object.keys(parsed.CityObjects).length;
        if (size === 0) {
          reject(Service.rejectResponse(
            { description: 'Aucun résultat', code: 404},
            404
          ));
        }
      } else {
        if(!JSON.parse(convert.xml2json(file,{compact: true}))['CityModel']['cityObjectMember']){
          reject(Service.rejectResponse(
            { description: 'Aucun résultat', code: 404},
            404
          ));
        }
      }
      resolve(Service.fileResponse(data, 200, 'application/zip'));
    } else {
      let file = fs.readFileSync(process.env['EXPORTER_SAVE_PATH'] + id + format, 'utf8');
      fs.unlinkSync(process.env['EXPORTER_SAVE_PATH'] + id + format);
      if (format === '.cityjson') {
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
      }
      resolve(Service.successResponse(file));
    }
  } catch {
    reject(Service.rejectResponse(
      {description: "Erreur lors de l'appel de l'exporteur", code: 500},
      500
    ));
  }
}; 

module.exports = {
  getBuildings,
  getRaster,
  getbuildingById,
  getDeletedBuildings,
};