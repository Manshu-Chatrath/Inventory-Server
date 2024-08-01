"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signUp_1 = require("./routes/signUp");
const dishes_1 = require("./routes/dishes");
const login_1 = require("./routes/login");
const items_1 = require("./routes/items");
const categories_1 = require("./routes/categories");
const database_1 = __importDefault(require("./database"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const cors = require("cors");
app.use(cors());
app.use(express_1.default.json());
dotenv_1.default.config();
console.log(process.env);
app.use(signUp_1.signUpRouter);
app.use(login_1.loginRouter);
app.use(items_1.itemRouter);
app.use(categories_1.categoryRouter);
app.use(dishes_1.dishesRouter);

database_1.default
  .sync()
  .then((res) => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on http://localhost:4000`);
    });
  })
  .catch((err) => console.log(err));
