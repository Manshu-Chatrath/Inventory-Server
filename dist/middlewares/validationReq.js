"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validation_error_1 = require("../errors/validation-error");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const requestValidationError = new validation_error_1.RequestValidationError("Invalid Parameters!");
        return res.status(requestValidationError.statusCode).send({
            message: requestValidationError.message,
            error: errors.array()[0].msg,
        });
    }
    next();
};
exports.validateRequest = validateRequest;
