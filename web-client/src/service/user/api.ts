import { AxiosInstance } from "axios";
import { User } from "./interface";

export class UserService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getUser(): Promise<User> {
    const res = await this.instance.get(`/user`);
    return res.data;
  }

  async getUserByMemberId({ member_id }: { member_id: string }): Promise<User> {
    const res = await this.instance.get(`/user/member/${member_id}`);
    return res.data;
  }

  async updateName({ name }: { name: string }): Promise<User> {
    const res = await this.instance.post(`/user/update-name`, { name });
    return res.data;
  }

  async updateProfilePictureUrl({
    profile_picture_url,
  }: {
    profile_picture_url: string;
  }): Promise<User> {
    const res = await this.instance.post(`/user/update-profile-picture-url`, {
      profile_picture_url,
    });
    return res.data;
  }

  async deleteUser(): Promise<{ success: boolean }> {
    const res = await this.instance.post(`/user/delete`);
    return res.data;
  }
}
