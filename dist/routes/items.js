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
exports.itemRouter = void 0;
const express_1 = __importDefault(require("express"));
const dataBaseError_1 = require("../util/dataBaseError");
const isAuth_1 = require("../middlewares/isAuth");
const items_1 = __importDefault(require("../models/items"));
const sequelize_1 = require("sequelize");
const router = (0, express_1.default)();
exports.itemRouter = router;
router.post("/createItem", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemName, quantity, threshold } = req.body;
        const itemExists = yield items_1.default.findOne({
            where: { name: itemName.toLowerCase() },
        });
        if (itemExists) {
            return res.status(400).json({ message: "Item already exists" });
        }
        const item = yield items_1.default.create({
            name: itemName.toLowerCase(),
            quantity: +quantity, //+ is used to convert string to number
            threshold: +threshold, //+ is used to convert string to number
        });
        return res.status(200).json({ item: item });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.get("/getItems", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const index = Number(req.query.index) || 0;
        const count = Number(req.query.count) || 10;
        const search = req.query.search || "";
        const total = yield items_1.default.count({
            where: {
                name: {
                    [sequelize_1.Op.like]: search + "%",
                },
            },
        });
        const items = yield items_1.default.findAll({
            where: {
                name: {
                    [sequelize_1.Op.like]: search + "%",
                },
            },
            offset: index,
            limit: count,
            order: [["name", "ASC"]],
        });
        return res.status(200).send({ items: items, total: total });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.delete("/items/:id", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield items_1.default.destroy({
            where: { id: id },
        });
        return res.status(200).json({ message: "Item got deleted" });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.patch("/items", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield items_1.default.update({
            name: req.body.itemName.toLowerCase(),
            quantity: +req.body.quantity, //+ is used to convert string to number
            threshold: +req.body.threshold, //+ is used to convert string to number
        }, { where: { id: req.body.id } });
        console.log("here");
        return res.status(200).json({ message: "Success" });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
