import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    const { artId } = createAssetDto;
    const asset = await this.assetModel.findOne({ artId });
    if (asset) {
      // throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
      return asset;
    }

    const createdAsset = await new this.assetModel({
      ...createAssetDto,
      createdAt: new Date(),
    }).save();

    return createdAsset;
  }

  findAll() {
    return `This action returns all asset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
