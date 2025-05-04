import request from "supertest";
import app from "../src/app";

jest.mock("../prisma/client", () => {
  const actual = jest.requireActual("../prisma/client");
  return {
    ...actual,
    prisma: {
      user: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    },
  };
});

describe("User Endpoints", () => {
  describe("GET /users", () => {
    it("should return 200 and an array (unauthenticated allowed)", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /users/:userId", () => {
    it("should return 404 for non-existent user", async () => {
      const res = await request(app).get("/users/nonexistentid");
      expect([400, 404]).toContain(res.status);
    });
  });

  describe("PUT /users/:userId", () => {
    it("should fail without auth token", async () => {
      const res = await request(app).put("/users/someid").send({});
      expect([401, 403]).toContain(res.status);
    });
  });
});
