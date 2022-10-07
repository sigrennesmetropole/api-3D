/**
 * The DataController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DataService');
//const config = require('../config');

const getBuildings = async (request, response) => {
  await Controller.handleRequest(request, response, service.getBuildings);
};

const getRaster = async (request, response) => {
  await Controller.handleRequest(request, response, service.getRaster);
};

const getbuildingById = async (request, response) => {
  await Controller.handleRequest(request, response, service.getbuildingById);
};

const getAddedBuildings = async (request, response) => {
  await Controller.handleRequest(request, response, service.getBuildings, {'dbView': process.env.DB_VIEW_ADDED_BUILDINGS});
};

const getDeletedBuildings = async (request, response) => {
  await Controller.handleRequest(request, response, service.getDeletedBuildings);
};

const getModifiedBuildings = async (request, response) => {
  await Controller.handleRequest(request, response, service.getBuildings, {'dbView': process.env.DB_VIEW_MODIFIED_BUILDINGS});
};

const getVegetation = async (request, response) => {
  await Controller.handleRequest(request, response, service.getFeaturesfromWFS, {'typeName': 'pnat_hab:arbres'});
};



module.exports = {
  getBuildings,
  getRaster,
  getbuildingById,
  getAddedBuildings,
  getDeletedBuildings,
  getModifiedBuildings,
  getVegetation
};
