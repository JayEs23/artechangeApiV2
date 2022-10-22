import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  userName: string;

  @ApiProperty({ enum: ['Investor', 'Admin', 'Issuer', 'Broker'] })
  userType: number;
}
