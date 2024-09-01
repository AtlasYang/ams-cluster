import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check')
  async check(@Res() res: Response) {
    res.send('OK');
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser({ email, password });

    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    const sessionToken = await this.authService.createSession(user.user_id);

    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      // sameSite: 'none',
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    res.send('Logged in');
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Body('profile_picture_url') profile_picture_url: string,
    @Res() res: any,
  ) {
    if (!email || !password || !name) {
      return res.status(400).send('Bad request');
    }

    const user = await this.authService.registerUser({
      email,
      password,
      name,
      profile_picture_url,
    });

    if (!user) {
      return res.status(400).send('Bad request');
    }

    res.send('Registered');
  }

  @Post('logout')
  async logout(@Res() res: any) {
    res.clearCookie('session_token');
    res.send('Logged out');
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string, @Res() res: any) {
    const emailExists = await this.authService.checkEmailExists(email);

    if (emailExists) {
      return res.status(400).send('Email already exists');
    }

    res.send('Email available');
  }
}
