import express from "express";
import { signUpRouter } from "./routes/signUp";
import { orderRouter } from "./routes/order";
import { dishesRouter } from "./routes/dishes";
import { loginRouter } from "./routes/login";
import { itemRouter } from "./routes/items";
import { categoryRouter } from "./routes/categories";

import sequelize from "./database";
import dotenv from "dotenv";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(signUpRouter);
app.use(loginRouter);
app.use(itemRouter);
app.use(categoryRouter);
app.use(dishesRouter);
app.use(orderRouter);

sequelize
  .sync()
  .then((res) => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on http://localhost:4000`);
    });
  })
  .catch((err: any) => console.log(err));
