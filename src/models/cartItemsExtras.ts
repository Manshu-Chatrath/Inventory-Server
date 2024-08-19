import {
  Table,
  Column,
  HasMany,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
} from "sequelize-typescript";

import CartItems from "./cartItems";
import Extras from "./extras";
import CartItemsExtrasItems from "./cartItemsExtrasItems";
export interface CartItemsExtrasAttrs {
  id?: number;
  cartItemId: number;
  extraId: number;
}

// Define the Client model
@Table({
  tableName: "cartItemsExtras", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class CartItemsExtras extends Model<CartItemsExtrasAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @ForeignKey(() => CartItems)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
  })
  cartItemId: number;

  @ForeignKey(() => Extras)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  extraId: number;

  @HasMany(() => CartItemsExtrasItems)
  cartItems: CartItemsExtrasItems[];

  @BelongsTo(() => Extras)
  extras: Extras;
}
export default CartItemsExtras;
