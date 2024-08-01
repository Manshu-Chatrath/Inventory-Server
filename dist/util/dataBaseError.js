"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBaseConnectionError = void 0;
const database_connection_error_1 = require("../errors/database-connection-error");
const dataBaseConnectionError = (res) => {
    const dataBaseError = new database_connection_error_1.DatabaseConnectionError("Some Unexpected Error Occured");
    return res
        .status(dataBaseError.statusCode)
        .send({ message: dataBaseError.message });
};
exports.dataBaseConnectionError = dataBaseConnectionError;
