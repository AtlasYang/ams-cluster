import { AxiosInstance } from "axios";

export class AuthService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async login({ email, password }: { email: string; password: string }) {
    return this.instance.post("/auth/login", { email, password });
  }

  async checkLogIn() {
    const res = await this.instance.get("/auth/check");
    if (res.status === 200) {
      return true;
    }
    return false;
  }

  async register({
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
    return this.instance.post("/auth/register", {
      email,
      password,
      name,
      profile_picture_url,
    });
  }

  async logout() {
    return this.instance.post("/auth/logout");
  }

  async checkEmail({ email }: { email: string }) {
    const res = await this.instance.post("/auth/check-email", { email });
    if (res.status === 400) {
      return false;
    }
    return true;
  }
}
