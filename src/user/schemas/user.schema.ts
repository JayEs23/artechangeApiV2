/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  Investor,
  Admin,
  Issuer,
  Broke,
}

@Schema()
class Identification {
  @Prop()
  country: string;

  @Prop()
  typek: string;

  @Prop()
  account_number: string;

  @Prop()
  bvn: string;

  @Prop()
  bank_code: string;
}
@Schema()
class Customer {
  @Prop()
  customer_id: number;

  @Prop()
  customer_code: string;

  @Prop()
  email: string;

  @Prop()
  identification: Identification;

  @Prop()
  reason: string;
}
@Schema()
class VerificationData {
  @Prop()
  event: string;

  @Prop()
  data: Customer;
}
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

  @Prop({ required: true, enum: Role })
  userType: Role;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  ethereumAddress: string;

  @Prop()
  verification: VerificationData;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
