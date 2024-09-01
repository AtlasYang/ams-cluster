import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('group/myrole/:group_id')
  async getMyRoleInGroup(@Req() req: any, @Param('group_id') groupId: number) {
    const res = await this.memberService.getMemberRoleInGroup({
      userId: req.userId,
      groupId,
    });

    return { role: res };
  }

  @Get('group/:group_id')
  async getMembersByGroupId(@Param('group_id') groupId: number) {
    return this.memberService.getMembersByGroupId(groupId);
  }

  @Get('user/:user_id')
  async getMembersByUserId(@Param('user_id') userId: number) {
    return this.memberService.getMembersByUserId(userId);
  }

  @Post('penalty')
  async addPenaltyPoint(
    @Body()
    { memberId, penaltyType }: { memberId: number; penaltyType: number },
  ) {
    return this.memberService.addPenaltyPoint({ memberId, penaltyType });
  }

  @Post('role')
  async changeRole(
    @Body()
    { memberId, newRole }: { memberId: number; newRole: number },
  ) {
    return this.memberService.changeMemberRole({ memberId, newRole });
  }

  @Post('remove')
  async removeMember(@Body() { memberId }: { memberId: number }) {
    return this.memberService.expelMember(memberId);
  }
}
