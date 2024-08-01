import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  AllowNull,
} from "sequelize-typescript";

export interface SuperVisorAttrs {
  id?: number;
  password: string;
  otp: string | null;
  status: string;
  email: string;
}

// Define the Client model
@Table({
  tableName: "supervisor", // Set the table name
  timestamps: true, // Add timestamps (createdAt, updatedAt)
})
class Supervisors extends Model<SuperVisorAttrs> {
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
  password: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  status: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  otp: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;
}
export default Supervisors;
