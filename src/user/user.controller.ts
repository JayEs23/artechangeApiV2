import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './schemas/user.schema';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';
import { VerifyUserDto } from './dto/verify-user.dto';

@ApiHeader({
  name: 'api-key',
  description: 'api-key header',
  required: true,
})
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/allusers')
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.userService.findAll(page, limit);
  }

  @Get('users-by-role/:role')
  findUsersByrole(@Param('role') role: Role) {
    return this.userService.findUsersByRole(role.toString());
  }

  @Post('/bank-verification')
  verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    return this.userService.verifyUser(verifyUserDto);
  }

  @HttpCode(200)
  @Post('/paystack/webhook')
  webhook(@Body() data) {
    console.log(data);
    return this.userService.webhook(data);
  }
}
