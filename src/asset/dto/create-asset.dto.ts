import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ required: true })
  artistName: string;

  @ApiProperty()
  artId: string;

  @ApiProperty()
  artTitle: string;

  @ApiProperty()
  artSymbol: string;

  @ApiProperty()
  artDescription: string;

  @ApiProperty()
  artCreationYear: Date;

  @ApiProperty()
  issuerEmail: string;

  @ApiProperty()
  artValue: string;

  @ApiProperty()
  artPicture: string;

  @ApiProperty()
  pricePerToken: number;

  @ApiProperty()
  numberOfTokens: string;

  @ApiProperty()
  numberOfTokensForSale: string;
}
