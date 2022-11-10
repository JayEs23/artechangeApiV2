import { ApiProperty } from '@nestjs/swagger';
export class VerifyUserDto {
  @ApiProperty()
  accountNumber: number;

  @ApiProperty()
  bvn: number;

  @ApiProperty()
  bankCode: number;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;
}
