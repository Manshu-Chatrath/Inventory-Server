import express, { Response } from "express";
import { dataBaseConnectionError } from "../util/dataBaseError";
import { isAuth } from "../middlewares/isAuth";
import { MyRequest } from "../middlewares/isAuth";
import Items from "../models/items";
import { Op } from "sequelize";

const router = express();
router.post("/createItem", isAuth, async (req: MyRequest, res: Response) => {
  try {
    const { itemName, quantity, threshold } = req.body;
    const itemExists = await Items.findOne({
      where: { name: itemName.toLowerCase() },
    });

    if (itemExists) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const item = await Items.create({
      name: itemName.toLowerCase(),
      quantity: +quantity, //+ is used to convert string to number
      threshold: +threshold, //+ is used to convert string to number
    });

    return res.status(200).json({ item: item });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.get("/getItems", isAuth, async (req: MyRequest, res) => {
  try {
    const index = Number(req.query.index) || 0;
    const count = Number(req.query.count) || 10;
    const search = req.query.search || "";
    const total = await Items.count({
      where: {
        name: {
          [Op.like]: "%" + search + "%",
        },
      },
    });
    const items: any = await Items.findAll({
      where: {
        name: {
          [Op.like]: "%" + search + "%",
        },
      },
      offset: index,
      limit: count,
      order: [["name", "ASC"]],
    });
    return res.status(200).send({ items: items, total: total });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});
router.delete("/items/:id", isAuth, async (req: MyRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Items.destroy({
      where: { id: id },
    });
    return res.status(200).json({ message: "Item got deleted" });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.patch("/items", isAuth, async (req: MyRequest, res: Response) => {
  try {
    await Items.update(
      {
        name: req.body.itemName.toLowerCase(),
        quantity: +req.body.quantity, //+ is used to convert string to number
        threshold: +req.body.threshold, //+ is used to convert string to number
      },
      { where: { id: req.body.id } }
    );
    return res.status(200).json({ message: "Success" });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});
export { router as itemRouter };
