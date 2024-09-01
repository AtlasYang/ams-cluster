import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from 'src/db/db.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [DbModule, StorageModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
