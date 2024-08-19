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
const cartItems_1 = __importDefault(require("./cartItems"));
const extras_1 = __importDefault(require("./extras"));
const cartItemsExtrasItems_1 = __importDefault(require("./cartItemsExtrasItems"));
// Define the Client model
let CartItemsExtras = class CartItemsExtras extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    })
], CartItemsExtras.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cartItems_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
    })
], CartItemsExtras.prototype, "cartItemId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => extras_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    })
], CartItemsExtras.prototype, "extraId", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => cartItemsExtrasItems_1.default)
], CartItemsExtras.prototype, "cartItems", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => extras_1.default)
], CartItemsExtras.prototype, "extras", void 0);
CartItemsExtras = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "cartItemsExtras", // Set the table name
        timestamps: true, // Add timestamps (createdAt, updatedAt)
    })
], CartItemsExtras);
exports.default = CartItemsExtras;
