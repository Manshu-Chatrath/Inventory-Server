import { Request, Response, NextFunction } from "express";
import axios from "axios";
export interface MyRequest extends Request {
  userId?: number;
  isValidUser?: boolean;
  type?: string;
}

async function verifyToken(token: string) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    if (response.data.access_type !== "online") {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

export const clientIsAuth = async (
  req: MyRequest,
  res: Response,
  next: NextFunction
) => {
  let auth = req.get("Authorization");

  if (!auth) {
    return res.status(401).send({ message: "Authorization header missing" });
  }
  const token = auth;
  try {
    const isVerified = await verifyToken(token as string);
    if (isVerified) {
      return next();
    }
    return res.status(500).send({ message: "Unauthorized" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
};
