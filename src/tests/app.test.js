const app = require("../index")
const supertest = require("supertest")
const request = supertest(app)

describe("/hello", () => {
    it("should return a response", async () => {
        const response = await request.get("/hello")
        expect(response.status).toBe(200)
        expect(response.text).toBe(`Hello World. path: ${this.openApiPath}`);
    })
})