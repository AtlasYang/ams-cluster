export interface Notification {
  notification_id: number;
  group_id: number;
  created_by: number;
  target_member_id: number;
  message: string;
  image_url: string;
  read: boolean;
  created_at: Date;
}

export interface NotificationCreateDto {
  group_id: number;
  created_by: number;
  target_member_id?: number;
  message: string;
  image_url: string;
}
