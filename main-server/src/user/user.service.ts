import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { User } from './user.interface';

@Injectable()
export class UserService {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async getUserById(userId: number): Promise<User | null> {
    const queryRes = await this.conn.query(
      'SELECT user_id, name, email, profile_picture_url, created_at FROM users WHERE user_id = $1',
      [userId],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0] as User;
  }

  async getUserByMemberId(memberId: number): Promise<User | null> {
    const queryRes = await this.conn.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.profile_picture_url,
        u.created_at
      FROM users u
      INNER JOIN members m
      ON u.user_id = m.user_id
      WHERE m.member_id = $1`,
      [memberId],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    return queryRes.rows[0] as User;
  }

  async updateUserName(userId: number, name: string): Promise<User | null> {
    try {
      await this.conn.query('UPDATE users SET name = $1 WHERE user_id = $2', [
        name,
        userId,
      ]);
    } catch (e) {
      return null;
    }

    return this.getUserById(userId);
  }

  async updateUserProfilePictureUrl(
    userId: number,
    profilePictureUrl: string,
  ): Promise<User | null> {
    try {
      await this.conn.query(
        'UPDATE users SET profile_picture_url = $1 WHERE user_id = $2',
        [profilePictureUrl, userId],
      );
    } catch (e) {
      return null;
    }

    return this.getUserById(userId);
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      await this.conn.query('DELETE FROM users WHERE user_id = $1', [userId]);
    } catch (e) {
      return false;
    }

    return true;
  }
}
