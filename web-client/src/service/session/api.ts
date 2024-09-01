import { AxiosInstance } from "axios";
import {
  Session,
  SessionAttendanceRequest,
  SessionAttendanceRequestCreateDto,
  SessionCreateDto,
  SessionFeedback,
  SessionFeedbackCreateDto,
  SessionParticipation,
  SessionParticipationCreateDto,
} from "./interface";

export class SessionService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getSessionIdBySessionSecret({
    session_secret,
  }: {
    session_secret: string;
  }): Promise<number> {
    const res = await this.instance.post(`/session/session-id`, {
      session_secret,
    });
    return res.data.session_id;
  }

  async getSessionById({
    session_id,
  }: {
    session_id: number;
  }): Promise<Session> {
    const res = await this.instance.get(`/session/${session_id}`);
    return res.data;
  }

  async getSessionsByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<Session[]> {
    const res = await this.instance.get(`/session/group/${group_id}`);
    return res.data;
  }

  async getSessionsByGroupIdAndDate({
    group_id,
    date,
  }: {
    group_id: number;
    date: string;
  }): Promise<Session[]> {
    const res = await this.instance.get(
      `/session/group/${group_id}/date/${date}`
    );
    return res.data;
  }

  async getTodaySessionsByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<Session> {
    const res = await this.instance.get(`/session/group/today/${group_id}`);
    return res.data;
  }

  async createSession({
    group_id,
    name,
    tags,
    session_date,
    session_time,
    special_notes,
  }: SessionCreateDto): Promise<Session> {
    const res = await this.instance.post("/session", {
      group_id,
      name,
      tags,
      session_date,
      session_time,
      special_notes,
    });
    return res.data;
  }

  async closeSession({ session_id }: { session_id: number }): Promise<boolean> {
    const res = await this.instance.post(`/session/close/${session_id}`);
    return res.data;
  }

  async deleteSession({
    session_id,
  }: {
    session_id: number;
  }): Promise<boolean> {
    const res = await this.instance.delete(`/session/${session_id}`);
    return res.data;
  }

  async generateQrCode({
    session_id,
  }: {
    session_id: number;
  }): Promise<string> {
    const res = await this.instance.post(`/session/qrcode/${session_id}`);
    return res.data;
  }

  async getSessionFeedbacks({
    session_id,
  }: {
    session_id: number;
  }): Promise<SessionFeedback[]> {
    const res = await this.instance.get(`/session/feedback/${session_id}`);
    return res.data;
  }

  async createSessionFeedback({
    session_id,
    member_id,
    feedback,
    image_url,
  }: SessionFeedbackCreateDto): Promise<SessionFeedback> {
    const res = await this.instance.post("/session/feedback", {
      session_id,
      member_id,
      feedback,
      image_url,
    });
    return res.data;
  }

  async deleteSessionFeedback({
    session_feedback_id,
  }: {
    session_feedback_id: number;
  }): Promise<boolean> {
    const res = await this.instance.delete(
      `/session/feedback/${session_feedback_id}`
    );
    return res.data;
  }

  async getSessionParticipation({
    session_id,
  }: {
    session_id: number;
  }): Promise<SessionParticipation[]> {
    const res = await this.instance.get(`/session/participation/${session_id}`);
    return res.data;
  }

  async getParticipationBySessionIdAndUserId({
    session_id,
  }: {
    session_id: number;
  }): Promise<SessionParticipation> {
    const res = await this.instance.get(
      `/session/participation/user/${session_id}`
    );
    return res.data;
  }
  async getUncheckedAttendanceRequestsNumberByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<number> {
    const res = await this.instance.get(
      `/session/attendance-request/num-unchecked/group/${group_id}`
    );

    return res.data.num as number;
  }

  async getParticipationsByUserIdAndGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<SessionParticipation[]> {
    const res = await this.instance.get(
      `/session/participation/group/${group_id}`
    );
    return res.data;
  }

  async createSessionParticipation({
    session_id,
    participation_state,
    attended,
  }: SessionParticipationCreateDto): Promise<boolean> {
    try {
      const res = await this.instance.post("/session/participation", {
        session_id,
        participation_state,
        attended,
      });

      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  async getAttendanceRequestByMemberId({
    member_id,
  }: {
    member_id: number;
  }): Promise<SessionAttendanceRequest[]> {
    const res = await this.instance.get(
      `/session/attendance-request/member/${member_id}`
    );
    return res.data;
  }

  async getAttendanceRequestBySessionId({
    session_id,
  }: {
    session_id: number;
  }): Promise<SessionAttendanceRequest[]> {
    const res = await this.instance.get(
      `/session/attendance-request/session/${session_id}`
    );
    return res.data;
  }

  async createAttendanceRequest({
    session_id,
    request_message,
    evidence_file_url,
  }: SessionAttendanceRequestCreateDto): Promise<SessionAttendanceRequest> {
    const res = await this.instance.post("/session/attendance-request", {
      session_id,
      request_message,
      evidence_file_url,
    });
    return res.data;
  }

  async deleteAttendanceRequest({
    session_attendance_request_id,
  }: {
    session_attendance_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.delete(
      `/session/attendance-request/${session_attendance_request_id}`
    );
    return res.data;
  }

  async approveAttendanceRequest({
    session_attendance_request_id,
  }: {
    session_attendance_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/session/attendance-request/approve/${session_attendance_request_id}`
    );
    return res.data;
  }

  async rejectAttendanceRequest({
    session_attendance_request_id,
  }: {
    session_attendance_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/session/attendance-request/reject/${session_attendance_request_id}`
    );
    return res.data;
  }

  async checkAttendanceRequest({
    session_attendance_request_id,
  }: {
    session_attendance_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/session/attendance-request/check/${session_attendance_request_id}`
    );
    return res.data;
  }
}
