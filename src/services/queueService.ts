import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();
const { REDIS_URL = "" } = process.env;
export const dishQueue = new Bull("dishQueue", REDIS_URL);
