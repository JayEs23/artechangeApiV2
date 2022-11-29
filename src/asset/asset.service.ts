import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';
import AssetManagerV2Abi from '../abi/AssetManagerV2.json';
import { ethers } from 'ethers';
import config from 'src/utils/config';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { contentSecurityPolicy } from 'helmet';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  async createAsset(createAssetDto: CreateAssetDto) {
    const { artId, issuerEmail } = createAssetDto;
    let blockchainAsset;

    // Polygon testnet contract
    const assetManagerAddress = '0x1F32c68d80B4a4bB42BEC3639C0f9bf170167860';
    const provider = new ethers.providers.AlchemyProvider(
      'maticmum',
      'N9Gpuw75XaGoVLAKCDfovvLDBqrhj3hq',
    );

    const signer = new ethers.Wallet(config.blockchain.privateKey, provider);
    const assetManager = new ethers.Contract(
      assetManagerAddress,
      AssetManagerV2Abi,
      signer,
    );

    const asset = await this.assetModel.findOne({ artId });

    if (asset) {
      blockchainAsset = await assetManager.tokenShares(createAssetDto.artId);
      const { _id, ...assetVal } = asset.toObject();
      const result = {
        owner: blockchainAsset.owner,
        sharesContract: blockchainAsset.sharesContract,
      };
      // throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
      return { ...assetVal, ...result };
    }

    const issuerObj = await this.userModel.findOne({
      email: issuerEmail,
    });

    if (!issuerObj) {
      throw new HttpException('Issuer does not exist', HttpStatus.NOT_FOUND);
    }

    const ar = {
      tokenId: createAssetDto.artId,
      name: createAssetDto.artTitle,
      symbol: createAssetDto.artSymbol,
      totalQuantity: ethers.utils.parseEther(createAssetDto.numberOftokens),
      price: createAssetDto.pricePerToken,
      issuer: issuerObj.ethereumAddress,
    };
    const assetHash = await assetManager.mint(ar);
    console.log({ assetHash });
    const txReceipt = await assetHash.wait(1);
    blockchainAsset = await assetManager.tokenShares(createAssetDto.artId);
    try {
      if (assetHash) {
        const createdAsset = await new this.assetModel({
          ...createAssetDto,
          createdAt: new Date(),
        }).save();

        const blochainResult = {
          owner: blockchainAsset.owner,
          sharesContract: blockchainAsset.sharesContract,
        };
        const { _id, ...assetValues } = createdAsset.toObject();
        return { ...assetValues, ...blochainResult };
      } else {
        return {
          Error: 'Unable to create asset',
        };
      }
    } catch (err) {
      throw new HttpException(
        'Unable to create asset',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
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
    return { status: 'success', statusCode: 200, data: { ...allAssets } };
  }

  async findOne(id: number) {
    const asset = await this.assetModel.findOne({ artId: id });
    return asset;
  }
}
