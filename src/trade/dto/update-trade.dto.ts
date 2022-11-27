import { PartialType } from '@nestjs/swagger';
import { FundWalletDto } from './fund-wallet.dto';

export class UpdateTradeDto extends PartialType(FundWalletDto) {}
