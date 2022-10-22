import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiHeader({
  name: 'api-key',
  description: 'api-key header',
  required: true,
})
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }

  @Get('/all-assets')
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.assetService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(+id);
  }
}
