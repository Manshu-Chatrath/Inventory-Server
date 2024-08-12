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
      console.log(req.session.userId);
      console.log(req.session);
      const { id } = decoded as { id: number };
      if (req.session && req.session.userId === id) {
        req.userId = req.session.userId;
        return next();
      } else {
        req?.session?.destroy((err) => {
          if (err) {
            console.log("Error destroying session:", err);
          }
          return res.status(401).send({ message: "Invalid token" });
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
};
