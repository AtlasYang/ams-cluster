import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { Response } from 'express';
import {
  GroupCreateDto,
  GroupInvitationCreateDto,
  GroupRequestCreateDto,
} from './group.interface';
import { MemberService } from 'src/member/member.service';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly memberService: MemberService,
  ) {}

  @Get(':group_id')
  async getGroupById(@Param('group_id') groupId: number) {
    const group = await this.groupService.getGroupById(groupId);
    if (!group) {
      return { error: 'Group not found' };
    }
    return group;
  }

  @Get('user/:user_id')
  async getGroupsByUserId(@Param('user_id') userId: number) {
    return this.groupService.getGroupsByUserId(userId);
  }

  @Get('search/:group_name_partial')
  async getGroupsByGroupNamePartial(
    @Param('group_name_partial') groupNamePartial: string,
  ) {
    return this.groupService.getGroupsByGroupNamePartial(groupNamePartial);
  }

  @Get('check/:group_name')
  async checkGroupNameAvailable(@Param('group_name') groupName: string) {
    const res = await this.groupService.checkGroupNameAvailable(groupName);
    if (res) {
      return { available: true };
    }
    return { available: false };
  }

  @Post()
  async createGroup(
    @Req() req: any,
    @Body() groupData: GroupCreateDto,
    @Res() res: Response,
  ) {
    const createResult = await this.groupService.createGroup(
      req.userId,
      groupData,
    );

    if (!createResult) {
      return res.status(500).send('Failed to create group');
    }

    return res.status(200).send('Group created successfully');
  }

  @Patch(':group_id')
  async updateGroup(
    @Param('group_id') groupId: number,
    @Body() updateData: Record<string, any>,
    @Res() res: Response,
  ) {
    const updateResult = await this.groupService.updateGroup(
      groupId,
      updateData,
    );

    if (!updateResult) {
      return res.status(500).send('Failed to update group');
    }

    return res.status(200).send('Group updated successfully');
  }

  @Delete(':group_id')
  async deleteGroup(
    @Req() req: any,
    @Param('group_id') groupId: number,
    @Res() res: Response,
  ) {
    const userRole = await this.memberService.getMemberRoleInGroup({
      userId: req.userId,
      groupId,
    });

    if (userRole !== 0) {
      return res.status(403).send('You are not the group owner');
    }

    const deleteResult = await this.groupService.deleteGroup(groupId);

    if (!deleteResult) {
      return res.status(500).send('Failed to delete group');
    }

    return res.status(200).send('Group deleted successfully');
  }

  @Post('invitation')
  async createGroupInvitation(
    @Req() req: any,
    @Body() groupInvitationData: GroupInvitationCreateDto,
    @Res() res: Response,
  ) {
    const userRole = await this.memberService.getMemberRoleInGroup({
      userId: req.userId,
      groupId: groupInvitationData.group_id,
    });

    if (userRole !== 0 && userRole !== 1) {
      return res.status(403).send('You are not the group owner or admin');
    }

    const createResult = await this.groupService.createGroupInvitation({
      userId: req.userId,
      groupInvitationData,
    });

    if (!createResult) {
      return res.status(500).send('Failed to create group invitation');
    }

    return res.status(200).send('Group invitation created successfully');
  }

  @Get('invitation/user/:user_id')
  async getGroupInvitationsByUserId(@Param('user_id') userId: number) {
    return this.groupService.getGroupInvitationsByUserId(userId);
  }

  @Get('invitation/group/:group_id')
  async getGroupInvitationsByGroupId(@Param('group_id') groupId: number) {
    return this.groupService.getGroupInvitationsByGroupId(groupId);
  }

  @Get('invitation/number/group/:group_id')
  async getUnreadGroupInvitationsNumberByUserId(
    @Param('group_id') groupId: number,
  ) {
    const res =
      await this.groupService.getUnreadGroupInvitationsNumberByUserId(groupId);
    return { num: res };
  }

  @Post('invitation/accept/:group_invitation_id')
  async acceptGroupInvitation(
    @Req() req: any,
    @Param('group_invitation_id') groupInvitationId: number,
    @Res() res: Response,
  ) {
    const acceptResult = await this.groupService.acceptGroupInvitation(
      req.userId,
      groupInvitationId,
    );

    if (!acceptResult) {
      return res.status(500).send('Failed to accept group invitation');
    }

    return res.status(200).send('Group invitation accepted successfully');
  }

  @Post('invitation/reject/:group_invitation_id')
  async rejectGroupInvitation(
    @Req() req: any,
    @Param('group_invitation_id') groupInvitationId: number,
    @Res() res: Response,
  ) {
    const rejectResult =
      await this.groupService.rejectGroupInvitation(groupInvitationId);

    if (!rejectResult) {
      return res.status(500).send('Failed to reject group invitation');
    }

    return res.status(200).send('Group invitation rejected successfully');
  }

  @Patch('invitation/read/:group_invitation_id')
  async readGroupInvitation(
    @Param('group_invitation_id') groupInvitationId: number,
    @Res() res: Response,
  ) {
    const readResult =
      await this.groupService.readGroupInvitation(groupInvitationId);

    if (!readResult) {
      return res.status(500).send('Failed to read group invitation');
    }

    return res.status(200).send('Group invitation read successfully');
  }

  @Delete('invitation/:group_invitation_id')
  async deleteGroupInvitation(
    @Req() req: any,
    @Param('group_invitation_id') groupInvitationId: number,
    @Res() res: Response,
  ) {
    const deleteResult =
      await this.groupService.deleteGroupInvitation(groupInvitationId);

    if (!deleteResult) {
      return res.status(500).send('Failed to delete group invitation');
    }

    return res.status(200).send('Group invitation deleted successfully');
  }

  @Post('request')
  async createGroupRequest(
    @Req() req: any,
    @Body() groupRequestData: GroupRequestCreateDto,
    @Res() res: Response,
  ) {
    const createResult = await this.groupService.createGroupRequest({
      userId: req.userId,
      groupRequestData,
    });

    if (!createResult) {
      return res.status(500).send('Failed to create group request');
    }

    return res.status(200).send('Group request created successfully');
  }

  @Get('request/user/:user_id')
  async getGroupRequestsByUserId(@Param('user_id') userId: number) {
    return this.groupService.getGroupRequestsByUserId(userId);
  }

  @Get('request/group/:group_id')
  async getGroupRequestsByGroupId(@Param('group_id') groupId: number) {
    return this.groupService.getGroupRequestsByGroupId(groupId);
  }

  @Get('request/number/group/:group_id')
  async getUnreadGroupRequestsNumberByGroupId(
    @Param('group_id') groupId: number,
  ) {
    const res =
      await this.groupService.getUnreadGroupRequestsNumberByGroupId(groupId);
    return { num: res };
  }

  @Post('request/accept/:group_request_id')
  async acceptGroupRequest(
    @Req() req: any,
    @Param('group_request_id') groupRequestId: number,
    @Res() res: Response,
  ) {
    const acceptResult =
      await this.groupService.acceptGroupRequest(groupRequestId);

    if (!acceptResult) {
      return res.status(500).send('Failed to accept group request');
    }

    return res.status(200).send('Group request accepted successfully');
  }

  @Post('request/reject/:group_request_id')
  async rejectGroupRequest(
    @Req() req: any,
    @Param('group_request_id') groupRequestId: number,
    @Res() res: Response,
  ) {
    const rejectResult =
      await this.groupService.rejectGroupRequest(groupRequestId);

    if (!rejectResult) {
      return res.status(500).send('Failed to reject group request');
    }

    return res.status(200).send('Group request rejected successfully');
  }

  @Patch('request/read/:group_request_id')
  async readGroupRequest(
    @Param('group_request_id') groupRequestId: number,
    @Res() res: Response,
  ) {
    const readResult = await this.groupService.readGroupRequest(groupRequestId);

    if (!readResult) {
      return res.status(500).send('Failed to read group request');
    }

    return res.status(200).send('Group request read successfully');
  }

  @Delete('request/:group_request_id')
  async deleteGroupRequest(
    @Req() req: any,
    @Param('group_request_id') groupRequestId: number,
    @Res() res: Response,
  ) {
    const userRole = await this.memberService.getMemberRoleInGroup({
      userId: req.userId,
      groupId: groupRequestId,
    });

    if (userRole !== 0) {
      return res.status(403).send('You are not the group owner');
    }

    const deleteResult =
      await this.groupService.deleteGroupRequest(groupRequestId);

    if (!deleteResult) {
      return res.status(500).send('Failed to delete group request');
    }

    return res.status(200).send('Group request deleted successfully');
  }

  @Post('quit/:group_id')
  async quitGroup(
    @Req() req: any,
    @Param('group_id') groupId: number,
    @Res() res: Response,
  ) {
    const quitResult = await this.groupService.quitGroup(req.userId, groupId);

    if (!quitResult) {
      return res.status(500).send('Failed to quit group');
    }

    return res.status(200).send('Group quit successfully');
  }

  @Get('minutes/:session_id')
  async getGroupPresenceAndLateTimeBySessionId(
    @Param('session_id') sessionId: number,
  ) {
    return this.groupService.getGroupPresenceAndLateTimeBySessionId(sessionId);
  }
}
