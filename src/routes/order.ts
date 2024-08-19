import express, { Request, Response } from "express";
import { clientIsAuth } from "../middlewares/clientIsAuth";
import Cart from "../models/cart";
import CartItems from "../models/cartItems";
import CartItemsExtras from "../models/cartItemsExtras";
import CartItemsExtrasItems from "../models/cartItemsExtrasItems";
import EmailService from "../services/email";
import Extras from "../models/extras";
import ExtraItems from "../models/extraItems";
import Dishes from "../models/dishes";
import { Op } from "sequelize";
import sequelize from "../database";
import { dataBaseConnectionError } from "../util/dataBaseError";
const router = express();
router.post("/addToCart", clientIsAuth, async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id, quantity, extras, name = "", price } = req.body;
    const cart = await Cart.findOne({
      where: { client_id: req.body.clientId },
      transaction,
    });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }
    const cartItem = await CartItems.create({
      cartId: cart.id ?? 0,
      itemId: id,
      quantity: quantity,
      price: price,
      name: name,
      disable: false,
    });
    const extraItems = extras.map((extra: any) => ({
      extraId: extra.id,
      cartItemId: cartItem.id,
    }));
    const cartItemsExtras = await CartItemsExtras.bulkCreate(extraItems, {
      transaction,
    });
    let cartItemsExtrasItems: any[] = [];
    extras.map((extra: any) => {
      const filterCartItemExtra: any = cartItemsExtras.find(
        (c) => c.extraId === extra.id
      );

      extra.extraItems.map((itemId: number) => {
        cartItemsExtrasItems.push({
          cartItemsExtrasId: filterCartItemExtra.id,
          itemsExtraId: itemId,
        });
      });
    });

    await CartItemsExtrasItems.bulkCreate(cartItemsExtrasItems, {
      transaction,
    });
    await transaction.commit();
    return res.status(200).send({ message: "Item added to cart" });
  } catch (error) {
    await transaction.rollback();
    dataBaseConnectionError(res);
  }
});

router.get(
  "/getCart/:id",
  clientIsAuth,
  async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    const clientId = req.params.id;
    try {
      const cart = await Cart.findOne({
        where: { client_id: clientId },
        transaction,
      });

      let cartItems = await CartItems.findAll({
        where: { cartId: cart!.id },

        include: [
          {
            model: Dishes,
            as: "dish",
            required: false,
            attributes: ["id", "name", "isActive", "src"],
          },
          {
            model: CartItemsExtras,
            attributes: ["id"],
            include: [
              {
                model: Extras,
                as: "extras",
                required: false,
                attributes: ["id", "name"],
              },
              {
                model: CartItemsExtrasItems,
                attributes: ["id"],
                include: [
                  {
                    model: ExtraItems,
                    required: false,
                    as: "extraItems",
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
        transaction,
      });
      const allCartItems: any[] = [];
      cartItems.map((item) => {
        let extraItems: any[] = [];
        item.cartItemsExtras.map((extra) => {
          extraItems.push({
            id: extra.extras.id,
            name: extra.extras.name,
            items: extra.cartItems.map((item) => {
              return {
                id: item.extraItems.id,
                name: item.extraItems.name,
              };
            }),
          });
        });
        allCartItems.push({
          id: item.id,
          itemId: item.itemId,
          cartId: item.cartId,
          price: item.price,
          disable: item.disable,
          quantity: item.quantity,
          name: item.dish.name,
          src: item.dish.src,
          isActive: item.dish.isActive,
          extraItems: extraItems,
        });
      });

      await transaction.commit();
      return res
        .status(200)
        .send({ message: "Item added to cart", cartItems: allCartItems });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      dataBaseConnectionError(res);
    }
  }
);

router.post(
  "/deleteCartItem",
  clientIsAuth,
  async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
      const cart = await Cart.findOne({
        where: { client_id: req.body.userId },
        transaction,
      });
      await CartItems.destroy({
        where: {
          [Op.and]: [
            { id: req.body.id },
            { cartId: cart!.id }, // Use Op.in for bulk operation
          ],
        },
        transaction,
      });
      await transaction.commit();
      return res.status(200).send({ message: "Item removed from cart" });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      dataBaseConnectionError(res);
    }
  }
);

function generateOrderNumber() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100000);
  return `ORD-${timestamp}-${randomNum}`;
}

router.post("/checkout", clientIsAuth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { client_id: req.body.userId } });
    const orderNumber = generateOrderNumber();
    const cartItems = await CartItems.findAll({
      where: {
        cartId: cart!.id,
      },
    });
    const notValid = cartItems.find((item) => item.disable === true);
    if (notValid) {
      return res.status(400).json({
        message: "Order is not valid. Some items in your cart are unavailable.",
      });
    } else {
      new EmailService(req.body.email, orderNumber);
      await CartItems.destroy({
        where: {
          cartId: cart!.id,
        },
      });
      return res
        .status(200)
        .json({ message: "Order processed successfully", orderNumber });
    }
  } catch (e) {
    dataBaseConnectionError(res);
  }
});

export { router as orderRouter };
