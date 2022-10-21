import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { generateAddressFromXPub, Currency } from '@tatumio/tatum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import config from 'src/utils/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { userId } = createUserDto;
    const user = await this.userModel.findOne({ userId });
    if (user) {
      // throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
      return this.sanitizeUser(user);
    }

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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
