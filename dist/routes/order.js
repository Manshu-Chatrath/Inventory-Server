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
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const clientIsAuth_1 = require("../middlewares/clientIsAuth");
const cartItems_1 = __importDefault(require("../models/cartItems"));
const cartItemsExtras_1 = __importDefault(require("../models/cartItemsExtras"));
const cartItemsExtrasItems_1 = __importDefault(require("../models/cartItemsExtrasItems"));
const email_1 = __importDefault(require("../services/email"));
const extras_1 = __importDefault(require("../models/extras"));
const extraItems_1 = __importDefault(require("../models/extraItems"));
const dishes_1 = __importDefault(require("../models/dishes"));
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const dataBaseError_1 = require("../util/dataBaseError");
const router = (0, express_1.default)();
exports.orderRouter = router;
router.post("/addToCart", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        const { id, quantity, extras, name = "", price, cartId } = req.body;
        const cartItem = yield cartItems_1.default.create({
            cartId: cartId,
            itemId: id,
            quantity: quantity,
            price: price,
            name: name,
            disable: false,
        }, { transaction });
        let totalItems = yield getCartLength(cartId);
        const extraItems = extras.map((extra) => ({
            extraId: extra.id,
            cartItemId: cartItem.id,
        }));
        const cartItemsExtras = yield cartItemsExtras_1.default.bulkCreate(extraItems, {
            transaction,
        });
        let cartItemsExtrasItems = [];
        extras.map((extra) => {
            const filterCartItemExtra = cartItemsExtras.find((c) => c.extraId === extra.id);
            extra.extraItems.map((itemId) => {
                cartItemsExtrasItems.push({
                    cartItemsExtrasId: filterCartItemExtra.id,
                    itemsExtraId: itemId,
                    cartItemId: cartItem.id,
                });
            });
        });
        yield cartItemsExtrasItems_1.default.bulkCreate(cartItemsExtrasItems, {
            transaction,
        });
        yield transaction.commit();
        return res
            .status(200)
            .send({ message: "Item added to cart", cartLength: totalItems });
    }
    catch (error) {
        console.log(error);
        yield transaction.rollback();
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
const getCartLength = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cartItems = yield cartItems_1.default.findAll({
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
});
router.get("/cartLength/:id", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let totalItems = yield getCartLength(+req.params.id);
        return res
            .status(200)
            .send({ message: "Item added to cart", cartLength: totalItems });
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.get("/getCart/:id", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        let cartItems = yield cartItems_1.default.findAll({
            where: { cartId: req.params.id },
            include: [
                {
                    model: dishes_1.default,
                    as: "dish",
                    required: false,
                    attributes: ["id", "name", "isActive", "src"],
                },
                {
                    model: cartItemsExtras_1.default,
                    attributes: ["id"],
                    include: [
                        {
                            model: extras_1.default,
                            as: "extras",
                            required: false,
                            attributes: ["id", "name"],
                        },
                        {
                            model: cartItemsExtrasItems_1.default,
                            attributes: ["id"],
                            include: [
                                {
                                    model: extraItems_1.default,
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
        const allCartItems = [];
        cartItems.map((item) => {
            let extraItems = [];
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
        yield transaction.commit();
        return res
            .status(200)
            .send({ message: "Item added to cart", cartItems: allCartItems });
    }
    catch (error) {
        console.log(error);
        yield transaction.rollback();
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.post("/deleteCartItem", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        yield cartItems_1.default.destroy({
            where: {
                [sequelize_1.Op.and]: [
                    { id: req.body.id },
                    { cartId: req.body.cartId }, // Use Op.in for bulk operation
                ],
            },
            transaction,
        });
        let totalItems = yield getCartLength(req.body.cartId);
        yield transaction.commit();
        return res
            .status(200)
            .send({ message: "Item removed from cart", cartLength: totalItems });
    }
    catch (error) {
        console.log(error);
        yield transaction.rollback();
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
function generateOrderNumber() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000);
    return `ORD-${timestamp}-${randomNum}`;
}
router.post("/checkout", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderNumber = generateOrderNumber();
        const cartItems = yield cartItems_1.default.findAll({
            where: {
                cartId: req.body.cartId,
            },
        });
        const notValid = cartItems.find((item) => item.disable === true);
        if (notValid) {
            return res.status(400).json({
                message: "Order is not valid. Some items in your cart are unavailable.",
            });
        }
        else {
            const sendEmail = new email_1.default(req.body.email, orderNumber, "client");
            yield sendEmail.sendEmail();
            yield cartItems_1.default.destroy({
                where: {
                    cartId: req.body.cartId,
                },
            });
            return res
                .status(200)
                .json({ message: "Order processed successfully", orderNumber });
        }
    }
    catch (e) {
        console.log(e);
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.put("/editCartItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        const { cartItemId, price, quantity, extras } = req.body;
        yield cartItems_1.default.update({
            quantity: quantity,
            price: price,
        }, { where: { id: cartItemId }, transaction });
        if (extras.length === 0) {
            yield cartItemsExtras_1.default.destroy({
                where: { cartItemId: cartItemId },
                transaction,
            });
        }
        else {
            const allExtraItems = yield cartItemsExtras_1.default.findAll({
                where: { cartItemId: cartItemId },
                attributes: ["extraId", "id"],
                include: [
                    {
                        model: cartItemsExtrasItems_1.default,
                    },
                ],
            });
            let extraItemsIds = extras.map((e) => e.id);
            let existingItemsIds = [];
            let removeIds = [];
            allExtraItems === null || allExtraItems === void 0 ? void 0 : allExtraItems.map((item) => {
                if (!extraItemsIds.includes(item.extraId)) {
                    removeIds.push(item.extraId);
                }
                else {
                    existingItemsIds.push(item.extraId);
                    extraItemsIds = extraItemsIds.filter((e) => e !== item.extraId);
                }
            });
            if (removeIds.length > 0) {
                yield cartItemsExtras_1.default.destroy({
                    where: {
                        [sequelize_1.Op.and]: {
                            extraId: {
                                [sequelize_1.Op.in]: removeIds,
                            },
                            cartItemId: cartItemId,
                        },
                    },
                    transaction,
                });
            }
            if (extraItemsIds.length > 0) {
                let obj = extraItemsIds.map((e) => {
                    return {
                        extraId: e,
                        cartItemId: cartItemId,
                    };
                });
                const newCartItemsExtras = yield cartItemsExtras_1.default.bulkCreate(obj, {
                    transaction,
                });
                let cartItemsExtrasItems = [];
                extras.map((extra) => {
                    const filterCartItemExtra = newCartItemsExtras.find((c) => c.extraId === extra.id);
                    extra.extraItems.map((itemId) => {
                        cartItemsExtrasItems.push({
                            cartItemsExtrasId: filterCartItemExtra.id,
                            itemsExtraId: itemId,
                            cartItemId: cartItemId,
                        });
                    });
                });
                yield cartItemsExtrasItems_1.default.bulkCreate(cartItemsExtrasItems, {
                    transaction,
                });
            }
            if (existingItemsIds.length > 0) {
                const bulkCartItemsExtrasItems = [];
                yield Promise.all(extras.map((e) => __awaiter(void 0, void 0, void 0, function* () {
                    if (existingItemsIds.includes(e.id)) {
                        const filterCartItemExtra = allExtraItems.find((c) => c.extraId === e.id);
                        const cartItemsExtrasItems = e.extraItems.map((itemId) => ({
                            cartItemsExtrasId: filterCartItemExtra.id,
                            itemsExtraId: itemId,
                            cartItemId: cartItemId,
                        }));
                        bulkCartItemsExtrasItems.push(...cartItemsExtrasItems);
                        yield cartItemsExtrasItems_1.default.destroy({
                            where: {
                                cartItemId: cartItemId,
                                cartItemsExtrasId: filterCartItemExtra.id,
                            },
                            transaction,
                        });
                    }
                })));
                if (bulkCartItemsExtrasItems.length > 0) {
                    yield cartItemsExtrasItems_1.default.bulkCreate(bulkCartItemsExtrasItems, {
                        transaction,
                    });
                }
            }
        }
        yield transaction.commit();
        return res.status(200).json({ message: "Order processed successfully" });
    }
    catch (e) {
        console.log(e);
        yield transaction.rollback();
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
