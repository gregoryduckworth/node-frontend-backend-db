import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../src/controller/refreshToken";
import { setupTestEnv, removeJwtSecrets } from "./utils/testEnv";

const originalConsoleError = console.error;
console.error = jest.fn();

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockImplementation(() => "mocked-token"),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === "valid-refresh-token") {
      return {
        userId: "test-user-id",
        email: "test@example.com",
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
      };
    }
    throw new Error("Invalid token");
  }),
}));

jest.mock("../prisma/client", () => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn().mockImplementation((params) => {
          if (params?.where?.refresh_token === "valid-refresh-token") {
            return Promise.resolve({
              id: "test-user-id",
              firstName: "Test",
              lastName: "User",
              email: "test@example.com",
              refresh_token: "valid-refresh-token",
              dateOfBirth: null,
            });
          }
          if (params?.where?.refresh_token === "expired-token") {
            return Promise.resolve({
              id: "test-user-id",
              refresh_token: "expired-token",
            });
          }
          if (params?.where?.refresh_token === "error-token") {
            throw new Error("Database error");
          }
          return Promise.resolve(null);
        }),
      },
    },
  };
});

describe("Token Endpoint", () => {
  // Use the centralized test environment setup
  const restoreEnv = setupTestEnv();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    restoreEnv();
  });

  describe("GET /token", () => {
    it("should return 204 if no refresh token cookie is present", async () => {
      const res = await request(app).get("/token");
      expect(res.status).toBe(204);
    });

    it("should return 403 if token is not in database", async () => {
      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=invalid-token"]);

      expect(res.status).toBe(403);
    });

    it("should return a new access token with valid refresh token", async () => {
      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=valid-refresh-token"]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.accessToken).toBe("mocked-token");
    });

    it("should handle JWT verification errors", async () => {
      const originalVerify = jwt.verify;
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=expired-token"]);

      expect(res.status).toBe(403);

      expect(console.error).toHaveBeenCalledWith(
        "JWT verification failed:",
        expect.any(Error)
      );

      (jwt.verify as jest.Mock).mockImplementation(originalVerify);
    });

    it("should return 500 when JWT secrets are not defined", async () => {
      // Use the centralized function to remove JWT secrets
      removeJwtSecrets();

      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=valid-refresh-token"]);

      expect(res.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith(
        "JWT secrets are not defined in environment variables"
      );
    });

    it("should handle unexpected server errors", async () => {
      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken=error-token"]);

      expect(res.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith(
        "Error refreshing token:",
        expect.any(Error)
      );
    });

    it("should handle malformed cookie", async () => {
      const res = await request(app)
        .get("/token")
        .set("Cookie", ["refreshToken"]);

      expect(res.status).toBe(204);
    });
  });

  describe("generateAccessToken function", () => {
    it("should generate a token with correct user information", () => {
      const mockUser = {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        dateOfBirth: new Date("1990-01-01"),
      };

      const token = generateAccessToken(mockUser, "test-secret");

      expect(token).toBe("mocked-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          dateOfBirth: mockUser.dateOfBirth.toISOString(),
        },
        "test-secret",
        { expiresIn: "30m" }
      );
    });

    it("should handle null dateOfBirth", () => {
      const mockUser = {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        dateOfBirth: null,
      };

      const token = generateAccessToken(mockUser, "test-secret");

      expect(token).toBe("mocked-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          dateOfBirth: null,
        },
        "test-secret",
        { expiresIn: "30m" }
      );
    });
  });
});
