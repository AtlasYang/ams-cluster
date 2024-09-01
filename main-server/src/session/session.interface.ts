export interface Session {
  session_id: number;
  group_id: number;
  name: string;
  tags: string;
  session_date: Date;
  session_time: Date;
  special_notes: string;
  qrcode_link?: string;
  created_at: Date;
}

export interface SessionCreateDto {
  group_id: number;
  name: string;
  tags: string;
  session_date: Date;
  session_time: string;
  special_notes: string;
}

export interface SessionFeedback {
  session_feedback_id: number;
  session_id: number;
  member_id: number;
  feedback: string;
  image_url?: string;
  created_at: Date;
}

export interface SessionFeedbackCreateDto {
  session_id: number;
  member_id: number;
  feedback: string;
  image_url?: string;
}

export interface SessionAttendanceRequest {
  session_attendance_request_id: number;
  session_id: number;
  member_id: number;
  request_message: string;
  evidence_file_url?: string;
  request_checked: boolean;
  request_approved: boolean;
  created_at: Date;
}

export interface SessionAttendanceRequestCreateDto {
  session_id: number;
  request_message: string;
  evidence_file_url?: string;
}

export interface SessionParticipation {
  session_participation_id: number;
  session_id: number;
  member_id: number;
  member_name: string;
  participation_state: number;
  attended: boolean;
  created_at: Date;
}

export interface SessionParticipationCreateDto {
  session_id: number;
  participation_state: number;
  attended: boolean;
}
