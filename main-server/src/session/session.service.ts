import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { FileService } from 'src/file/file.service';
import { MemberService } from 'src/member/member.service';
import {
  Session,
  SessionAttendanceRequest,
  SessionAttendanceRequestCreateDto,
  SessionCreateDto,
  SessionFeedback,
  SessionFeedbackCreateDto,
  SessionParticipation,
  SessionParticipationCreateDto,
} from './session.interface';
import * as qrcode from 'qrcode';
import { GroupService } from 'src/group/group.service';

const SECRET_LENGTH = 24;

@Injectable()
export class SessionService {
  constructor(
    @Inject(PG_CONNECTION) private readonly conn: Client,
    private readonly memberService: MemberService,
    private readonly groupService: GroupService,
    private readonly fileService: FileService,
  ) {}

  async getSessionIdBySessionSecret(
    sessionSecret: string,
  ): Promise<number | null> {
    const queryRes = await this.conn.query(
      `SELECT session_id FROM sessions WHERE session_secret = $1`,
      [sessionSecret],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0].session_id;
  }

  async getSessionById(sessionId: number): Promise<Session | null> {
    const queryRes = await this.conn.query(
      `SELECT
        session_id,
        group_id,
        name,
        tags,
        session_date,
        session_time,
        special_notes,
        qrcode_link,
        created_at
      FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0];
  }

  async getSessionsByGroupId(groupId: number): Promise<Session[]> {
    const queryRes = await this.conn.query(
      `SELECT
            session_id,
            group_id,
            name,
            tags,
            session_date,
            session_time,
            special_notes,
            qrcode_link,
            created_at
        FROM sessions WHERE group_id = $1`,
      [groupId],
    );

    return queryRes.rows;
  }

  async getSessionsByGroupIdAndDate(
    groupId: number,
    sessionDate: Date,
  ): Promise<Session[]> {
    const queryRes = await this.conn.query(
      `SELECT
            session_id,
            group_id,
            name,
            tags,
            session_date,
            session_time,
            special_notes,
            qrcode_link,
            created_at
        FROM sessions WHERE group_id = $1 AND session_date = $2`,
      [groupId, sessionDate],
    );

    return queryRes.rows;
  }

  async getTodaySessionByGroupId(groupId: number): Promise<Session | null> {
    const queryRes = await this.conn.query(
      `SELECT
            session_id,
            group_id,
            name,
            tags,
            session_date,
            session_time,
            special_notes,
            qrcode_link,
            created_at
        FROM sessions WHERE group_id = $1 AND session_date = CURRENT_DATE`,
      [groupId],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0];
  }

  async getSessionSecret(sessionId: number): Promise<string | null> {
    const queryRes = await this.conn.query(
      `SELECT session_secret FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0].session_secret;
  }

  async checkSessionSecretDuplicate(sessionSecret: string): Promise<boolean> {
    const queryRes = await this.conn.query(
      `SELECT session_id FROM sessions WHERE session_secret = $1`,
      [sessionSecret],
    );

    return queryRes.rows.length > 0;
  }

  async createSession(
    sessionCreateDto: SessionCreateDto,
  ): Promise<Session | null> {
    let sessionSecret = this.generateSessionSecret(SECRET_LENGTH);
    while (await this.checkSessionSecretDuplicate(sessionSecret)) {
      sessionSecret = this.generateSessionSecret(SECRET_LENGTH);
    }

    const queryRes = await this.conn.query(
      `INSERT INTO sessions (group_id, name, tags, session_date, session_time, special_notes, session_secret) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        sessionCreateDto.group_id,
        sessionCreateDto.name,
        sessionCreateDto.tags,
        sessionCreateDto.session_date,
        sessionCreateDto.session_time,
        sessionCreateDto.special_notes,
        sessionSecret,
      ],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return {
      session_id: queryRes.rows[0].session_id,
      group_id: queryRes.rows[0].group_id,
      name: queryRes.rows[0].name,
      tags: queryRes.rows[0].tags,
      session_date: queryRes.rows[0].session_date,
      session_time: queryRes.rows[0].session_time,
      special_notes: queryRes.rows[0].special_notes,
      qrcode_link: null,
      created_at: queryRes.rows[0].created_at,
    } as Session;
  }

  async closeSession(sessionId: number): Promise<boolean> {
    // find all members without session_participation row and add them with participation_state 3, attended false
    const group = await this.conn.query(
      `SELECT group_id FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (group.rows.length === 0) {
      return false;
    }

    const members = await this.conn.query(
      `SELECT member_id FROM members WHERE group_id = $1`,
      [group.rows[0].group_id],
    );

    for (const member of members.rows) {
      const duplicateCheck = await this.conn.query(
        `SELECT * FROM session_participation WHERE session_id = $1 AND member_id = $2`,
        [sessionId, member.member_id],
      );

      if (duplicateCheck.rows.length === 0) {
        await this.conn.query(
          `INSERT INTO session_participation (session_id, member_id, participation_state, attended) VALUES ($1, $2, 3, FALSE)`,
          [sessionId, member.member_id],
        );
      }
    }

    await this.conn.query(
      `UPDATE sessions SET tags = 'closed' WHERE session_id = $1`,
      [sessionId],
    );

    // calculate penlaties
    const groupData = await this.groupService.getGroupById(
      group.rows[0].group_id,
    );

    if (!groupData) {
      return false;
    }

    if (groupData.use_unattendance_penalty) {
      const participations = await this.getParticipationsBySessionId(sessionId);

      for (const participation of participations) {
        if (participation.participation_state === 2) {
          await this.memberService.addPenaltyPoint({
            memberId: participation.member_id,
            penaltyType: 2,
          });
        } else if ([3, 5].includes(participation.participation_state)) {
          await this.memberService.addPenaltyPoint({
            memberId: participation.member_id,
            penaltyType: 0,
          });
        } else if (participation.participation_state === 4) {
          await this.memberService.addPenaltyPoint({
            memberId: participation.member_id,
            penaltyType: 1,
          });
        }
      }
    }

    return true;
  }

  async deleteSession(sessionId: number): Promise<boolean> {
    await this.conn.query(`DELETE FROM sessions WHERE session_id = $1`, [
      sessionId,
    ]);

    return true;
  }

  async createQRCodeAndReturnURL(sessionId: number): Promise<string | null> {
    const qrAlreadyExists = await this.conn.query(
      `SELECT qrcode_link FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (qrAlreadyExists.rows[0].qrcode_link) {
      return qrAlreadyExists.rows[0].qrcode_link;
    }

    const sessionSecret = await this.getSessionSecret(sessionId);
    if (!sessionSecret) {
      return null;
    }

    const qrCodeBuffer = await qrcode.toBuffer(sessionSecret);
    const qrCodeIdentifier = this.generateSessionSecret(SECRET_LENGTH);

    const qrCodeLink = await this.fileService.uploadQRCode(
      qrCodeBuffer,
      qrCodeIdentifier,
    );

    if (!qrCodeLink) {
      return null;
    }

    await this.conn.query(
      `UPDATE sessions SET qrcode_link = $1 WHERE session_id = $2`,
      [qrCodeLink, sessionId],
    );

    return qrCodeLink;
  }

  generateSessionSecret(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async getFeedbacksBySessionId(sessionId: number): Promise<SessionFeedback[]> {
    const queryRes = await this.conn.query(
      `SELECT
          session_feedback_id,
          session_id,
          member_id,
          feedback,
          image_url,
          created_at
      FROM session_feedbacks WHERE session_id = $1`,
      [sessionId],
    );

    return queryRes.rows;
  }

  async createFeedback(
    sessionFeedbackCreateDto: SessionFeedbackCreateDto,
  ): Promise<SessionFeedback | null> {
    const queryRes = await this.conn.query(
      `INSERT INTO session_feedbacks (session_id, member_id, feedback, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        sessionFeedbackCreateDto.session_id,
        sessionFeedbackCreateDto.member_id,
        sessionFeedbackCreateDto.feedback,
        sessionFeedbackCreateDto.image_url,
      ],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return {
      session_feedback_id: queryRes.rows[0].session_feedback_id,
      session_id: queryRes.rows[0].session_id,
      member_id: queryRes.rows[0].member_id,
      feedback: queryRes.rows[0].feedback,
      image_url: queryRes.rows[0].image_url,
      created_at: queryRes.rows[0].created_at,
    } as SessionFeedback;
  }

  async deleteFeedback(sessionFeedbackId: number): Promise<boolean> {
    await this.conn.query(
      `DELETE FROM session_feedbacks WHERE session_feedback_id = $1`,
      [sessionFeedbackId],
    );

    return true;
  }

  async getParticipationsBySessionId(
    sessionId: number,
  ): Promise<SessionParticipation[]> {
    const queryRes = await this.conn.query(
      `
      SELECT
          sp.session_participation_id,
          sp.session_id,
          sp.member_id,
          u.name as member_name,
          sp.participation_state,
          sp.attended,
          sp.created_at
      FROM session_participation sp
      INNER JOIN members m ON sp.member_id = m.member_id
      INNER JOIN users u ON m.user_id = u.user_id
      WHERE sp.session_id = $1
      `,
      [sessionId],
    );

    return queryRes.rows;
  }

  async getParticipationBySessionIdAndUserId(
    sessionId: number,
    userId: number,
  ): Promise<SessionParticipation | null> {
    const group = await this.conn.query(
      `SELECT group_id FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (group.rows.length === 0) {
      return null;
    }

    const member = await this.conn.query(
      `SELECT member_id FROM members WHERE user_id = $1 AND group_id = $2`,
      [userId, group.rows[0].group_id],
    );

    if (member.rows.length === 0) {
      return null;
    }

    const queryRes = await this.conn.query(
      `
      SELECT
          sp.session_participation_id,
          sp.session_id,
          sp.member_id,
          u.name as member_name,
          sp.participation_state,
          sp.attended,
          sp.created_at
      FROM session_participation sp
      INNER JOIN members m ON sp.member_id = m.member_id
      INNER JOIN users u ON m.user_id = u.user_id
      WHERE sp.session_id = $1 AND sp.member_id = $2
      `,
      [sessionId, member.rows[0].member_id],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return {
      session_participation_id: queryRes.rows[0].session_participation_id,
      session_id: queryRes.rows[0].session_id,
      member_id: queryRes.rows[0].member_id,
      member_name: queryRes.rows[0].member_name,
      participation_state: queryRes.rows[0].participation_state,
      attended: queryRes.rows[0].attended,
      created_at: queryRes.rows[0].created_at,
    } as SessionParticipation;
  }

  async getParticipationsByUserIdAndGroupId(
    userId: number,
    groupId: number,
  ): Promise<SessionParticipation[]> {
    const member = await this.conn.query(
      `SELECT member_id FROM members WHERE user_id = $1 AND group_id = $2`,
      [userId, groupId],
    );

    if (member.rows.length === 0) {
      return [];
    }

    const queryRes = await this.conn.query(
      `SELECT
          sp.session_participation_id,
          sp.session_id,
          sp.member_id,
          u.name as member_name,
          sp.participation_state,
          sp.attended,
          sp.created_at
      FROM session_participation sp
      INNER JOIN members m ON sp.member_id = m.member_id
      INNER JOIN users u ON m.user_id = u.user_id
      WHERE sp.member_id = $1`,
      [member.rows[0].member_id],
    );

    return queryRes.rows;
  }

  async createParticipation(
    userId: number,
    sessionParticipationCreateDto: SessionParticipationCreateDto,
  ): Promise<SessionParticipation | null> {
    const group = await this.conn.query(
      `SELECT group_id FROM sessions WHERE session_id = $1`,
      [sessionParticipationCreateDto.session_id],
    );

    if (group.rows.length === 0) {
      return null;
    }

    const member = await this.conn.query(
      `SELECT member_id FROM members WHERE user_id = $1 AND group_id = $2`,
      [userId, group.rows[0].group_id],
    );

    if (member.rows.length === 0) {
      return null;
    }

    const duplicateCheck = await this.conn.query(
      `SELECT * FROM session_participation WHERE session_id = $1 AND member_id = $2`,
      [sessionParticipationCreateDto.session_id, member.rows[0].member_id],
    );

    if (duplicateCheck.rows.length > 0) {
      return null;
    }

    const queryRes = await this.conn.query(
      `INSERT INTO session_participation (session_id, member_id, participation_state, attended) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        sessionParticipationCreateDto.session_id,
        member.rows[0].member_id,
        sessionParticipationCreateDto.participation_state,
        sessionParticipationCreateDto.attended,
      ],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return {
      session_participation_id: queryRes.rows[0].session_participation_id,
      session_id: queryRes.rows[0].session_id,
      member_id: queryRes.rows[0].member_id,
      member_name: queryRes.rows[0].member_name,
      participation_state: queryRes.rows[0].participation_state,
      attended: queryRes.rows[0].attended,
      created_at: queryRes.rows[0].created_at,
    } as SessionParticipation;
  }

  async updateParticipationStatus(
    sessionId: number,
    memberId: number,
    participationState: number,
  ): Promise<boolean> {
    const queryRes = await this.conn.query(
      `UPDATE session_participation SET participation_state = $1 WHERE session_id = $2 AND member_id = $3 RETURNING *`,
      [participationState, sessionId, memberId],
    );

    return queryRes.rows.length > 0;
  }

  async getAttendanceRequestsByMemberId(
    memberId: number,
  ): Promise<SessionAttendanceRequest[]> {
    const queryRes = await this.conn.query(
      `SELECT
          session_attendance_request_id,
          session_id,
          member_id,
          request_message,
          evidence_file_url,
          request_checked,
          request_approved,
          created_at
      FROM session_attendance_requests WHERE member_id = $1`,
      [memberId],
    );

    return queryRes.rows;
  }

  async getAttendanceRequestsBySessionId(
    sessionId: number,
  ): Promise<SessionAttendanceRequest[]> {
    const queryRes = await this.conn.query(
      `SELECT
          session_attendance_request_id,
          session_id,
          member_id,
          request_message,
          evidence_file_url,
          request_checked,
          request_approved,
          created_at
      FROM session_attendance_requests WHERE session_id = $1`,
      [sessionId],
    );

    return queryRes.rows;
  }

  async getUncheckedAttendanceRequestsNumberByGroupId(
    groupId: number,
  ): Promise<number> {
    const queryRes = await this.conn.query(
      `SELECT
          COUNT(*)
      FROM session_attendance_requests sar
      JOIN members m ON sar.member_id = m.member_id
      WHERE m.group_id = $1 AND sar.request_checked = FALSE`,
      [groupId],
    );

    return parseInt(queryRes.rows[0].count);
  }

  async createAttendanceRequest(
    user_id: number,
    sessionAttendanceRequestCreateDto: SessionAttendanceRequestCreateDto,
  ): Promise<SessionAttendanceRequest | null> {
    const group = await this.conn.query(
      `SELECT group_id FROM sessions WHERE session_id = $1`,
      [sessionAttendanceRequestCreateDto.session_id],
    );

    if (group.rows.length === 0) {
      return null;
    }

    const member = await this.conn.query(
      `SELECT member_id FROM members WHERE user_id = $1 AND group_id = $2`,
      [user_id, group.rows[0].group_id],
    );

    if (member.rows.length === 0) {
      return null;
    }

    await this.conn.query(
      `INSERT INTO session_participation (session_id, member_id, participation_state, attended) VALUES ($1, $2, 0, FALSE)`,
      [sessionAttendanceRequestCreateDto.session_id, member.rows[0].member_id],
    );

    const queryRes = await this.conn.query(
      `INSERT INTO session_attendance_requests (session_id, member_id, request_message, evidence_file_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        sessionAttendanceRequestCreateDto.session_id,
        member.rows[0].member_id,
        sessionAttendanceRequestCreateDto.request_message,
        sessionAttendanceRequestCreateDto.evidence_file_url,
      ],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return {
      session_attendance_request_id:
        queryRes.rows[0].session_attendance_request_id,
      session_id: queryRes.rows[0].session_id,
      member_id: queryRes.rows[0].member_id,
      request_message: queryRes.rows[0].request_message,
      evidence_file_url: queryRes.rows[0].evidence_file_url,
      request_checked: queryRes.rows[0].request_checked,
      request_approved: queryRes.rows[0].request_approved,
      created_at: queryRes.rows[0].created_at,
    } as SessionAttendanceRequest;
  }

  async deleteAttendanceRequest(
    sessionAttendanceRequestId: number,
  ): Promise<boolean> {
    await this.conn.query(
      `DELETE FROM session_attendance_requests WHERE session_attendance_request_id = $1`,
      [sessionAttendanceRequestId],
    );

    return true;
  }

  async approveAttendanceRequest(
    sessionAttendanceRequestId: number,
  ): Promise<boolean> {
    const queryRes = await this.conn.query(
      `UPDATE session_attendance_requests SET request_approved = TRUE, request_checked = TRUE WHERE session_attendance_request_id = $1 RETURNING *`,
      [sessionAttendanceRequestId],
    );

    if (queryRes.rows.length === 0) {
      return false;
    }

    await this.updateParticipationStatus(
      queryRes.rows[0].session_id,
      queryRes.rows[0].member_id,
      4,
    );

    return true;
  }

  async rejectAttendanceRequest(
    sessionAttendanceRequestId: number,
  ): Promise<boolean> {
    const queryRes = await this.conn.query(
      `UPDATE session_attendance_requests SET request_approved = FALSE, request_checked = TRUE WHERE session_attendance_request_id = $1 RETURNING *`,
      [sessionAttendanceRequestId],
    );

    if (queryRes.rows.length === 0) {
      return false;
    }

    await this.updateParticipationStatus(
      queryRes.rows[0].session_id,
      queryRes.rows[0].member_id,
      5,
    );

    return true;
  }

  async checkAttendanceRequest(
    sessionAttendanceRequestId: number,
  ): Promise<boolean> {
    await this.conn.query(
      `UPDATE session_attendance_requests SET request_checked = TRUE WHERE session_attendance_request_id = $1`,
      [sessionAttendanceRequestId],
    );

    return true;
  }
}
