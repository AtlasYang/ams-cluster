export interface Group {
  group_id: number;
  name: string;
  description: string;
  created_at: Date;
  group_picture_url: string;
  allow_unapproved_join: boolean;
  use_unattendance_penalty: boolean;
  unexcused_absence_penalty: number;
  approved_absence_penalty: number;
  late_penalty: number;
  allowed_extra_minutes_for_presence: number;
  allowed_extra_minutes_for_late: number;
  max_late_count: number;
  warning_late_count: number;
  max_absence_count: number;
  warning_absence_count: number;
  max_unexcused_absence_count: number;
  warning_unexcused_absence_count: number;
  restrict_member_number: boolean;
  max_member_count: number;
}

export interface GroupCreateDto {
  name: string;
  description: string;
  group_picture_url: string;
  allow_unapproved_join: boolean;
}

export interface GroupListItem {
  group_id: number;
  name: string;
  description: string;
  group_picture_url: string;
  allow_unapproved_join: boolean;
  member_count: number;
}

export interface GroupInvitation {
  group_invitation_id: number;
  group_id: number;
  inviter_id: number;
  invitee_id: number;
  invitation_message: string;
  is_admin_invitation: boolean;
  read: boolean;
  invitation_accepted: boolean;
  created_at: Date;
}

export interface GroupInvitationCreateDto {
  group_id: number;
  invitee_id: number;
  invitation_message: string;
  is_admin_invitation: boolean;
}

export interface GroupRequest {
  group_request_id: number;
  group_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_picture_url: string;
  request_message: string;
  read: boolean;
  request_accepted: boolean;
  created_at: Date;
}

export interface GroupRequestCreateDto {
  group_id: number;
  request_message: string;
}
