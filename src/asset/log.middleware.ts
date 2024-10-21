/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logDetails = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      timestamp: new Date(),
    };

    const logFilePath = path.join(__dirname, '../logs/asset_manager_requests_log.txt');
    fs.appendFileSync(logFilePath, JSON.stringify(logDetails, null, 2) + '\n');

    // console.log('Request logged:', logDetails);

    next();
  }
}
