import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerDoc {
  static async setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Art Exchange Api')
      .setDescription('Art Exchange')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api-specs', app, document);
  }
}
