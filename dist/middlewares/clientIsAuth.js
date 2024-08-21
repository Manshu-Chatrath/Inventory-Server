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
exports.clientIsAuth = void 0;
const axios_1 = __importDefault(require("axios"));
function verifyToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
            if (response.data.access_type !== "online") {
                return false;
            }
            return true;
        }
        catch (error) {
            console.error("Token verification failed:", error);
            return false;
        }
    });
}
const clientIsAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let auth = req.get("Authorization");
    if (!auth) {
        return res.status(401).send({ message: "Authorization header missing" });
    }
    const token = auth;
    try {
        const isVerified = yield verifyToken(token);
        if (isVerified) {
            return next();
        }
        return res.status(500).send({ message: "Unauthorized" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: err });
    }
});
exports.clientIsAuth = clientIsAuth;
