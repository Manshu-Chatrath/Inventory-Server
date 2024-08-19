import express, { Response } from "express";
import { dataBaseConnectionError } from "../util/dataBaseError";
import { isAuth } from "../middlewares/isAuth";
import * as AWS from "aws-sdk";
import { MyRequest } from "../middlewares/isAuth";
import { v1 as uuid } from "uuid";
import { Op } from "sequelize";
import Dishes from "../models/dishes";
import Extras from "../models/extras";
import sequelize from "../database";
import ExtraItems from "../models/extraItems";
import Items_Has_Dishes from "../models/Items_has_dishes";
import Items from "../models/items";
import CartItems from "../models/cartItems";
const router = express();
router.post("/createDish", isAuth, async (req: MyRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      itemName,
      price = 0,
      status,
      discountDetails,
      description = "",
      src = "",
      selectedItems,
      selectedCategory,
      extraCategories,
    } = req.body;

    const dish: any = await Dishes.create(
      {
        name: itemName,
        categoryId: selectedCategory.id,
        isActive: status === "active" ? true : false,
        discountStartDate: discountDetails?.startDiscountDate,
        discountEndDate: discountDetails?.endDiscountDate,
        discountStartTime: discountDetails?.startDiscountTime,
        discountEndTime: discountDetails?.endDiscountTime,
        price: +price,
        discountPercentage: +discountDetails?.discountPercentage,
        description: description,
        timeZone: discountDetails?.timeZone ? discountDetails.timeZone : "",
        discount: discountDetails?.discount ? discountDetails.discount : false,
        src: src,
      },
      { transaction }
    );

    const arr = extraCategories.map((item: any) => {
      return {
        name: item.name,
        dishId: dish.id,
        allowedItems: +item.maxSelection,
      };
    });
    const extras = await Extras.bulkCreate(arr, {
      transaction,
    });
    let extraItems: any[] = [];
    extras.map((extra: any, index) => {
      extraItems = extraCategories[index].items.map((item: any) => {
        return {
          name: item.name,
          price: +item.price,
          extraId: extra.id,
        };
      });
    });

    const items = selectedItems.map((item: any) => {
      return {
        itemId: item,
        dishId: dish.id,
      };
    });
    await ExtraItems.bulkCreate(extraItems, { transaction });
    await Items_Has_Dishes.bulkCreate(items, { transaction });
    await transaction.commit();
    return res.status(200).json({ message: "Success", id: dish.id });
  } catch (e) {
    await transaction.rollback();
    console.log(e);
  }
});

router.patch("/editDish", isAuth, async (req: MyRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      itemName,
      id,
      price = 0,
      status,
      discountDetails,
      description = "",
      addedSelectedItems,
      selectedCategory,
      removeExtraCategories,
      removedSelectedItems,
      changedExtraCategories,
      extraCategories,
    } = req.body;

    await Dishes.update(
      {
        name: itemName,
        categoryId: selectedCategory.id,
        isActive: status === "active" ? true : false,
        discountStartDate: discountDetails?.startDiscountDate,
        discountEndDate: discountDetails?.endDiscountDate,
        discountStartTime: discountDetails?.startDiscountTime,
        discountEndTime: discountDetails?.endDiscountTime,
        price: +price,
        discountPercentage: +discountDetails?.discountPercentage,
        description: description,
        timeZone: discountDetails?.timeZone,
        discount: discountDetails?.discount ? discountDetails.discount : false,
      },
      { where: { id: id }, transaction }
    );

    if (removedSelectedItems?.length > 0) {
      await Items_Has_Dishes.destroy({
        where: {
          [Op.and]: [
            { dishId: id },
            { itemId: { [Op.in]: removedSelectedItems } }, // Use Op.in for bulk operation
          ],
        },
        transaction,
      });
    }

    if (addedSelectedItems?.length > 0) {
      const items = addedSelectedItems.map((item: any) => {
        return {
          itemId: item,
          dishId: id,
        };
      });
      await Items_Has_Dishes.bulkCreate(items, { transaction });
    }

    if (removeExtraCategories?.length > 0) {
      await Extras.destroy({
        where: {
          [Op.and]: [
            { dishId: id },
            { id: { [Op.in]: removeExtraCategories } }, // Use Op.in for bulk operation
          ],
        },
        transaction,
      });
    }

    const addedExtraCategories = extraCategories.filter(
      (item: any) => !item.id
    );

    if (addedExtraCategories?.length > 0) {
      const arr = addedExtraCategories.map((item: any) => {
        return {
          name: item.name,
          dishId: id,
          allowedItems: +item.maxSelection,
        };
      });
      const extras = await Extras.bulkCreate(arr, {
        transaction,
      });
      let extraItems: any[] = [];
      extras.map((extra: any, index) => {
        extraItems = addedExtraCategories[index].items.map((item: any) => {
          return {
            name: item.name,
            price: +item.price,
            extraId: extra.id,
          };
        });
      });
      await ExtraItems.bulkCreate(extraItems, { transaction });
    }

    if (changedExtraCategories?.length > 0) {
      await Promise.all(
        changedExtraCategories.map(async (extra: any) => {
          await Extras.update(
            { name: extra.name, allowedItems: +extra.maxSelection, dishId: id },
            { where: { id: extra.id }, transaction }
          );

          await ExtraItems.destroy({
            where: { extraId: extra.id },
            transaction,
          });
          const extraItems = extra.items.map((item: any) => {
            return {
              name: item.name,
              price: +item.price,
              extraId: extra.id,
            };
          });
          await ExtraItems.bulkCreate(extraItems, { transaction });
        })
      );
    }
    await CartItems.update(
      {
        disable: true,
      },
      {
        where: { itemId: id },
      }
    );
    await transaction.commit();
    return res.status(200).json({ message: "Success" });
  } catch (e) {
    await transaction.rollback();
    console.log(e);
  }
});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: "ca-central-1",
});

const getSignedUrl = (imageKey: string, res: Response) => {
  s3.getSignedUrl(
    "putObject",
    {
      Bucket: "myblogbucket222",
      Key: imageKey,
      ContentType: "image/*",
      Expires: 360000,
    },
    (err: Error, url: string) => {
      if (err) {
        return res.status(500).send({ message: "Some error occured!" });
      }
      return res.send({ imageKey, url });
    }
  );
};

router.get(
  "/getImageUrl/upload",
  isAuth,
  async (req: MyRequest, res: Response) => {
    {
      try {
        const imageUuid = uuid();
        const id: any = req.query.id;
        const imageKey = `${id}/${imageUuid}`;
        const dish = await Dishes.findOne({
          where: { id: id },
        });
        if (dish?.src) {
          s3.deleteObject(
            {
              Bucket: "myblogbucket222",
              Key: `${id}/${dish.imageUuid}`,
            },
            function (err: Error) {
              if (err) {
                return res.status(500).send({ message: "Some error occured!" });
              }
            }
          );
        }
        await Dishes.update({ imageUuid: imageUuid }, { where: { id: id } });
        getSignedUrl(imageKey, res);
      } catch (err) {
        console.log(err);
        dataBaseConnectionError(res);
      }
    }
  }
);

router.post("/image/upload", isAuth, async (req: MyRequest, res: Response) => {
  const { id, imageKey } = req.body;

  const imageUrl = `https://myblogbucket222.s3.ca-central-1.amazonaws.com/${imageKey}`;
  try {
    await Dishes.update({ src: imageUrl }, { where: { id: id } });
    return res.send({ src: imageUrl });
  } catch (err) {
    dataBaseConnectionError(res);
  }
});

router.get("/getDish/:id", async (req: MyRequest, res: Response) => {
  const { id } = req.params;
  try {
    const dish = await Dishes.findOne({
      where: { id: id },
      include: [
        {
          model: Items,
          as: "items",
        },
        {
          model: Extras,
          as: "extras",
          include: [
            {
              model: ExtraItems,
            },
          ],
        },
      ],
    });
    return res.status(200).send({ selectedDish: dish });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.delete("/dish/:id", isAuth, async (req: MyRequest, res: Response) => {
  const { id } = req.params;
  try {
    await Dishes.destroy({
      where: { id: id },
    });
    s3.deleteObject(
      {
        Bucket: "myblogbucket222",
        Key: `${id}/image`,
      },
      function (err: Error) {
        if (err) {
          return res.status(500).send({ message: "Some error occured!" });
        }
      }
    );
    return res.status(200).send({ message: "success" });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

const mapDishes = (dishes: any) => {
  const allDishes = dishes.map((dish: any) => {
    const dishPlainObject = dish.get({ plain: true });
    const lowIngeredients =
      dishPlainObject?.items?.some((i: any) => i.quantity < i.threshold) ??
      false;
    return { ...dishPlainObject, lowIngeredients };
  });
  return allDishes;
};

router.get("/getDishes", async (req: MyRequest, res: Response) => {
  const index = Number(req.query.index) || 0;
  const count = Number(req.query.count) || 10;
  const search = req.query.search || "";
  const categoryId = Number(req.query?.categoryId);
  try {
    if (categoryId) {
      const total = await Dishes.count({
        where: {
          name: {
            [Op.like]: "%" + search + "%",
          },
          categoryId: categoryId,
        },
      });

      const dishes = await Dishes.findAll({
        where: {
          name: {
            [Op.like]: "%" + search + "%",
          },
          categoryId: categoryId,
        },
        include: [
          {
            model: Items,
            as: "items",
          },
        ],
        offset: index,
        limit: count,
        order: [["name", "ASC"]],
      });
      const allDishes = mapDishes(dishes);
      return res.status(200).send({ dishes: allDishes, total: total });
    } else {
      const total = await Dishes.count({
        where: {
          name: {
            [Op.like]: "%" + search + "%",
          },
        },
      });

      const dishes = await Dishes.findAll({
        where: {
          name: {
            [Op.like]: "%" + search + "%",
          },
        },
        include: [
          {
            model: Items,
            as: "items",
          },
        ],
        offset: index,
        limit: count,
        order: [["name", "ASC"]],
      });

      const allDishes = mapDishes(dishes);
      return res.status(200).send({ dishes: allDishes, total: total });
    }
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

export { router as dishesRouter };
