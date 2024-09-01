import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Client } from 'pg';
import { PG_CONNECTION } from 'src/constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(PG_CONNECTION) private readonly conn: Client) {}

  async use(req: any, res: any, next: () => void) {
    const sessionToken = req.cookies['session_token'];
    if (!sessionToken) {
      return res.status(401).send('Unauthorized');
    }

    const queryRes = await this.conn.query(
      'SELECT * FROM user_sessions WHERE session_token = $1',
      [sessionToken],
    );

    if (queryRes.rows.length === 0) {
      return res.status(401).send('Unauthorized');
    }

    req.userId = queryRes.rows[0].user_id;

    next();
  }
}
