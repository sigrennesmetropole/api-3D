// const { Middleware } = require('swagger-express-middleware');
const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { OpenApiValidator } = require('express-openapi-validator');
const { info } = require('console');
const logger = require('./logger');
const config = require('./config');
const metadata = require('./clients/metadata/metadata');
const customParam = require('./customParameters.js');
const { response } = require('express');

class ExpressServer {
  constructor(port, openApiYaml) {
    this.port = port;
    this.app = express();
    this.app.set('view engine', 'ejs');
    this.openApiPath = openApiYaml;
    try {
      this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
    } catch (e) {
      logger.error('failed to start Express Server', e.message);
    }
    this.setupMiddleware();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '14MB' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static('public'));
    // Simple test to see that the server is up and responding
    this.app.get('/hello', (req, res) => res.send(`Hello World. path: ${this.openApiPath}`));
    // Send the openapi document *AS GENERATED BY THE GENERATOR*
    this.app.get('/openapi', (req, res) => res.sendFile((path.join(__dirname, 'api', 'openapi.yaml'))));

    // View the openapi document in a visual interface. Should be able to test from this page
    //this.app.use('/api/api-docs', swaggerUI.serve, swaggerUI.setup(this.schema));
    //this.app.use('/api/api-docs', swaggerUI.serveFiles(this.schema, {}), swaggerUI.setup(this.schema));
    // swagger file that serve a WSO2 GUI (API Manager)
    if (process.env.APIM_FILE != undefined) {
      const apim_file = path.join(config.ROOT_DIR, 'api', process.env.APIM_FILE);
      const jsonapim = jsYaml.safeLoad(fs.readFileSync(apim_file));
      
      this.app.use('/api/api-docs', swaggerUI.serveFiles(jsonapim, {

        swaggerOptions: {
          /*
          requestInterceptor: function (req) { 
            // this function is run on client side and cannot reach server-side variables such as APIMPUBLICKEY
            if (req.headers['apiKey'] == undefined && req.headers['Authorization'] == undefined ){
              //TODO : externaliser la clé publique
              req.headers['apiKey'] = 'eyJ4NXQiOiJNREJsTTJRMVltRTRaREZrTldReE4yVTJZVEJpTkRreU5EUmxaV0l4TXpGak9ESXlNalF3TWc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhcHBtYW5hZ2VyQGNhcmJvbi5zdXBlciIsImFwcGxpY2F0aW9uIjp7Im93bmVyIjoiYXBwbWFuYWdlciIsInRpZXJRdW90YVR5cGUiOm51bGwsInRpZXIiOiI1MFBlck1pbiIsIm5hbWUiOiJwdWJsaXF1ZSIsImlkIjoxNDEsInV1aWQiOiJhYjU2NzA1Yi05M2RjLTQzYjEtOTQyMC1lZDJmYzUxOGQxZGQifSwiaXNzIjoiaHR0cHM6XC9cL2FwaW1hbmFnZXIuc2kucmVubmVzLmZyXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiUHVibGlxdWVfZmFpYmxlIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOiJzZWMifX0sImtleXR5cGUiOiJQUk9EVUNUSU9OIiwicGVybWl0dGVkUmVmZXJlciI6IiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IjNkIiwiY29udGV4dCI6IlwvM2RcL3YxIiwicHVibGlzaGVyIjoiZy50YXNzZXQiLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiUHVibGlxdWVfZmFpYmxlIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IjNkLXRlc3QiLCJjb250ZXh0IjoiXC8zZC10ZXN0XC92MSIsInB1Ymxpc2hlciI6ImcudGFzc2V0IiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IlB1YmxpcXVlX2ZhaWJsZSJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJydmF0ZXN0IiwiY29udGV4dCI6IlwvcnZhLXRlc3RcL3YyIiwicHVibGlzaGVyIjoiZy50YXNzZXQiLCJ2ZXJzaW9uIjoidjIiLCJzdWJzY3JpcHRpb25UaWVyIjoiUHVibGlxdWVfZmFpYmxlIn1dLCJ0b2tlbl90eXBlIjoiYXBpS2V5IiwicGVybWl0dGVkSVAiOiIiLCJpYXQiOjE2NzU0MzMzOTIsImp0aSI6IjA2NzEyMWIxLWQ3NjItNDU4Ny04YzQ2LTJlMmEwMmQwZDc3OCJ9.JnDoqBRz39NvSAYJKgjlQI2-eItm95FYf_5yOk5LEwy9C8CNPHnv7oS3OR1x7lH4mCmll1X7czwIX21jsjRR7zD-HNzJlNOkishlxUWOETfaPJk4DVQoDBxvQTmvvdhdm4euE10wdSULzClc3fqRMO9Ocfx5pgX3xPK6Bv_hpghd7lekd91Q2KqcjfBaDp_aN6XlAQqF7j0O15yvtNVGrtbDPovRHLWxrNABX-HPZ7QwQaZxhFnKBohB4uys-eivsFR4-WeGHjs3-iW_hFqXXmOvr7zhWlJWSD7E7jnMF8hgBrLI8Oe2ZTKOfibf6itXwbQxuIai6owV3PQNecnA-w=="';
            }
              return req;
          }, 
          */ 
         /*  
          responseInterceptor: function (res) {  
            console.log(res.headers);
            return res;
          }     
          */
        }
       
      }), swaggerUI.setup(jsonapim));
    } else {
      this.app.use('/api/api-docs', swaggerUI.serve, swaggerUI.setup(this.schema));
    }

    customParam.init();

    this.app.get('/login-redirect', (req, res) => {
      res.status(200);
      res.json(req.query);
    });
    this.app.get('/oauth2-redirect.html', (req, res) => {
      res.status(200);
      res.json(req.query);
    });

    for (const uuid of process.env.FILES_IDS.split(',')) {
      this.app.get(`/files/${uuid}`, (req, res) => {
        logger.info(`Téléchargement du fichier ${process.env[uuid]}`);
        res.download((path.join(__dirname, 'files', process.env[uuid])), process.env[uuid]);
      });
    }
    this.app.get('/', (req, res) => {
      const data = metadata.getMetadata().then((result) => {
        // ajout de paramètres complémentaires
        const customConf = customParam.getCustomProp();
        if (customConf != 'undefined') {
          result.custom = customConf;
        }
        res.render(path.join(__dirname, 'templates/telechargement'), result);
      });
    });
  }

  launch() {
    new OpenApiValidator({
      apiSpec: this.openApiPath,
      operationHandlers: path.join(__dirname),
      fileUploader: { dest: config.FILE_UPLOAD_PATH },
    }).install(this.app)
      .catch((e) => console.log(e))
      .then(() => {
        this.app.use((err, req, res, next) => {
          res.status(err.status || 500).json({
            message: err.message || err,
            errors: err.errors || '',
          });
        });
        const server = http.createServer(this.app).listen(this.port);
        server.setTimeout(40 * 60 * 1000);
        console.log(`Listening on port ${this.port}`);
      });
  }

  async close() {
    if (this.server !== undefined) {
      await this.server.close();
      console.log(`Server on port ${this.port} shut down`);
    }
  }

}

module.exports = ExpressServer;
