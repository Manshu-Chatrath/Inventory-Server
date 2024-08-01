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
exports.signUpRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const password_1 = __importDefault(require("../services/password"));
const validationReq_1 = require("../middlewares/validationReq");
const supervisors_1 = __importDefault(require("../models/supervisors"));
const bad_request_error_1 = require("../errors/bad-request-error");
const generateNewOtp_1 = require("../services/generateNewOtp");
const dataBaseError_1 = require("../util/dataBaseError");
const email_1 = __importDefault(require("../services/email"));
const sequelize_1 = require("sequelize");
const router = (0, express_1.default)();
exports.signUpRouter = router;
const generateNewOtp = new generateNewOtp_1.GenerateOtpService().generateNewOtp;
const validateReq = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Enter a valid email address"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/)
        .withMessage("Password must contain at least one special character"),
];
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let errorMessage = null;
        const ModalType = supervisors_1.default;
        console.log(req.body.email);
        const modalParameter = yield supervisors_1.default.findOne({
            where: { email: { [sequelize_1.Op.eq]: req.body.email } },
        });
        if (modalParameter) {
            if (modalParameter.status === "pending") {
                const { hashedOtp, otp } = yield generateNewOtp();
                yield ModalType.update({
                    otp: hashedOtp,
                }, {
                    where: {
                        email: req.body.email,
                    },
                });
                const sendEmail = new email_1.default(req.body.email, otp.toString());
                yield sendEmail.sendEmail();
                return res.status(201).send({ message: "success" });
            }
            errorMessage = `User already exists!`;
            const badReq = new bad_request_error_1.BadRequestError(errorMessage);
            return res.status(badReq.statusCode).send({ message: badReq.message });
        }
        else {
            const password = yield password_1.default.hashPassword(req.body.password);
            const email = req.body.email;
            const { hashedOtp, otp } = yield generateNewOtp();
            yield ModalType.create({
                password: password,
                email: email,
                otp: hashedOtp,
                status: "pending",
            });
            try {
                const sendEmail = new email_1.default(email, otp.toString());
                yield sendEmail.sendEmail();
                res.status(201).send({ message: "success" });
            }
            catch (e) {
                console.log(e);
                return res.status(503).send({ message: "Please retry!" });
            }
        }
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
});
const finalSignup = (res, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ModalType = supervisors_1.default;
        const modalParameter = yield ModalType.findOne({
            where: { email: { [sequelize_1.Op.eq]: req.body.email } },
        });
        if (modalParameter) {
            const isOtpTrue = yield password_1.default.verifyPassword(req.body.otp, modalParameter.otp);
            if (isOtpTrue) {
                yield ModalType.update({
                    status: "complete",
                }, {
                    where: {
                        email: req.body.email,
                    },
                });
                return res.status(201).send({ message: "OTP successfully verified!" });
            }
            else {
                return res.status(401).send({ message: "Invalid OTP! Please Retry." });
            }
        }
    }
    catch (e) {
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
});
router.post("/initiateSignup", validateReq, validationReq_1.validateRequest, (req, res) => {
    signUp(req, res);
});
router.post("/finalSignup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    finalSignup(res, req);
}));
