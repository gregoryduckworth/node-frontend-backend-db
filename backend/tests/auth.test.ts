import request from "supertest";
import app from "../src/app";

describe("Auth Endpoints", () => {
  describe("POST /auth/register", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /auth/login", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should return 204 if not logged in", async () => {
      const res = await request(app).delete("/auth/logout");
      expect([200, 204]).toContain(res.status);
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should fail with missing email", async () => {
      const res = await request(app).post("/auth/forgot-password").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/reset-password").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
