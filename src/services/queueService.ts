import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.REDIS_URL);
export const dishQueue = new Bull("dishQueue", process.env.REDIS_URL!);
