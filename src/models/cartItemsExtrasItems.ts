import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import CartItemsExtras from "./cartItemsExtras";
import ExtraItems from "./extraItems";
import CartItems from "./cartItems";
export interface CartItemsExtrasItemsAttrs {
  id?: number;
  cartItemsExtrasId: number;
  itemsExtraId: number;
  cartItemId: number;
}

// Define the Client model
@Table({
  tableName: "cartItemsExtrasItems", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class CartItemsExtrasItems extends Model<CartItemsExtrasItemsAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @ForeignKey(() => CartItemsExtras)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
  })
  cartItemsExtrasId: number;

  @ForeignKey(() => CartItems)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
  })
  cartItemId: number;

  @BelongsTo(() => ExtraItems)
  extraItems: ExtraItems;

  @ForeignKey(() => ExtraItems)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  itemsExtraId: number;
}
export default CartItemsExtrasItems;
