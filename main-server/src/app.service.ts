import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      endPoint: process.env.STORAGE_HOST,
      accessKey: process.env.MINIO_ACCESS_KEY_ID,
      secretKey: process.env.MINIO_SECRET_ACCESS_KEY,
    };
  }
}
