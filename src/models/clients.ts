import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  HasOne,
} from "sequelize-typescript";
import Cart from "./cart";
export interface ClientAttrs {
  id?: number;
  clientId: string;
  email: string | null;
  name: string;
}

// Define the Client model
@Table({
  tableName: "clients", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Clients extends Model<ClientAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  clientId: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @HasOne(() => Cart)
  cart: Cart;
}
export default Clients;
