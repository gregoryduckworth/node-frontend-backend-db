import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) return res.sendStatus(403);

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!refreshTokenSecret || !accessTokenSecret) {
      console.error("JWT secrets are not defined in environment variables");
      return res.sendStatus(500);
    }

    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      },
      accessTokenSecret,
      { expiresIn: "30m" }
    );

    return res.json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
