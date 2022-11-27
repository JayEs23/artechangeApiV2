import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AssetModule } from './asset/asset.module';
import { TradeModule } from './trade/trade.module';
import config from './utils/config';

@Module({
  imports: [
    UserModule,
    AssetModule,
    MongooseModule.forRoot(config.database.MongoDB),
    TradeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
