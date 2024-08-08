"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.dishesRouter = void 0;
const express_1 = __importDefault(require("express"));
const dataBaseError_1 = require("../util/dataBaseError");
const isAuth_1 = require("../middlewares/isAuth");
const AWS = __importStar(require("aws-sdk"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const dishes_1 = __importDefault(require("../models/dishes"));
const queueService_1 = require("../services/queueService");
const dotenv_1 = __importDefault(require("dotenv"));
const extras_1 = __importDefault(require("../models/extras"));
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const extraItems_1 = __importDefault(require("../models/extraItems"));
const Items_has_dishes_1 = __importDefault(require("../models/Items_has_dishes"));
const items_1 = __importDefault(require("../models/items"));
const router = (0, express_1.default)();
exports.dishesRouter = router;
dotenv_1.default.config();
queueService_1.dishQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = job.data;
    console.log("Queue should be triggered ", id);
    try {
        yield dishes_1.default.update({ discount: false }, { where: { id: id } });
    }
    catch (e) {
        console.error(e);
    }
}));
queueService_1.dishQueue.on("failed", (job, err) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Job failed", job.id);
    console.log(err);
    yield job.retry();
}));
console.log(`Initializing dishQueue with Redis URL: ${process.env.REDIS_URL}`);
if (!process.env.REDIS_URL) {
    console.error("REDIS_URL environment variable is not set.");
}
router.post("/createDish", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        const { itemName, price = 0, status, discountDetails, description = "", src = "", selectedItems, selectedCategory, extraCategories, } = req.body;
        const dish = yield dishes_1.default.create({
            name: itemName,
            categoryId: selectedCategory.id,
            isActive: status === "active" ? true : false,
            discountStartDate: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountDate,
            discountEndDate: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountDate,
            discountStartTime: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountTime,
            discountEndTime: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountTime,
            price: +price,
            discountPercentage: +(discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discountPercentage),
            description: description,
            timeZone: (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.timeZone) ? discountDetails.timeZone : "",
            discount: (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discount) ? discountDetails.discount : false,
            src: src,
        }, { transaction });
        if ((discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discount) &&
            (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountTime) &&
            (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountTime)) {
            queueService_1.dishQueue.add({
                id: dish.id,
            }, {
                delay: dish.endDiscountTime - (0, moment_1.default)().valueOf(),
                attempts: 5,
            });
        }
        const arr = extraCategories.map((item) => {
            return {
                name: item.name,
                dishId: dish.id,
                allowedItems: +item.maxSelection,
            };
        });
        const extras = yield extras_1.default.bulkCreate(arr, {
            transaction,
        });
        let extraItems = [];
        extras.map((extra, index) => {
            extraItems = extraCategories[index].items.map((item) => {
                return {
                    name: item.name,
                    price: +item.price,
                    extraId: extra.id,
                };
            });
        });
        const items = selectedItems.map((item) => {
            return {
                itemId: item,
                dishId: dish.id,
            };
        });
        yield extraItems_1.default.bulkCreate(extraItems, { transaction });
        yield Items_has_dishes_1.default.bulkCreate(items, { transaction });
        yield transaction.commit();
        return res.status(200).json({ message: "Success", id: dish.id });
    }
    catch (e) {
        yield transaction.rollback();
        console.log(e);
    }
}));
router.patch("/editDish", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        const { itemName, id, price = 0, status, discountDetails, description = "", addedSelectedItems, selectedCategory, removeExtraCategories, removedSelectedItems, changedExtraCategories, extraCategories, } = req.body;
        yield dishes_1.default.update({
            name: itemName,
            categoryId: selectedCategory.id,
            isActive: status === "active" ? true : false,
            discountStartDate: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountDate,
            discountEndDate: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountDate,
            discountStartTime: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountTime,
            discountEndTime: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountTime,
            price: +price,
            discountPercentage: +(discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discountPercentage),
            description: description,
            timeZone: discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.timeZone,
            discount: (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discount) ? discountDetails.discount : false,
        }, { where: { id: id }, transaction });
        if ((discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.discount) &&
            (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.startDiscountTime) &&
            (discountDetails === null || discountDetails === void 0 ? void 0 : discountDetails.endDiscountTime)) {
            console.log(discountDetails.endDiscountTime - (0, moment_1.default)().valueOf());
            console.log("This should added in the queue");
            queueService_1.dishQueue.add({
                id: id,
            }, {
                delay: discountDetails.endDiscountTime - (0, moment_1.default)().valueOf(),
                attempts: 5,
            });
        }
        if ((removedSelectedItems === null || removedSelectedItems === void 0 ? void 0 : removedSelectedItems.length) > 0) {
            yield Items_has_dishes_1.default.destroy({
                where: {
                    [sequelize_1.Op.and]: [
                        { dishId: id },
                        { itemId: { [sequelize_1.Op.in]: removedSelectedItems } }, // Use Op.in for bulk operation
                    ],
                },
                transaction,
            });
        }
        if ((addedSelectedItems === null || addedSelectedItems === void 0 ? void 0 : addedSelectedItems.length) > 0) {
            const items = addedSelectedItems.map((item) => {
                return {
                    itemId: item,
                    dishId: id,
                };
            });
            yield Items_has_dishes_1.default.bulkCreate(items, { transaction });
        }
        if ((removeExtraCategories === null || removeExtraCategories === void 0 ? void 0 : removeExtraCategories.length) > 0) {
            yield extras_1.default.destroy({
                where: {
                    [sequelize_1.Op.and]: [
                        { dishId: id },
                        { id: { [sequelize_1.Op.in]: removeExtraCategories } }, // Use Op.in for bulk operation
                    ],
                },
                transaction,
            });
        }
        const addedExtraCategories = extraCategories.filter((item) => !item.id);
        console.log(addedExtraCategories);
        if ((addedExtraCategories === null || addedExtraCategories === void 0 ? void 0 : addedExtraCategories.length) > 0) {
            const arr = addedExtraCategories.map((item) => {
                return {
                    name: item.name,
                    dishId: id,
                    allowedItems: +item.maxSelection,
                };
            });
            const extras = yield extras_1.default.bulkCreate(arr, {
                transaction,
            });
            let extraItems = [];
            extras.map((extra, index) => {
                extraItems = addedExtraCategories[index].items.map((item) => {
                    return {
                        name: item.name,
                        price: +item.price,
                        extraId: extra.id,
                    };
                });
            });
            yield extraItems_1.default.bulkCreate(extraItems, { transaction });
        }
        if ((changedExtraCategories === null || changedExtraCategories === void 0 ? void 0 : changedExtraCategories.length) > 0) {
            yield Promise.all(changedExtraCategories.map((extra) => __awaiter(void 0, void 0, void 0, function* () {
                yield extras_1.default.update({ name: extra.name, allowedItems: +extra.maxSelection, dishId: id }, { where: { id: extra.id }, transaction });
                yield extraItems_1.default.destroy({
                    where: { extraId: extra.id },
                    transaction,
                });
                const extraItems = extra.items.map((item) => {
                    return {
                        name: item.name,
                        price: +item.price,
                        extraId: extra.id,
                    };
                });
                yield extraItems_1.default.bulkCreate(extraItems, { transaction });
            })));
        }
        yield transaction.commit();
        return res.status(200).json({ message: "Success" });
    }
    catch (e) {
        yield transaction.rollback();
        console.log(e);
    }
}));
const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: "ca-central-1",
});
const getSignedUrl = (imageKey, res) => {
    s3.getSignedUrl("putObject", {
        Bucket: "myblogbucket222",
        Key: imageKey,
        ContentType: "image/*",
        Expires: 360000,
    }, (err, url) => {
        if (err) {
            return res.status(500).send({ message: "Some error occured!" });
        }
        return res.send({ imageKey, url });
    });
};
router.get("/getImageUrl/upload", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const imageUuid = (0, uuid_1.v1)();
            const id = req.query.id;
            const imageKey = `${id}/${imageUuid}`;
            const dish = yield dishes_1.default.findOne({
                where: { id: id },
            });
            if (dish === null || dish === void 0 ? void 0 : dish.src) {
                s3.deleteObject({
                    Bucket: "myblogbucket222",
                    Key: `${id}/${dish.imageUuid}`,
                }, function (err) {
                    if (err) {
                        return res.status(500).send({ message: "Some error occured!" });
                    }
                });
            }
            yield dishes_1.default.update({ imageUuid: imageUuid }, { where: { id: id } });
            getSignedUrl(imageKey, res);
        }
        catch (err) {
            console.log(err);
            (0, dataBaseError_1.dataBaseConnectionError)(res);
        }
    }
}));
router.post("/image/upload", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, imageKey } = req.body;
    const imageUrl = `https://myblogbucket222.s3.ca-central-1.amazonaws.com/${imageKey}`;
    try {
        yield dishes_1.default.update({ src: imageUrl }, { where: { id: id } });
        return res.send({ src: imageUrl });
    }
    catch (err) {
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.get("/getDish/:id", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const dish = yield dishes_1.default.findOne({
            where: { id: id },
            include: [
                {
                    model: items_1.default,
                    as: "items",
                },
                {
                    model: extras_1.default,
                    as: "extras",
                    include: [
                        {
                            model: extraItems_1.default,
                        },
                    ],
                },
            ],
        });
        return res.status(200).send({ selectedDish: dish });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.delete("/dish/:id", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield dishes_1.default.destroy({
            where: { id: id },
        });
        s3.deleteObject({
            Bucket: "myblogbucket222",
            Key: `${id}/image`,
        }, function (err) {
            if (err) {
                return res.status(500).send({ message: "Some error occured!" });
            }
        });
        return res.status(200).send({ message: "success" });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
const mapDishes = (dishes) => {
    const allDishes = dishes.map((dish) => {
        var _a, _b;
        const dishPlainObject = dish.get({ plain: true });
        const lowIngeredients = (_b = (_a = dishPlainObject === null || dishPlainObject === void 0 ? void 0 : dishPlainObject.items) === null || _a === void 0 ? void 0 : _a.some((i) => i.quantity < i.threshold)) !== null && _b !== void 0 ? _b : false;
        return Object.assign(Object.assign({}, dishPlainObject), { lowIngeredients });
    });
    return allDishes;
};
router.get("/getDishes", isAuth_1.isAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const index = Number(req.query.index) || 0;
    const count = Number(req.query.count) || 10;
    const search = req.query.search || "";
    const categoryId = Number((_a = req.query) === null || _a === void 0 ? void 0 : _a.categoryId);
    try {
        if (categoryId) {
            const total = yield dishes_1.default.count({
                where: {
                    name: {
                        [sequelize_1.Op.like]: "%" + search + "%",
                    },
                    categoryId: categoryId,
                },
            });
            const dishes = yield dishes_1.default.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.like]: "%" + search + "%",
                    },
                    categoryId: categoryId,
                },
                include: [
                    {
                        model: items_1.default,
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
        else {
            const total = yield dishes_1.default.count({
                where: {
                    name: {
                        [sequelize_1.Op.like]: "%" + search + "%",
                    },
                },
            });
            const dishes = yield dishes_1.default.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.like]: "%" + search + "%",
                    },
                },
                include: [
                    {
                        model: items_1.default,
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
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
