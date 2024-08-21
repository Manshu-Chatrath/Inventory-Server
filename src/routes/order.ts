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
    const { id, quantity, extras, name = "", price, cartId } = req.body;
    const cartItem = await CartItems.create(
      {
        cartId: cartId,
        itemId: id,
        quantity: quantity,
        price: price,
        name: name,
        disable: false,
      },
      { transaction }
    );

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
          cartItemId: cartItem.id,
        });
      });
    });

    await CartItemsExtrasItems.bulkCreate(cartItemsExtrasItems, {
      transaction,
    });
    await transaction.commit();
    let totalItems = await getCartLength(cartId);
    return res
      .status(200)
      .send({ message: "Item added to cart", cartLength: totalItems });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    dataBaseConnectionError(res);
  }
});

const getCartLength = async (id: number) => {
  const cartItems = await CartItems.findAll({
    attributes: ["id", "quantity"],
    where: {
      cartId: id,
    },
  });
  let totalItems = 0;
  cartItems.map((item) => {
    totalItems += item.quantity;
  });
  return totalItems;
};

router.get(
  "/cartLength/:id",
  clientIsAuth,
  async (req: Request, res: Response) => {
    try {
      let totalItems = await getCartLength(+req.params.id);
      return res
        .status(200)
        .send({ message: "Item added to cart", cartLength: totalItems });
    } catch (e) {
      console.log(e);
      dataBaseConnectionError(res);
    }
  }
);
router.get(
  "/getCart/:id",
  clientIsAuth,
  async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
      let cartItems = await CartItems.findAll({
        where: { cartId: req.params.id },
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
      await CartItems.destroy({
        where: {
          [Op.and]: [
            { id: req.body.id },
            { cartId: req.body.cartId }, // Use Op.in for bulk operation
          ],
        },
        transaction,
      });
      let totalItems = await getCartLength(req.body.cartId);
      await transaction.commit();
      return res
        .status(200)
        .send({ message: "Item removed from cart", cartLength: totalItems });
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

router.post("/checkout", clientIsAuth, async (req: Request, res: Response) => {
  try {
    const orderNumber = generateOrderNumber();
    const cartItems = await CartItems.findAll({
      where: {
        cartId: req.body.cartId,
      },
    });
    const notValid = cartItems.find((item) => item.disable === true);
    if (notValid) {
      return res.status(400).json({
        message: "Order is not valid. Some items in your cart are unavailable.",
      });
    } else {
      const sendEmail = new EmailService(req.body.email, orderNumber, "client");
      await sendEmail.sendEmail();
      await CartItems.destroy({
        where: {
          cartId: req.body.cartId,
        },
      });
      return res
        .status(200)
        .json({ message: "Order processed successfully", orderNumber });
    }
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.put("/editCartItem", async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { cartItemId, price, quantity, extras } = req.body;
    await CartItems.update(
      {
        quantity: quantity,
        price: price,
      },
      { where: { id: cartItemId }, transaction }
    );

    if (extras.length === 0) {
      await CartItemsExtras.destroy({
        where: { cartItemId: cartItemId },
        transaction,
      });
    } else {
      const allExtraItems = await CartItemsExtras.findAll({
        where: { cartItemId: cartItemId },
        attributes: ["extraId", "id"],
        include: [
          {
            model: CartItemsExtrasItems,
          },
        ],
      });

      let extraItemsIds = extras.map((e: any) => e.id);
      let existingItemsIds: number[] = [];
      let removeIds: number[] = [];
      allExtraItems?.map((item) => {
        if (!extraItemsIds.includes(item.extraId)) {
          removeIds.push(item.extraId);
        } else {
          existingItemsIds.push(item.extraId);
          extraItemsIds = extraItemsIds.filter(
            (e: number) => e !== item.extraId
          );
        }
      });
      if (removeIds.length > 0) {
        await CartItemsExtras.destroy({
          where: {
            [Op.and]: {
              extraId: {
                [Op.in]: removeIds,
              },
              cartItemId: cartItemId,
            },
          },
          transaction,
        });
      }

      if (extraItemsIds.length > 0) {
        let obj = extraItemsIds.map((e: any) => {
          return {
            extraId: e,
            cartItemId: cartItemId,
          };
        });
        const newCartItemsExtras = await CartItemsExtras.bulkCreate(obj, {
          transaction,
        });

        let cartItemsExtrasItems: any[] = [];
        extras.map((extra: any) => {
          const filterCartItemExtra: any = newCartItemsExtras.find(
            (c) => c.extraId === extra.id
          );
          extra.extraItems.map((itemId: number) => {
            cartItemsExtrasItems.push({
              cartItemsExtrasId: filterCartItemExtra.id,
              itemsExtraId: itemId,
              cartItemId: cartItemId,
            });
          });
        });
        await CartItemsExtrasItems.bulkCreate(cartItemsExtrasItems, {
          transaction,
        });
      }
      if (existingItemsIds.length > 0) {
        const bulkCartItemsExtrasItems: any[] = [];

        await Promise.all(
          extras.map(async (e: any) => {
            if (existingItemsIds.includes(e.id)) {
              const filterCartItemExtra: any = allExtraItems.find(
                (c) => c.extraId === e.id
              );

              const cartItemsExtrasItems = e.extraItems.map(
                (itemId: number) => ({
                  cartItemsExtrasId: filterCartItemExtra.id,
                  itemsExtraId: itemId,
                  cartItemId: cartItemId,
                })
              );
              bulkCartItemsExtrasItems.push(...cartItemsExtrasItems);

              await CartItemsExtrasItems.destroy({
                where: {
                  cartItemId: cartItemId,
                  cartItemsExtrasId: filterCartItemExtra.id,
                },
                transaction,
              });
            }
          })
        );

        if (bulkCartItemsExtrasItems.length > 0) {
          await CartItemsExtrasItems.bulkCreate(bulkCartItemsExtrasItems, {
            transaction,
          });
        }
      }
    }
    await transaction.commit();
    return res.status(200).json({ message: "Order processed successfully" });
  } catch (e) {
    console.log(e);
    await transaction.rollback();
    dataBaseConnectionError(res);
  }
});

export { router as orderRouter };
