const ExpressServer = require('../expressServer');
const supertest = require("supertest");
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { serve } = require('swagger-ui-express');
let server, request;
beforeAll(() => {
    server = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    request = supertest( server.app);
    server.launch();
});

afterAll(() => {
    server.close();
});

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
        expect(response.text).toBe(fs.readFileSync(path.join(__dirname, '..'+path.sep+'api', 'openapi.yaml'), 'utf8'));
    })
});

describe("/", () => {
    it("should return a response", async () => {
        const response = await request.get("/")
        expect(response.status).toBe(200)
        expect(response.text).toBe(`{"f":"json"}`)
    })
});

describe("/conformance", () => {
    it("should return a response", async () => {
        const response = await request.get("/conformance")
        expect(response.status).toBe(200)
        expect(response.text).toBe(`{"f":"json"}`)
    })
});

describe("/collections", () => {
    it("should return a response", async () => {
        const response = await request.get("/collections")
        expect(response.status).toBe(200)
        expect(response.text).toBe(`{}`)
    })
});