"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dishes_1 = __importDefault(require("./dishes"));
const cart_1 = __importDefault(require("./cart"));
const cartItemsExtras_1 = __importDefault(require("./cartItemsExtras"));
// Define the Client model
let CartItems = class CartItems extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    })
], CartItems.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        allowNull: false,
    })
], CartItems.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false,
    })
], CartItems.prototype, "disable", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cart_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
    })
], CartItems.prototype, "cartId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => dishes_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    })
], CartItems.prototype, "itemId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    })
], CartItems.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    })
], CartItems.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => dishes_1.default)
], CartItems.prototype, "dish", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => cartItemsExtras_1.default)
], CartItems.prototype, "cartItemsExtras", void 0);
CartItems = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "cartItems", // Set the table name
        timestamps: true, // Add timestamps (createdAt, updatedAt)
    })
], CartItems);
exports.default = CartItems;
