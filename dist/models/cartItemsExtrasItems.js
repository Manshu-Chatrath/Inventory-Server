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
const cartItemsExtras_1 = __importDefault(require("./cartItemsExtras"));
const extraItems_1 = __importDefault(require("./extraItems"));
// Define the Client model
let CartItemsExtrasItems = class CartItemsExtrasItems extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    })
], CartItemsExtrasItems.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cartItemsExtras_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
    })
], CartItemsExtrasItems.prototype, "cartItemsExtrasId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => extraItems_1.default)
], CartItemsExtrasItems.prototype, "extraItems", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => extraItems_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    })
], CartItemsExtrasItems.prototype, "itemsExtraId", void 0);
CartItemsExtrasItems = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "cartItemsExtrasItems", // Set the table name
        timestamps: true, // Add timestamps (createdAt, updatedAt)
    })
], CartItemsExtrasItems);
exports.default = CartItemsExtrasItems;
