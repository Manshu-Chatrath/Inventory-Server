"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const custom_error_1 = require("./custom-error");
class BadRequestError extends custom_error_1.CustomError {
    constructor(message) {
        super();
        this.statusCode = 400;
        this.message = message;
    }
    serializeMethodErrors() {
        return { statusCode: this.statusCode, message: this.message };
    }
}
exports.BadRequestError = BadRequestError;
