import express, { Response } from "express";
import { dataBaseConnectionError } from "../util/dataBaseError";
import { isAuth } from "../middlewares/isAuth";
import { MyRequest } from "../middlewares/isAuth";
import { Sequelize } from "sequelize";
import Categories from "../models/categories";
import Dishes from "../models/dishes";
const router = express();

router.post(
  "/createCategory",
  isAuth,
  async (req: MyRequest, res: Response) => {
    try {
      const { category } = req.body;
      const categoryExists = await Categories.findOne({
        where: { name: category.toLowerCase() },
      });

      if (categoryExists) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const newCategory = await Categories.create({
        name: category.toLowerCase(),
      });
      return res.status(200).json({ category: newCategory });
    } catch (e) {
      dataBaseConnectionError(res);
    }
  }
);

router.delete(
  "/category/:id",
  isAuth,
  async (req: MyRequest, res: Response) => {
    try {
      const { id } = req.params;
      await Categories.destroy({
        where: { id: id },
      });
      return res.status(200).json({ message: "Category deleted" });
    } catch (e) {
      console.log(e);
      dataBaseConnectionError(res);
    }
  }
);

router.patch("/category", isAuth, async (req: MyRequest, res: Response) => {
  try {
    await Categories.update(
      { name: req.body.category.toLowerCase() },
      { where: { id: req.body.id } }
    );
    console.log("here");
    return res.status(200).json({ message: "Success" });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});

router.get("/categories", isAuth, async (req: MyRequest, res: Response) => {
  try {
    const categories = await Categories.findAll({
      include: [
        {
          model: Dishes, // Assuming 'Dishes' is your model name for dishes
          attributes: [], // Exclude dish attributes from the result
          duplicating: false, // Avoid duplication if there are multiple dishes per category
        },
      ],
      attributes: {
        include: [
          // Use Sequelize.fn to count the number of dishes associated with each category
          [Sequelize.fn("COUNT", Sequelize.col("dishes.id")), "quantity"],
        ],
      },
      group: ["Categories.id"], // Group by category ID to ensure proper counting
      order: [["name", "ASC"]],
    });
    return res.status(200).send({ categories });
  } catch (e) {
    console.log(e);
    dataBaseConnectionError(res);
  }
});
export { router as categoryRouter };
