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
const cart_1 = __importDefault(require("../models/cart"));
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
    var _a;
    const transaction = yield database_1.default.transaction();
    try {
        const { id, quantity, extras, name = "", price } = req.body;
        const cart = yield cart_1.default.findOne({
            where: { client_id: req.body.clientId },
            transaction,
        });
        if (!cart) {
            return res.status(404).send({ message: "Cart not found" });
        }
        const cartItem = yield cartItems_1.default.create({
            cartId: (_a = cart.id) !== null && _a !== void 0 ? _a : 0,
            itemId: id,
            quantity: quantity,
            price: price,
            name: name,
            disable: false,
        });
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
                });
            });
        });
        yield cartItemsExtrasItems_1.default.bulkCreate(cartItemsExtrasItems, {
            transaction,
        });
        yield transaction.commit();
        return res.status(200).send({ message: "Item added to cart" });
    }
    catch (error) {
        yield transaction.rollback();
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
router.get("/getCart/:id", clientIsAuth_1.clientIsAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    const clientId = req.params.id;
    try {
        const cart = yield cart_1.default.findOne({
            where: { client_id: clientId },
            transaction,
        });
        let cartItems = yield cartItems_1.default.findAll({
            where: { cartId: cart.id },
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
        const cart = yield cart_1.default.findOne({
            where: { client_id: req.body.userId },
            transaction,
        });
        yield cartItems_1.default.destroy({
            where: {
                [sequelize_1.Op.and]: [
                    { id: req.body.id },
                    { cartId: cart.id }, // Use Op.in for bulk operation
                ],
            },
            transaction,
        });
        yield transaction.commit();
        return res.status(200).send({ message: "Item removed from cart" });
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
router.post("/checkout", clientIsAuth_1.clientIsAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield cart_1.default.findOne({ where: { client_id: req.body.userId } });
        const orderNumber = generateOrderNumber();
        const cartItems = yield cartItems_1.default.findAll({
            where: {
                cartId: cart.id,
            },
        });
        const notValid = cartItems.find((item) => item.disable === true);
        if (notValid) {
            return res.status(400).json({
                message: "Order is not valid. Some items in your cart are unavailable.",
            });
        }
        else {
            new email_1.default(req.body.email, orderNumber);
            yield cartItems_1.default.destroy({
                where: {
                    cartId: cart.id,
                },
            });
            return res
                .status(200)
                .json({ message: "Order processed successfully", orderNumber });
        }
    }
    catch (e) {
        (0, dataBaseError_1.dataBaseConnectionError)(res);
    }
}));
