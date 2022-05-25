/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* describe the feature collection with id `collectionId`
*
* collectionId String local identifier of a collection
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns collection
* */
const describeCollection = ({ collectionId, f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        collectionId,
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
        "title": "RENNES METROPOLE - API 3D",
        "description": "string",
        "links": [
          {
            "href": "http://localhost:8080/",
            "rel": f == "application/json" ? "self" : "alternate",
            "type": "application/json",
            "title": "This document"+ f == "application/json" ? " as application/json" : ""
          },{
            "href": "http://localhost:8080/?f=text%2Fhtml",
            "rel": f == "text/html" ? "self" : "alternate",
            "type": "text/html",
            "title": "This document"+f == "text/html" ? " as text/html" : ""
          },
          {
            "href": "http://localhost:8080/conformance?f=application%2Fjson",
            "rel": "conformance",
            "type": "application/json",
            "title": "Conformance declaration as application/json"
          },
          {
            "href": "http://localhost:8080/conformance?f=text%2Fhtml",
            "rel": "conformance",
            "type": "text/html",
            "title": "Conformance declaration as text/html"
          },
          {
            "href": "http://localhost:8080/collections?f=application%2Fjson",
            "rel": "data",
            "type": "application/json",
            "title": "Collections Metadata as application/json"
          },
          {
            "href": "http://localhost:8080/collections?f=text%2Fhtml",
            "rel": "data",
            "type": "text/html",
            "title": "Collections Metadata as text/html"
          },
          {
            "href": "http://localhost:8080/openapi",
            "rel": "service-desc",
            "type": "application/x-yaml",
            "title": "API definition for this endpoint as application/x-yaml"
          },
          {
            "href": "http://localhost:8080/api-docs",
            "rel": "service-doc",
            "type": "text/html",
            "title": "API definition for this endpoint as text/html"
          }
        ]
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
  describeCollection,
  getCollections,
  getConformanceDeclaration,
  getLandingPage,
};
