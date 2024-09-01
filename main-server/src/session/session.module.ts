import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { DbModule } from 'src/db/db.module';
import { MemberModule } from 'src/member/member.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [DbModule, MemberModule, FileModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
