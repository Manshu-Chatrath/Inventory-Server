import {
  Table,
  Column,
  Model,
  HasMany,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import Dishes from "./dishes";
export interface CategoriesAttrs {
  id?: number;
  name: string;
}

// Define the Client model
@Table({
  tableName: "categories", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Categories extends Model<CategoriesAttrs> {
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
    unique: true,
  })
  name: string;

  @HasMany(() => Dishes)
  dishes: Dishes[];
}
export default Categories;
