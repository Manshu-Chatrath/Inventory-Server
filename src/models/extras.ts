import {
  Table,
  Column,
  ForeignKey,
  Model,
  DataType,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import Dishes from "./dishes";
import ExtraItems from "./extraItems";

export interface ExtrasAttrs {
  id?: number;
  name: string;
  dishId: number;
  allowedItems: number;
}

// Define the Client model
@Table({
  tableName: "extras", // Set the table name
  timestamps: false, // Add timestamps (createdAt, updatedAt)
})
class Extras extends Model<ExtrasAttrs> {
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
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  allowedItems: number;

  @ForeignKey(() => Dishes)
  @Column({
    type: DataType.INTEGER,
    onDelete: "CASCADE",
  })
  dishId: number;

  @HasMany(() => ExtraItems)
  extras: ExtraItems[];
}
export default Extras;
