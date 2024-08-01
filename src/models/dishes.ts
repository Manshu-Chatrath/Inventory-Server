import {
  Table,
  Column,
  Model,
  BelongsToMany,
  DataType,
  ForeignKey,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import Extras from "./extras";
import Categories from "./categories";
import Items_Has_Dishes from "./Items_has_dishes";
import Items from "./items";
export interface DishesAttrs {
  id?: number;
  name: string;
  price: number;
  src: string;
  categoryId: number;
  discount: boolean;
  discountStartDate?: number;
  discountEndDate?: number;
  timeZone?: string;
  discountPercentage?: number;
  discountStartTime?: number;
  discountEndTime?: number;
  isActive: boolean;
  imageUuid?: string;
  description: string;
}

// Define the Client model
@Table({
  tableName: "dishes", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Dishes extends Model<DishesAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id?: number;

  @BelongsToMany(() => Items, {
    through: { model: () => Items_Has_Dishes },
    onDelete: "CASCADE",
  })
  items: Items[];

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL,
  })
  price: number;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
  })
  src: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  timeZone: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  imageUuid: string;

  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
  })
  discountStartDate: number;

  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
  })
  discountEndDate: number;

  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
  })
  discountStartTime: number;

  @ForeignKey(() => Categories)
  @Column({
    type: DataType.INTEGER,
  })
  categoryId: number;

  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
  })
  discountEndTime: number;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
  })
  discountPercentage: number;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  discount: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  @HasMany(() => Extras)
  extras: Extras[];
}
export default Dishes;
