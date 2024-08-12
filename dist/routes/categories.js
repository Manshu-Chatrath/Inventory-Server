"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const dataBaseError_1 = require("../util/dataBaseError");
const isAuth_1 = require("../middlewares/isAuth");
const sequelize_1 = require("sequelize");
const categories_1 = __importDefault(require("../models/categories"));
const dishes_1 = __importDefault(require("../models/dishes"));
const router = (0, express_1.default)();
exports.categoryRouter = router;
router.post("/createCategory", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.body;
        const categoryExists = yield categories_1.default.findOne({
            where: { name: category.toLowerCase() },
        });
        if (categoryExists) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = yield categories_1.default.create({
            name: category.toLowerCase(),
        });
        return res.status(200).json({ category: newCategory });
    }
    catch (e) {
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.delete("/category/:id", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield categories_1.default.destroy({
            where: { id: id },
        });
        return res.status(200).json({ message: "Category deleted" });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.patch("/category", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield categories_1.default.update({ name: req.body.category.toLowerCase() }, { where: { id: req.body.id } });
        return res.status(200).json({ message: "Success" });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categories_1.default.findAll({
            include: [
                {
                    model: dishes_1.default, // Assuming 'Dishes' is your model name for dishes
                    attributes: [], // Exclude dish attributes from the result
                    duplicating: false, // Avoid duplication if there are multiple dishes per category
                },
            ],
            attributes: {
                include: [
                    // Use Sequelize.fn to count the number of dishes associated with each category
                    [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("dishes.id")), "quantity"],
                ],
            },
            group: ["Categories.id"], // Group by category ID to ensure proper counting
            order: [["name", "ASC"]],
        });
        return res.status(200).send({ categories });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
