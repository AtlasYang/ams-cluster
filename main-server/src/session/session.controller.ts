import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  SessionAttendanceRequestCreateDto,
  SessionCreateDto,
  SessionFeedbackCreateDto,
  SessionParticipationCreateDto,
} from './session.interface';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('session-id')
  async getSessionIdBySessionSecret(
    @Body('session_secret') sessionSecret: string,
  ) {
    const res =
      await this.sessionService.getSessionIdBySessionSecret(sessionSecret);

    return { session_id: res ?? -1 };
  }

  @Get(':session_id')
  async getSessionById(@Param('session_id') sessionId: number) {
    return this.sessionService.getSessionById(sessionId);
  }

  @Get('group/:group_id')
  async getSessionsByGroupId(@Param('group_id') groupId: number) {
    return this.sessionService.getSessionsByGroupId(groupId);
  }

  @Get('group/:group_id/date/:date')
  async getSessionsByGroupIdAndDate(
    @Param('group_id') groupId: number,
    @Param('date') date: string,
  ) {
    return this.sessionService.getSessionsByGroupIdAndDate(
      groupId,
      new Date(date),
    );
  }

  @Get('group/today/:group_id')
  async getTodaySessionsByGroupId(@Param('group_id') groupId: number) {
    return this.sessionService.getTodaySessionByGroupId(groupId);
  }

  @Post()
  async createSession(@Body() sessionData: SessionCreateDto) {
    const session = await this.sessionService.createSession(sessionData);
    await this.sessionService.createQRCodeAndReturnURL(session.session_id);
    return session;
  }

  @Post('close/:session_id')
  async closeSession(@Param('session_id') sessionId: number) {
    return this.sessionService.closeSession(sessionId);
  }

  @Delete(':session_id')
  async deleteSession(@Param('session_id') sessionId: number) {
    return this.sessionService.deleteSession(sessionId);
  }

  @Post('qrcode/:session_id')
  async generateQrCode(@Param('session_id') sessionId: number) {
    return this.sessionService.createQRCodeAndReturnURL(sessionId);
  }

  @Get('feedback/:session_id')
  async getSessionFeedbacks(@Param('session_id') sessionId: number) {
    return this.sessionService.getFeedbacksBySessionId(sessionId);
  }

  @Post('feedback')
  async createSessionFeedback(@Body() feedbackData: SessionFeedbackCreateDto) {
    return this.sessionService.createFeedback(feedbackData);
  }

  @Delete('feedback/:session_feedback_id')
  async deleteSessionFeedback(
    @Param('session_feedback_id') sessionFeedbackId: number,
  ) {
    return this.sessionService.deleteFeedback(sessionFeedbackId);
  }

  @Get('participation/:session_id')
  async getSessionParticipation(@Param('session_id') sessionId: number) {
    return this.sessionService.getParticipationsBySessionId(sessionId);
  }

  @Get('participation/user/:session_id')
  async getParticipationBySessionIdAndUserId(
    @Req() req: any,
    @Param('session_id') sessionId: number,
  ) {
    return this.sessionService.getParticipationBySessionIdAndUserId(
      sessionId,
      req.userId,
    );
  }

  @Get('participation/group/:group_id')
  async getParticipationsByUserIdAndGroupId(
    @Req() req: any,
    @Param('group_id') groupId: number,
  ) {
    return this.sessionService.getParticipationsByUserIdAndGroupId(
      req.userId,
      groupId,
    );
  }

  @Post('participation')
  async createSessionParticipation(
    @Req() req: any,
    @Body() participationData: SessionParticipationCreateDto,
    @Res() res: any,
  ) {
    const result = await this.sessionService.createParticipation(
      req.userId,
      participationData,
    );

    if (!result) {
      return res.status(500).send({ error: 'Failed to create participation' });
    }

    return res
      .status(200)
      .send({ message: 'Participation created successfully' });
  }

  @Get('attendance-request/member/:member_id')
  async getAttendanceRequestByMemberId(@Param('member_id') memberId: number) {
    return this.sessionService.getAttendanceRequestsByMemberId(memberId);
  }

  @Get('attendance-request/session/:session_id')
  async getAttendanceRequestBySessionId(
    @Param('session_id') sessionId: number,
  ) {
    return this.sessionService.getAttendanceRequestsBySessionId(sessionId);
  }

  @Get('attendance-request/num-unchecked/group/:group_id')
  async getUncheckedAttendanceRequestsNumberByGroupId(
    @Param('group_id') groupId: number,
  ) {
    const res =
      await this.sessionService.getUncheckedAttendanceRequestsNumberByGroupId(
        groupId,
      );

    return { num: res };
  }

  @Post('attendance-request')
  async createAttendanceRequest(
    @Req() req: any,
    @Body() attendanceRequestData: SessionAttendanceRequestCreateDto,
  ) {
    return this.sessionService.createAttendanceRequest(
      req.userId,
      attendanceRequestData,
    );
  }

  @Delete('attendance-request/:session_attendance_request_id')
  async deleteAttendanceRequest(
    @Param('session_attendance_request_id') sessionAttendanceRequestId: number,
  ) {
    return this.sessionService.deleteAttendanceRequest(
      sessionAttendanceRequestId,
    );
  }

  @Post('attendance-request/approve/:session_attendance_request_id')
  async approveAttendanceRequest(
    @Param('session_attendance_request_id') sessionAttendanceRequestId: number,
  ) {
    return this.sessionService.approveAttendanceRequest(
      sessionAttendanceRequestId,
    );
  }

  @Post('attendance-request/reject/:session_attendance_request_id')
  async rejectAttendanceRequest(
    @Param('session_attendance_request_id') sessionAttendanceRequestId: number,
  ) {
    return this.sessionService.rejectAttendanceRequest(
      sessionAttendanceRequestId,
    );
  }

  @Post('attendance-request/check/:session_attendance_request_id')
  async checkAttendanceRequest(
    @Param('session_attendance_request_id') sessionAttendanceRequestId: number,
  ) {
    return this.sessionService.checkAttendanceRequest(
      sessionAttendanceRequestId,
    );
  }
}
