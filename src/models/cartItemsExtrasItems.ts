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
export interface CartItemsExtrasItemsAttrs {
  id?: number;
  cartItemsExtrasId: number;
  itemsExtraId: number;
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
