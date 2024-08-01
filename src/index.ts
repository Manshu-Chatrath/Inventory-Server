import express from "express";
import { signUpRouter } from "./routes/signUp";
import { dishesRouter } from "./routes/dishes";
import { loginRouter } from "./routes/login";
import { itemRouter } from "./routes/items";
import { categoryRouter } from "./routes/categories";
import sequelize from "./database";
import dotenv from "dotenv";
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(signUpRouter);
app.use(loginRouter);
app.use(itemRouter);
app.use(categoryRouter);
app.use(dishesRouter);
console.log("hjere?");
sequelize
  .sync()
  .then((res) => {
    app.listen(4000, () => {
      console.log(`Server is running on http://localhost:4000`);
      setInterval(() => {
        console.log("jere");
        const memoryUsage = process.memoryUsage();
        console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
        console.log(
          `Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        );
        console.log(
          `Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
        );
        console.log(
          `External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        );
      }, 1000);
    });
  })
  .catch((err: any) => console.log(err));
