import {
  Table,
  Column,
  ForeignKey,
  Model,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import Extras from "./extras";

export interface ExtraItemsAttrs {
  id?: number;
  name: string;
  price: number;
  extraId: number;
}

// Define the Client model
@Table({
  tableName: "extraItems", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class ExtraItems extends Model<ExtraItemsAttrs> {
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
  name: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;

  @ForeignKey(() => Extras)
  @Column({
    type: DataType.INTEGER,
    onDelete: "CASCADE",
  })
  extraId: number;
}
export default ExtraItems;
