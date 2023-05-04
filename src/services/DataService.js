/* eslint-disable no-unused-vars */
const Service = require('./Service');
const exporter = require('../clients/impexp/exp');
const wfs = require('../clients/geoserver/wfs');
const postgres = require('../clients/postgres/postgres');
const uuid = require('uuid');
const fs = require('fs');
var convert = require('xml-js');
var BBox = require('bbox');
const axios = require('axios');
var dataValidator = require('./DataValidator');
const JSZip = require("jszip");
const StreamZip = require('node-stream-zip');

const path = require('path');
const config = require('../config');
const logger = require('../logger');
const admz = require('adm-zip')

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

const getBuildings = ({ f, bbox, codeInsee, limit, startIndex, texture, dbView, date}) => new Promise(
  async (resolve, reject) => {
    let sqlSelect;
    if (!!dbView) {
      sqlSelect = makeQueryString(dbView, date, codeInsee)
      texture = 'non';
    } else if (!!bbox & !!!codeInsee){
      bbox  = bbox.split(',');
      dataValidator.isBBoxLessThanMaxSizeElseReject(bbox, reject);
    } else if (!!!bbox & !!codeInsee) {
      dataValidator.getCommuneDataElseReject(codeInsee, reject);
      sqlSelect = makeQueryString(false, false, codeInsee)
    } else {
      reject(Service.rejectResponse(
        {description: "Invalid input : <bbox> or <code insee> must be set", code: 400},
        400
      ));
    }
    try {
      let id = uuid.v4();
      let format = f === 'application/json' ? ".cityjson" : ".citygml";
      logger.info('Export des données');
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
const getRaster = ({ bbox }) => new Promise(
  async (resolve, reject) => {
    bbox = dataValidator.getBBoxFromAny(bbox, reject);
    try {
      let {height, width} = dataValidator.getBBoxHeightAndWidth(bbox);
      wfs.exportRasterWFS(version='1.0.0', layers='mnt2018', bbox, witdh=Math.floor(width*2), height=Math.floor(height*2), crs='EPSG:3948', format='image/geotiff')
        .then((result) => {
          resolve(Service.fileResponse(result, 200, "image/geotiff"));
        }, (raison) => {
          console.log(raison);
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
* fetch features from WFS service
*
* bbox List  (optional)
* codeInsee String  (optional)
* returns json
* */
const getFeaturesfromWFS = ({ typeName, bbox }) => new Promise(

  async (resolve, reject) => {
    bbox = dataValidator.getBBoxFromAny(bbox, reject); //a verifier si c'est la bonne chose à faire
    try {
      wfs.exportVectorWFS(version='1.1.0', typeName, bbox, srs='EPSG%3A3948', f='application%2Fjson')
      .then((result) => {
          resolve(Service.fileResponse(result, 200, 'application/json'));
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
        query += ` WHERE (LEFT(bati_id,5) LIKE '${codeInsee}') AND (date_ope BETWEEN '${date}' AND now())`
      } else if (!!codeInsee) {
        query += ` WHERE LEFT(bati_id,5) LIKE '${codeInsee}'`
      } else if (!!date) {
        query += ` WHERE date_ope BETWEEN '${date}' AND now()`
      }
      query += ' ORDER BY date_ope DESC'
      query +=  ` LIMIT ${!!limit?limit:process.env.PG_ROWS_LIMIT}`
      if (!!startIndex) query += ` OFFSET ${startIndex}`
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

const makeQueryString = (dbView, date, codeInsee) => {
  let requete  = `"SELECT cityobject_id FROM citydb.cityobject_genericattrib WHERE attrname='BUILDINGID'`;
  if (!!dbView) {
    requete += ` and strval IN (SELECT bati_id FROM ${process.env.DB_SCHEMA_EVOLUTION}.${dbView}`;
    let where = false;
    if(!!codeInsee){
      requete += " WHERE ";
      where = true;
      requete += "bati_id like '" + codeInsee + "_%'";
    }
    if(!!date){
      if(where){
        requete += " AND ";
      }else{
        requete += " WHERE ";
        where = true;
      }
      requete += "(date_ope BETWEEN '"+date+"' AND now())";
    }
    requete += ')"';
    return requete;
  }
  if (!!codeInsee) {
    return `"SELECT cityobject_id FROM citydb.cityobject_genericattrib WHERE attrname='BUILDINGID' and strval LIKE '${codeInsee}_%'"`;
  }
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
  logger.info('Début du traitement après export : ' + id + format);
  let fileExtention = texture === 'oui' ? '.zip' : format;
  try{
    if (texture === 'oui') {
      let _tailleFichier = fs.statSync(process.env['EXPORTER_SAVE_PATH'] + id + fileExtention)["size"];
      if ((_tailleFichier) > process.env['DOWNLD_LIMITSIZE_MO'] * 1000000) { // si taille fichier > 500 M0, on dépose le fichier dans un dossier path.join(__dirname, 'files', 'dwnldtmp')
        try{
          let sourceFile = id + fileExtention;
          let date = new Date();
          let month = (date.getMonth()+1).toString().length === 1 ? '0' + (date.getMonth()+1).toString() : (date.getMonth()+1).toString();
          let day = (date.getDate()).toString().length === 1 ? '0' + (date.getDate()).toString() : (date.getDate()).toString();
          let hours = (date.getHours()).toString().length === 1 ? '0' + (date.getHours()).toString() : (date.getHours()).toString();
          let minutes = (date.getMinutes()).toString().length === 1 ? '0' + (date.getMinutes()).toString() : (date.getMinutes()).toString();
          let seconds = (date.getSeconds()).toString().length === 1 ? '0' + (date.getSeconds()).toString() : (date.getSeconds()).toString();
          let horodatage = date.getFullYear().toString()+ month + day + hours + minutes + seconds + date.getMilliseconds().toString();
          let destFile =  horodatage + '_buildings_' + format.replace(".city", "") + fileExtention;
          let destfolder = path.join(process.env['DOWNLD_PATH'], process.env['DOWNLD_FOLDERNAME']);
          
          if (!fs.existsSync(destfolder)) {
            logger.info('Creation du dossier : ' + destfolder);
            await fs.mkdirSync(destfolder);
          }
          fs.copyFile(process.env['EXPORTER_SAVE_PATH'] + sourceFile, path.join(destfolder,destFile), fs.constants.COPYFILE_FICLONE, (err) => {
            if (err) {
              reject(Service.rejectResponse(
                { description: 'Erreur Copie du fichier exporté', code: 404},
                404
              ));
            } 
          });

          let url =  process.env['DOWNLD_URL'] + "/" + process.env['DOWNLD_FOLDERNAME'] + '/' + destFile;
          let refTime = new Date(date.getTime() + process.env['DOWNLD_RETENTION_MIN'] * 60 * 1000);

          let data = {
            commentaire : "Le résultat de votre recherche est trop lourd pour vous être fourni directement. Vous pouvez le télécharger à l'adresse ci-après jusqu'au "+ refTime.toLocaleDateString() + " à " + refTime.toLocaleTimeString() +".",
            url : url
          }
          logger.info('Fin du traitement après export : ' + id + fileExtention);
          resolve(Service.successResponse({
                data : JSON.stringify(data),
                type : 'json'
              }));
        } catch (e) {
          logger.info(e);
        }
      } else {
        // data = fichier à retourner
        let data = await new JSZip.external.Promise(function (resolve, reject) {
        // lecture du fichier zip
        fs.readFile(process.env['EXPORTER_SAVE_PATH'] + id + fileExtention, function(err, data) { 
              if (err) {
                  reject(err);
              } else {
                  resolve(data);
              }
          });
        });
        
        // stzip = lecture stream du fichier principal de l'archive pour controle du contenu
        const stzip = new StreamZip.async({ file: process.env['EXPORTER_SAVE_PATH'] + id + fileExtention });
        let file = '';
        let stream = await stzip.stream(id + `.${format.slice(5)}`);
        let atleastoneresult = false;
        for await(const _data of stream) {
          if (!atleastoneresult && (_data.indexOf('cityObjectMember') > 0 || _data.indexOf('BUILDINGID') > 0) ){
            atleastoneresult = true;
          }
          file += _data;
        }
        
        if (!atleastoneresult) {
          await stzip.close();
          reject(Service.rejectResponse(
            { description: 'Aucun résultat', code: 404},
            404
          ));
        }
        logger.info('Fin du traitement après export : ' + id + fileExtention);
        resolve(Service.fileResponse(data, 200, 'application/zip'));
        stzip.close();
      }
    } 
    else { // FICHIER UNIQUE SANS TEXTURE
      let _tailleFichier = fs.statSync(process.env['EXPORTER_SAVE_PATH'] + id + format)["size"];
      if ((_tailleFichier) > process.env['DOWNLD_LIMITSIZE_MO'] * 1000000) { // si taille fichier > 500 M0 on crée une archive 
        const zp = new admz();
        zp.addLocalFile(process.env['EXPORTER_SAVE_PATH'] + id + format);
        zp.getEntries()[0].entryName="buildings"+ `.${format.slice(5)}`;
        
        const data = zp.toBuffer();
        logger.info('Fin du traitement après export ' + id + format);
        resolve(Service.fileResponse(data, 200, 'application/zip'));
      } else {
        let string = '';
        let stream = fs.createReadStream(process.env['EXPORTER_SAVE_PATH'] + id + format, 'utf8');
        let atleastoneresult = false;
        for await(const _data of stream) {
          if (!atleastoneresult && (_data.indexOf('cityObjectMember') > 0 || _data.indexOf('BUILDINGID') > 0) ){
            atleastoneresult = true;
          }
          string += _data;
        }
        if(!atleastoneresult){
          reject(Service.rejectResponse(
            { description: 'Aucun résultat', code: 404},
            404
          ));
        }

        let file = {
            type : format === '.cityjson'?'json':'gml',
            data : string
          };

        logger.info('Fin du traitement après export : ' + id + format);
        resolve(Service.successResponse(file));
      } 
    }
  } catch (error) {
    logger.error("Erreur du traitement après export");
    reject(Service.rejectResponse(
      {description: "Erreur lors du controle de l'export des données", code: 500},
      500
    ));
  } finally {
    fs.unlinkSync(process.env['EXPORTER_SAVE_PATH'] + id + fileExtention);
  }
}; 




module.exports = {
  getBuildings,
  getRaster,
  getbuildingById,
  getDeletedBuildings,
  getFeaturesfromWFS
};