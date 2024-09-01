import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { memberRoles, PG_CONNECTION } from 'src/constants';
import {
  Group,
  GroupCreateDto,
  GroupInvitation,
  GroupInvitationCreateDto,
  GroupListItem,
  GroupRequest,
  GroupRequestCreateDto,
} from './group.interface';

@Injectable()
export class GroupService {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async getGroupById(groupId: number): Promise<Group | null> {
    const queryRes = await this.conn.query(
      'SELECT * FROM groups WHERE group_id = $1',
      [groupId],
    );

    return queryRes.rows[0] || null;
  }

  async getGroupsByUserId(userId: number): Promise<GroupListItem[]> {
    const queryRes = await this.conn.query(
      `
        SELECT 
            g.group_id,
            g.name,
            g.description,
            g.group_picture_url,
            g.allow_unapproved_join,
            COUNT(m_all.user_id) AS member_count
        FROM 
            groups g
        INNER JOIN 
            members m ON g.group_id = m.group_id
        INNER JOIN 
            members m_all ON g.group_id = m_all.group_id
        WHERE 
            m.user_id = $1
        GROUP BY 
            g.group_id`,
      [userId],
    );

    return queryRes.rows;
  }

  async getGroupsByGroupNamePartial(
    groupNamePartial: string,
  ): Promise<GroupListItem[]> {
    const queryRes = await this.conn.query(
      `
      SELECT 
        g.group_id,
        g.name,
        g.description,
        g.group_picture_url,
        g.allow_unapproved_join,
        COUNT(m.user_id) as member_count
      FROM groups g
      LEFT JOIN members m ON g.group_id = m.group_id
      WHERE g.name LIKE $1
      GROUP BY g.group_id`,
      [`%${groupNamePartial}%`],
    );

    return queryRes.rows;
  }

  async getGroupPresenceAndLateTimeBySessionId(
    sessionId: number,
  ): Promise<any> {
    const group = await this.conn.query(
      `SELECT group_id FROM sessions WHERE session_id = $1`,
      [sessionId],
    );

    if (group.rows.length === 0) {
      return null;
    }

    const queryRes = await this.conn.query(
      `
      SELECT 
        allowed_extra_minutes_for_presence,
        allowed_extra_minutes_for_late
      FROM groups
      WHERE group_id = $1  
      `,
      [group.rows[0].group_id],
    );

    return queryRes.rows[0];
  }

  async checkGroupNameAvailable(groupName: string): Promise<boolean> {
    const queryRes = await this.conn.query(
      'SELECT * FROM groups WHERE name = $1',
      [groupName],
    );

    return queryRes.rows.length === 0;
  }

  async createGroup(
    creator_user_id: number,
    group_data: GroupCreateDto,
  ): Promise<number | null> {
    await this.conn.query('BEGIN');

    try {
      const new_group_secret = this.generateGroupSecret(7);
      const queryRes = await this.conn.query(
        'INSERT INTO groups (name, description, group_picture_url, allow_unapproved_join, group_secret) VALUES ($1, $2, $3, $4, $5) RETURNING group_id',
        [
          group_data.name,
          group_data.description,
          group_data.group_picture_url,
          group_data.allow_unapproved_join,
          new_group_secret,
        ],
      );

      const new_group_id = queryRes.rows[0].group_id;

      await this.conn.query(
        'INSERT INTO members (user_id, group_id, member_role) VALUES ($1, $2, $3)',
        [
          creator_user_id,
          new_group_id,
          memberRoles.find((role) => role.name === 'Owner').id,
        ],
      );

      await this.conn.query('COMMIT');

      return new_group_id;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return null;
    }
  }

  generateGroupSecret(length: number): string {
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

  async updateGroup(
    groupId: number,
    updateData: Record<string, any>,
  ): Promise<boolean> {
    try {
      const updateDataEntries = Object.entries(updateData);
      const updateDataValues = updateDataEntries.map(
        ([key], index) => `${key} = $${index + 1}`,
      );
      const updateDataValuesString = updateDataValues.join(', ');

      const values = [...Object.values(updateData), groupId];

      await this.conn.query(
        `UPDATE groups SET ${updateDataValuesString} WHERE group_id = $${values.length}`,
        values,
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async deleteGroup(groupId: number): Promise<boolean> {
    try {
      await this.conn.query('DELETE FROM groups WHERE group_id = $1', [
        groupId,
      ]);
    } catch (e) {
      return false;
    }

    return true;
  }

  async createGroupInvitation({
    userId,
    groupInvitationData,
  }: {
    userId: number;
    groupInvitationData: GroupInvitationCreateDto;
  }): Promise<boolean> {
    await this.conn.query('BEGIN');

    try {
      await this.conn.query(
        'INSERT INTO group_invitations (group_id, inviter_id, invitee_id, invitation_message) VALUES ($1, $2, $3, $4)',
        [
          groupInvitationData.group_id,
          userId,
          groupInvitationData.invitee_id,
          groupInvitationData.invitation_message,
        ],
      );

      await this.conn.query('COMMIT');

      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async getGroupInvitationsByUserId(
    userId: number,
  ): Promise<GroupInvitation[]> {
    const queryRes = await this.conn.query(
      'SELECT * FROM group_invitations WHERE invitee_id = $1',
      [userId],
    );

    return queryRes.rows;
  }

  async getUnreadGroupInvitationsNumberByUserId(
    userId: number,
  ): Promise<number> {
    const queryRes = await this.conn.query(
      'SELECT COUNT(*) FROM group_invitations WHERE invitee_id = $1 AND read = FALSE',
      [userId],
    );

    return queryRes.rows[0].count;
  }

  async getGroupInvitationsByGroupId(
    groupId: number,
  ): Promise<GroupInvitation[]> {
    const queryRes = await this.conn.query(
      'SELECT * FROM group_invitations WHERE group_id = $1',
      [groupId],
    );

    return queryRes.rows;
  }

  async acceptGroupInvitation(
    groupInvitationId: number,
    userId: number,
  ): Promise<boolean> {
    await this.conn.query('BEGIN');

    try {
      await this.conn.query(
        'UPDATE group_invitations SET invitation_accepted = TRUE WHERE group_invitation_id = $1',
        [groupInvitationId],
      );

      const groupInvitation = await this.conn.query(
        'SELECT * FROM group_invitations WHERE group_invitation_id = $1',
        [groupInvitationId],
      );

      const memberRole = groupInvitation.rows[0].is_admin_invitation
        ? 'Admin'
        : 'Member';

      await this.conn.query(
        'INSERT INTO members (user_id, group_id, member_role) VALUES ($1, $2, $3)',
        [
          userId,
          groupInvitation.rows[0].group_id,
          memberRoles.find((role) => role.name === memberRole).id,
        ],
      );

      await this.conn.query('COMMIT');

      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async rejectGroupInvitation(groupInvitationId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM group_invitations WHERE group_invitation_id = $1',
        [groupInvitationId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async readGroupInvitation(groupInvitationId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'UPDATE group_invitations SET read = TRUE WHERE group_invitation_id = $1',
        [groupInvitationId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async deleteGroupInvitation(groupInvitationId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM group_invitations WHERE group_invitation_id = $1',
        [groupInvitationId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async createGroupRequest({
    userId,
    groupRequestData,
  }: {
    userId: number;
    groupRequestData: GroupRequestCreateDto;
  }): Promise<boolean> {
    await this.conn.query('BEGIN');

    try {
      await this.conn.query(
        'INSERT INTO group_requests (group_id, user_id, request_message) VALUES ($1, $2, $3)',
        [groupRequestData.group_id, userId, groupRequestData.request_message],
      );

      await this.conn.query('COMMIT');

      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async getGroupRequestsByUserId(userId: number): Promise<GroupRequest[]> {
    const queryRes = await this.conn.query(
      `
      SELECT
        gr.group_request_id,
        gr.group_id,
        gr.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.profile_picture_url AS user_picture_url,
        gr.request_message,
        gr.read,
        gr.request_accepted,
        gr.created_at
      FROM group_requests gr
      JOIN users u ON gr.user_id = u.user_id
      WHERE gr.user_id = $1
      `,
      [userId],
    );

    return queryRes.rows;
  }

  async getGroupRequestsByGroupId(groupId: number): Promise<GroupRequest[]> {
    const queryRes = await this.conn.query(
      `
      SELECT
        gr.group_request_id,
        gr.group_id,
        gr.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.profile_picture_url AS user_picture_url,
        gr.request_message,
        gr.read,
        gr.request_accepted,
        gr.created_at
      FROM group_requests gr
      JOIN users u ON gr.user_id = u.user_id
      WHERE gr.group_id = $1
      `,
      [groupId],
    );

    return queryRes.rows;
  }

  async getUnreadGroupRequestsNumberByGroupId(
    groupId: number,
  ): Promise<number> {
    const queryRes = await this.conn.query(
      'SELECT COUNT(*) FROM group_requests WHERE group_id = $1 AND read = FALSE',
      [groupId],
    );

    return queryRes.rows[0].count;
  }

  async acceptGroupRequest(groupRequestId: number): Promise<boolean> {
    await this.conn.query('BEGIN');

    try {
      await this.conn.query(
        'UPDATE group_requests SET request_accepted = TRUE WHERE group_request_id = $1',
        [groupRequestId],
      );

      const groupRequest = await this.conn.query(
        'SELECT * FROM group_requests WHERE group_request_id = $1',
        [groupRequestId],
      );

      await this.conn.query(
        'INSERT INTO members (user_id, group_id, member_role) VALUES ($1, $2, $3)',
        [
          groupRequest.rows[0].user_id,
          groupRequest.rows[0].group_id,
          memberRoles.find((role) => role.name === 'Member').id,
        ],
      );

      await this.conn.query(
        'DELETE FROM group_requests WHERE user_id = $1 AND group_id = $2',
        [groupRequest.rows[0].user_id, groupRequest.rows[0].group_id],
      );

      await this.conn.query('COMMIT');

      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async rejectGroupRequest(groupRequestId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM group_requests WHERE group_request_id = $1',
        [groupRequestId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async readGroupRequest(groupRequestId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'UPDATE group_requests SET read = TRUE WHERE group_request_id = $1',
        [groupRequestId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async deleteGroupRequest(groupRequestId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM group_requests WHERE group_request_id = $1',
        [groupRequestId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async quitGroup(userId: number, groupId: number): Promise<boolean> {
    try {
      await this.conn.query(
        'DELETE FROM members WHERE user_id = $1 AND group_id = $2',
        [userId, groupId],
      );
    } catch (e) {
      return false;
    }

    return true;
  }
}
