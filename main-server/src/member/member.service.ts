import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { Member } from './member.interface';

@Injectable()
export class MemberService {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async getMemberRoleInGroup({
    userId,
    groupId,
  }: {
    userId: number;
    groupId: number;
  }): Promise<number | null> {
    const queryRes = await this.conn.query(
      'SELECT member_role FROM members WHERE user_id = $1 AND group_id = $2',
      [userId, groupId],
    );

    return queryRes.rows[0]?.member_role ?? null;
  }

  async getMembersByGroupId(groupId: number): Promise<Member[]> {
    const queryRes = await this.conn.query(
      `
    SELECT
      m.member_id,
      m.user_id,
      u.name AS member_name,
      u.email AS member_email,
      m.group_id,
      m.member_role,
      m.penalty_point,
      m.joined_at,
      COUNT(CASE WHEN sp.participation_state = 2 THEN 1 END) AS late_count,
      COUNT(CASE WHEN sp.participation_state = 4 THEN 1 END) AS approved_absence_count,
      COUNT(CASE WHEN sp.participation_state IN (3, 5) THEN 1 END) AS unexcused_absence_count
    FROM members m
    JOIN users u ON m.user_id = u.user_id
    LEFT JOIN session_participation sp ON m.member_id = sp.member_id
    WHERE m.group_id = $1
    GROUP BY m.member_id, u.name, u.email, m.group_id, m.member_role, m.penalty_point, m.joined_at
    `,
      [groupId],
    );

    return queryRes.rows;
  }

  async getMembersByUserId(userId: number): Promise<Member[]> {
    const queryRes = await this.conn.query(
      `
      SELECT
        m.member_id,
        m.user_id,
        u.name AS member_name,
        u.email AS member_email,
        m.group_id,
        m.member_role,
        m.penalty_point,
        m.joined_at
      FROM members m
      JOIN users u ON m.user_id = u.user_id
      WHERE m.user_id = $1
      `,
      [userId],
    );

    return queryRes.rows;
  }
  /** penalty_type: 0(unexcused_absence), 1(approved_absence), 2(late) */
  async addPenaltyPoint({
    memberId,
    penaltyType,
  }: {
    memberId: number;
    penaltyType: number;
  }): Promise<boolean> {
    const memberGroup = await this.conn.query(
      `SELECT
        g.use_unattendance_penalty,
        g.unexcused_absence_penalty,
        g.approved_absence_penalty,
        g.late_penalty
      FROM groups g
      JOIN members m ON g.group_id = m.group_id
      WHERE m.member_id = $1`,
      [memberId],
    );

    if (!memberGroup.rows[0]) {
      return false;
    }

    const {
      use_unattendance_penalty,
      unexcused_absence_penalty,
      approved_absence_penalty,
      late_penalty,
    } = memberGroup.rows[0];

    if (!use_unattendance_penalty) {
      return false;
    }

    let penaltyPoint = 0;
    switch (penaltyType) {
      case 0:
        penaltyPoint = unexcused_absence_penalty;
        break;
      case 1:
        penaltyPoint = approved_absence_penalty;
        break;
      case 2:
        penaltyPoint = late_penalty;
        break;
    }

    await this.conn.query(
      'UPDATE members SET penalty_point = penalty_point + $1 WHERE member_id = $2',
      [penaltyPoint, memberId],
    );

    return true;
  }

  async expelMember(memberId: number): Promise<boolean> {
    await this.conn.query('BEGIN');

    try {
      await this.conn.query('DELETE FROM members WHERE member_id = $1', [
        memberId,
      ]);

      await this.conn.query('COMMIT');

      return true;
    } catch (e) {
      await this.conn.query('ROLLBACK');
      return false;
    }
  }

  async changeMemberRole({
    memberId,
    newRole,
  }: {
    memberId: number;
    newRole: number;
  }): Promise<boolean> {
    await this.conn.query(
      'UPDATE members SET member_role = $1 WHERE member_id = $2',
      [newRole, memberId],
    );

    return true;
  }
}
