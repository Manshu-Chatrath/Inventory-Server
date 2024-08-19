import express, { Request, Response } from "express";
import { Op } from "sequelize";
import EmailService from "../services/email";
import { dataBaseConnectionError } from "../util/dataBaseError";
import { GenerateOtpService } from "../services/generateNewOtp";
import PasswordService from "../services/password";
import Clients from "../models/clients";
import Cart from "../models/cart";
import Supervisors, { SuperVisorAttrs } from "../models/supervisors";
import dotenv from "dotenv";
dotenv.config();
const router = express();
const jwt = require("jsonwebtoken");
const generateNewOtp = new GenerateOtpService().generateNewOtp;
export const generateTokens = (model: SuperVisorAttrs) => {
  const accessToken = jwt.sign(
    { email: model.email, id: model!.id },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  return { accessToken };
};

const verifyOtp = async (
  req: Request,
  res: Response,
  model: SuperVisorAttrs
) => {
  try {
    if (!model?.otp) {
      return res
        .status(400)
        .json({ success: false, message: "Otp has been expired!" });
    }
    const isOtpTrue = await PasswordService.verifyPassword(
      req.body.otp,
      model.otp!
    );
    if (isOtpTrue) {
      return res.status(200).json({
        message: "Successful",
        id: model.id,
        email: model.email,
      });
    } else {
      return res.status(401).json({ message: "Invalid OTP!" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

router.post("/client/login", async (req: Request, res: Response) => {
  const user = await Clients.findOne({
    where: { email: req.body.email },
    attributes: ["email", "name", "id"],
  });

  if (user) {
    return res.status(200).send({
      message: "Successful",
      client: {
        id: user.id,
        email: user.email,
        name: user.name,
        access_token: req.body.access_token,
        expires_in: req.body.expires_in,
      },
    });
  } else {
    const client = await Clients.create({
      email: req.body.email,
      name: req.body.name,
      clientId: req.body.id,
    });

    await Cart.create({
      client_id: client.id!,
    });
    return res.status(200).send({
      message: "Successful",
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
        access_token: req.body.access_token,
        expires_in: req.body.expires_in,
      },
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await Supervisors.findOne({
      where: { email: req.body.email },
      attributes: ["email", "id", "password", "status"],
    });

    if (!user || user.status !== "complete") {
      return res.status(404).send({ message: "Client Doesn't exist" });
    }
    const verifyPassword = await PasswordService.verifyPassword(
      req.body.password,
      user.password
    );
    if (!verifyPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateTokens(user);

    return res.status(200).json({
      message: "Successful",
      token,
      id: user.id,
      email: user.email,
    });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.post("/verifyOtp", async (req: Request, res: Response) => {
  try {
    const model = await Supervisors.findOne({
      where: { email: req.body.email },
      attributes: ["email", "id", "password", "otp"],
    });
    verifyOtp(req, res, model!);
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.post("/newPassword", async (req: Request, res: Response) => {
  const password: string = await PasswordService.hashPassword(
    req.body.password
  );
  const user = await Supervisors.findOne({
    where: { email: { [Op.eq]: req.body.email } },
  });
  if (!user) {
    return res.status(404).send({ message: "User Doesn't exist" });
  } else {
    await Supervisors.update(
      {
        password: password,
      },
      {
        where: {
          email: req.body.email,
        },
      }
    );

    res.status(200).send({ message: "Success" });
  }
});

router.post("/forgotPassword", async (req: Request, res: Response) => {
  try {
    const { hashedOtp, otp } = await generateNewOtp();

    const user = await Supervisors.findOne({
      where: { email: { [Op.eq]: req.body.email } },
    });
    if (!user) {
      return res.status(404).send({ message: "User Doesn't exist" });
    } else {
      await Supervisors.update(
        {
          otp: hashedOtp,
        },
        {
          where: {
            email: req.body.email,
          },
        }
      );

      const sendEmail = new EmailService(req.body.email, otp.toString());
      await sendEmail.sendEmail();
      res.status(200).send({ message: "Success" });
    }
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.post("/verifyOtp", async (req: Request, res: Response) => {
  try {
    const user = await Supervisors.findOne({
      where: { email: { [Op.eq]: req.body.email } },
    });
    if (!user) {
      return res.status(404).send({ message: "User Doesn't exist" });
    }
    const isOtpTrue = await PasswordService.verifyPassword(
      req.body.otp,
      user.otp
    );

    if (isOtpTrue) {
      return res.status(201).send({ message: "OTP successfully verified!" });
    } else {
      return res.status(401).send({ message: "Invalid OTP! Please Retry." });
    }
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

export { router as loginRouter };
