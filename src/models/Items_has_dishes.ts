import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull,
} from "sequelize-typescript";
import Items from "./items";
import Dishes from "./dishes";
export interface Items_Has_DishesAttrs {
  dishId: number;
  itemId: number;
  id?: number;
}

// Define the Client model
@Table({
  tableName: "items_has_dishes", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Items_Has_Dishes extends Model<Items_Has_DishesAttrs> {
  @AllowNull(false)
  @ForeignKey(() => Items)
  @Column(DataType.INTEGER)
  itemId: number;

  @AllowNull(false)
  @ForeignKey(() => Dishes)
  @Column(DataType.INTEGER)
  dishId: number;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;
}
export default Items_Has_Dishes;
