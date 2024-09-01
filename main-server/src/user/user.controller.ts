import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@Req() req: any) {
    const user = await this.userService.getUserById(req.userId);
    if (!user) {
      return { error: 'User not found' };
    }
    return user;
  }

  @Get('member/:member_id')
  async getUserByMemberId(@Param('member_id') memberId: number) {
    const user = await this.userService.getUserByMemberId(memberId);
    if (!user) {
      return { error: 'User not found' };
    }
    return user;
  }

  @Post('update-name')
  async updateName(@Req() req: any) {
    const user = await this.userService.updateUserName(
      req.userId,
      req.body.name,
    );
    if (!user) {
      return { error: 'Failed to update name' };
    }
    return user;
  }

  @Post('update-profile-picture-url')
  async updateProfilePictureUrl(@Req() req: any) {
    const user = await this.userService.updateUserProfilePictureUrl(
      req.userId,
      req.body.profile_picture_url,
    );
    if (!user) {
      return { error: 'Failed to update profile picture URL' };
    }
    return user;
  }

  @Post('delete')
  async deleteUser(@Req() req: any) {
    const success = await this.userService.deleteUser(req.userId);
    if (!success) {
      return { error: 'Failed to delete user' };
    }
    return { success: true };
  }
}
