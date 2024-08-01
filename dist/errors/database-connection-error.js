"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionError = void 0;
const custom_error_1 = require("./custom-error");
class DatabaseConnectionError extends custom_error_1.CustomError {
    constructor(message) {
        super();
        this.statusCode = 500;
        this.message = message;
    }
    serializeMethodErrors() {
        return { statusCode: this.statusCode, message: this.message };
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
