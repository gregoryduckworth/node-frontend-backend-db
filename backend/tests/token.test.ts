import request from "supertest";
import app from "../src/app";

describe("Token Endpoint", () => {
  describe("GET /token", () => {
    it("should return 204 if no refresh token cookie is present", async () => {
      const res = await request(app).get("/token");
      expect(res.status).toBe(204);
    });
  });
});
