import { Sequelize } from "sequelize-typescript";
import Supervisors from "./models/supervisors";
import Categories from "./models/categories";
import Dishes from "./models/dishes";
import ExtraItems from "./models/extraItems";
import Clients from "./models/clients";
import Cart from "./models/cart";
import Extras from "./models/extras";
import Items_Has_Dishes from "./models/Items_has_dishes";
import CartItemsExtras from "./models/cartItemsExtras";
import CartItemsExtrasItems from "./models/cartItemsExtrasItems";
import CartItems from "./models/cartItems";
import Items from "./models/items";
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.MYSQL_HOST,
  timezone: "+00:00",
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  models: [
    Supervisors,
    Categories,
    CartItemsExtrasItems,
    CartItemsExtras,
    Items,
    Clients,
    Dishes,
    CartItems,
    Items_Has_Dishes,
    Cart,
    Extras,
    ExtraItems,
  ],
});

export default sequelize;
