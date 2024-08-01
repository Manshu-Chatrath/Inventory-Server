import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  AllowNull,
} from "sequelize-typescript";
import Dishes from "./dishes";
import Items_Has_Dishes from "./Items_has_dishes";
export interface ItemsAttrs {
  id?: number;
  name: string;
  quantity: number;
  threshold: number;
}

// Define the Client model
@Table({
  tableName: "items", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Items extends Model<ItemsAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @BelongsToMany(() => Dishes, {
    through: { model: () => Items_Has_Dishes },
    onDelete: "CASCADE",
  })
  dishes: Dishes[];

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  threshold: number;
}
export default Items;
