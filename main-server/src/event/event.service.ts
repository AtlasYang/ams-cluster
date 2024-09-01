import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { Event, EventCreateDto } from './event.interface';

@Injectable()
export class EventService {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async getEventsBySessionId({
    userId,
    sessionId,
  }: {
    userId: number;
    sessionId: number;
  }): Promise<Event[]> {
    const queryRes = await this.conn.query(
      `
        SELECT
            e.*,
            ep.member_id IS NOT NULL AS attended
        FROM events e
        LEFT JOIN event_participation ep
        ON e.event_id = ep.event_id
        AND ep.member_id = $1
        WHERE e.session_id = $2
    `,
      [userId, sessionId],
    );

    return queryRes.rows;
  }

  async createEvent(eventCreateDto: EventCreateDto): Promise<Event> {
    const queryRes = await this.conn.query(
      `INSERT INTO events (session_id, event_name, event_description) VALUES ($1, $2, $3) RETURNING *`,
      [
        eventCreateDto.session_id,
        eventCreateDto.event_name,
        eventCreateDto.event_description,
      ],
    );

    return {
      ...queryRes.rows[0],
      attended: false,
    };
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.conn.query(`DELETE FROM events WHERE event_id = $1`, [eventId]);
  }

  async createEventParticipation({
    eventId,
    memberId,
  }: {
    eventId: number;
    memberId: number;
  }): Promise<boolean> {
    try {
      await this.conn.query(
        `INSERT INTO event_participation (event_id, member_id) VALUES ($1, $2)`,
        [eventId, memberId],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteEventParticipation({
    eventId,
    memberId,
  }: {
    eventId: number;
    memberId: number;
  }): Promise<boolean> {
    try {
      await this.conn.query(
        `DELETE FROM event_participation WHERE event_id = $1 AND member_id = $2`,
        [eventId, memberId],
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}
