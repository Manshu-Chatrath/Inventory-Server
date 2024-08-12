import express from "express";
import { signUpRouter } from "./routes/signUp";
import { dishesRouter } from "./routes/dishes";
import { loginRouter } from "./routes/login";
import { itemRouter } from "./routes/items";
import { categoryRouter } from "./routes/categories";
import session from "express-session";
import sequelize from "./database";

import dotenv from "dotenv";
const cors = require("cors");
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
const app = express();
app.use(
  cors({
    origin: "https://your-restaurant-inventory-0e6c20d5900a.herokuapp.com",
    credentials: true,
  })
);
app.use(express.json());
dotenv.config();
app.use(
  session({
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(signUpRouter);
app.use(loginRouter);
app.use(itemRouter);
app.use(categoryRouter);
app.use(dishesRouter);

sequelize
  .sync()
  .then((res) => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on http://localhost:4000`);
    });
  })
  .catch((err: any) => console.log(err));
