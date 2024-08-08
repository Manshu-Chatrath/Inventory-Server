import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();
const redisUrl = process.env.REDIS_TLS_URL || process.env.REDIS_URL;
export const dishQueue = new Bull("dishQueue", redisUrl!, {
  redis: {
    maxRetriesPerRequest: 5, // Increase retry limit
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000); // Increase retry delay
    },
    connectTimeout: 30000, // Increase connection timeout to 30 seconds
  },
});
