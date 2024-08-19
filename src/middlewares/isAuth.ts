import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export interface MyRequest extends Request {
  userId?: number;
  isValidUser?: boolean;
  type?: string;
}

export const isAuth = async (
  req: MyRequest,
  res: Response,
  next: NextFunction
) => {
  let auth = req.get("Authorization");
  if (!auth) {
    return res.status(401).send({ message: "Authorization header missing" });
  }
  const token = auth;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY!);
    if (decoded) {
      const { id } = decoded as { id: number };
      req.userId = id;
      return next();
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
