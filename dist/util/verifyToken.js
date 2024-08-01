"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jwt = require("jsonwebtoken");
const verifyToken = (token) => {
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded;
    }
    catch (error) {
        // Token is invalid or has expired
        return null;
    }
};
exports.verifyToken = verifyToken;
