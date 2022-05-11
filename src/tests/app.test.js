const ExpressServer = require('../expressServer');
const supertest = require("supertest");
const config = require('../config');
const fs = require('fs');
const path = require('path');
const request = supertest( new ExpressServer(config.URL_PORT, config.OPENAPI_YAML).app);

describe("/hello", () => {
    it("should return a response", async () => {
        const response = await request.get("/hello")
        expect(response.status).toBe(200)
        expect(response.text).toBe(`Hello World. path: ${ config.OPENAPI_YAML}`);
    })
});

describe("/openapi", () => {
    it("should return a response", async () => {
        const response = await request.get("/openapi")
        expect(response.status).toBe(200)
        expect(response.text).toBe(fs.readFileSync(path.join(__dirname, '..\\api', 'openapi.yaml'), 'utf8'));
    })
});