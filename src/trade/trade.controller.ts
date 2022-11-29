import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TradeService } from './trade.service';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { ApiHeader } from '@nestjs/swagger';
import { BuySharesDto } from './dto/buy-shares.dto';

@ApiHeader({
  name: 'api-key',
  description: 'api-key header',
  required: true,
})
@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('/fund/address')
  fundWallet(@Body() createTradeDto: FundWalletDto) {
    return this.tradeService.fundWallet(createTradeDto);
  }

  @Post('/buy/shares')
  buyShares(@Body() buySharesDto: BuySharesDto) {
    return this.tradeService.buyNFTShares(buySharesDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTradeDto: UpdateTradeDto) {
    return this.tradeService.update(+id, updateTradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradeService.remove(+id);
  }
}
