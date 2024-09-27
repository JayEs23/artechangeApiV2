/* eslint-disable prettier/prettier */
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

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { artId } = createAssetDto;
    try {
      const asset = await this.assetModel.findOne({ artId });
      if (asset) {
        return asset;
      }

      const createdAsset = await new this.assetModel({
        ...createAssetDto,
        createdAt: new Date(),
      }).save();

      return createdAsset;
    } catch (error) {
      throw new HttpException('Error creating asset: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAsset(createAssetDto: CreateAssetDto) {
    const { artId, issuerEmail } = createAssetDto;
    let blockchainAsset;

    const assetManagerAddress = '0x9F10d8C1EcB12a08da39d46430960173d6883100';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/AC7ev2olJLNl9Z4KgI2tGufFh5zYBsqP');
    const signer = new ethers.Wallet(config.blockchain.privateKey, provider);
    const assetManager = new ethers.Contract(assetManagerAddress, AssetManagerV2Abi, signer);

    try {
        // Check if the asset already exists
        const asset = await this.assetModel.findOne({ artId });
        if (asset) {
            blockchainAsset = await assetManager.tokenShares(artId);
            const { _id, ...assetVal } = asset.toObject();
            return { ...assetVal, owner: blockchainAsset.owner, sharesContract: blockchainAsset.sharesContract };
        }

        // Check if the issuer exists
        const issuerObj = await this.userModel.findOne({ email: issuerEmail });
        if (!issuerObj) {
            throw new HttpException('Issuer does not exist', HttpStatus.NOT_FOUND);
        }

        // Prepare asset details
        const ar = {
            tokenId: artId,
            name: createAssetDto.artTitle,
            symbol: createAssetDto.artSymbol,
            totalQuantity: ethers.utils.parseEther(String(createAssetDto.numberOftokens)),
            price: createAssetDto.pricePerToken,
            issuer: issuerObj.ethereumAddress,
        };

        // Get and adjust gas price
        const gasPrice = await provider.getGasPrice();
        const adjustedGasPrice = gasPrice.mul(ethers.BigNumber.from(2));

        // Estimate gas limit
        const gasLimit = 1000000; //await assetManager.estimateGas.mint(ar);

        // Execute the mint transaction
        try {
          const tx = await assetManager.mint(ar, {
              gasPrice: adjustedGasPrice,
              gasLimit: gasLimit,
          });
          console.log('Transaction hash:', tx.hash);
          const txReceipt = await tx.wait(3);
          console.log('Transaction receipt:', txReceipt);
          
        } catch (mintError) {
            console.error("Mint Transaction Error:", mintError);
            throw new HttpException('Error during minting: ' + mintError.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      

        

        // Retrieve blockchain asset details after minting
        blockchainAsset = await assetManager.tokenShares(artId);

        // Save the new asset in the database
        const createdAsset = await new this.assetModel({
            ...createAssetDto,
            createdAt: new Date(),
        }).save();

        return {
            ...createdAsset.toObject(),
            owner: blockchainAsset.owner,
            sharesContract: blockchainAsset.sharesContract,
        };

    } catch (error) {
        console.error("Detailed Error:", error);
        throw new HttpException('Error creating asset on blockchain: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}



  async findAll(page: string, limit: string) {
    if (parseInt(limit, 10) > 200) {
      throw new HttpException('Limit exceeds 200', HttpStatus.BAD_REQUEST);
    }

    const pageOptions = {
      page: parseInt(page, 10) || 0,
      limit: parseInt(limit, 10) || 10,
    };

    try {
      const allAssets = await this.assetModel
        .find()
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .exec();

      if (allAssets.length === 0) {
        throw new HttpException('No assets found', HttpStatus.NOT_FOUND);
      }
      
      return { status: 'success', statusCode: 200, data: allAssets };
    } catch (error) {
      throw new HttpException('Error retrieving assets: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const asset = await this.assetModel.findOne({ artId: id });
      if (!asset) {
        throw new HttpException('Asset not found', HttpStatus.NOT_FOUND);
      }
      return asset;
    } catch (error) {
      throw new HttpException('Error retrieving asset: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
