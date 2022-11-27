import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import config from 'src/utils/config';
import AssetManagerV2Abi from '../abi/AssetManagerV2.json';

@Injectable()
export class TradeService {
  async fundWallet(fundWalletDto: FundWalletDto) {
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
    try {
      const { blockchainAddress, amount, email } = fundWalletDto;
      const tx = await assetManager.fundWallet(
        blockchainAddress,
        ethers.utils.parseEther(amount),
      );
      const receipt = await tx.wait(1);

      if (receipt.status) {
        const response = {
          hash: tx.hash,
          investorAddress: blockchainAddress,
          email,
          amount,
        };
        return response;
      } else {
        return {
          Error: 'Transaction Failed',
        };
      }
    } catch (err) {
      throw new HttpException(
        'Issuer does not exist',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  findAll() {
    return `This action returns all trade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trade`;
  }

  update(id: number, updateTradeDto: UpdateTradeDto) {
    return `This action updates a #${id} trade`;
  }

  remove(id: number) {
    return `This action removes a #${id} trade`;
  }
}
