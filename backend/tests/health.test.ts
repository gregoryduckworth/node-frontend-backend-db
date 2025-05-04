import request from "supertest";
import app from "../src/app";

describe("Health Check Endpoint", () => {
  it("should return a 200 status and a message", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("OK");
  });
});
