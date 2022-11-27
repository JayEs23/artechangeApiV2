import { ApiProperty } from '@nestjs/swagger';

export class FundWalletDto {
  @ApiProperty({ required: true })
  email: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  blockchainAddress: string;

  @ApiProperty()
  reference: string;
}
