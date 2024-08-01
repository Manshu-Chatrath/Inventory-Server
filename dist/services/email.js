"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const dotenv_1 = __importDefault(require("dotenv"));
const emailLayout_1 = require("../util/emailLayout");
dotenv_1.default.config();
class EmailService {
    constructor(receiver, otp) {
        this.sender = "jack.germanshepherd@gmail.com";
        this.sendEmail = () => __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "jack.germanshepherd@gmail.com",
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            yield transporter.sendMail({
                from: "jack.germanshepherd@gmail.com",
                to: this.receiver,
                subject: "OTP",
                html: (0, emailLayout_1.otpEmailContent)(this.otp),
            });
            return true;
        });
        this.receiver = receiver;
        this.otp = otp;
    }
}
exports.default = EmailService;
