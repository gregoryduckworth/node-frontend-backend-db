import request from "supertest";
import app from "../src/app";
import { Request, Response, NextFunction } from "express";
import {
  setupTestSuite,
  testUsers,
  credentials,
  endpoints,
  setupPasswordComparison,
} from "./helpers";

jest.mock("../prisma/client", () => {
  return {
    prisma: jest.requireActual("./__mocks__/prismaMock").default,
  };
});

jest.mock("jsonwebtoken", () => {
  return jest.requireActual("./__mocks__/jwtMock").default;
});

jest.mock("bcrypt", () => {
  return jest.requireActual("./__mocks__/bcryptMock").default;
});

interface CustomRequest extends Request {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

jest.mock("../src/middlewares/verifyToken", () => ({
  verifyToken: (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.cookies?.refreshToken === "valid-refresh-token") {
      req.user = {
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      };
      return next();
    }
    return res.sendStatus(401);
  },
}));

console.log = jest.fn();

describe("User Endpoints", () => {
  const cleanup = setupTestSuite();
  let originalGet: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalGet = Object.getOwnPropertyDescriptor(Object.prototype, "cookies");
    Object.defineProperty(Object.prototype, "cookies", {
      get: function () {
        return this._cookies || {};
      },
      set: function (val) {
        this._cookies = val;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalGet) {
      Object.defineProperty(Object.prototype, "cookies", originalGet);
    } else {
      delete (Object.prototype as any).cookies;
    }
  });

  afterAll(() => {
    cleanup();
  });

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
      expect(res.status).toBe(401);
    });

    it("should fail with invalid data", async () => {
      const agent = request.agent(app);
      const res = await agent
        .put("/users/test-user-id")
        .set("Cookie", ["refreshToken=valid-refresh-token"])
        .send({ firstName: "", lastName: "", email: "" });

      expect(res.status).toBe(400);
    });

    it("should succeed with valid token and data", async () => {
      const userUpdateData = {
        firstName: "Updated",
        lastName: "User",
        email: "updated@example.com",
      };

      const agent = request.agent(app);

      const res = await agent
        .put("/users/test-user-id")
        .set("Cookie", ["refreshToken=valid-refresh-token"])
        .send(userUpdateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "User updated");
    });
  });

  describe("POST /auth/register", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app)
        .post(endpoints.auth.register)
        .send({ firstName: "Test" });

      expect(res.status).toBe(400);
    });

    it("should fail when passwords don't match", async () => {
      const res = await request(app).post(endpoints.auth.register).send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: credentials.valid.password,
        confirmPassword: "DifferentPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Password doesn't match");
    });

    it("should fail with weak password", async () => {
      const res = await request(app).post(endpoints.auth.register).send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: credentials.invalid.password,
        confirmPassword: credentials.invalid.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Password must be");
    });

    it("should succeed with valid data", async () => {
      const res = await request(app).post(endpoints.auth.register).send({
        firstName: "New",
        lastName: "User",
        email: "new@example.com",
        password: credentials.valid.password,
        confirmPassword: credentials.valid.password,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Register Successful");
    });
  });

  describe("POST /auth/login", () => {
    it("should fail with missing credentials", async () => {
      const res = await request(app).post(endpoints.auth.login).send({});

      expect(res.status).toBe(400);
    });

    it("should fail with incorrect email", async () => {
      const res = await request(app).post(endpoints.auth.login).send({
        email: credentials.invalid.email,
        password: credentials.valid.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Email not found");
    });

    it("should fail with incorrect password", async () => {
      // Set password comparison to return false for this test
      setupPasswordComparison(false);

      const res = await request(app).post(endpoints.auth.login).send({
        email: testUsers.standard.email,
        password: credentials.invalid.wrongPassword,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Password is wrong");

      // Reset password comparison to default behavior
      setupPasswordComparison(true);
    });

    it("should succeed with valid credentials", async () => {
      const res = await request(app).post(endpoints.auth.login).send({
        email: testUsers.standard.email,
        password: credentials.valid.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"][0]).toContain("refreshToken=");
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should return 204 if no refresh token", async () => {
      const res = await request(app).delete("/auth/logout");
      expect(res.status).toBe(204);
    });

    it("should succeed with valid refresh token", async () => {
      const res = await request(app)
        .delete("/auth/logout")
        .set("Cookie", ["refreshToken=valid-refresh-token"]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "OK");
      expect(res.headers["set-cookie"][0]).toContain("refreshToken=;");
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should fail with missing email", async () => {
      const res = await request(app)
        .post(endpoints.auth.forgotPassword)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Email is required");
    });

    it("should succeed even with non-existent email (for security reasons)", async () => {
      const res = await request(app)
        .post(endpoints.auth.forgotPassword)
        .send({ email: credentials.invalid.email });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Password reset instructions");
    });

    it("should succeed with existing email", async () => {
      const res = await request(app)
        .post(endpoints.auth.forgotPassword)
        .send({ email: testUsers.standard.email });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Password reset instructions");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should fail with missing token", async () => {
      const res = await request(app).post("/auth/reset-password").send({
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Token is required");
    });

    it("should fail with mismatched passwords", async () => {
      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-reset-token",
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Passwords don't match");
    });

    it("should fail with weak password", async () => {
      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-reset-token",
        password: "weak",
        confirmPassword: "weak",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Password must be");
    });

    it("should succeed with valid token and password", async () => {
      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-reset-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Password has been reset successfully"
      );
    });
  });

  describe("GET /token", () => {
    it("should fail with no refresh token", async () => {
      const res = await request(app).get("/token");
      expect(res.status).toBe(204);
    });

    it("should succeed with valid refresh token", async () => {
      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=valid-refresh-token"]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
    });
  });
});
