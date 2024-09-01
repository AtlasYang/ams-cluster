import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { MINIO_CONNECTION, PG_CONNECTION } from 'src/constants';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  @Inject(PG_CONNECTION) private readonly conn: any;
  @Inject(MINIO_CONNECTION) private readonly minioClient: Client;

  async validateUser({ email, password }: { email: string; password: string }) {
    const queryRes = await this.conn.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (queryRes.rows.length === 0) {
      return null;
    }

    const user = queryRes.rows[0];
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    return user;
  }

  async registerUser({
    email,
    password,
    name,
    profile_picture_url,
  }: {
    email: string;
    password: string;
    name: string;
    profile_picture_url: string;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.conn.query(
        'INSERT INTO users (email, password_hash, name, profile_picture_url) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, name, profile_picture_url],
      );

      return true;
    } catch (e) {
      return null;
    }
  }

  async checkEmailExists(email: string) {
    const queryRes = await this.conn.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    return queryRes.rows.length > 0;
  }

  async createSession(userId: number) {
    const sessionToken = this.generateSessionToken();
    await this.conn.query(
      'INSERT INTO user_sessions (user_id, session_token) VALUES ($1, $2)',
      [userId, sessionToken],
    );
    return sessionToken;
  }

  generateSessionToken() {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token;
  }
}
