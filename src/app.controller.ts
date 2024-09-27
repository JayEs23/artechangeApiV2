/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiHeader({
  name: 'api-key',
  description: 'api-key header',
  required: true,
})
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
