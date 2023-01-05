import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { BuySharesDto } from './dto/buy-shares.dto';
import config from 'src/utils/config';
import AssetManagerV2Abi from '../abi/AssetManagerV2.json';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { generatePrivateKeyFromMnemonic, Currency } from '@tatumio/tatum';

@Injectable()
export class TradeService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  async fundWallet(fundWalletDto: FundWalletDto) {
    let userID;
    const user = await this.userModel.findOne({ email: fundWalletDto.email });
    if (user) {
      //
      userID = user.userId;
    } else {
      throw new HttpException('user Email not found', HttpStatus.BAD_REQUEST);
    }
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
      // const receipt = await tx.wait(1);

      if (tx) {
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
        `Transaction failed: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async buyNFTShares(buySharesDto: BuySharesDto) {
    let userID;
    const user = await this.userModel.findOne({
      email: buySharesDto.investorEmail,
    });
    if (user) {
      //
      userID = user.userId;
    } else {
      throw new HttpException('User email not found', HttpStatus.BAD_REQUEST);
    }

    // Polygon testnet contract
    const assetManagerAddress = '0x1F32c68d80B4a4bB42BEC3639C0f9bf170167860';
    const provider = new ethers.providers.AlchemyProvider(
      'maticmum',
      'N9Gpuw75XaGoVLAKCDfovvLDBqrhj3hq',
    );

    const userPKey = await generatePrivateKeyFromMnemonic(
      Currency.ETH,
      false,
      config.blockchain.mnemonic,
      Number(userID),
    );

    const masterWallet = new ethers.Wallet(
      config.blockchain.privateKey,
      provider,
    );
    const transaction = {
      nonce: Number((await masterWallet.getTransactionCount()) + 1),
      gasLimit: 21000,
      gasPrice: 20000000000,

      to: buySharesDto.investorAddress,
      // ... or supports ENS names
      // to: "ricmoo.firefly.eth",

      value: ethers.utils.parseUnits('1.0', 16),
      data: '0x',

      // This ensures the transaction cannot be replayed on different networks
      chainId: 80001,
    };

    const trans = masterWallet.signTransaction(transaction);

    trans.then((signedTransaction) => {
      console.log({ signedTransaction });
      provider
        .sendTransaction(signedTransaction)
        .then((tx) => {
          console.log({ tx });
        })
        .catch((err) => {
          console.log({ err });
        });
    });

    const signer = new ethers.Wallet(userPKey, provider);
    const assetManager = new ethers.Contract(
      assetManagerAddress,
      AssetManagerV2Abi,
      signer,
    );
    try {
      const {
        issuerAddress,
        issuerEmail,
        tokenAmount,
        investorAddress,
        artId,
      } = buySharesDto;

      const tx = await assetManager.buyShares(
        artId,
        issuerAddress,
        ethers.utils.parseEther(tokenAmount),
        1,
        { gasPrice: 1500000016, gasLimit: 120000 },
      );

      const receipt = await tx.wait(1);

      if (tx) {
        const response = {
          hash: tx.hash,
          issuerAddress,
          investorAddress,
          tokenAmount,
        };
        return response;
      } else {
        return {
          Error: 'Transaction Failed',
        };
      }
    } catch (err) {
      console.log({ seeError: err }, 'a***********************');
      throw new HttpException(
        `Transaction failed: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
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
