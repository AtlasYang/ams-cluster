import { AxiosInstance } from "axios";
import { Notification, NotificationCreateDto } from "./interface";

export class NotificationService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getNotificationsByUserIdAndGroupId({ group_id }: { group_id: number }) {
    const res = await this.instance.get(`/notification/user/group/${group_id}`);
    return res.data as Notification[];
  }

  async getNotificationsByGroupId({ group_id }: { group_id: number }) {
    const res = await this.instance.get(`/notification/group/${group_id}`);
    return res.data as Notification[];
  }

  async markNotificationAsRead({
    notification_id,
  }: {
    notification_id: number;
  }) {
    const res = await this.instance.patch(
      `/notification/read/${notification_id}`
    );
    return res.data;
  }

  async createNotificationForAllGroupMembers({
    group_id,
    notificationCreateDto,
  }: {
    group_id: number;
    notificationCreateDto: NotificationCreateDto;
  }) {
    const res = await this.instance.post("/notification/group", {
      group_id,
      notificationCreateDto,
    });
    return res.data;
  }
}
