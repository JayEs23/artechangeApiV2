import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';
import AssetManagerV2Abi from '../abi/AssetManagerV2.json';
import { ethers } from 'ethers';
import config from 'src/utils/config';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
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

  async createAsset(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { artId } = createAssetDto;
    const assetManagerAddress = '0x8CfDba8Eaf72f08606D63197E76887E670B38D41';
    const provider = new ethers.providers.AlchemyProvider(
      'goerli',
      'N9Gpuw75XaGoVLAKCDfovvLDBqrhj3hq',
    );

    const signer = new ethers.Wallet(
      '0xb7737cb2e722b11841adda4dce8b2f04a7e4f308a766a8bcec882b0a59aa02cb',
      provider,
    );
    const assetManager = new ethers.Contract(
      assetManagerAddress,
      AssetManagerV2Abi,
      signer,
    );

    const gasEstimate = await assetManager.estimateGas.mint(
      {
        tokenId: ethers.BigNumber.from('1000000000'),
        name: 'art ex',
        symbol: 'THY',
        totalQuantity: ethers.BigNumber.from('1000000000'),
        price: ethers.BigNumber.from('1000000000'),
        issuer: '0x4d2833F8dba51811D6C6f3813F2DF4E1f6f06080',
      },
      { gasLimit: ethers.BigNumber.from('1000000000') },
    );

    console.log(gasEstimate);
    console.log(
      await assetManager.mint(
        {
          tokenId: ethers.BigNumber.from('1000000000'),
          name: 'art ex',
          symbol: 'THY',
          totalQuantity: ethers.BigNumber.from('1000000000'),
          price: ethers.BigNumber.from('1000000000'),
          issuer: '0x8CfDba8Eaf72f08606D63197E76887E670B38D41',
        },
        {
          gasLimit: ethers.BigNumber.from('10000000000000'),
          gasPrice: ethers.BigNumber.from('2100'),
        },
      ),
    );

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
