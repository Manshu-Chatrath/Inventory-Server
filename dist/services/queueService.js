"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dishQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_TLS_URL || process.env.REDIS_URL;
exports.dishQueue = new bull_1.default("dishQueue", redisUrl, {
    redis: {
        maxRetriesPerRequest: 5, // Increase retry limit
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000); // Increase retry delay
        },
        connectTimeout: 30000, // Increase connection timeout to 30 seconds
    },
});
