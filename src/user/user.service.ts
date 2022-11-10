import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { generateAddressFromXPub, Currency } from '@tatumio/tatum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { Role, User, UserDocument } from './schemas/user.schema';
import config from 'src/utils/config';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map, Observable, tap } from 'rxjs';
import https from 'https';
import { VerifyUserDto } from './dto/verify-user.dto';
import { createECDH } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { userId } = createUserDto;
    const user = await this.userModel.findOne({ userId });
    if (user) {
      // throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
      return this.sanitizeUser(user);
    }

    /**
     * Generate Ethereum address for each user from the master mnemonic
     * using the userId
     */
    const ethAddress = generateAddressFromXPub(
      Currency.ETH,
      false,
      config.blockchain.xpub,
      parseInt(userId),
    );

    const createdUser = await new this.userModel({
      ...createUserDto,
      createdAt: new Date(),
      ethereumAddress: ethAddress,
    }).save();

    return this.sanitizeUser(createdUser);
  }

  sanitizeUser(user) {
    const sanitized = user.toObject();
    sanitized.blockchainAddress = sanitized.ethereumAddress;
    delete sanitized['_id'];
    delete sanitized['ethereumAddress'];
    return sanitized;
  }

  async findAll(page: string, limit: string) {
    if (parseInt(limit, 10) > 200) {
      throw new HttpException('Limit exceed 200', HttpStatus.BAD_REQUEST);
    }
    const pageOptions = {
      page: parseInt(page, 10) || 0,
      limit: parseInt(limit, 10) || 10,
    };
    const allUsers = await this.userModel
      .find()
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec();
    if (allUsers.length === 0) {
      throw new HttpException(`No user found`, HttpStatus.NOT_FOUND);
    }

    const all = allUsers.map((user) => this.sanitizeUser(user));

    return { status: 'success', statusCode: 200, data: { ...all } };
  }

  async findUsersByRole(role: string) {
    const roleInt = parseInt(role, 10) || 0;
    const users = await this.userModel.find({ userType: roleInt });
    if (users.length === 0) {
      throw new HttpException(
        `No user with the role ${role} found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return users;
  }

  async verifyUser(userDetails: VerifyUserDto): Promise<any> {
    const createUserParams = JSON.stringify({
      email: userDetails.email,
      first_name: userDetails.firstname,
      last_name: userDetails.lastname,
      phone: userDetails.phone,
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/customer/CUS_z7wcqorxf26ztts/identification',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_TEST_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    let customerCode;
    try {
      const resp = await lastValueFrom(
        this.httpService
          .post('https://api.paystack.co/customer', createUserParams, options)
          .pipe(map((resp) => resp.data)),
      );
      customerCode = resp.data.customer_code;
    } catch (error) {
      return error.response.data;
    }
    const params = JSON.stringify({
      country: 'NG',
      type: 'bank_account',
      account_number: userDetails.accountNumber,
      bvn: userDetails.bvn,
      bank_code: userDetails.bankCode,
      first_name: userDetails.firstname,
      last_name: userDetails.lastname,
    });

    try {
      const resp = await lastValueFrom(
        this.httpService
          .post(
            `https://api.paystack.co/customer/${customerCode}/identification`,
            params,
            options,
          )
          .pipe(map((resp) => resp.data)),
      );
      return resp;
    } catch (error) {
      return error.response.data;
    }
  }
  async webhook(data) {
    if (data?.event?.inludes('customeridentification')) {
      this.userModel.findOneAndUpdate(
        { email: data.data.email },
        { verification: data },
        { new: true },
      );
    }
    return data;
  }
}
