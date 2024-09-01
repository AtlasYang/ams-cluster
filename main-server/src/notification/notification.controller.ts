import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationCreateDto } from './notification.interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user/group/:group_id')
  async getNotificationsByUserId(
    @Req() req: any,
    @Param('group_id') groupId: number,
  ) {
    return this.notificationService.getNotificationsByUserIdAndGroupId({
      userId: req.userId,
      groupId,
    });
  }

  @Get('group/:group_id')
  async getNotificationsByGroupId(@Param('group_id') groupId: number) {
    return this.notificationService.getNotificationsByGroupId(groupId);
  }
  @Patch('read/:notification_id')
  async markNotificationAsRead(
    @Param('notification_id') notificationId: number,
    @Res() res: any,
  ) {
    const result =
      await this.notificationService.markNotificationAsRead(notificationId);

    if (!result) {
      return res
        .status(500)
        .send({ error: 'Failed to mark notification as read' });
    }

    return res.status(200).send({ message: 'Notification marked as read' });
  }

  @Post('group')
  async createNotificationForAllGroupMembers(
    @Req() req: any,
    @Body() notificationCreateDto: NotificationCreateDto,
    @Res() res: any,
  ) {
    const result =
      await this.notificationService.createNotificationForAllGroupMembers({
        userId: req.userId,
        notificationCreateDto,
      });

    if (!result) {
      return res.status(500).send({ error: 'Failed to create notification' });
    }

    return res.status(200).send({ message: 'Notification created' });
  }
}
