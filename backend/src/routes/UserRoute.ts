import express from "express";
import {
  getAllUsers,
  getUserById,
  login,
  logout,
  register,
  updateUser,
  forgotPassword,
  resetPassword,
} from "../controller/UserController";
import { verifyToken } from "../middlewares/verifyToken";
import { refreshToken } from "../controller/refreshToken";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId", verifyToken, updateUser);

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.delete("/auth/logout", logout);
router.get("/token", refreshToken);

export default router;
