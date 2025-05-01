import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
    if (!confirmPassword)
      return res.status(400).json({ message: "Confirm Password is required" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password doesn't match" });
    const isUserExist = await prisma.user.findFirst({ where: { email } });
    if (isUserExist)
      return res.status(400).json({ message: "Email already exists" });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    return res.status(201).json({ message: "Register Successful" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email not found" });
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res.status(400).json({ message: "Password is wrong" });
    const { id: userId, email: userEmail, name: userName } = user;
    const accessToken = jwt.sign(
      { userId, userEmail, userName },
      accessTokenSecret,
      { expiresIn: "15s" }
    );
    const refreshToken = jwt.sign(
      { userId, userEmail, userName },
      refreshTokenSecret,
      { expiresIn: "1d" }
    );
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email } = req.body;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return res.sendStatus(403);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
    });
    if (!user) return res.sendStatus(403);
    if (user.refresh_token !== refreshToken) return res.sendStatus(403);
    await prisma.user.update({
      where: { id: req.params.userId },
      data: { name, email },
    });
    return res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) return res.sendStatus(204);
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: null },
    });
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res
        .status(200)
        .json({ message: "Password reset instructions sent to your email" });
    }

    const resetToken = jwt.sign({ userId: user.id, email }, accessTokenSecret, {
      expiresIn: "1h",
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: expiresAt,
      },
    });

    // In a real application, you would send an email with a link containing the token
    // For example: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    console.log(`Reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset link would be: http://localhost:5173/reset-password?token=${resetToken}`
    );

    return res
      .status(200)
      .json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) return res.status(400).json({ message: "Token is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
    if (!confirmPassword)
      return res.status(400).json({ message: "Confirm password is required" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    let decoded;
    try {
      decoded = jwt.verify(token, accessTokenSecret);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: (decoded as any).userId,
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
