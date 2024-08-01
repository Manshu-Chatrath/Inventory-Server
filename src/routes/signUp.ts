import express, { Request, Response } from "express";
import { body } from "express-validator";
import PasswordService from "../services/password";
import { validateRequest } from "../middlewares/validationReq";
import Supervisors from "../models/supervisors";
import { BadRequestError } from "../errors/bad-request-error";
import { GenerateOtpService } from "../services/generateNewOtp";
import { dataBaseConnectionError } from "../util/dataBaseError";
import EmailService from "../services/email";
import { Op } from "sequelize";

const router = express();
const generateNewOtp = new GenerateOtpService().generateNewOtp;
const validateReq = [
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("email").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),
];

const signUp = async (req: Request, res: Response) => {
  try {
    let errorMessage: string | null = null;
    const ModalType = Supervisors;
    const modalParameter = await Supervisors.findOne({
      where: { email: { [Op.eq]: req.body.email } },
    });
    if (modalParameter) {
      if (modalParameter.status === "pending") {
        const { hashedOtp, otp } = await generateNewOtp();
        await ModalType.update(
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
        return res.status(201).send({ message: "success" });
      }
      errorMessage = `User already exists!`;
      const badReq = new BadRequestError(errorMessage);
      return res.status(badReq.statusCode).send({ message: badReq.message });
    } else {
      const password: string = await PasswordService.hashPassword(
        req.body.password
      );
      const { hashedOtp, otp } = await generateNewOtp();

      await ModalType.create({
        password: password,
        email: req.body.email,
        otp: hashedOtp,
        status: "pending",
      });

      try {
        const sendEmail = new EmailService(req.body.email, otp.toString());
        await sendEmail.sendEmail();
        res.status(201).send({ message: "success" });
      } catch (e) {
        console.log(e);
        return res.status(503).send({ message: "Please retry!" });
      }
    }
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
};

const finalSignup = async (res: Response, req: Request) => {
  try {
    const ModalType = Supervisors;
    const modalParameter = await ModalType.findOne({
      where: { email: { [Op.eq]: req.body.email } },
    });

    if (modalParameter) {
      const isOtpTrue = await PasswordService.verifyPassword(
        req.body.otp,
        modalParameter.otp
      );

      if (isOtpTrue) {
        await ModalType.update(
          {
            status: "complete",
          },
          {
            where: {
              email: req.body.email,
            },
          }
        );
        return res.status(201).send({ message: "OTP successfully verified!" });
      } else {
        return res.status(401).send({ message: "Invalid OTP! Please Retry." });
      }
    }
  } catch (e) {
    dataBaseConnectionError(res);
  }
};

router.post(
  "/initiateSignup",
  validateReq,
  validateRequest,
  (req: Request, res: Response) => {
    signUp(req, res);
  }
);

router.post("/finalSignup", async (req: Request, res: Response) => {
  finalSignup(res, req);
});

export { router as signUpRouter };
