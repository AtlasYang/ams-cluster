import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { Notification, NotificationCreateDto } from './notification.interface';

@Injectable()
export class NotificationService {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async getNotificationsByUserIdAndGroupId({
    userId,
    groupId,
  }: {
    userId: number;
    groupId: number;
  }): Promise<Notification[]> {
    const member = await this.conn.query(
      'SELECT * FROM members WHERE user_id = $1 AND group_id = $2',
      [userId, groupId],
    );

    if (member.rows.length === 0) {
      return [];
    }

    const queryRes = await this.conn.query(
      'SELECT * FROM notifications WHERE target_member_id = $1',
      [member.rows[0].member_id],
    );

    return queryRes.rows;
  }

  async getNotificationsByGroupId(groupId: number): Promise<Notification[]> {
    const queryRes = await this.conn.query(
      'SELECT * FROM notifications WHERE group_id = $1',
      [groupId],
    );

    return queryRes.rows;
  }

  async createNotificationForAllGroupMembers({
    userId,
    notificationCreateDto,
  }: {
    userId: number;
    notificationCreateDto: NotificationCreateDto;
  }): Promise<boolean> {
    const groupMembers = await this.conn.query(
      'SELECT * FROM members WHERE group_id = $1',
      [notificationCreateDto.group_id],
    );

    try {
      await this.conn.query('BEGIN');
      for (const member of groupMembers.rows) {
        await this.conn.query(
          `INSERT INTO notifications (group_id, created_by, target_member_id, message, image_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            notificationCreateDto.group_id,
            userId,
            member.member_id,
            notificationCreateDto.message,
            notificationCreateDto.image_url,
          ],
        );
      }
      await this.conn.query('COMMIT');
      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async createNotification({
    userId,
    notificationCreateDto,
  }: {
    userId: number;
    notificationCreateDto: NotificationCreateDto;
  }): Promise<boolean> {
    try {
      await this.conn.query(
        `INSERT INTO notifications (group_id, created_by, target_member_id, message, image_url)
             VALUES ($1, $2, $3, $4, $5)`,
        [
          notificationCreateDto.group_id,
          userId,
          notificationCreateDto.target_member_id,
          notificationCreateDto.message,
          notificationCreateDto.image_url,
        ],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'UPDATE notifications SET read = true WHERE notification_id = $1',
        [notificationId],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM notifications WHERE notification_id = $1',
        [notificationId],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteNotificationsByIds(notificationIds: number[]): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM notifications WHERE notification_id = ANY($1)',
        [notificationIds],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteNotificationsByGroupId(groupId: number): Promise<boolean> {
    try {
      await this.conn.query('DELETE FROM notifications WHERE group_id = $1', [
        groupId,
      ]);
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteNotificationsByUserId(userId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM notifications WHERE target_member_id = $1',
        [userId],
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}
