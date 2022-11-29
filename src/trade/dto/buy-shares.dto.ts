import { ApiProperty } from '@nestjs/swagger';

export class BuySharesDto {
  @ApiProperty({ required: true })
  investorAddress: string;

  @ApiProperty({ required: true })
  tokenAmount: string;

  @ApiProperty({ required: true })
  issuerAddress: string;

  @ApiProperty({ required: true })
  issuerEmail: string;

  @ApiProperty({ required: true })
  artId: number;

  @ApiProperty({ required: true })
  investorEmail: string;
}
