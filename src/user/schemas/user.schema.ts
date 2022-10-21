import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  @Prop({ unique: true })
  userId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userType: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  ethereumAddress: string;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
