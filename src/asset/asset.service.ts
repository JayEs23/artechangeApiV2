import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async findAll(page: string, limit: string) {
    if (parseInt(limit, 10) > 200) {
      throw new HttpException('Limit exceed 200', HttpStatus.BAD_REQUEST);
    }
    const pageOptions = {
      page: parseInt(page, 10) || 0,
      limit: parseInt(limit, 10) || 10,
    };
    const allAssets = await this.assetModel
      .find()
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec();
    if (allAssets.length === 0) {
      throw new HttpException(`No Asset found`, HttpStatus.NOT_FOUND);
    }
    return { data: allAssets };
  }

  async findOne(id: number) {
    const asset = await this.assetModel.findOne({ artId: id });
    return asset;
  }
}
