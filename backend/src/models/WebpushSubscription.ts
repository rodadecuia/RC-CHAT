import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

@Table
class WebpushSubscription extends Model<WebpushSubscription> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.TEXT)
  endpoint: string;

  @Column
  p256dh: string;

  @Column
  auth: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}

export default WebpushSubscription;
