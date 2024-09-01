import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { DbModule } from 'src/db/db.module';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [DbModule, MemberModule],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
