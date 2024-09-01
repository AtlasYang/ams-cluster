export interface Member {
  member_id: number;
  user_id: number;
  member_name: string;
  member_email: string;
  group_id: number;
  member_role: number;
  penalty_point: number;
  joined_at: Date;
  late_count?: number;
  approved_absence_count?: number;
  unexcused_absence_count?: number;
}
