import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'src/constants';

@Injectable()
export class FileService {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly storageClient: Client,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<string | null> {
    const fileName = `${Date.now()}-${file.originalname}`;
    try {
      await this.storageClient.putObject(
        'assets',
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );
      return `${process.env.MINIO_URL}/assets/${fileName}`;
    } catch (e) {
      return null;
    }
  }

  async uploadQRCode(
    buffer: Buffer,
    identifier: string,
  ): Promise<string | null> {
    try {
      await this.storageClient.putObject(
        'qrcodes',
        `qr-${identifier}.png`,
        buffer,
        buffer.length,
        {
          'Content-Type': 'image/png',
        },
      );
      return `${process.env.MINIO_URL}/qrcodes/qr-${identifier}.png`;
    } catch (e) {
      return null;
    }
  }
}
