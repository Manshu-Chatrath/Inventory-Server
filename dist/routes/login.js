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
exports.loginRouter = exports.generateTokens = void 0;
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const email_1 = __importDefault(require("../services/email"));
const dataBaseError_1 = require("../util/dataBaseError");
const generateNewOtp_1 = require("../services/generateNewOtp");
const password_1 = __importDefault(require("../services/password"));
const isAuth_1 = require("../middlewares/isAuth");
const supervisors_1 = __importDefault(require("../models/supervisors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.default)();
exports.loginRouter = router;
const jwt = require("jsonwebtoken");
const generateNewOtp = new generateNewOtp_1.GenerateOtpService().generateNewOtp;
const generateTokens = (model) => {
    const accessToken = jwt.sign({ email: model.email, id: model.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
    return { accessToken };
};
exports.generateTokens = generateTokens;
const verifyOtp = (req, res, model) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(model === null || model === void 0 ? void 0 : model.otp)) {
            return res
                .status(400)
                .json({ success: false, message: "Otp has been expired!" });
        }
        const isOtpTrue = yield password_1.default.verifyPassword(req.body.otp, model.otp);
        if (isOtpTrue) {
            return res.status(200).json({
                message: "Successful",
                id: model.id,
                email: model.email,
            });
        }
        else {
            return res.status(401).json({ message: "Invalid OTP!" });
        }
    }
    catch (e) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield supervisors_1.default.findOne({
            where: { email: req.body.email },
            attributes: ["email", "id", "password", "status"],
        });
        if (!user || user.status !== "complete") {
            return res.status(404).send({ message: "Client Doesn't exist" });
        }
        const verifyPassword = yield password_1.default.verifyPassword(req.body.password, user.password);
        if (!verifyPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, exports.generateTokens)(user);
        req.session.userId = user.id;
        return res.status(200).json({
            message: "Successful",
            token,
            id: user.id,
            email: user.email,
        });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.post("/verifyOtp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = yield supervisors_1.default.findOne({
            where: { email: req.body.email },
            attributes: ["email", "id", "password", "otp"],
        });
        verifyOtp(req, res, model);
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.post("/newPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const password = yield password_1.default.hashPassword(req.body.password);
    const user = yield supervisors_1.default.findOne({
        where: { email: { [sequelize_1.Op.eq]: req.body.email } },
    });
    if (!user) {
        return res.status(404).send({ message: "User Doesn't exist" });
    }
    else {
        yield supervisors_1.default.update({
            password: password,
        }, {
            where: {
                email: req.body.email,
            },
        });
        res.status(200).send({ message: "Success" });
    }
}));
router.post("/forgotPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hashedOtp, otp } = yield generateNewOtp();
        const user = yield supervisors_1.default.findOne({
            where: { email: { [sequelize_1.Op.eq]: req.body.email } },
        });
        if (!user) {
            return res.status(404).send({ message: "User Doesn't exist" });
        }
        else {
            yield supervisors_1.default.update({
                otp: hashedOtp,
            }, {
                where: {
                    email: req.body.email,
                },
            });
            const sendEmail = new email_1.default(req.body.email, otp.toString());
            yield sendEmail.sendEmail();
            res.status(200).send({ message: "Success" });
        }
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.post("/verifyOtp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield supervisors_1.default.findOne({
            where: { email: { [sequelize_1.Op.eq]: req.body.email } },
        });
        if (!user) {
            return res.status(404).send({ message: "User Doesn't exist" });
        }
        const isOtpTrue = yield password_1.default.verifyPassword(req.body.otp, user.otp);
        if (isOtpTrue) {
            return res.status(201).send({ message: "OTP successfully verified!" });
        }
        else {
            return res.status(401).send({ message: "Invalid OTP! Please Retry." });
        }
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.post("/logout", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: "Internal Server Error" });
        }
        return res.status(200).send({ message: "Logged out successfully" });
    });
}));
