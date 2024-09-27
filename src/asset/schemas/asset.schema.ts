/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssetDocument = Asset & Document;

@Schema({ versionKey: false })
export class Asset {
  @Prop({ required: true })
  artistName: string;

  @Prop({ required: true, unique: true })
  artId: string;

  @Prop({ required: true })
  artTitle: string;

  @Prop({ required: true })
  artSymbol: string;

  @Prop({ required: true })
  artDescription: string;

  @Prop({ required: true })
  artCreationYear: Date;

  @Prop({ required: true })
  issuerEmail: string;

  @Prop()
  artValue: string;

  @Prop()
  artPicture: string;

  @Prop()
  pricePerToken: number;

  @Prop()
  numberOftokens: number;

  @Prop()
  numberOfTokensForSale: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
