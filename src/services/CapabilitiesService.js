/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* describe the feature collection with id `buildings`
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns collection
* */
const describeBuildings = ({ f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        f,
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
* the feature collections in the dataset
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns collections
* */
const getCollections = ({ f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        f,
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
* API conformance definition
* A list of all conformance classes specified in a standard that the server conforms to.
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns confClasses
* */
const getConformanceDeclaration = ({ f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        f,
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
* Landing page
* The landing page provides links to the API definition and the conformance statements for this API.
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns landingPage
* */
const getLandingPage = ({ f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        f,
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
  describeBuildings,
  getCollections,
  getConformanceDeclaration,
  getLandingPage,
};
