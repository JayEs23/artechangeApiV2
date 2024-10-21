/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';
import AssetManagerV3Abi from '../abi/AssetManagerV3.json';
import { ethers } from 'ethers';
import config from 'src/utils/config';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createAsset(createAssetDto: CreateAssetDto) {
    const { artId, issuerEmail } = createAssetDto;
    let blockchainAsset;

    const assetManagerAddress = '0x7b7f5c56fdaa5c860f14e0130fa69dfa5cf71e5b'; // Contract Address
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/AC7ev2olJLNl9Z4KgI2tGufFh5zYBsqP'); // RPC URL
    // const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/AC7ev2olJLNl9Z4KgI2tGufFh5zYBsqP'); // RPC URL
    const signer = new ethers.Wallet(config.blockchain.privateKey, provider);
    const assetManager = new ethers.Contract(assetManagerAddress, AssetManagerV3Abi, signer);
    // Log the AssetManager instance details
    const logFilePath = path.join(__dirname, '../../logs/asset_manager_log.txt');
    fs.appendFileSync(logFilePath, `AssetManager Instance: ${JSON.stringify(assetManager, null, 2)}\n`);

    // console.log('Asset Manager:', assetManager);

    try {
      // Check if the asset already exists
      const asset = await this.assetModel.findOne({ artId });
      if (asset) {
        // Retrieve blockchain asset
        blockchainAsset = await assetManager.tokenShares(artId);
        const { _id, ...assetVal } = asset.toObject();
        return { ...assetVal, owner: blockchainAsset.owner, sharesContract: blockchainAsset.sharesContract };
      }

      // Check if the issuer exists
      const issuerObj = await this.userModel.findOne({ email: issuerEmail });
      if (!issuerObj) {
        throw new HttpException('Issuer does not exist', HttpStatus.NOT_FOUND);
      }

      // Prepare asset details for minting
      const ar = {
        tokenId: artId,
        name: createAssetDto.artTitle,
        symbol: createAssetDto.artSymbol,
        totalQuantity: ethers.utils.parseEther(String(createAssetDto.numberOftokens)),
        price: createAssetDto.pricePerToken,
        issuer: issuerObj.ethereumAddress,
      };

      // Debugging: log parameters before minting
      console.log('Minting parameters:', [ar]);

      // Estimate gas price and gas limit
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(ethers.BigNumber.from(2)); // Increase gas price for higher priority
      console.log('Gas price:', adjustedGasPrice.toString());

      // const gasLimit = await assetManager.estimateGas.mint(ar);
      // const adjustedGasLimit = gasLimit.mul(ethers.BigNumber.from(2)); // Increase gas limit for safety margin
      // console.log('Gas limit:', adjustedGasLimit.toString());

      const ownerAddress = await assetManager.getOwner();
      console.log("Signer Address ::::=> ", signer.address);
      console.log("Owner Address :::=> ", ownerAddress)
      if (ownerAddress !== signer.address) {
          throw new HttpException('Only the owner can mint assets', HttpStatus.FORBIDDEN);
      }


      // Execute the mint transaction
      try {
        const tx = await assetManager.mint(ar, {
          gasPrice: adjustedGasPrice,
          gasLimit:  ethers.utils.hexlify(7000000),
        });
        console.log('Transaction hash:', tx.hash);

        // Wait for 3 confirmations
        const txReceipt = await tx.wait(3);
        console.log('Transaction receipt:', txReceipt);

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

      } catch (mintError) {
        console.error("Mint Transaction Error:", mintError);
        throw new HttpException('Error during minting: ' + mintError.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

    } catch (error) {
      // console.error("Detailed Error:", error);
      throw new HttpException('Error creating asset on blockchain: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Find all assets with pagination
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

  // Find a single asset by ID
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
