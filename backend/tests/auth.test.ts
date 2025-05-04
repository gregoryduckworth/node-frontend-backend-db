import request from "supertest";
import app from "../src/app";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Mock Prisma client
jest.mock("../prisma/client", () => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

// Mock JWT
jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn().mockReturnValue("mock-token"),
    verify: jest
      .fn()
      .mockReturnValue({ userId: "test-user-id", email: "test@example.com" }),
  };
});

// Mock bcrypt
jest.mock("bcrypt", () => {
  return {
    genSalt: jest.fn().mockResolvedValue("salt"),
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn(),
  };
});

describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with password mismatch", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password124",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password doesn't match");
    });

    it("should fail with weak password", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password",
        confirmPassword: "password",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password must contain/);
    });

    it("should fail if email already exists", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "existing-user",
      });

      const res = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "existing@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });

    it("should succeed with valid data", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });

      const res = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Register Successful");
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe("POST /auth/login", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with non-existent email", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email not found");
    });

    it("should fail with incorrect password", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        password: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "WrongPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password is wrong");
    });

    it("should succeed with valid credentials", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-id",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(jwt.sign).toHaveBeenCalledTimes(2); // Once for access token, once for refresh token
      expect(prisma.user.update).toHaveBeenCalled(); // To store refresh token
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should return 204 if not logged in", async () => {
      const res = await request(app).delete("/auth/logout");
      expect([200, 204]).toContain(res.status);
    });

    it("should successfully logout when logged in", async () => {
      // Setup a mock request with a refresh token cookie
      const mockRequest = request(app)
        .delete("/auth/logout")
        .set("Cookie", ["refreshToken=valid-refresh-token"]);

      // Mock finding the user with the refresh token
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-id",
        refresh_token: "valid-refresh-token",
      });

      const res = await mockRequest;
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OK");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-id" },
        data: { refresh_token: null },
      });
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should fail with missing email", async () => {
      const res = await request(app).post("/auth/forgot-password").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should return 200 even if email doesn't exist (security)", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post("/auth/forgot-password").send({
        email: "nonexistent@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Password reset instructions sent to your email"
      );
    });

    it("should generate reset token for existing user", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
      });

      const res = await request(app).post("/auth/forgot-password").send({
        email: "test@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Password reset instructions sent to your email"
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled(); // To store reset token
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should fail with missing fields", async () => {
      const res = await request(app).post("/auth/reset-password").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with password mismatch", async () => {
      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-token",
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Passwords don't match");
    });

    it("should fail with invalid token", async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app).post("/auth/reset-password").send({
        token: "invalid-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    it("should fail if user with token doesn't exist", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    it("should successfully reset password with valid token and data", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        reset_token: "valid-token",
        reset_token_expires: new Date(Date.now() + 3600000), // 1 hour in the future
      });

      const res = await request(app).post("/auth/reset-password").send({
        token: "valid-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password has been reset successfully");
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-id" },
        data: {
          password: "hashed-password",
          reset_token: null,
          reset_token_expires: null,
        },
      });
    });
  });
});
