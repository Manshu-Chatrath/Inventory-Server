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
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let auth = req.get("Authorization");
    if (!auth) {
        return res.status(401).send({ message: "Authorization header missing" });
    }
    const token = auth;
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        if (decoded) {
            const { id } = decoded;
            req.userId = id;
            return next();
        }
    }
    catch (err) {
        return res.status(500).send({ message: err });
    }
});
exports.isAuth = isAuth;
