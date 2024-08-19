const nodemailer = require("nodemailer");
import dotenv from "dotenv";
import { orderEmailContent, otpEmailContent } from "../util/emailLayout";
dotenv.config();
class EmailService {
  sender = "jack.germanshepherd@gmail.com";
  receiver: string;
  otp: string;
  type: string;
  orderNumber: string;
  constructor(
    receiver: string,
    otp: string,
    orderNumber = "",
    type = "management"
  ) {
    this.receiver = receiver;
    this.otp = otp;
    this.orderNumber = orderNumber;
    this.type = type;
  }

  sendEmail = async () => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jack.germanshepherd@gmail.com",
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    if (this.type === "client") {
      await transporter.sendMail({
        from: "jack.germanshepherd@gmail.com",
        to: this.receiver,
        subject: "Order Confirmation",
        html: orderEmailContent(this.orderNumber),
      });
    } else {
      await transporter.sendMail({
        from: "jack.germanshepherd@gmail.com",
        to: this.receiver,
        subject: "OTP",
        html: otpEmailContent(this.otp),
      });
    }

    return true;
  };
}
export default EmailService;
