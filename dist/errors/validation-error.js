"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidationError extends custom_error_1.CustomError {
    constructor(message) {
        super();
        this.statusCode = 400;
        this.message = message;
    }
    serializeMethodErrors() {
        return { message: this.message, statusCode: this.statusCode };
    }
    static parametersErrors(arr, obj) {
        let isErrorExist = false;
        for (let key in obj) {
            if (!arr.includes(key)) {
                isErrorExist = true;
                break;
            }
        }
        if (isErrorExist) {
            return true;
        }
    }
}
exports.RequestValidationError = RequestValidationError;
