import { Request, Response, NextFunction } from "express";
import Supervisors from "../models/supervisors";
const jwt = require("jsonwebtoken");
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
  const token = auth;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
    let isValidUser: any = false;

    if (decoded) {
      const { id } = decoded;
      if (req?.isValidUser) {
        return next();
      }

      if (!isValidUser) {
        isValidUser = await Supervisors.findOne({ where: { id: id } });
      }
      if (isValidUser) {
        req.isValidUser = true;
        req.userId = id;
        next();
      } else {
        return res.status(401).send({ message: "Invalid token" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
};
