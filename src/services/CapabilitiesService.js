/* eslint-disable no-unused-vars */
const Service = require('./Service');
var os = require("os");
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
        "links": [
          {
            "href": "/collections/buildings?f=application%2Fjson",
            "rel": "self",
            "type": "application/json",
            "title": "Buildings"
          },
          {
            "href": "/collections/buildings?f=application%2Fgml%2Bxml%3Bversion%3D3.2",
            "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
            "type": "application/gml+xml;version=3.2",
            "title": "Buildings"
          },
          {
            "href": "/collections/buildings/items?f=application%2Fjson",
            "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
            "type": "application/json",
            "title": "Buildings"
          },
          {
            "href": "/collections/buildings/items?f=application%2Fgml%2Bxml%3Bversion%3D3.2",
            "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
            "type": "application/gml+xml;version=3.2",
            "title": "Buildings"
          }
        ],
        "id": "buildings",
        "title": "Buildings",
        "description": "Fetch buildings",
        "crs": [
          "http://www.opengis.net/def/crs/EPSG/0/3948"
        ],
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
* describe the feature collection with id `mnt2018`
*
* f String The optional f parameter indicates the output format that the server shall provide as part of the response document.  The default format is JSON. (optional)
* returns collection
* */
const describeMnt2018 = ({ f }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        "links": [
          {
            "href": "/collections/mnt2018?f=application%2Fjson",
            "rel": "self",
            "type": "application/json",
            "title": "Buildings"
          },
          {
            "href": "/collections/mnt2018/coverage",
            "rel": "http://www.opengis.net/def/rel/ogc/1.0/coverage",
            "type": "image/tiff;application=geotiff",
            "title": "mnt2018"
          }
        ],
        "id": "mnt2018",
        "title": "mnt2018",
        "description": "Fetch mnt2018",
        "crs": [
          "http://www.opengis.net/def/crs/EPSG/0/3948"
        ],
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
        "links": [{
          "rel": "data",
          "type": "application/json",
          "title": "The JSON representation of the list of all data collections served from this endpoint",
          "href": "/collections?f=application%2Fjson"
        }],
        "collections": [
          {
            "id": "buildings",
            "title": "Buildings",
            "description": "Fetch buildings",
            "links": [
              {
                "href": "/collections/buildings?f=application%2Fjson",
                "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
                "type": "application/json",
                "title": "Buildings"
              },
              {
                "href": "/collections/buildings?f=application%2Fgml%2Bxml%3Bversion%3D3.2",
                "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
                "type": "application/gml+xml;version=3.2",
                "title": "Buildings"
              },
              {
                "href": "/collections/buildings/items?f=application%2Fjson",
                "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
                "type": "application/json",
                "title": "Buildings"
              },
              {
                "href": "/collections/buildings/items?f=application%2Fgml%2Bxml%3Bversion%3D3.2",
                "rel": "http://www.opengis.net/def/rel/ogc/1.0/collection",
                "type": "application/gml+xml;version=3.2",
                "title": "Buildings"
              }
            ]
          }, {
            "id": "mnt2018",
            "title": "mnt2018",
            "description": "Fetch mnt2018",
            "links": [
              {
                "href": "/collections/mnt2018/coverage",
                "rel": "http://www.opengis.net/def/rel/ogc/1.0/coverage",
                "type": "image/tiff;application=geotiff",
                "title": "mnt2018"
              }
            ]
          }
        ]
      }
      ));
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
        "conformsTo": [
          "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core",
          "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/landingPage",
          "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/oas30",
          "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/html",
          "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/json"
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
        "links": [
          {
            "rel": "self",
            "href": "/api-docs/",
            "type": "text/html",
            "title": "API Documentation"
          },
          {
            "rel": "conformance",
            "type": "application/json",
            "title": "The JSON representation of the conformance declaration for this server listing the requirement classes implemented by this server",
            "href": "/conformance?f=application%2Fjson"
          },{
            "rel": "data",
            "type": "application/json",
            "title": "The JSON representation of the list of all data collections served from this endpoint",
            "href": "/collections?f=application%2Fjson"
          },
        ],
        "title": "API 3D Landing page"
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
  describeMnt2018,
  getCollections,
  getConformanceDeclaration,
  getLandingPage,
};
