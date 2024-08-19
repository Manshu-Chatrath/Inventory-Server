import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import Dishes from "./dishes";
import Cart from "./cart";
import CartItemsExtras from "./cartItemsExtras";
import { bool } from "aws-sdk/clients/signer";

export interface CartItemsAttrs {
  id?: number;
  cartId: number;
  itemId: number;
  name: string;
  disable?: boolean;
  price: number;
  quantity: number;
}

// Define the Client model
@Table({
  tableName: "cartItems", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class CartItems extends Model<CartItemsAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  disable: bool;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
  })
  cartId: number;

  @ForeignKey(() => Dishes)
  @Column({
    type: DataType.INTEGER,
  })
  itemId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @BelongsTo(() => Dishes)
  dish: Dishes;

  @HasMany(() => CartItemsExtras)
  cartItemsExtras: CartItemsExtras[];
}
export default CartItems;
