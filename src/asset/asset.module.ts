/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { LogMiddleware } from './log.middleware';

@Module({
  controllers: [AssetController],
  providers: [AssetService],
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class AssetModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: 'asset/create', method: RequestMethod.POST });
  }
}
