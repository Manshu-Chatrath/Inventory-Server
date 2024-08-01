"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const supervisors_1 = __importDefault(require("./models/supervisors"));
const categories_1 = __importDefault(require("./models/categories"));
const dishes_1 = __importDefault(require("./models/dishes"));
const extraItems_1 = __importDefault(require("./models/extraItems"));
const extras_1 = __importDefault(require("./models/extras"));
const Items_has_dishes_1 = __importDefault(
  require("./models/Items_has_dishes")
);
const items_1 = __importDefault(require("./models/items"));
console.log(process.env);
const sequelize = new sequelize_typescript_1.Sequelize({
  dialect: "mysql",
  host: process.env.MYSQL_HOST,
  timezone: "+00:00",
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  models: [
    supervisors_1.default,
    categories_1.default,
    items_1.default,
    dishes_1.default,
    Items_has_dishes_1.default,
    extras_1.default,
    extraItems_1.default,
  ],
});
exports.default = sequelize;
