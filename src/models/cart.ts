import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  HasMany,
} from "sequelize-typescript";
import Clients from "./clients";
import CartItems from "./cartItems";
export interface CartAttrs {
  id?: number;
  client_id: number;
}

// Define the Client model
@Table({
  tableName: "cart", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Cart extends Model<CartAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @ForeignKey(() => Clients)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  client_id: number;

  @HasMany(() => CartItems)
  cartItems: CartItems[];
}
export default Cart;
